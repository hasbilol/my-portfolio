# AGENTS.md

## Project Overview
Personal portfolio website for Hafiz Aiman — a single-page site with an AI chatbot assistant ("Bo") backed by a Cloudflare Worker.

## Tech Stack
- **Frontend:** HTML, CSS, vanilla JS (no framework)
- **Backend:** Cloudflare Worker (serverless)
- **AI:** OpenRouter API (meta-llama/llama-3.1-8b-instruct)
- **Deployment:** Cloudflare Pages (frontend) + Cloudflare Workers (backend)

## Project Structure
```
mywebsite/
├── index.html              # Single-page portfolio (Hero, About, Skills, Projects, Experience, Contact)
├── assets/
│   ├── css/style.css       # All styles — dark theme, teal/blue accents, responsive
│   ├── js/
│   │   ├── script.js       # Core UI logic: nav, scroll progress, reveal animations, modal, form
│   │   └── chatbot.js      # Chatbot panel UI — sends messages to Worker, renders responses
│   └── images/             # (empty — .gitkeep)
├── worker/
│   ├── worker.js           # Cloudflare Worker — proxies chat to OpenRouter API
│   ├── knowledge.js        # Chatbot knowledge base (exported template string)
│   ├── knowledge.md        # Markdown version of knowledge base
│   └── wrangler.toml       # Worker config
├── DEPLOYMENT.md           # Deployment guide
└── AGENTS.md               # This file
```

## Key Files
- `assets/js/script.js:1-280` — Scroll progress, mobile nav, active section tracking, reveal-on-scroll, project modal, contact form
- `assets/js/chatbot.js:1-169` — Chatbot open/close, message send/receive, typing indicator
- `worker/worker.js:1-120` — POST `/` endpoint, validates message, calls OpenRouter, returns AI reply
- `worker/knowledge.js:5-89` — Knowledge base content (edit this to update what the chatbot knows)
- `assets/css/style.css:1-1116` — All CSS in one file; uses CSS custom properties (`--bg`, `--accent`, `--accent-2`, etc.)

## Code Conventions
- No build step — plain HTML/CSS/JS, no bundler
- JS uses IIFEs with `$` / `$$` query selectors
- CSS uses BEM-ish naming (`.chatbot-message--user`, `.nav-link.is-active`)
- Accessibility: `aria-*` attributes, skip-link, focus management, `prefers-reduced-motion` support
- Worker uses ES modules (`import`)

## Development Commands
- **Local:** Open `index.html` in a browser (or use a local server like `npx serve`)
- **Deploy Worker:** `cd worker && wrangler deploy`
- **Set Worker Secret:** `wrangler secret put OPENROUTER_API_KEY`
- **Deploy Pages:** Push to connected Git repo (auto-deploys)

## Chatbot Architecture
1. User types message → `chatbot.js` sends POST to Worker URL
2. Worker receives message, builds system prompt with knowledge base
3. Worker calls OpenRouter API (llama-3.1-8b-instruct)
4. Worker returns AI response → chatbot renders it

## UI Notes
- Dark theme: `--bg: #0b1020`, accent teal `#22c7b8`, blue `#18a7ff`
- Animated background with `body::before` radial gradients
- Scroll-reveal animations via IntersectionObserver
- Hero role rotator cycles through titles
- Project cards open a modal with details
- Chatbot is a floating panel (bottom-right), toggleable

## Common Tasks
- **Add a new section:** Add HTML in `index.html`, add section ID to `sectionIds` array in `script.js:66`
- **Update chatbot knowledge:** Edit `worker/knowledge.js` and redeploy Worker
- **Change theme colors:** Edit CSS custom properties in `style.css:1-14`
- **Add images:** Place in `assets/images/` (currently empty)
