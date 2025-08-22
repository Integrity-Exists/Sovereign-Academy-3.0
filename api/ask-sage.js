export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Return helpful fallback response
      const fallbackResponse = getFallbackResponse(prompt);
      return res.json({ response: fallbackResponse });
    }

    // Make request to OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API Error:', errorText);
      
      // Return fallback response on API error
      const fallbackResponse = getFallbackResponse(prompt);
      return res.json({ response: fallbackResponse });
    }

    const data = await openaiResponse.json();
    const response = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';
    
    res.json({ response });
  } catch (error) {
    console.error('Handler error:', error);
    
    // Return fallback response on any error
    const fallbackResponse = getFallbackResponse(req.body?.prompt || '');
    res.json({ response: fallbackResponse });
  }
}

function getFallbackResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('custody') || lowerPrompt.includes('child')) {
    return "For custody cases: Always file your motions promptly, demand full discovery, and challenge any GAL that shows bias. Document everything and assert your parental rights under the 14th Amendment. Remember, I'm not a licensed attorney - this is educational information only.";
  }
  
  if (lowerPrompt.includes('cps') || lowerPrompt.includes('dss')) {
    return "For CPS/DSS cases: Demand due process immediately, file for all discovery, and challenge any 4th or 14th Amendment violations. Never sign safety plans without legal review. This is educational guidance - consult with a licensed attorney for your specific situation.";
  }
  
  if (lowerPrompt.includes('court') || lowerPrompt.includes('judge') || lowerPrompt.includes('hearing')) {
    return "For court preparation: Dress professionally, arrive early, address the judge as 'Your Honor', object to hearsay, and always request written orders. Know your procedural rights and local court rules. This is general guidance - not legal advice.";
  }
  
  if (lowerPrompt.includes('traffic') || lowerPrompt.includes('ticket') || lowerPrompt.includes('citation')) {
    return "For traffic matters: Challenge jurisdiction, demand proof of calibration for speed devices, and question the officer's training. Many tickets can be dismissed on procedural grounds. This is educational information only.";
  }
  
  return "Hello! I'm Sage, your AI legal coach for self-representation education. While I can provide general information about legal procedures and rights, I'm not a licensed attorney and this isn't legal advice. What specific area of law are you dealing with? (custody, CPS, traffic, criminal, housing, etc.)";
}
