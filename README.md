# 🪐 Venus — AI-Powered Video Sharing Platform

A **Loom-clone** SaaS application for recording, sharing, and collaborating on videos with AI-powered features.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk)
![Stripe](https://img.shields.io/badge/Payments-Stripe-635bff?logo=stripe)
![Electron](https://img.shields.io/badge/Desktop-Electron-47848F?logo=electron)

## ✨ Features

- 🎥 **Screen Recording** — Record screen, camera, or both via Electron desktop app
- 🤖 **AI Summaries** — Auto-generated titles, descriptions & transcriptions *(coming soon)*
- 👥 **Team Workspaces** — Organize videos, invite members, collaborate
- 🔗 **Instant Sharing** — Share videos via link, no downloads needed
- 📁 **Folder Organization** — Create folders, rename inline, drag-and-drop
- 🔔 **Notifications** — Real-time activity feed
- 💳 **Billing** — Free & Pro plans with Stripe integration
- 🌙 **Dark Mode** — Beautiful dark theme with light/system options
- 🖥 **Desktop Recorder** — Electron app with source selection, webcam toggle, timer

## 🛠 Tech Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| **Frontend** | Next.js 16, React, TypeScript, Tailwind CSS | ✅ |
| **UI** | ShadCN UI (50+ components) | ✅ |
| **Auth** | Clerk (Google OAuth) | ✅ |
| **Database** | Neon (PostgreSQL) + Prisma 7 ORM | ✅ |
| **State** | React Query (TanStack) | ✅ |
| **Payments** | Stripe (checkout, webhooks, portal) | ✅ |
| **Desktop** | Electron.js (screen recorder) | ✅ |
| **AI** | OpenAI (Whisper, GPT-4o-mini) | ✅ |
| **Storage** | AWS S3 + CloudFront | ✅ |

## 📁 Project Structure

```
Venus/
├── prisma/
│   └── schema.prisma          # 11 models, 3 enums
├── src/
│   ├── actions/               # Server actions (user, workspace, video, payment, ai)
│   ├── app/
│   │   ├── (website)/         # Landing page
│   │   ├── auth/              # Sign-in, sign-up, callback
│   │   ├── dashboard/         # Protected workspace pages
│   │   ├── preview/           # Video preview page (+ comments, AI summary)
│   │   ├── payment/           # Stripe success/cancel pages
│   │   └── api/               # AI routes, Upload routes, Health endpoints
│   ├── components/
│   │   ├── global/            # Sidebar, navbar, folders, videos
│   │   ├── theme/             # Theme provider
│   │   └── ui/                # ShadCN components
│   ├── hooks/                 # useQueryData, useMutationData, useSearch, useZodForm
│   ├── lib/                   # Prisma, Stripe, OpenAI, S3 singletons
│   └── types/                 # TypeScript type definitions
├── desktop/                   # Electron desktop recorder app (uploads to S3 directly)
└── public/                    # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- [Clerk](https://clerk.com) account (free)
- [Neon](https://neon.tech) database (free)
- [Stripe](https://stripe.com) account (for payments)
- [OpenAI](https://platform.openai.com) account (for AI features)
- AWS Account (for S3 and CloudFront)

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
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/auth/callback
   NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/auth/callback

   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SUBSCRIPTION_PRICE_ID=price_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # AI / OpenAI
   OPENAI_API_KEY=sk-...

   # AWS S3 / CloudFront
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=us-east-1
   AWS_BUCKET_NAME=your-bucket-name
   CLOUDFRONT_URL=https://your-distribution.cloudfront.net

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

### Desktop App (Electron)

```bash
cd desktop
npm install
npm run dev
```

## 📊 Database Schema

11 models: `User`, `Media`, `Workspace`, `Folder`, `Video`, `Comment`, `Subscription`, `Member`, `Notification`, `Invite`, `Trial`

3 enums: `Preset` (HD/SD), `Type` (PERSONAL/PUBLIC), `Plan` (FREE/PRO)

## 🗺 Roadmap

- [x] Next.js web app with auth & dashboard
- [x] Landing page with pricing
- [x] Auth callback — login → DB user/workspace → dashboard
- [x] Electron desktop app (screen recorder)
- [x] Stripe payment integration (checkout, webhooks, portal)
- [x] Debug & health endpoints (`/api/health`)
- [x] AI features (transcription, auto-titles, summaries)
- [x] AWS S3 + CloudFront video storage & direct desktop uploads
- [x] Video comments with real-time updates
- [x] Workspace invite flow via email
- [ ] Production deployment

## 🐛 Debugging

Visit `http://localhost:3000/api/debug` to check system status:
```json
{
  "clerkUser": { "id": "...", "email": "..." },
  "database": "connected",
  "env": { "DATABASE_URL": "present" }
}
```

## 📝 License

MIT

---

Built with ❤️ using Next.js, Clerk, Prisma, Stripe & ShadCN UI
