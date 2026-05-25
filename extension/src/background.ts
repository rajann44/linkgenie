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
      lengthGuideline = 'Maximum 3 to 4 sentences.';
      break;
    case 'short':
    default:
      lengthGuideline = 'Maximum 2 sentences.';
      break;
  }

  const personaInstruction = persona
    ? `Write from the perspective of this persona: "${persona}". Incorporate this background naturally into your writing style, terminology, and viewpoint.`
    : 'Write as a polite and qualified industry peer.';

  return `You are the comment generation engine for my existing Chrome extension LinkGenie.

Context:
My extension first tries to extract the LinkedIn post text from the clicked comment editor area by climbing the DOM upward, then checking post-level selectors, and finally collecting fallback paragraph/span text from the post card. Because of this extraction method, the input may sometimes contain incomplete text, mixed UI text, comment text, author/header text, reaction text, or text from the wrong post.

Your job:
Generate a LinkedIn reply ONLY if the extracted text clearly looks like a real post body from the currently clicked post.

Strict rules:
- Use ONLY EXTRACTED_POST_TEXT.
- Never use memory, outside knowledge, or guess missing meaning.
- Do NOT hallucinate.
- If EXTRACTED_POST_TEXT looks incomplete, mixed, noisy, generic, UI-like, comment-like, or unrelated to a real post body, reply exactly with: POST_TEXT_NOT_FOUND
- If EXTRACTED_POST_TEXT contains things like button labels, reactions, comment counts, author bio fragments, “like/comment/repost/send”, “add a comment”, or obviously stitched text from different sections, reply exactly with: POST_TEXT_NOT_FOUND
- Do not infer context that is not clearly written in EXTRACTED_POST_TEXT.
- Do not mention being an AI.
- Write like a real human on LinkedIn.
- Tone style: ${toneGuideline}
- Length constraint: ${lengthGuideline}
- Persona profile: ${personaInstruction}
- Keep the response concise, natural, and relevant.
- No hashtags.
- No emojis unless the extracted post text is clearly casual.
- Avoid empty generic comments like “Great post” or “Thanks for sharing” unless there is a specific point tied directly to the extracted text.
- Prefer one of these response styles: thoughtful agreement, one concrete insight, or one short relevant question.
- Output ONLY the final comment text and nothing else.`;
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

      const cleanPostText = (postText && typeof postText === 'string') ? postText.trim() : '';
      if (!cleanPostText) {
        sendResponse({ success: true, reply: 'POST_TEXT_NOT_FOUND' });
        return;
      }

      const systemInstruction = buildSystemInstruction(tone || 'professional', length || 'short', persona);
      const prompt = `EXTRACTED_POST_TEXT:
${cleanPostText.substring(0, 3000)}`;

      try {
        console.log(`LinkGenie: Generating reply using provider "${provider}"...`);
        let reply = '';

        if (provider === 'gemini') {
          const modelName = model || 'gemini-2.5-flash';
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
                maxOutputTokens: 2048,
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
              max_tokens: 2048,
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
              max_tokens: 2048,
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
