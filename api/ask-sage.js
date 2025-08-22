export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();

  // Friendly health check in browser
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, info: 'Use POST to chat with Sage.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // --- Body parsing that works on Vercel Node 20 ---
    let body = {};
    if (req.body && typeof req.body === 'object') {
      body = req.body;
    } else if (typeof req.body === 'string') {
      try { body = JSON.parse(req.body); } catch { body = {}; }
    } else {
      // raw read (covers cases where req.body isn't populated)
      const raw = await new Promise((resolve) => {
        let data = '';
        req.on('data', (c) => (data += c));
        req.on('end', () => resolve(data));
      });
      try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
    }

    const prompt = body.prompt ?? '';
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    // --- OpenAI call (kept as-is) ---
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.json({ response: getFallbackResponse(prompt) });
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are Sage, an AI legal coach for the Sovereign Academy. You help people with legal self-representation and understanding their rights.

Key guidelines:
- Always remind users you're not a licensed attorney and this isn't legal advice
- Focus on self-representation education and empowerment
- Provide practical guidance for court procedures
- Emphasize constitutional rights and due process
- Be supportive but realistic about legal challenges
- Suggest consulting licensed attorneys for complex matters
- Use accessible language, not legal jargon`
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      console.error('OpenAI API Error:', await openaiResponse.text());
      return res.json({ response: getFallbackResponse(prompt) });
    }

    const data = await openaiResponse.json();
    const response =
      data.choices?.[0]?.message?.content ||
      'I apologize, but I could not generate a response at this time.';

    return res.json({ response });
  } catch (error) {
    console.error('Handler error:', error);
    return res.json({ response: getFallbackResponse('') });
  }
}

function getFallbackResponse(prompt = '') {
  const p = (prompt || '').toLowerCase();
  if (p.includes('custody') || p.includes('child')) {
    return "For custody cases: Always file your motions promptly, demand full discovery, and challenge any GAL that shows bias. Document everything and assert your parental rights under the 14th Amendment. I'm not a licensed attorney—this is educational info only.";
  }
  if (p.includes('cps') || p.includes('dss')) {
    return "For CPS/DSS cases: Demand due process immediately, request all discovery, and challenge any 4th or 14th Amendment violations. Never sign safety plans without legal review. This is educational guidance—consult a licensed attorney for your situation.";
  }
  if (p.includes('court') || p.includes('judge') || p.includes('hearing')) {
    return "Court prep: Arrive early, address the judge as 'Your Honor', object to hearsay, and request written orders. Know your local rules. This is general guidance—not legal advice.";
  }
  if (p.includes('traffic') || p.includes('ticket') || p.includes('citation')) {
    return "Traffic matters: Ask for device calibration proof and training records; many tickets hinge on procedure. Educational info only.";
  }
  return "Hi! I'm Sage, your AI legal coach for self-representation education. I’m not a lawyer and this isn’t legal advice—but I can help you learn procedures and rights. What area are you dealing with (custody, CPS, traffic, criminal, housing, etc.)?";
}
