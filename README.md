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

## Installation & Setup

### Option A: Install Pre-built Release (Recommended)
1. Download the latest release package (`linkgenie-v1.0.0.zip`) from the [GitHub Releases](https://github.com/rajann44/linkgenie/releases) section.
2. Unzip the downloaded file to a directory on your computer.
3. Open Google Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** using the toggle switch in the top-right corner.
5. Click the **Load unpacked** button in the top-left.
6. Select the folder where you extracted the release ZIP.

### Option B: Build from Source (For Developers)
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Clone the repository and build the project:
   ```bash
   # Navigate to the extension folder
   cd extension

   # Install development dependencies
   npm install

   # Compile the production bundle
   npm run build
   ```
   *(Use `npm run watch` if you want to automatically compile code changes during active development).*
3. Open Google Chrome and go to `chrome://extensions/`.
4. Enable **Developer mode**.
5. Click **Load unpacked** and select the `extension/` directory.

---

## Configuration

1. Click the **LinkGenie** extension icon in your Chrome toolbar to open the **Options Page**.
2. Select your preferred **LLM Provider** (Google Gemini, OpenAI, or Anthropic Claude).
3. Enter your **API Key** (stored securely on your device).
4. *(Optional)* Override the **Model Name** or configure a custom **Persona** (e.g. *"Helpful product engineer, tone: technical, keep it under 2 sentences"*).
5. Click **Save Configuration**.

Now, open LinkedIn, expand the comments on any post, and click the **AI Reply** button to generate contextual responses!

---

## Tech Stack
- **Languages**: TypeScript, HTML, CSS
- **Bundler**: `esbuild`
- **APIs**: Direct REST calls to Google Gemini, OpenAI, and Anthropic Claude endpoints.
- **Storage**: `chrome.storage.sync` for credentials and configurations.

---

## License
MIT
