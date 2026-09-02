/**
 * AyushCase Unified AI LLM Provider
 * Supports Google Gemini, OpenAI (ChatGPT), and Classical AYUSH Clinical Knowledge Fallback Engine.
 */

export async function generateLLMResponse({
  systemPrompt,
  userMessage,
  conversationHistory = [],
  temperature = 0.3,
  maxTokens = 600
}) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

  // 1. Try Google Gemini API (Gemini 1.5 Flash)
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const contents = [];

      // Add conversation history if any
      conversationHistory.forEach((msg) => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }]
      });

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            text: text.trim(),
            provider: 'Google Gemini (gemini-1.5-flash)'
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, trying next provider...', err.message);
    }
  }

  // 2. Try OpenAI API (ChatGPT / GPT-4o-mini)
  if (openaiKey) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        })),
        { role: 'user', content: userMessage }
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature,
          max_tokens: maxTokens
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return {
            text: text.trim(),
            provider: 'OpenAI (GPT-4o-mini)'
          };
        }
      }
    } catch (err) {
      console.warn('OpenAI API call failed, using fallback engine...', err.message);
    }
  }

  // 3. Built-in High Precision Classical AYUSH Knowledge Engine (Offline / Hackathon Demo Fallback)
  return {
    text: null, // Signals caller to use classical knowledge response template
    provider: 'AyushCase Classical Clinical Knowledge Engine (Charaka/Sushruta/ICD-11)'
  };
}
