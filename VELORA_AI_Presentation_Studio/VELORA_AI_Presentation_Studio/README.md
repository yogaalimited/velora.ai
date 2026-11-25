# VELORA — AI Presentation Studio

A deployable AI-powered presentation generator. It includes a responsive dashboard, AI outline/slide generation, PDF/DOCX/TXT source upload, editable slide preview, speaker notes, themes, and `.pptx` export.

## Requirements
- Node.js 18+
- An OpenAI API key for full AI generation

## Run locally
```bash
npm install
cp .env.example .env
```
Add your API key to `.env`, then:
```bash
npm run dev
```
Open http://localhost:3000

Without an API key, VELORA runs in demo mode with a local sample outline so you can test the editor and PPTX export. Full AI generation requires a valid server-side `OPENAI_API_KEY`.

## Deploy
Deploy as a Node.js web service (Render, Railway, Fly.io, or any Node host):
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables `OPENAI_API_KEY` and optionally `OPENAI_MODEL` / `PORT`.
- Do not commit `.env` or expose your API key in frontend code.

## Features
- AI-generated presentation structure and slide content
- PDF, DOCX, and TXT source material extraction
- Language, audience, tone, slide count, and custom instructions
- Four visual themes
- Edit slide titles, bullet points, and presenter notes
- Export editable PowerPoint (`.pptx`) with speaker notes

## Notes / current scope
- The generated PowerPoint contains editable text and shapes, not a full-fidelity PowerPoint clone.
- Image generation is not wired to an image provider yet; slide visuals are typography/layout-based. This keeps the project runnable without a second API integration.
- Drafts currently live in the active browser session; connect a database/storage provider if you want persistent user accounts and cloud libraries.
- For production use, add authentication, rate limiting, usage limits, and a privacy policy before opening it to the public.
