# Chrome Web Store Listing — LinkGenie

> Last Updated: 2026-05-25

## Store Listing

**Extension Name** [REQUIRED]
`LinkGenie`

**Short Description** [REQUIRED]
`Draft professional, contextual LinkedIn replies inline using AI with LinkGenie.`

**Detailed Description** [REQUIRED]
```text
LinkGenie is a lightweight, privacy-focused productivity assistant designed to help you draft context-aware replies to LinkedIn posts directly from your feed. 

Stop wasting time staring at a blank text box trying to craft the perfect response. Whether you want to provide professional insights, support a connection with a warm message, or ask an analytical question, LinkGenie helps you build engaging, natural-sounding replies that match the conversation flow.

### Key Features
- Contextual Drafts: Instantly extracts the text of the LinkedIn post you are viewing to generate highly relevant replies.
- Dynamic Presets: Choose from multiple tones (Professional, Warm, Thoughtful/Intellectual, or Concise/Short) to match your voice.
- Flexible Lengths: Select between Short (up to 2 sentences) or Medium (up to 4 sentences) presets.
- Personalization Profiles: Customize a default persona (e.g. "A senior web performance developer") so generated drafts sound naturally like you.
- Inline Integration: Seamlessly adds an "AI Reply" button right next to the native LinkedIn comment input emojis and icons.
- Fully Serverless: Connects directly to Google Gemini, OpenAI GPT, or Anthropic Claude using your own API Key—no middleman, no tracking, and no external storage of your data.

### How to Use It
1. Click the extension icon and select your preferred LLM Provider (Gemini, OpenAI, or Claude).
2. Enter your API Key and customize your persona profile.
3. Navigate to any LinkedIn post and open the comment section.
4. Click the "AI Reply" button next to the Emoji/Photo toolbar under the comment field.
5. In the LinkGenie window, review the scraped post content, adjust the Tone/Length, and click "Generate Draft".
6. Click "Insert Reply" to copy the generated response directly into the LinkedIn composer.

### Privacy First
LinkGenie is 100% serverless. We do not operate any backend servers. Your settings, API keys, and configurations are stored securely inside your local browser profile. Post data and API keys are only transmitted directly to your chosen AI endpoint (Google, OpenAI, or Anthropic) via official secure HTTPS connections.
```

**Category** [REQUIRED]
`Productivity`

**Single Purpose** [REQUIRED]
`Drafts contextual reply options for LinkedIn posts based on selected tone and length settings.`

**Primary Language** [REQUIRED]
`English`


## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `extension/icons/icon128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | |

### Screenshot Notes
- **Screenshot 1:** Show the inline "AI Reply" button positioned next to the comment toolbar on a LinkedIn post.
- **Screenshot 2:** Show the LinkGenie dialog modal open with the extracted post text populated, options selected, and a draft reply generated.
- **Screenshot 3:** Show the options/settings page with the LLM configurations and the personalization profiles.


## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Used to locally store extension preferences (provider, API keys, models, and custom personas) in the user's secure browser profile. |
| `https://*.linkedin.com/*` | host_permissions | Required to detect the active comment composer, scan parent elements for post text, and automatically inject the inline trigger button. |
| `https://generativelanguage.googleapis.com/*` | host_permissions | Required to perform secure content generation requests directly to the Google Gemini API. |
| `https://api.openai.com/*` | host_permissions | Required to perform secure content generation requests directly to the OpenAI GPT API. |
| `https://api.anthropic.com/*` | host_permissions | Required to perform secure content generation requests directly to the Anthropic Claude API. |


## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Authentication info | No | Yes (API Key) | Transmitted securely (HTTPS) only to your selected provider (Google, OpenAI, or Anthropic) to authenticate and generate drafts. Never stored on our own servers. | No |
| Website content | Yes | Yes (Post Text) | Reads public LinkedIn post text locally to formulate the prompt context. Sent directly to your selected LLM API to generate draft replies. | No |
| User activity | Yes | No | Selected tone, length presets, and persona are stored locally in the browser to maintain settings across sessions. | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes


## Privacy Policy

**Privacy Policy URL** [REQUIRED]
`https://github.com/[YOUR_USERNAME]/[YOUR_REPO]/blob/main/PRIVACY_POLICY.md` (Update with your live URL once pushed)


## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free


## Developer Info

**Publisher Name** [REQUIRED]
`[YOUR_PUBLISHER_NAME]`

**Contact Email** [REQUIRED]
`[YOUR_EMAIL]`

**Support URL / Email** [RECOMMENDED]
`https://github.com/[YOUR_USERNAME]/[YOUR_REPO]/issues` (Alternatively: `https://[YOUR-VERCEL-DOMAIN].vercel.app/#support`)

**Homepage URL** [RECOMMENDED]
`https://github.com/[YOUR_USERNAME]/[YOUR_REPO]`


## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-05-25 | Initial release with support for inline AI replies, multiple tone/length settings, and custom personas. | Draft |


## Review Notes

### Known Issues / Limitations
- None.
