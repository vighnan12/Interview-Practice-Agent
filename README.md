# Interview Practice Partner - AI Agent Application

A full-stack application for practicing interviews with an AI-powered mock interview partner.

## Tech Stack

**Frontend:**
- React + Vite
- TailwindCSS
- Chat-style UI

**Backend:**
- Node.js + Express
- Groq API integration (100% free, no billing required)
- JSON-based agent responses

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory:
```
PORT=3000
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-70b-versatile
```

   **Getting your free Groq API key:**
   1. Go to https://console.groq.com/
   2. Sign up for a free account (no credit card required!)
   3. Navigate to API Keys: https://console.groq.com/keys
   4. Click "Create API Key"
   5. Copy your API key and paste it in the `.env` file

   **Available Groq Models:**
   - `llama-3.1-8b-instant` (default, fast and reliable)
   - `llama-3.1-70b-versatile` (if available, check Groq console)
   - `mixtral-8x7b-32768` (alternative)

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Features

- **Three Interview Phases:**
  - `idle`: Initial greeting and setup
  - `in_progress`: Active interview with questions
  - `final_feedback`: Structured feedback at the end

- **Question Types:**
  - Intro
  - Background
  - Project
  - Technical
  - Behavioral
  - Closing
  - Feedback

- **Modern UI:**
  - Clean chat interface
  - Role and experience configuration
  - Start/End interview controls
  - Real-time message exchange

## API Endpoint

### POST /api/interview

**Request Body:**
```json
{
  "phase": "idle" | "in_progress" | "final_feedback",
  "role": "string",
  "experienceYears": number,
  "history": [
    {
      "from": "user" | "bot",
      "text": "string"
    }
  ]
}
```

**Response:**
```json
{
  "reply": "string",
  "phase": "idle" | "in_progress" | "final_feedback",
  "question_type": "intro" | "background" | "project" | "technical" | "behavioral" | "closing" | "feedback",
  "expect_candidate_answer": true | false
}
```

## Usage

1. Start both the backend and frontend servers
2. Enter your job role and years of experience
3. Click "Start Interview" to begin
4. Answer questions as they appear
5. Click "End & Feedback" when you're ready to receive feedback

## Notes

- **Groq is 100% free** - No billing, no credit card required!
- Get your free API key at: https://console.groq.com/keys
- The backend uses `llama-3.1-8b-instant` by default (can be changed in `.env`)
- The system prompt is designed to conduct realistic mock interviews
- Groq is extremely fast - responses are typically under 1 second!

