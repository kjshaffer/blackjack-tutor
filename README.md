# Blackjack Basic Strategy Tutor

A web application that teaches blackjack basic strategy through adaptive practice and AI-powered feedback. Built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- **Interactive Practice** — Get dealt randomized hands and choose the correct basic strategy action (hit, stand, double down, split)
- **AI Explanations** — When you answer incorrectly, GPT-4o-mini explains the probability reasoning behind the correct play
- **Adaptive Problem Selection** — The system tracks your accuracy on hard hands, soft hands, and pairs, then deals you more of what you struggle with
- **Progress Dashboard** — Accuracy-over-time charts, per-category mastery breakdown, and session history powered by Recharts
- **Background Processing** — LLM calls are processed asynchronously via BullMQ/Redis so the UI stays fast
- **User Accounts** — Sign up, log in, log out with NextAuth.js

## Tech Stack

- **Frontend & Backend:** Next.js (App Router) with TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **LLM:** OpenAI API (GPT-4o-mini)
- **Background Worker:** BullMQ with Redis
- **Charts:** Recharts
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js

## Prerequisites

- Node.js 18+
- Docker (for PostgreSQL and Redis)
- An OpenAI API key

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/blackjack-tutor.git
cd blackjack-tutor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/blackjack"
AUTH_SECRET="any-random-string-for-session-encryption"
OPENAI_API_KEY="sk-your-openai-api-key-here"
REDIS_URL="redis://localhost:6379"
```

### 4. Start the databases

```bash
docker run --name bjtutor-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=blackjack -p 5432:5432 -d postgres
docker run --name bjtutor-redis -p 6379:6379 -d redis
```

If the containers already exist but are stopped, start them with:

```bash
docker start bjtutor-db bjtutor-redis
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Generate the Prisma client

```bash
npx prisma generate
```

### 7. Start the app (two terminals needed)

Terminal 1 — the web app:

```bash
npm run dev
```

Terminal 2 — the background worker:

```bash
npm run worker
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Usage

1. Go to the landing page and create an account
2. Navigate to Practice to start a session
3. You will be dealt a hand — choose Hit, Stand, Double Down, or Split
4. If you answer incorrectly, an AI-generated explanation will appear explaining why the correct play is optimal
5. The system adapts to deal more of the hand types you struggle with
6. Check the Dashboard to see your accuracy charts and progress over time