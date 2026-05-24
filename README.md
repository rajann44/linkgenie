# LinkGenie 🧞‍♂️

LinkGenie is a premium, 100% serverless Chrome Extension (Manifest V3) that drafts personalized, context-aware, and professional replies to LinkedIn posts. 

Because LinkGenie is completely serverless, **it communicates directly with LLM API endpoints from your browser**. No backend server setup, hosting, or external database is required.

---

## Key Features

- **100% Serverless & Private**: Direct API calls to LLM providers from your browser's service worker. Your API keys are stored securely in `chrome.storage.sync`.
- **Context-Aware Scraper**: Automatically parses the parent post's content to generate relevant, personalized drafts instead of generic replies.
- **Multiple AI Providers**: Native support for **Google Gemini**, **OpenAI**, and **Anthropic Claude**.
- **Custom Persona/Tone**: Tailor drafts by setting your professional background or preferred communication style.
- **React-Safe Text Injection**: Programmatically populates LinkedIn's dynamic text editors safely.

---

## Quick Setup

### 1. Build the Extension
Ensure you have Node.js installed, then run:

```bash
# Navigate to the extension folder
cd extension

# Install build dependencies
npm install

# Build the extension bundle
npm run build
```
*(Run `npm run watch` if you are actively modifying the source code).*

### 2. Install in Chrome
1. Open Google Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** (top-left button).
4. Select the `extension/` directory in this repository.

### 3. Configure API Keys
1. Click the **LinkGenie** extension icon in your Chrome toolbar to open the **Options Page**.
2. Select your preferred **LLM Provider** (e.g., Google Gemini).
3. Enter your **API Key**.
4. (Optional) Customise the **Model Name** or specify a **Persona** (e.g., *"Helpful product engineer, keep it under 2 sentences"*).
5. Click **Save Configuration**.

Now, open LinkedIn and look for the 🧞‍♂️ **AI Reply** button under any post's comment field!

---

## Tech Stack
- **Languages**: TypeScript, HTML, CSS
- **Bundler**: `esbuild`
- **APIs**: Direct REST calls to Google Gemini, OpenAI, and Anthropic Claude endpoints.
- **Storage**: `chrome.storage.sync` for credentials and configurations.

---

## License
MIT
