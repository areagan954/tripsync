# TripSync Setup

## Prerequisites
- Node.js 18+ (install from https://nodejs.org or via `brew install node`)

## One-time setup
```bash
cd tripsync
npm install
npx prisma db push   # creates prisma/dev.db with the schema
npm run dev          # starts at http://localhost:3000
```

## After that
Just `npm run dev` each time.

## Database GUI (optional)
```bash
npx prisma studio    # opens a web UI at http://localhost:5555
```
