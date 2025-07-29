# Resume Tailor

AI-powered web app to tailor your resume for specific job descriptions.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhamzasalam09%2Fnexium_hamza_grand_project)

## Features
- Magic Link Email Authentication (Supabase)
- Upload resume (TXT/DOCX) & job description
- AI tailoring via n8n + OpenAI
- Live editable preview
- Download tailored resume as Word document
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

## Troubleshooting

### MongoDB Connection Issues

If you see SSL/TLS errors like `tlsv1 alert internal error`, try the following:

1. **Temporary Solution**: Disable database operations in your `.env.local`:
   ```
   ENABLE_DATABASE=false
   ```

2. **Connection String**: Ensure your MongoDB connection string includes proper SSL options:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nexium?retryWrites=true&w=majority&ssl=true
   ```

3. **Network Issues**: Check if your network/firewall is blocking MongoDB Atlas connections.

4. **Credentials**: Verify your MongoDB username, password, and cluster name are correct.

### N8N Webhook Issues

If you see 404 errors for N8N webhook:

1. **Check URL**: Verify your N8N webhook URL is correct in `.env.local`
2. **N8N Status**: Ensure your N8N instance is running and accessible
3. **Fallback**: The app will automatically fall back to OpenAI if N8N fails

### General Issues

- **Missing Environment Variables**: Copy `.env.example` to `.env.local` and fill in your values
- **Port Conflicts**: The app runs on port 3000 by default, change in `package.json` if needed
- **Build Errors**: Run `npm install` to ensure all dependencies are installed