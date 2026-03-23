# 🎬 Vintyl — AI-Powered Video Sharing Platform

Vintyl is a high-performance async video communication platform built with Next.js, Express, and Electron. It enables seamless screen recording, real-time streaming, AI-powered transcription & summarization, and collaborative video sharing for teams.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Electron](https://img.shields.io/badge/Desktop-Electron-47848F?logo=electron)
![Gemini](https://img.shields.io/badge/AI-Gemini_1.5_Flash-4285F4?logo=google)
![Supabase](https://img.shields.io/badge/Storage-Supabase-3ECF8E?logo=supabase)
![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?logo=stripe)

---

## ✨ Features

### Core Platform
- **Screen Recording** — Desktop app captures screen/audio and streams to the cloud in real-time
- **Video Library** — Organize videos into workspaces and folders
- **Video Preview** — Rich preview page with view tracking, sharing, and comments
- **Workspace Collaboration** — Invite team members, manage permissions

### AI-Powered
- **Auto Transcription** — Google Gemini 1.5 Flash converts speech to text
- **AI Summarization** — Generates titles and summaries for every video
- **AI Trial Hook** — Free-tier users get one AI usage before upgrading
- **VoiceFlow AI Agent** — Interactive chatbot for video-contextual Q&A

### Video Editing (Beta)
- **Cut & Trim** — Range sliders to set start/end points
- **Canvas Size** — Switch between 16:9, 9:16, 1:1, and 4:3 aspect ratios
- **Background Music** — Pick from preset tracks with volume control
- **Export** — Download edited clips as WebM

### Monetization
- **3-Tier Pricing** — Free, Pro ($29/mo), and Team ($99/mo) plans
- **Stripe Integration** — Checkout sessions, billing portal, and webhook handling
- **Feature Comparison** — Beautiful pricing page with feature comparison grid

### CMS Integration
- **Cloudways/Wordpress** — "How To" guides fetched from a headless CMS

---

## 🏗 Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Electron App  │────▶│   Express Server  │────▶│ Supabase Storage│
│ (Desktop Recorder)│   │  (Socket.IO +     │     │  (vintyl-videos) │
└─────────────────┘     │   Gemini AI)      │     └─────────────────┘
                        └──────────────────┘
                              ▲
                              │
                        ┌──────────────────┐     ┌─────────────────┐
                        │   Next.js App     │────▶│  Neon Postgres  │
                        │ (Web Dashboard)   │     │   (Prisma ORM)  │
                        └──────────────────┘     └─────────────────┘
```

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/YumiNoona/Vintyl.git
cd Vintyl
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database (Neon Postgres)
DATABASE_URL=...

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/auth/callback
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/auth/callback

# AI (Google Gemini - FREE)
GEMINI_API_KEY=...

# Storage (Supabase - FREE)
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_PRO_PRICE_ID=...
STRIPE_TEAM_PRICE_ID=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Express Server
EXPRESS_PORT=5050

# App
NEXT_PUBLIC_HOST_URL=http://localhost:3000
NEXT_PUBLIC_VOICEFLOW_KEY=...
```

### 3. Supabase Storage Setup
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Storage** → **New Bucket**
3. Name it `vintyl-videos` and make it **Public**
4. Under **Policies**, add a policy allowing `INSERT`, `SELECT`, `UPDATE`, `DELETE` for all users (or authenticated users)

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Platform

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

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React Query, Tailwind CSS, ShadCN UI, Framer Motion |
| **Backend** | Express.js, Socket.IO |
| **Database** | PostgreSQL (Neon) + Prisma ORM |
| **Desktop** | Electron (WebRTC Media Capture) |
| **AI** | Google Gemini 1.5 Flash (Transcription & Summarization) |
| **Storage** | Supabase Storage |
| **Auth** | Clerk |
| **Payments** | Stripe (Checkout, Webhooks, Billing Portal) |
| **AI Agent** | VoiceFlow |

---

## 📂 Project Structure

```
Vintyl/
├── src/
│   ├── actions/        # Server actions (AI, payment, video, workspace)
│   ├── app/            # Next.js app router pages
│   ├── components/     # UI components (recording, videos, billing)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities (prisma, storage, stripe, voiceflow)
│   └── generated/      # Prisma generated client
├── express-server/     # Express + Socket.IO processing server
├── desktop/            # Electron desktop recorder
├── prisma/             # Database schema & migrations
└── public/             # Static assets
```

---

## 📝 License
MIT
