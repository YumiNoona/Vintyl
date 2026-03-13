# 🪐 Venus — AI-Powered Video Sharing Platform

A **Loom-clone** SaaS application for recording, sharing, and collaborating on videos with AI-powered features.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk)

## ✨ Features

- 🎥 **Screen Recording** — Record screen, camera, or both via desktop app
- 🤖 **AI Summaries** — Auto-generated titles, descriptions & transcriptions
- 👥 **Team Workspaces** — Organize videos, invite members, collaborate
- 🔗 **Instant Sharing** — Share videos via link, no downloads needed
- 📁 **Folder Organization** — Create folders, rename inline, drag-and-drop
- 🔔 **Notifications** — Real-time activity feed
- 💳 **Billing** — Free & Pro plans with Stripe integration
- 🌙 **Dark Mode** — Beautiful dark theme with light/system options

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React, TypeScript, Tailwind CSS |
| **UI** | ShadCN UI (50+ components) |
| **Auth** | Clerk (Google OAuth) |
| **Database** | Neon (PostgreSQL) + Prisma ORM |
| **State** | React Query (TanStack) |
| **Backend** | Express.js + Socket.IO *(coming soon)* |
| **Desktop** | Electron.js *(coming soon)* |
| **AI** | OpenAI, Whisper *(coming soon)* |
| **Storage** | AWS S3 + CloudFront *(coming soon)* |
| **Payments** | Stripe *(coming soon)* |

## 📁 Project Structure

```
Venus/
├── prisma/
│   └── schema.prisma          # 11 models, 3 enums
├── src/
│   ├── actions/               # Server actions (user, workspace, video)
│   ├── app/
│   │   ├── (website)/         # Landing page
│   │   ├── auth/              # Sign-in, sign-up, callback
│   │   ├── dashboard/         # Protected workspace pages
│   │   └── preview/           # Video preview page
│   ├── components/
│   │   ├── global/            # Sidebar, navbar, modal, loader, search,
│   │   │                      # folders, videos, workspace content
│   │   ├── theme/             # Theme provider
│   │   └── ui/                # ShadCN components
│   ├── hooks/                 # useQueryData, useMutationData, useSearch, useZodForm
│   ├── lib/                   # Prisma client, utils
│   ├── react-query/           # Query client provider
│   └── types/                 # TypeScript type definitions
└── public/                    # Static assets (logo)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- [Clerk](https://clerk.com) account (free)
- [Neon](https://neon.tech) database (free)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/YumiNoona/Venus.git
   cd Venus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root:
   ```env
   # Database (Neon)
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/auth/callback
   NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/auth/callback

   # App
   NEXT_PUBLIC_HOST_URL=http://localhost:3000
   ```

4. **Push database schema**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the dev server**
   ```bash
   npm run dev
   ```

6. **Open** `http://localhost:3000`

## 📊 Database Schema

11 models: `User`, `Media`, `Workspace`, `Folder`, `Video`, `Comment`, `Subscription`, `Member`, `Notification`, `Invite`, `Trial`

3 enums: `Preset` (HD/SD), `Type` (PERSONAL/PUBLIC), `Plan` (FREE/PRO)

## 🗺 Roadmap

- [x] Next.js web app with auth & dashboard
- [x] Landing page with pricing
- [ ] Express server (Socket.IO for real-time video streaming)
- [ ] Electron desktop app (screen recorder)
- [ ] Stripe payment integration
- [ ] AI features (transcription, auto-titles, summaries)
- [ ] AWS S3 + CloudFront streaming

## 📝 License

MIT

---

Built with ❤️ using Next.js, Clerk, Prisma & ShadCN UI
