import express, { Request, Response, Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { PrismaClient } from '../generated/prisma';

dotenv.config();

const prisma = new PrismaClient();
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('API_KEY is not defined in the environment variables');
}
const googleAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const geminiModel = googleAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
});

const router: Router = express.Router();

interface PodcastGenerationResponse {
  title: string;
  content: string;
  keywords: string[];
  summary: string;
}

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required in request body' });
    return;
  }

  const systemPrompt = `
    You are a podcast content generator. Given a user request, generate comprehensive podcast content, create an engaging title, and extract relevant keywords. Return your response in JSON format with four fields: "title", "content", "keywords", and "summary".
    
    Requirements:
    - Generate an engaging, descriptive title that captures the essence of the content
    - Generate engaging, conversational podcast content that sounds natural when spoken
    - Content should be informative, well-structured, and appropriate for the requested duration
    - Extract 4-6 relevant keywords from the input that capture the main topics and concepts
    - Generate a concise summary of the content that captures the main points and insights
    
    - Use a conversational tone with natural transitions
    - Include specific examples and practical insights where relevant
    - NO opening greetings or closing remarks - dive straight into content
    - IMPORTANT: Return response as valid JSON only
    - IMPORTANT: Do NOT include any markdown formatting such as triple backticks or code blocks in your response.

    Example Inputs and Outputs:
    Input: "Give me a 5 minute podcast on React"
    Output:
    {
    "title": "React Fundamentals: Building Modern UIs with Components and Virtual DOM",
    "content": "React has revolutionized how we build user interfaces by introducing a component-based architecture that makes code more modular and reusable. At its core, React uses a virtual DOM - essentially a JavaScript representation of the actual DOM that allows React to efficiently update only the parts of a webpage that have actually changed. The beauty of React lies in its declarative approach. Instead of telling the browser how to manipulate the DOM step by step, you simply describe what the UI should look like for any given state, and React figures out how to make it happen. This is powered by React's reconciliation algorithm, which compares the new virtual DOM tree with the previous one and calculates the minimum number of changes needed. One of React's most powerful features is its component lifecycle. Components can mount, update, and unmount, and React provides hooks like useEffect to let you tap into these lifecycle events. This gives you precise control over when to fetch data, set up subscriptions, or clean up resources. React's ecosystem is incredibly rich. You have state management solutions like Redux or Zustand, routing with React Router, and countless UI libraries. The community has built tools for everything from animation to form handling, making React development both powerful and efficient. What makes React particularly appealing to developers is its learning curve. Once you understand components, props, and state, you can start building real applications. The mental model is intuitive - everything is a component, and data flows down through props while events bubble up through callbacks.",
    "keywords": ["React", "virtual DOM", "component-based architecture", "useEffect", "state management", "UI development"],
    "summary": "This episode explores how React's component model and virtual DOM optimize UI development and performance."
    }

    Input: "Why is React more performant than Angular and describe all the details at a low level"
    Output:
    {
    "title": "React vs Angular: The Performance Battle Under the Hood",
    "content": "The performance differences between React and Angular stem from fundamental architectural decisions that affect how each framework handles rendering, change detection, and DOM manipulation. React's performance advantage starts with its virtual DOM implementation. When state changes occur, React creates a new virtual DOM tree and performs a diffing algorithm called reconciliation. This process compares the new tree with the previous one at the node level, identifying exactly which components need updates. React then batches these changes and applies them to the real DOM in a single operation, minimizing expensive DOM manipulations. Angular, in contrast, uses a zone-based change detection system. Zone.js patches browser APIs like setTimeout, Promise, and event handlers to detect when asynchronous operations complete. When any of these operations finish, Angular runs change detection across the entire component tree, checking every binding in every component. This can lead to performance bottlenecks in large applications because Angular might check hundreds of bindings even when only one component's data has changed. At the rendering level, React's fiber architecture provides another performance boost. Introduced in React 16, fiber allows React to break rendering work into chunks and spread it across multiple frames. This means React can pause expensive rendering operations to handle user interactions, preventing the UI from becoming unresponsive. Angular's rendering is more synchronous and can block the main thread during complex updates. React's component model also contributes to better performance. React components are pure functions by default, making them highly optimizable. The framework can use techniques like memoization with React.memo to prevent unnecessary re-renders. Angular components, being class-based with more overhead, are inherently more expensive to instantiate and execute. Bundle size is another factor. React's core library is significantly smaller than Angular's framework. A minimal React application starts around 130KB, while Angular applications typically start around 500KB. This difference affects initial load times and parsing speed, especially on slower devices. The compilation strategies also differ significantly. React uses Babel to transform JSX into JavaScript function calls, which is a straightforward transformation. Angular's ahead-of-time compilation is more complex, generating additional code for dependency injection, change detection, and template binding, which can impact runtime performance.",
    "keywords": ["React performance", "Angular performance", "virtual DOM", "reconciliation algorithm", "change detection", "rendering optimization"],
    "summary": "We break down the performance differences between React and Angular, diving into change detection, rendering strategies, and architecture."
    }
    `;

  try {
    const result = await geminiModel.generateContent([systemPrompt, prompt]);
    const response = result.response;
    const generatedText = response.text();

    // Strip out code block markers like ```json or ```
    const cleanedText = generatedText.replace(/^```json\s*|```$/g, '').trim();
    console.log('cleanedText', cleanedText);
    const parsedResponse = JSON.parse(cleanedText) as PodcastGenerationResponse;

    // Save the generated content to the database
    const savedSummary = await prisma.podcastSummary.create({
      data: {
        title: parsedResponse.title,
        summary: parsedResponse.summary,
        keywords: parsedResponse.keywords,
        // Note: audioId will be set later when the audio file is generated
      },
    });

    console.log('Saved podcast summary:', savedSummary);
    
    // Return both the generated content and the database record
    res.json({
      ...parsedResponse,
      id: savedSummary.id
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      error: 'Failed to generate podcast content',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
