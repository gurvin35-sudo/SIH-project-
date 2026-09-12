/**
 * AyushCase Unified AI LLM Provider
 * Supports Groq Cloud (Ultra-fast open models), Google Gemini, OpenAI (ChatGPT), 
 * and Classical AYUSH Clinical Knowledge Fallback Engine.
 */

export async function generateLLMResponse({
  systemPrompt,
  userMessage,
  conversationHistory = [],
  temperature = 0.3,
  maxTokens = 650
}) {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. Try Groq Cloud API with top fast and resilient models
  if (groqKey && groqKey.trim()) {
    const candidateModels = [
      process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'llama-3.1-70b-versatile',
      'gemma2-9b-it',
      'mixtral-8x7b-32768'
    ].filter(Boolean);

    // Remove duplicates
    const uniqueModels = Array.from(new Set(candidateModels));

    for (const groqModel of uniqueModels) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-4).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          { role: 'user', content: userMessage }
        ];

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          signal: AbortSignal.timeout(10000),
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
          let rawText = data.choices?.[0]?.message?.content;
          if (rawText && typeof rawText === 'string') {
            // Strip any chain-of-thought <think>...</think> tags
            rawText = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            if (rawText.length > 20) {
              return {
                text: rawText,
                provider: `Groq Cloud (${groqModel})`
              };
            }
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn(`Groq model ${groqModel} status ${res.status}:`, errData?.error?.message || res.statusText);
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

      // Add conversation history
      conversationHistory.slice(-3).forEach((msg) => {
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
        signal: AbortSignal.timeout(9000),
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
        if (text && text.trim().length > 20) {
          return {
            text: text.trim(),
            provider: 'Google Gemini (gemini-1.5-flash)'
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed:', err.message);
    }
  }

  // 3. Try OpenAI API (ChatGPT / GPT-4o-mini)
  if (openaiKey && openaiKey.trim()) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-3).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        })),
        { role: 'user', content: userMessage }
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: AbortSignal.timeout(9000),
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
        if (text && text.trim().length > 20) {
          return {
            text: text.trim(),
            provider: 'OpenAI (GPT-4o-mini)'
          };
        }
      }
    } catch (err) {
      console.warn('OpenAI API call failed:', err.message);
    }
  }

  // 4. Built-in High Precision Classical AYUSH Knowledge Engine (Offline / Zero-API Fallback)
  return {
    text: null,
    provider: 'AyushCase Classical Clinical Knowledge Engine (Charaka/Sushruta/ICD-11)'
  };
}
