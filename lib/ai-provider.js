/**
 * AyushCase Unified AI LLM Provider
 * Supports Groq (Llama 3.3 70B / Llama 3.1 8B), Google Gemini, OpenAI (ChatGPT), 
 * and Classical AYUSH Clinical Knowledge Fallback Engine.
 */

export async function generateLLMResponse({
  systemPrompt,
  userMessage,
  conversationHistory = [],
  temperature = 0.3,
  maxTokens = 800
}) {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. Try Groq Cloud API (groq/compound, openai/gpt-oss-120b, qwen/qwen3.8-27b)
  if (groqKey && groqKey.trim()) {
    const candidateModels = [
      process.env.GROQ_MODEL,
      'groq/compound',
      'openai/gpt-oss-120b',
      'qwen/qwen3.8-27b',
      'groq/compound-mini',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant'
    ].filter(Boolean);

    for (const groqModel of candidateModels) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          { role: 'user', content: userMessage }
        ];

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey.trim()}`
          },
          body: JSON.stringify({
            model: groqModel,
            messages,
            temperature,
            max_tokens: maxTokens,
            top_p: 0.9
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            return {
              text: text.trim(),
              provider: `Groq Cloud (${groqModel})`
            };
          }
        }
      } catch (err) {
        console.warn(`Groq model ${groqModel} failed:`, err.message);
      }
    }
  }

  // 2. Try Google Gemini API (Gemini 1.5 Flash)
  if (geminiKey && geminiKey.trim()) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`;
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

  // 3. Try OpenAI API (ChatGPT / GPT-4o-mini)
  if (openaiKey && openaiKey.trim()) {
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
          Authorization: `Bearer ${openaiKey.trim()}`
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

  // 4. Built-in High Precision Classical AYUSH Knowledge Engine (Offline / Hackathon Demo Fallback)
  return {
    text: null, // Signals caller to use classical knowledge response template
    provider: 'AyushCase Classical Clinical Knowledge Engine (Charaka/Sushruta/ICD-11)'
  };
}
