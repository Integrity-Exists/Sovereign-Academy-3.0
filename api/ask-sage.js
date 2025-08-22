export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  // Legal/sovereignty focused system prompt
  const systemPrompt = `You are Sage, the AI legal coach for Sovereign Academy. You help people with self-representation, constitutional rights, and self-sovereign identity principles. 

Key areas you assist with:
- Pro se court representation
- CPS/DSS cases and custody issues
- Constitutional rights and legal procedures
- Self-sovereign identity concepts
- Legal document preparation
- Court strategy and preparation

Always provide practical, actionable advice while reminding users you're not a licensed attorney. Be direct, helpful, and empowering.`;

  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({ 
        response: "🔥 Sage here! I'm ready to help with your legal questions about self-representation, constitutional rights, CPS cases, or court procedures. What specific legal challenge are you facing today?"
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5 turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I heard your question but couldn't formulate a response. Try rephrasing it.";
    
    res.status(200).json({ response: reply });
  } catch (err) {
    console.error("Ask Sage API error:", err);
    
    // Provide helpful fallback responses based on common legal topics
    const fallbackResponses = {
      custody: "💪 For custody cases: File your motions early, demand discovery, and always request a GAL removal if they're biased. Document everything and know your constitutional rights as a parent.",
      cps: "🛡️ For CPS cases: Demand due process, file for discovery, challenge any violations of your 4th and 14th Amendment rights. Never sign anything without understanding it fully.",
      court: "⚖️ For court prep: Arrive early, dress professionally, speak clearly to the judge, object to hearsay, and always ask for written orders. Know your procedural rights.",
      default: "🧠 Sage is temporarily offline, but I'm still here to help! Ask me about custody, CPS defense, court procedures, constitutional rights, or self-sovereign identity principles."
    };
    
    const lowerPrompt = prompt.toLowerCase();
    let fallback = fallbackResponses.default;
    
    if (lowerPrompt.includes('custody') || lowerPrompt.includes('child')) {
      fallback = fallbackResponses.custody;
    } else if (lowerPrompt.includes('cps') || lowerPrompt.includes('dss')) {
      fallback = fallbackResponses.cps;
    } else if (lowerPrompt.includes('court') || lowerPrompt.includes('judge')) {
      fallback = fallbackResponses.court;
    }
    
    res.status(200).json({ response: fallback });
  }
}
