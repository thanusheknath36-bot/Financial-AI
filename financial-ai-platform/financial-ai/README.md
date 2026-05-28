# FinanceAI — Financial Report Analyzer

Upload any PDF financial report and get instant CFA-level AI analysis powered by Claude.

---

## Quick Start (Local)

### 1. Add your API key
Edit `backend/.env`:
```
ANTHROPIC_API_KEY=your_key_here
```
Get your key at https://console.anthropic.com

### 2. Start the backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# Runs at http://localhost:8000
```

### 3. Start the frontend
```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:3000
```

Open http://localhost:3000 — upload a PDF and click Analyze.

---

## Docker (one command)
```bash
# Add your key to backend/.env first
docker-compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
```

---

## Deploy to Replit (free, gets a public URL)

1. Go to https://replit.com and create a new Repl
2. Choose "Import from GitHub" or upload this folder
3. Add `ANTHROPIC_API_KEY` in Replit Secrets
4. Set run command: `uvicorn main:app --host 0.0.0.0 --port 8000`
5. Your public URL will be: `https://your-repl-name.repl.co`

For the frontend, create a separate Repl and set:
```
NEXT_PUBLIC_API_URL=https://your-backend-repl.repl.co
```

---

## Deploy Frontend to Vercel (free)

1. Push the `frontend/` folder to a GitHub repo
2. Go to https://vercel.com → New Project → Import repo
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url`
4. Deploy — you get a live URL like `your-app.vercel.app`

---

## Deploy Backend to Render (free)

1. Push `backend/` to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo, set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add env var: `ANTHROPIC_API_KEY=your_key`
5. Deploy — you get a URL like `https://your-app.onrender.com`

---

## What it analyzes
- Revenue, Net Income, Total Assets, Debt, Equity, Operating Cash Flow
- Net profit margin, ROE, Debt-to-equity, Current ratio
- Health score (0–100), Risk level, Strengths, Weaknesses, Warnings
- CFA-level recommendation

Supports: PDF, TXT, CSV financial reports
