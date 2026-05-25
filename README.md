<div align="center">

<img src="extension/icons/icon128.png" alt="LinkGenie Logo" width="96" height="96" />

# LinkGenie 🧞‍♂️

**Privacy-first, serverless AI assistant that drafts context-aware LinkedIn replies inline — directly in your feed.**

<br/>

[![Available on Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/linkgenie/gmcfeelffpkcnkllliimpkdpfiijigfh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)](https://github.com/rajann44/linkgenie/releases/tag/v1.0.0)
[![Open Source](https://img.shields.io/badge/Open%20Source-MIT-brightgreen?style=for-the-badge&logo=github)](https://github.com/rajann44/linkgenie)

<br/>

<a href="https://chromewebstore.google.com/detail/linkgenie/gmcfeelffpkcnkllliimpkdpfiijigfh">
  <img src="https://img.shields.io/badge/Install%20on-Chrome%20Web%20Store-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white&labelColor=1a1a2e" alt="Install on Chrome Web Store" height="48" />
</a>

<sub>🔍 Extension ID: <code>gmcfeelffpkcnkllliimpkdpfiijigfh</code> &nbsp;·&nbsp; Verified & published by Google Chrome Web Store review</sub>

</div>

---

LinkGenie is a 100% serverless Chrome Extension (Manifest V3) that communicates **directly with LLM API endpoints from your browser** — no backend server, no tracking, no external databases. Reviewed and published on the **Chrome Web Store**.


---

## Screenshots

<table>
  <tr>
    <td align="center">
      <img src="cws_assets/screenshot1.png" alt="LinkGenie Draft Modal on LinkedIn" width="480" /><br/>
      <sub><b>AI Reply modal on LinkedIn</b></sub>
    </td>
    <td align="center">
      <img src="cws_assets/screenshot2.png" alt="LinkGenie Options & Configuration" width="480" /><br/>
      <sub><b>Options & API configuration panel</b></sub>
    </td>
  </tr>
</table>

---

## Key Features

| Feature | Description |
|---|---|
| 🔒 **100% Serverless & Private** | Direct API calls to LLM providers from your browser's service worker. API keys stored securely in `chrome.storage.sync`. |
| 🧠 **Context-Aware Drafting** | Automatically parses the parent post's content to generate relevant, personalized drafts instead of generic replies. |
| ⚙️ **Multiple AI Providers** | Native support for **Google Gemini**, **OpenAI**, and **Anthropic Claude**. |
| 🎭 **Custom Persona & Tone** | Tailor drafts by setting your professional background or preferred communication style. |
| 📂 **Open Source & Auditable** | MIT licensed. Inspect the full source — no black boxes. |

---

## Installation & Setup

### ✅ Option A: Install from Chrome Web Store (Easiest)

Click the badge below or visit the Chrome Web Store listing directly:

**[→ Install LinkGenie from the Chrome Web Store](https://chromewebstore.google.com/detail/linkgenie/gmcfeelffpkcnkllliimpkdpfiijigfh)**

No manual ZIP extraction required — one click and you're ready.

### Option B: Install Pre-built Release (Manual)
1. Download the latest release package (`linkgenie-v1.0.0.zip`) from [GitHub Releases](https://github.com/rajann44/linkgenie/releases).
2. Unzip the downloaded file to a directory on your computer.
3. Open Google Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** using the toggle switch in the top-right corner.
5. Click the **Load unpacked** button in the top-left.
6. Select the folder where you extracted the release ZIP.

### Option C: Build from Source (For Developers)
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Clone the repository and build the project:
   ```bash
   cd extension
   npm install
   npm run build
   ```
   *(Use `npm run watch` to auto-compile changes during development.)*
3. Open Chrome → `chrome://extensions/` → Enable **Developer mode** → **Load unpacked** → select the `extension/` directory.

---

## Configuration

1. Click the **LinkGenie** icon in your Chrome toolbar to open the **Options Page**.
2. Select your preferred **LLM Provider** (Google Gemini, OpenAI, or Anthropic Claude).
3. Enter your **API Key** (stored securely on your device — never transmitted to our servers).
4. *(Optional)* Override the **Model Name** or add a custom **Persona** (e.g. *"Helpful product engineer, tone: technical, keep it concise"*).
5. Click **Save Configuration**.

Open LinkedIn, expand the comments on any post, and click the **AI Reply** button to generate contextual responses! ✨

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Bundler | `esbuild` |
| APIs | Google Gemini, OpenAI, Anthropic Claude (direct REST) |
| Storage | `chrome.storage.sync` |
| Manifest | Chrome Extension Manifest V3 |

---

## License

[MIT](https://opensource.org/licenses/MIT) — free to use, inspect, modify, and distribute.
