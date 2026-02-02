# Adrian Status

A minimal dark-mode status dashboard for tracking an AI agent’s work. Built with React, Vite, and Tailwind CSS.

## Features
- Reads live data from `public/status.json`
- Auto-refreshes every 30 seconds
- Current focus, status indicator, tasks, activity log, last updated timestamp
- Mobile-responsive layout
- Ready to deploy to Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Data Source
Edit `public/status.json` with your agent’s latest status:

```json
{
  "agent": "Adrian",
  "status": "working",
  "currentFocus": "Building status dashboard",
  "lastUpdated": "2026-02-02T14:50:00Z",
  "tasks": [
    { "id": 1, "title": "Task name", "status": "in-progress", "priority": "high" }
  ],
  "activity": [
    { "timestamp": "2026-02-02T14:50:00Z", "message": "Started building dashboard" }
  ]
}
```

## Deploy to Vercel

1. Push this project to a Git repository.
2. In Vercel, import the repo.
3. Build command: `npm run build`
4. Output directory: `dist`

That’s it.
