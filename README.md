# Resume Tailor

AI-powered web app to tailor your resume for specific job descriptions.

## Features
- Magic Link Email Authentication (Supabase)
- Upload resume (PDF/text) & job description
- AI tailoring via n8n + OpenAI
- Live editable preview
- Download tailored resume as PDF
- Save resumes to MongoDB (optional)
- User dashboard for past resumes
- Deployed on Vercel (CI/CD)

## Stack
- **Frontend:** React + Tailwind CSS
- **Backend:** Next.js API routes
- **Auth & Storage:** Supabase
- **AI Logic:** n8n + OpenAI
- **Database:** MongoDB
- **Deployment:** Vercel

## Folder Structure
```
/app      # Frontend components and pages
/api      # Backend API routes
/docs     # PRD, wireframes, docs
/ai       # n8n + AI logic integration
/utils    # Supabase & MongoDB helpers
```

## Environment Variables
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- MONGODB_URI
- OPENAI_API_KEY
- N8N_WEBHOOK_URL

## Getting Started
1. Clone repo & install dependencies
2. Set env vars
3. Run locally: `npm run dev`
4. Deploy to Vercel 