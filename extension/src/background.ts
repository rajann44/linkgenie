// Listen for messages from content script or options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'generateReply') {
    const { postText, tone, length } = message;

    // Fetch settings from chrome.storage
    chrome.storage.sync.get(['apiUrl', 'provider', 'apiKey', 'model', 'persona'], async (items) => {
      const apiUrl = items.apiUrl || 'http://localhost:3000/api/generate';
      const provider = items.provider || 'gemini';
      const apiKey = items.apiKey || '';
      const model = items.model || '';
      const persona = items.persona || '';

      try {
        console.log(`Sending draft generation request to ${apiUrl}...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            postText,
            tone,
            length,
            persona,
            provider,
            apiKey,
            model
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`API returned status ${response.status}: ${errText || response.statusText}`);
        }

        const data = await response.json();
        if (data && data.reply) {
          sendResponse({ success: true, reply: data.reply });
        } else {
          throw new Error('API returned invalid JSON response format.');
        }
      } catch (error: any) {
        console.error('Error generating reply:', error);
        let errorMsg = 'Failed to generate reply.';
        if (error.name === 'AbortError') {
          errorMsg = 'API request timed out (20 seconds).';
        } else if (error.message) {
          errorMsg = error.message;
        }
        sendResponse({ success: false, error: errorMsg });
      }
    });

    return true; // Keeps the sendResponse channel open for async operations
  }
});
