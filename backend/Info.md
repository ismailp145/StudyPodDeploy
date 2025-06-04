Make sure you CD into backend
npm run build 
npm run dev


curl -X POST http://localhost:5008/tts-stream \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world"}' --output hello.mp3


  cd into backend/src

  npm prisma generate