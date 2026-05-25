# Privacy Policy for LinkGenie

Last updated: 2026-05-25

We value your privacy. This Privacy Policy explains how LinkGenie handles user data. By using the LinkGenie Chrome extension, you agree to the practices outlined below.

## 1. What Data We Collect & How We Use It

LinkGenie is designed as a serverless utility. We do not operate any backend servers and do not collect, monitor, or store your data on our own infrastructure.

- **Authentication Info (API Keys):** To generate drafts, you must configure your personal API Keys for Google Gemini, OpenAI, or Anthropic. These API Keys are stored locally inside your browser profile and are transmitted securely (via HTTPS) directly to the respective AI provider's official endpoint when a request is made.
- **Website Content (LinkedIn Post Text):** When you click the inline "AI Reply" button on LinkedIn, the extension reads the text of the post you are replying to. This content is sent directly to your selected LLM provider as context to generate a draft reply. We do not retain or transmit this text anywhere else.
- **User Settings (Tone, Length, Persona):** Your selected settings (such as preferred tone, draft length, and custom persona) are stored locally to personalize your generation prompts.

## 2. Data Storage

All configurations, keys, and settings are stored locally on your device using the `chrome.storage.sync` API. If you have Chrome sync enabled, these settings may sync across your own authenticated devices via Google's official synchronization servers. We have no access to this data.

## 3. Third-Party Services

When you use LinkGenie, requests are sent directly to the AI provider you select in the settings. These third-party services have their own privacy policies governing how they handle input data:

- **Google Gemini API:** [Google Privacy Policy](https://policies.google.com/privacy)
- **OpenAI API:** [OpenAI Privacy Policy](https://openai.com/privacy)
- **Anthropic Claude API:** [Anthropic Privacy Policy](https://www.anthropic.com/privacy)

Please review the terms and policies of your selected AI provider to understand how they handle your prompts and data.

## 4. Data Sharing & Disclosure

We do not sell, rent, trade, or share any user data with third parties. Data is only sent to the specific AI provider API configured by you, solely to fulfill content generation requests.

## 5. Your Choices & Data Deletion

You can view, update, or delete your API Keys and configurations at any time through the LinkGenie settings page. Uninstalling the extension will automatically purge all associated data from your browser's local storage.

## 6. Changes to This Policy

We may update this Privacy Policy from time to time. Any changes will be updated on this page with the revision date.

## 7. Contact

If you have any questions or concerns regarding this Privacy Policy, please open an issue in the project repository:

[https://github.com/[YOUR_USERNAME]/[YOUR_REPO]/issues](https://github.com/[YOUR_USERNAME]/[YOUR_REPO]/issues)
