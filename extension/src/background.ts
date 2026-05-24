// System instruction builder for the LLM
function buildSystemInstruction(tone: string, length: string, persona: string): string {
  let toneGuideline = '';
  switch (tone) {
    case 'warm':
      toneGuideline = 'friendly, encouraging, supportive, and appreciative. Show genuine interest.';
      break;
    case 'thoughtful':
      toneGuideline = 'analytical, inquisitive, adding constructive value, or asking an insightful question. Deepen the conversation.';
      break;
    case 'concise':
      toneGuideline = 'extremely direct, crisp, and to-the-point. Eliminate all filler words.';
      break;
    case 'professional':
    default:
      toneGuideline = 'knowledgeable, polite, balanced, objective, and constructive. Sound like an experienced industry professional.';
      break;
  }

  let lengthGuideline = '';
  switch (length) {
    case 'medium':
      lengthGuideline = 'Keep the reply around 3 to 4 sentences max. Provide a bit of substance.';
      break;
    case 'short':
    default:
      lengthGuideline = 'Keep the reply very brief, around 1 to 2 sentences max. Absolutely no fluff.';
      break;
  }

  const personaInstruction = persona
    ? `Write from the perspective of this persona: "${persona}". Incorporate this background naturally into your writing style, terminology, and viewpoint.`
    : 'Write as a polite and qualified industry peer.';

  return `You are an expert copywriter helping a user draft comment replies on LinkedIn.
Your goal is to write a reply that is organic, authentic, highly personalized to the post, and adds value.

CRITICAL: The reply must be highly contextual and specific to the post content provided.
- Do NOT write generic, vague statements that could apply to any post.
- Explicitly reference a specific point, key concept, lesson, or terminology mentioned in the post to prove you read it and are engaging with their ideas.
- Provide a brief, constructive thought, personal agreement/disagreement, or ask a specific relevant question about their main topic.

IMPORTANT: Avoid "LinkedIn Cringe" and hype.
- Do NOT use exaggerated praise (e.g., "Incredible achievement!", "Congrats on the launch!", "Game-changing!", "Super exciting!").
- Do NOT use typical spam-bot phrases (e.g., "Thanks for sharing!", "Spot on!", "Couldn't agree more!", "Let's connect!").
- Do NOT use call-to-action (CTA) language or self-promotional pitches.
- Do NOT use hashtags unless absolutely critical. Prefer zero.
- Limit emojis to 0 or 1 at most.
- Sound like a real, competent professional having a normal, intelligent conversation.
- If the original post content is too short, generic, or unclear, generate a safe, polite, neutral reply.

Writing Style Guidelines:
- Tone: ${toneGuideline}
- Length: ${lengthGuideline}
- Persona Context: ${personaInstruction}

Format: Return ONLY the raw reply text. Do not wrap the response in quotation marks, and do not prefix it with label text like "Reply:" or "Here is your reply:".`;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'generateReply') {
    const { postText, tone, length } = message;

    // Fetch settings from chrome.storage
    chrome.storage.sync.get(['provider', 'apiKey', 'model', 'persona'], async (items) => {
      const provider = (items.provider || 'gemini').toLowerCase();
      const apiKey = items.apiKey || '';
      const model = items.model || '';
      const persona = items.persona || '';

      if (!apiKey) {
        sendResponse({ 
          success: false, 
          error: 'API Key is missing. Please open the LinkGenie options page (from the extension icon) and enter your API Key.' 
        });
        return;
      }

      const systemInstruction = buildSystemInstruction(tone || 'professional', length || 'short', persona);
      
      const cleanPostText = (postText && typeof postText === 'string') ? postText.trim() : '';
      let prompt = '';
      if (!cleanPostText) {
        prompt = `Draft a polite, professional, and generalized LinkedIn comment that is engaging, supportive, and adds general value to a professional network post in this user's industry.`;
      } else {
        prompt = `Here is the LinkedIn post text I want to reply to:
"""
${cleanPostText.substring(0, 3000)}
"""

Draft a reply to this post following your system instructions.`;
      }

      try {
        console.log(`LinkGenie: Generating reply using provider "${provider}"...`);
        let reply = '';

        if (provider === 'gemini') {
          const modelName = model || 'gemini-1.5-flash';
          // Use standard Google Generative Language API
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              systemInstruction: { parts: [{ text: systemInstruction }] },
              generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7
              }
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || response.statusText;
            throw new Error(`Google API error (${response.status}): ${errMsg}`);
          }

          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            throw new Error('Gemini API returned an empty content candidate.');
          }
          reply = text.trim();

        } else if (provider === 'openai') {
          const modelName = model || 'gpt-4o-mini';
          const url = 'https://api.openai.com/v1/chat/completions';

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: prompt }
              ],
              max_tokens: 500,
              temperature: 0.7
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || response.statusText;
            throw new Error(`OpenAI API error (${response.status}): ${errMsg}`);
          }

          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (!text) {
            throw new Error('OpenAI API returned an empty choices content.');
          }
          reply = text.trim();

        } else if (provider === 'anthropic') {
          const modelName = model || 'claude-3-haiku-20240307';
          const url = 'https://api.anthropic.com/v1/messages';

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'dangerously-allow-browser': 'true'
            },
            body: JSON.stringify({
              model: modelName,
              max_tokens: 500,
              temperature: 0.7,
              system: systemInstruction,
              messages: [
                { role: 'user', content: prompt }
              ]
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || response.statusText;
            throw new Error(`Anthropic API error (${response.status}): ${errMsg}`);
          }

          const data = await response.json();
          const text = data.content?.[0]?.text;
          if (!text) {
            throw new Error('Anthropic API returned an empty messages text content.');
          }
          reply = text.trim();

        } else {
          throw new Error(`Unsupported provider: ${provider}`);
        }

        sendResponse({ success: true, reply });
      } catch (error: any) {
        console.error('LinkGenie: Generation error:', error);
        sendResponse({ success: false, error: error.message || 'Failed to generate reply.' });
      }
    });

    return true; // Keep message channel open for async fetch
  }
});
