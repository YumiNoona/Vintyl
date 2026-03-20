# 🪐 Vintyl — AI-Powered Video Sharing Platform

Vintyl is a high-performance video communication platform that combines a Next.js web application, an Express processing server, and an Electron desktop recorder. It enables seamless screen recording, real-time streaming, and automated AI transcription/summarization.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Electron](https://img.shields.io/badge/Desktop-Electron-47848F?logo=electron)
![OpenAI](https://img.shields.io/badge/AI-OpenAI-412991?logo=openai)
![AWS](https://img.shields.io/badge/Storage-S3-FF9900?logo=amazons3)

## 🏗 Architecture

Vintyl operates on a three-tier system:
1.  **Next.js (Web)**: The user dashboard, workspace management, and video preview interface.
2.  **Express Server (Processing)**: A specialized Node.js server that handles real-time Socket.IO streams, WebM duration fixing, AWS S3 uploads, and OpenAI AI pipelines.
3.  **Electron (Desktop)**: A lightweight desktop recorder that captures screen/audio and streams binary chunks to the processing server.

---

## 🚀 Getting Started

### 1. Clone & Core Setup
```bash
git clone https://github.com/YumiNoona/Vintyl.git
cd Vintyl
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database & Auth
DATABASE_URL=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# AWS (S3 & CloudFront)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
AWS_REGION=...

# AI Services
OPENAI_API_KEY=...

# Server Config
NEXT_PUBLIC_HOST_URL=http://localhost:3000
EXPRESS_PORT=5050
```

### 3. Run the Platform

You need to run three separate processes for the full experience:

#### A. Web Frontend (Next.js)
```bash
npm run dev
```

#### B. Processing Server (Express)
```bash
cd express-server
npm install
npm run dev
```

#### C. Desktop Recorder (Electron)
```bash
cd desktop
npm install
npm start
```

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React Query, Tailwind CSS, ShadCN UI
- **Backend Orchestration**: Express, Socket.IO, Axios
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Desktop**: Electron (WebRTC Media Capture)
- **AI**: OpenAI Whisper (Transcription) & GPT-4o (Summarization)
- **Infrastructure**: AWS S3 (Storage) + CloudFront (CDN)

---

## 📝 License
MIT
