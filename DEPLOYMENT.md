# Deployment Guide

## Overview
This portfolio website uses Cloudflare Pages (frontend) + Cloudflare Workers (backend) for deployment.

## Prerequisites
- Cloudflare account
- Groq API key (get one at https://console.groq.com/)

## Customize Your Knowledge Base

**Before deploying**, customize the chatbot's knowledge about you:

1. Open `worker/knowledge.js`
2. Replace the template content with your actual information:
   - About Me: Your background, interests, goals
   - Skills: Your technical skills and expertise
   - Projects: Your projects and what you've built
   - Experience & Education: Your work history and education
   - Contact Information: How people can reach you
   - Additional Information: Any other relevant details

3. The chatbot will use this information to answer questions about you as your assistant

## Deployment Steps

### 1. Deploy Cloudflare Worker (Backend)

1. Install Wrangler CLI (if not already installed):
   ```bash
   npm install -g wrangler
   ```

2. Navigate to the worker directory:
   ```bash
   cd worker
   ```

3. Login to Cloudflare:
   ```bash
   wrangler login
   ```

4. Set the Groq API key as a secret:
   ```bash
   wrangler secret put GROQ_API_KEY
   ```
   (Enter your Groq API key when prompted)

5. Deploy the worker:
   ```bash
   wrangler deploy
   ```

6. Note the worker URL (e.g., `portfolio-chatbot-worker.your-subdomain.workers.dev`)

### 2. Configure Worker Route in Cloudflare Pages

1. Go to your Cloudflare Pages project settings
2. Navigate to "Functions" or "Workers" section
3. Add a route: `/api/*` → Your worker name
4. Or use Cloudflare Dashboard → Workers & Pages → Your Worker → Settings → Triggers → Routes
5. Add route: `yourdomain.com/api/*` (or `*.pages.dev/api/*` for Pages)

### 3. Update Chatbot Worker URL (if needed)

If your worker is deployed at a custom route, update the `WORKER_URL` in `assets/js/chatbot.js`:

```javascript
const WORKER_URL = '/api/chat'; // Default - works with route configuration
// OR use full URL if needed:
// const WORKER_URL = 'https://your-worker.your-subdomain.workers.dev';
```

### 4. Deploy Frontend to Cloudflare Pages

1. Connect your repository to Cloudflare Pages
2. Set build settings:
   - Build command: (none needed - static site)
   - Build output: `/` (root directory)
3. Deploy

### Alternative: Manual Configuration

If you prefer to use a direct worker URL instead of routing:

1. Deploy the worker and get its URL
2. Update `WORKER_URL` in `assets/js/chatbot.js` to the full worker URL
3. Ensure CORS is properly configured (already handled in worker.js)

## Environment Variables

- `GROQ_API_KEY`: Your Groq API key (set in Worker secrets, not in frontend)

## Updating Your Knowledge Base

After customizing `worker/knowledge.js`:
1. Make sure you've replaced all template content with your actual information
2. Redeploy the worker: `cd worker && wrangler deploy`
3. The chatbot will now use your updated information

## Testing

1. Open your deployed site
2. Click the chatbot button (bottom-right)
3. Send a test message
4. Verify the AI response appears

## Troubleshooting

- **Chatbot not responding**: Check browser console for errors, verify worker URL is correct
- **CORS errors**: Ensure worker has proper CORS headers (already configured)
- **API errors**: Verify `GROQ_API_KEY` is set correctly in Worker secrets
- **404 on `/api/chat`**: Ensure worker route is configured in Cloudflare Pages/Workers dashboard

