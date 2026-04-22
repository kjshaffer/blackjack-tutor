# Blackjack Basic Strategy Tutor

A web application that teaches blackjack basic strategy through adaptive practice and AI-powered feedback.

## Tech Stack

- **Frontend & Backend:** Next.js (App Router) with TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **LLM:** OpenAI API (GPT-4o-mini)
- **Styling:** Tailwind CSS

## Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)
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
```

### 4. Start the database

```bash
docker run --name bjtutor-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=blackjack -p 5432:5432 -d postgres
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Generate the Prisma client

```bash
npx prisma generate
```

### 7. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Usage

1. Go to `/signup` to create an account
2. Go to `/practice` to start a practice session
3. You will be dealt a hand — choose Hit, Stand, Double Down, or Split
4. If you answer incorrectly, an AI-generated explanation will appear explaining the probability reasoning behind the correct play
5. The system tracks your accuracy per hand type (hard, soft, pair) and adapts to deal more of the types you struggle with