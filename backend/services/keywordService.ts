import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

// Instantiate winkNLP.
const nlp = winkNLP(model);
// Obtain "its" helper to extract item properties.
const its = nlp.its;
// Obtain "as" reducer helper to reduce a collection.
const as = nlp.as;


export function filterKeywords(text:string){
  // Common nouns that are not relevant to the podcast
  const generic = new Set([
    'difference','comparison','podcast', 
    'make', 'generate', 'you', 'can', 'produce', 'me', 'explanation', 'topic', 
    'topic', 'subject', 'matter', 'he', 'him', 'her', 'they', 'them', 'their', 'we', 'our'
  ]);
  return winkNLP(model)
         .readDoc(text)
         .tokens()
         .filter(t => ['NOUN','PROPN'].includes(t.out(its.pos)))
         .out()
         .filter(w => !generic.has(w)); 
}
