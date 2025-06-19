# Feedback AI

A full-stack app for uploading audio files, transcribing them with Deepgram, and analyzing the transcript with Groq's Llama 3 (via API) to provide structured call feedback.

---

## Features
- **Frontend:** Next.js app for drag-and-drop audio upload and feedback display.
- **Backend:** Node.js/Express server for:
  - Transcription (Deepgram API)
  - LLM analysis (Groq Llama 3 API)
- **Output:** JSON feedback with scores and observations for call evaluation.

---

## Setup Instructions

### 1. Clone the Repository
```bash
# Clone and enter the project directory
cd feedback-ai
```

### 2. Install Dependencies
#### Frontend (Next.js)
```bash
npm install
```
#### Backend
```bash
cd feedback-ai-backend
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in `feedback-ai-backend/` with:
```
DEEPGRAM_API_KEY=your_deepgram_api_key
GROQ_API_KEY=your_groq_api_key
```
- Get your Deepgram key at: https://console.deepgram.com/api-keys
- Get your Groq key at: https://console.groq.com/

### 4. Run the Backend
```bash
cd feedback-ai-backend
node server.js
```
The backend will run at `http://localhost:5000`.

### 5. Run the Frontend
```bash
cd .. # if not already in project root
npm run dev
```
The frontend will run at `http://localhost:3000`.

---

## Usage
- Open the frontend in your browser.
- Upload or drag-and-drop a `.mp3` or `.wav` audio file.
- Click "Process" to transcribe and analyze the call.
- View the structured feedback and scores.

---

## Limitations & Notes
- **Audio Length:** Free AI APIs (Deepgram, Groq) may not process long audio files (e.g., > 4 minutes or > 25MB). If you upload a long file, you may get an error or incomplete transcription.
- **API Quotas:** Free API keys have rate limits and quotas. If you hit a limit, you may need to wait or upgrade your plan.
- **Model Output:** LLM output may vary and sometimes may not return perfect JSON. The backend tries to extract the first JSON object from the response.

---

## Troubleshooting
- **Transcription errors:** Check your Deepgram API key and audio file size/type.
- **LLM errors:** Check your Groq API key and model name. Make sure your .env is correct and restart the backend after changes.
- **Frontend errors:** Make sure the backend is running and accessible at `http://localhost:5000`.

---

## Customization
- You can swap out the LLM or transcription provider by editing `feedback-ai-backend/server.js`.
- To change the favicon, replace `src/app/favicon.ico` in the frontend.

---


