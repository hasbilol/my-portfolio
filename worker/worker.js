import knowledgeBase from './knowledge.js';

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Allow': 'POST, OPTIONS',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { message } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `
You are a friendly and professional portfolio assistant.
Your role is to help visitors understand the portfolio owner.

KNOWLEDGE BASE:
${knowledgeBase}

INSTRUCTIONS:
- Answer using only the knowledge base
- Be professional, friendly, and concise (2–4 sentences)
- If information is missing, say so politely
- Speak as an assistant representing the portfolio owner
- Highlight skills, projects, and experience confidently
`;

    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'moonshotai/kimi-k2-instruct-0905',
            messages: [
              { role: 'system', content: systemPrompt.trim() },
              { role: 'user', content: message.trim() },
            ],
            temperature: 0.7,
            max_tokens: 250,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        console.error('Groq API error:', response.status, err);
        return new Response(
          JSON.stringify({ error: 'AI service error' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const reply =
        data.choices?.[0]?.message?.content ??
        'Sorry, I could not generate a response.';

      return new Response(
        JSON.stringify({ response: reply }),
        { headers: { 'Content-Type': 'application/json' } }
      );

    } catch (err) {
      console.error('Worker runtime error:', err);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
};
