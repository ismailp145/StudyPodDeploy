### StudyPod — Final Presentation Outline (8-10 min)

---

## 1  Introduction & Problem Statement  (\~2 min)  — **Ismail**

* **Hook** – Students waste time skimming articles when they could be listening on-the-go.
* **Problem** – Existing podcast apps don’t generate *personal* audio from arbitrary study material or adapt to users’ changing interests.
* **Solution** – **StudyPod:** • turns any text prompt into an AI-generated, human-sounding podcast • learns your interests to recommend relevant episodes • stores everything in a personal, cloud-hosted playlist.
* **Stack at a glance**

  * **Frontend**  ( Expo / React Native)
  * **Backend** (Node + Express, Prisma + MongoDB)
  * **AI services** Google Gemini 2.0-Flash (content) & PlayHT (speech)
  * **Storage/Delivery** AWS S3 for audio, Firebase for social auth, MongoDB
* **Roles**

  * Ismail – Auth flow, keyword parser, playlist UI
  * Fahad – Interest model, audio-quality selection, player controls
  * Yousef – Podcast generation pipeline, DB integration, S3 ops

---

## 2  Live Demo & Technical Walk-Through  (\~5 min)

> **We’ll walk through an end-to-end user journey, handing off as noted.**

| Step  | Demo Action & Speaker                                         | Behind-the-Scenes Technical Highlights                                                                                                      |
| ----- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **Log In (Ismail)** – Google/Firebase one-tap                 | Secure OAuth tokens stored with Expo SecureStore → JWT to backend                                                                           |
| **2** | **Set Interests (Fahad)** – Fill quick tag form               | Interests persisted on `users` collection; discovery queries pre-filtered by Mongo `$text` search                                           |
| **3** | **Discovery Page (Fahad)**                                    | Server joins `audioFiles` + `summary.keywords` against interests; lazy-loads waveform thumbnails                                            |
| **4** | **Custom Prompt (Ismail)** – “Explain CRISPR in simple terms” | ⚙️ **Keyword Parser** (winkNLP) extracts nouns → fast DB lookup; if hit, we stream existing audio                                           |
| **5** | **Fallback Generation (Yousef)** – Tap *Generate*             | ① Gemini returns `{title, content, summary, keywords}` ② Text cached, keywords re-indexed ③ PlayHT converts to realistic voice (selected ↓) |
| **6** | **Audio Quality Choice (Fahad)** – Standard vs HQ voice       | Passes `voiceId` & `format` in PlayHT request; \~15 s synthesis; progress bar via SSE                                                       |
| **7** | **Playback (Ismail)** – Native player UI                      | Audio URL is a signed S3 link; no downloads → lower data use; background playback supported                                                 |
| **8** | **Save & My Playlist (Ismail)**                               | Creates `userAudioFiles` doc → invokes optimistic UI update; swipe-to-delete triggers HTTP `DELETE` (demo OK & error states)                |
| **9** | **Edge Case Demo (Yousef)** – Duplicate keyword               | Backend checks user’s history → serves next best match (complexity: deterministic conflict resolution)                                      |

*Throughout the demo we’ll surface debug overlays (Redux dev-tools & Prisma logs) to prove the pipeline is real-time and fault-tolerant.*

---

## 3  Lessons Learned & Future Work  (\~1 min)  — **All**

* **Tech we mastered:**
  * Server-side streaming with Node & SSE
  * winkNLP custom pipeline for lightweight NLP on device
  * PlayHT async TTS web-hooks & retry logic
* **If we had more time:**

  1. **Smart caching** – run PlayHT **after** checking DB to save credits (current TODO)
  2. **Vector search** with Pinecone for semantic matches instead of keyword hits
  3. **Collaborative playlists** and shareable episode links
  4. **Offline downloads** via Expo Audio & background sync

> **Q-Ready** – Every member reviewed all service endpoints, schema files, and CI scripts, so feel free to quiz us on any layer of the stack.

Presentation Outline

User logs in - Ismail via Firebase (maybe social)

User interest form - Fahad
    Explain end to end so the interests are saved via usser field
    discovery page uses interest form to populate from db if exists

Sends to home page

User submits prompt and keyword catches (ismail)
    ismail explain keyword algo and then what happens if not found
    Currently it is not the smartest, it returns the first instance of the keyword
    but if the podcast is already in the users audio files, then it goes to the next one

Test case (user recieves audio they do not like or is not relevent because
keyword parser is not able to parse prompt)

Then press button to make a post request and skips keyboard validation

Post request is made and then generate podcast actually happens  
Audio Selection - Fahad

Generate Podcast Flow -
    Gemini Request is made: returns title, summary, podcast content,
    and keywords

    The information is saved to the db 
    
    the request to playht is made (user recieves an audio based on the 
    voice chosen) 

    the audio is returned (yousef)

    **Optimizations we could have made**
    Checking the DB after the gemini call to avoid making a play ht call 
    if one of the higher quality keywords is in the database. 

The podcast is returned

Podcast audio player just points to s3 (ismail)
Podcast controls (Req 5) (Fahad)

The podcast is then added to the database (Yousef)
The podcast is shown in the user's library (Yousef)

Discovery Page
How the discovery page is populated.(Fahad)

S3 Service (Fahad)

**Improvment**
We should have used a relational db instead of mongo db, since we actually used
relations more than not to connect our data.
