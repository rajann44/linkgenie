// Centralized configuration for selectors and fallbacks
const SELECTORS = {
  // LinkedIn contenteditable comment input box
  commentEditor: 'div[contenteditable="true"]',
  
  // Containers representing comment blocks
  commentBoxContainer: '.comments-comment-box, .comments-comment-box-comment__text-editor, .comments-comment-textarea, .comment-box',
  
  // Sibling actions bar where we append our trigger button
  actionBar: '.comments-comment-box__actions, .comments-comment-box__form-container, .comments-comment-box__form, .comments-comment-box__editor-container',
  
  // Submit/post button container in the actions bar (for inserting nearby)
  submitContainer: '.comments-comment-box__submit-button-container, .comments-comment-box__post-button',

  // Parents representing the update/post card
  postCard: 'div.feed-shared-update-v2, div[data-urn], article, .feed-shared-update, .occludable-update, .feed-shared-update-v2__comments-container',
  
  // Selectors for finding post content text inside a post card
  postText: [
    'p[componentkey*="feed-commentary"]',
    '[componentkey*="commentary"]',
    '[class*="commentary"]',
    '.feed-shared-update-v2__description-text',
    '.update-components-text',
    '.feed-shared-text',
    '[class*="description-text"]',
    '[class*="update-components-text"]',
    '.feed-shared-update-v2__commentary',
    '.feed-shared-update-v2__commentary-wrapper',
    '.feed-shared-inline-show-more-text'
  ]
};

// State variables for currently active composer
let activeEditor: HTMLElement | null = null;
let activePostText = '';
let currentTone = 'professional';
let currentLength = 'short';
let activeContainer: HTMLElement | null = null;

// Initialize shadow DOM root
let shadowRootElement: ShadowRoot | null = null;

// Debounce helper
let scanTimeout: number | null = null;
let isGenerating = false;

/**
 * Traverses up from a comment composer to find the parent post text content.
 */
/**
 * Helper to determine if an element resides inside a comment box, thread list, or reply node.
 * This checks obfuscated componentkeys, data-testids, and standard class naming patterns.
 */
function isInsideCommentSection(el: HTMLElement, stopAt?: HTMLElement): boolean {
  let curr: HTMLElement | null = el;
  while (curr) {
    if (stopAt && curr === stopAt) {
      break;
    }
    const compKey = (curr.getAttribute('componentkey') || '').toLowerCase();
    const testId = (curr.getAttribute('data-testid') || '').toLowerCase();
    const className = (curr.className || '').toLowerCase();
    
    // Ignore elements or parents that are part of the main post commentary description
    if (
      compKey.includes('commentary') ||
      className.includes('commentary')
    ) {
      curr = curr.parentElement;
      continue;
    }

    if (
      compKey.includes('comment-') ||
      compKey.includes('replaceablecomment_') ||
      compKey.includes('commentlist') ||
      compKey.includes('commentbox') ||
      testId.includes('comment') ||
      (className.includes('comment') && !className.includes('commentary'))
    ) {
      return true;
    }
    curr = curr.parentElement;
  }
  return false;
}

/**
 * Traverses up from a comment composer to find the parent post text content.
 */
function extractPostText(editor: HTMLElement): string {
  // 1. Find the parent post card, bypassing nested comment items
  let current: HTMLElement | null = editor;
  let postCardElement: HTMLElement | null = null;
  while (current) {
    const role = current.getAttribute('role') || '';
    const compKey = current.getAttribute('componentkey') || '';
    
    // Check if the current element belongs to a comment item so we keep climbing
    const isComment = current.classList.contains('comments-comment-item') ||
                      current.classList.contains('comment-item') ||
                      current.closest('.comments-comment-item') ||
                      current.closest('.comment-item') ||
                      (current.getAttribute('data-id') || '').startsWith('comment-');

    if (!isComment) {
      if (
        current.tagName === 'ARTICLE' ||
        current.hasAttribute('data-urn') ||
        role === 'listitem' ||
        compKey.includes('FeedType_MAIN_FEED') ||
        current.classList.contains('feed-shared-update-v2') ||
        current.classList.contains('occludable-update') ||
        current.classList.contains('feed-shared-update')
      ) {
        postCardElement = current;
        break;
      }
    }
    current = current.parentElement;
  }

  // Fallback if no container card is found
  if (!postCardElement) {
    let temp = editor;
    for (let i = 0; i < 16; i++) {
      if (temp.parentElement) temp = temp.parentElement;
    }
    postCardElement = temp;
  }

  if (!postCardElement) {
    console.warn('AI Reply Extension: Could not resolve parent post card.');
    return '';
  }

  console.log('AI Reply Extension: Found post card container:', postCardElement.tagName, postCardElement.className);

  // Find the comments section container (the child of postCardElement that contains the editor)
  let commentsContainer: HTMLElement | null = null;
  let curr = editor;
  while (curr && curr.parentElement && curr.parentElement !== postCardElement) {
    curr = curr.parentElement;
  }
  if (curr && curr.parentElement === postCardElement) {
    commentsContainer = curr;
  }

  // Find the header container by climbing up from the profile link
  let headerContainer: HTMLElement | null = null;
  const profileLink = postCardElement.querySelector('a[href*="/in/"], a[href*="/company/"]');
  if (profileLink) {
    let currHeader = profileLink as HTMLElement;
    while (currHeader && currHeader.parentElement && currHeader.parentElement !== postCardElement) {
      currHeader = currHeader.parentElement;
    }
    if (currHeader && currHeader.parentElement === postCardElement) {
      headerContainer = currHeader;
    }
  }

  // 2. Try to query known selectors FIRST (explicitly checking .expandable-text-box)
  const knownSelectors = [
    '.expandable-text-box',
    '.feed-shared-inline-show-more-text',
    'p[componentkey*="feed-commentary"]',
    '[class*="commentary"]'
  ];

  for (const selector of knownSelectors) {
    const el = postCardElement.querySelector(selector) as HTMLElement;
    if (el) {
      // Make sure it's not inside comments or header
      const insideComments = commentsContainer && commentsContainer.contains(el);
      const insideHeader = headerContainer && headerContainer.contains(el);
      if (!insideComments && !insideHeader) {
        let text = (el.textContent || '').trim();
        text = text.replace(/\bsee\s+more\b/gi, '').trim();
        if (text.length > 15) {
          console.log(`AI Reply Extension: Found post text via primary selector "${selector}":`, text);
          return text;
        }
      }
    }
  }

  // 3. Fallback to class-agnostic scanner if known selectors fail
  console.log('AI Reply Extension: Primary selectors failed. Falling back to class-agnostic scanner...');
  const paragraphs = postCardElement.querySelectorAll('p, span');
  const validSegments: string[] = [];

  paragraphs.forEach((p) => {
    const el = p as HTMLElement;

    // Skip if it's inside the comments container
    if (commentsContainer && commentsContainer.contains(el)) {
      return;
    }

    // Skip if it's inside the header container
    if (headerContainer && headerContainer.contains(el)) {
      return;
    }

    // Skip if it is a link to a profile/company itself
    if (el.closest('a[href*="/in/"], a[href*="/company/"]')) {
      return;
    }

    // Skip if it's inside our own assistant root
    if (el.closest('#ai-reply-assistant-root')) {
      return;
    }

    // Skip if it's the editor itself
    if (el.closest('div[contenteditable="true"]') || el.tagName === 'TEXTAREA') {
      return;
    }

    // Skip social action sections
    if (
      el.closest('[class*="social-"]') ||
      el.closest('[class*="action-bar"]') ||
      el.closest('[class*="footer"]') ||
      el.closest('.feed-shared-social-action-bar') ||
      el.closest('.feed-shared-social-counts')
    ) {
      return;
    }

    let text = (el.textContent || '').trim();
    
    // Clean "see more" link text if appended
    text = text.replace(/\bsee\s+more\b/gi, '').trim();

    // Skip social action text or numbers
    const lowerText = text.toLowerCase();
    if (
      text.length > 10 &&
      !lowerText.includes('like') &&
      !lowerText.includes('comment') &&
      !lowerText.includes('repost') &&
      !lowerText.includes('send') &&
      !/^\d+$/.test(text) &&
      !lowerText.includes('reactions')
    ) {
      // Prevent duplicates (e.g. if we matched both a parent p and an inner span)
      const dupIndex = validSegments.findIndex(existing => existing.includes(text) || text.includes(existing));
      if (dupIndex !== -1) {
        if (text.length > validSegments[dupIndex].length) {
          validSegments[dupIndex] = text;
        }
      } else {
        validSegments.push(text);
      }
    }
  });

  const finalPostText = validSegments.join('\n\n').trim();
  console.log('AI Reply Extension: Scraped Post Content (Final):', finalPostText);
  return finalPostText;
}

/**
 * Safe text injection into React-controlled contenteditable element.
 */
function injectTextIntoComposer(editor: HTMLElement, text: string) {
  editor.focus();
  
  try {
    // Select all content inside editor
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    selection?.removeAllRanges();
    selection?.addRange(range);
    
    // Use execCommand to replace selected text, which triggers internal React listeners
    const success = document.execCommand('insertText', false, text);
    if (!success) {
      // Fallback if execCommand fails
      editor.innerText = text;
    }

    // Trigger input events to ensure React state updates and enables the "Post" button
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    editor.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('AI Reply Extension: Text successfully injected into active composer.');
  } catch (error) {
    console.error('AI Reply Extension: Error inserting text:', error);
    // Manual fallback direct assign
    editor.innerText = text;
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

/**
 * Prepares and injects the Shadow DOM modal structure if not already present.
 */
function ensureShadowRoot(): ShadowRoot {
  if (shadowRootElement) return shadowRootElement;

  const rootDiv = document.createElement('div');
  rootDiv.id = 'ai-reply-assistant-root';
  rootDiv.style.position = 'fixed';
  rootDiv.style.zIndex = '999999';
  document.body.appendChild(rootDiv);

  const shadow = rootDiv.attachShadow({ mode: 'open' });
  shadowRootElement = shadow;

  // Add Google Font import and styling sheet
  const style = document.createElement('style');
  style.textContent = `
    :host {
      font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75); /* Native LinkedIn modal overlay shadow */
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease-in-out;
      z-index: 100000;
    }

    .backdrop.active {
      opacity: 1;
      pointer-events: auto;
    }

    /* Modal Container styling */
    .modal-container {
      width: 95%;
      max-width: 550px;
      max-height: 90vh;
      overflow-y: auto;
      transform: translateY(20px);
      transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
      display: flex;
      flex-direction: column;
      border-radius: 12px; /* Native LinkedIn card corners */
      background: #ffffff; /* Light Mode default */
      color: rgba(0, 0, 0, 0.9);
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08), 0 12px 30px rgba(0, 0, 0, 0.24);
    }

    .backdrop.active .modal-container {
      transform: translateY(0);
    }

    /* Dark Mode override for Container */
    .backdrop.dark .modal-container {
      background: #1d2226; /* Native LinkedIn dark background */
      color: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
    }

    /* Modal Header */
    .modal-header {
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .backdrop.dark .modal-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .modal-title {
      font-size: 20px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.9);
    }

    .backdrop.dark .modal-title {
      color: rgba(255, 255, 255, 0.9);
    }

    /* Close Button (Circle style) */
    .close-btn {
      background: transparent;
      border: none;
      color: rgba(0, 0, 0, 0.6);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.12s;
    }

    .close-btn:hover {
      background: rgba(0, 0, 0, 0.08);
      color: rgba(0, 0, 0, 0.9);
    }

    .backdrop.dark .close-btn {
      color: rgba(255, 255, 255, 0.6);
    }

    .backdrop.dark .close-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.9);
    }

    .modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow-y: auto;
    }

    /* Post Preview Container */
    .post-preview-container {
      background: rgba(0, 0, 0, 0.02);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 8px;
      padding: 12px;
    }

    .backdrop.dark .post-preview-container {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .post-preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      cursor: pointer;
      user-select: none;
    }

    .backdrop.dark .post-preview-header {
      color: rgba(255, 255, 255, 0.6);
    }

    .post-preview-body {
      font-size: 14px;
      line-height: 1.42;
      color: rgba(0, 0, 0, 0.7);
      max-height: 70px;
      overflow-y: auto;
      margin-top: 8px;
      display: block;
      white-space: pre-wrap;
    }

    .backdrop.dark .post-preview-body {
      color: rgba(255, 255, 255, 0.7);
    }

    .post-preview-body.collapsed {
      display: none;
    }

    /* Option controls */
    .controls-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    @media (min-width: 480px) {
      .controls-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .control-label {
      font-size: 14px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.6);
    }

    .backdrop.dark .control-label {
      color: rgba(255, 255, 255, 0.6);
    }

    /* Segmented selector tabs as native Filter Pills */
    .segmented-control {
      display: flex;
      gap: 8px;
      background: transparent;
      border: none;
      padding: 0;
      flex-wrap: wrap;
    }

    .segmented-option {
      border: 1px solid rgba(0, 0, 0, 0.6);
      border-radius: 16px; /* Native pill borders */
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.6);
      cursor: pointer;
      background: transparent;
      transition: all 0.12s ease-in-out;
      user-select: none;
      text-align: center;
    }

    .backdrop.dark .segmented-option {
      border: 1px solid rgba(255, 255, 255, 0.6);
      color: rgba(255, 255, 255, 0.6);
    }

    .segmented-option:hover {
      background: rgba(0, 0, 0, 0.08);
      color: rgba(0, 0, 0, 0.9);
      border-color: rgba(0, 0, 0, 0.9);
    }

    .backdrop.dark .segmented-option:hover {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.9);
      border-color: rgba(255, 255, 255, 0.9);
    }

    /* Active Pill States */
    .segmented-option.active {
      background: #0a66c2; /* LinkedIn Blue */
      border-color: #0a66c2;
      color: #ffffff;
    }

    .backdrop.dark .segmented-option.active {
      background: #ffffff; /* White pills on dark background */
      border-color: #ffffff;
      color: #1d2226;
    }

    /* Editor block */
    .editor-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
    }

    .draft-textarea {
      width: 100%;
      height: 150px;
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.15);
      border-radius: 8px;
      padding: 16px;
      color: rgba(0, 0, 0, 0.9);
      font-family: inherit;
      font-size: 15px;
      line-height: 1.5;
      resize: vertical;
      box-sizing: border-box;
      transition: border-color 0.16s ease-in-out;
    }

    .backdrop.dark .draft-textarea {
      background: #151a1e;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.9);
    }

    .draft-textarea:focus {
      outline: none;
      border-color: #0a66c2;
      box-shadow: 0 0 0 1px #0a66c2;
    }

    .backdrop.dark .draft-textarea:focus {
      border-color: #ffffff;
      box-shadow: 0 0 0 1px #ffffff;
    }

    /* State messages */
    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.85);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 16px;
      border-radius: 8px;
      z-index: 10;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s ease-in-out;
    }

    .backdrop.dark .loading-overlay {
      background: rgba(29, 34, 38, 0.85);
    }

    .loading-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(10, 102, 194, 0.2);
      border-top-color: #0a66c2;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .backdrop.dark .spinner {
      border: 3px solid rgba(255, 255, 255, 0.2);
      border-top-color: #ffffff;
    }

    .loading-text {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.7);
      font-weight: 500;
    }

    .backdrop.dark .loading-text {
      color: rgba(255, 255, 255, 0.7);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-container {
      display: none;
      background: rgba(224, 36, 36, 0.08);
      border: 1px solid rgba(224, 36, 36, 0.2);
      color: #d12c2c;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.4;
    }

    .backdrop.dark .error-container {
      background: rgba(248, 113, 113, 0.08);
      border: 1px solid rgba(248, 113, 113, 0.2);
      color: #f87171;
    }

    .error-container.active {
      display: block;
    }

    /* Footer actions */
    .modal-footer {
      padding: 16px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      align-items: center;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
    }

    .backdrop.dark .modal-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* Standardized native pill buttons */
    .btn {
      height: 32px;
      padding: 0 16px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 16px; /* Native pill shape */
      cursor: pointer;
      transition: all 0.16s ease-in-out;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-sizing: border-box;
      font-family: inherit;
    }

    /* Secondary Outlined Pills */
    .btn-secondary {
      background: transparent;
      border: 1px solid #0a66c2;
      color: #0a66c2;
    }

    .btn-secondary:hover {
      background: rgba(10, 102, 194, 0.08);
      color: #004182;
      border-color: #004182;
    }

    .backdrop.dark .btn-secondary {
      border: 1px solid rgba(255, 255, 255, 0.6);
      color: rgba(255, 255, 255, 0.75);
    }

    .backdrop.dark .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.9);
      border-color: rgba(255, 255, 255, 0.9);
    }

    /* Primary Solid Pills */
    .btn-primary {
      background: #0a66c2;
      border: none;
      color: #ffffff;
    }

    .btn-primary:hover {
      background: #004182;
    }

    /* Primary Button in Dark Mode turns white with dark text */
    .backdrop.dark .btn-primary {
      background: #eef3f8;
      color: #191919;
    }

    .backdrop.dark .btn-primary:hover {
      background: #d9e2ec;
    }

    .btn:disabled {
      opacity: 0.35 !important;
      cursor: not-allowed !important;
      background: rgba(0, 0, 0, 0.08) !important;
      color: rgba(0, 0, 0, 0.35) !important;
      border: none !important;
    }

    .backdrop.dark .btn:disabled {
      background: rgba(255, 255, 255, 0.08) !important;
      color: rgba(255, 255, 255, 0.35) !important;
      border: none !important;
    }
  
  `;
  shadow.appendChild(style);

  // Render modal structure
  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  backdrop.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-title">LinkGenie Draft Assistant</div>
        <button class="close-btn" id="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        
        <!-- Post Preview Container -->
        <div class="post-preview-container">
          <div class="post-preview-header" id="togglePreview">
            <span>Post Context Preview</span>
            <span id="previewArrow">▼</span>
          </div>
          <div class="post-preview-body" id="postPreviewBody">Loading post text...</div>
        </div>

        <!-- Tone and Length selectors -->
        <div class="controls-grid">
          <div class="control-group">
            <div class="control-label">Tone</div>
            <div class="segmented-control" id="toneControl">
              <div class="segmented-option active" data-value="professional">Prof</div>
              <div class="segmented-option" data-value="warm">Warm</div>
              <div class="segmented-option" data-value="thoughtful">Intel</div>
              <div class="segmented-option" data-value="concise">Short</div>
            </div>
          </div>
          <div class="control-group">
            <div class="control-label">Draft Length</div>
            <div class="segmented-control" id="lengthControl">
              <div class="segmented-option active" data-value="short">Short</div>
              <div class="segmented-option" data-value="medium">Medium</div>
            </div>
          </div>
        </div>

        <!-- Text area editor and loader -->
        <div class="editor-container">
          <div class="loading-overlay" id="loadingOverlay">
            <div class="spinner"></div>
            <div class="loading-text">Crafting reply draft...</div>
          </div>
          <div class="control-label">Generated Draft (Editable)</div>
          <textarea class="draft-textarea" id="draftTextarea" placeholder="No draft generated yet. Click generate or choose settings..."></textarea>
        </div>

        <!-- Error displays -->
        <div class="error-container" id="errorContainer"></div>

      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
        <button class="btn btn-secondary" id="regenerateBtn">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style="fill: currentColor;">
            <path d="M10.15 2.15C9.07 1.07 7.62 0.44 6 0.44C2.93 0.44 0.44 2.93 0.44 6C0.44 9.07 2.93 11.56 6 11.56C8.54 11.56 10.68 9.85 11.35 7.56H9.72C9.12 8.97 7.68 10 6 10C3.79 10 2 8.21 2 6C2 3.79 3.79 2 6 2C7.1 2 8.09 2.45 8.81 3.17L6.89 5.09H11.56V0.44L10.15 2.15Z"/>
          </svg>
          Regenerate
        </button>
        <button class="btn btn-primary" id="insertBtn" disabled>Insert Reply</button>
      </div>
    </div>
  `;
  shadow.appendChild(backdrop);

  // Bind Events within Shadow DOM
  const closeBtn = shadow.getElementById('closeModal') as HTMLButtonElement;
  const cancelBtn = shadow.getElementById('cancelBtn') as HTMLButtonElement;
  const insertBtn = shadow.getElementById('insertBtn') as HTMLButtonElement;
  const regenerateBtn = shadow.getElementById('regenerateBtn') as HTMLButtonElement;

  const draftTextarea = shadow.getElementById('draftTextarea') as HTMLTextAreaElement;

  const hideModal = () => {
    backdrop.classList.remove('active');
  };

  // Close bindings
  closeBtn.addEventListener('click', hideModal);
  cancelBtn.addEventListener('click', hideModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) hideModal();
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      hideModal();
    }
  });

  // Toggle Post Preview collapse/expand
  const togglePreview = shadow.getElementById('togglePreview');
  const postPreviewBody = shadow.getElementById('postPreviewBody');
  const previewArrow = shadow.getElementById('previewArrow');
  if (togglePreview && postPreviewBody && previewArrow) {
    togglePreview.addEventListener('click', () => {
      const isCollapsed = postPreviewBody.classList.toggle('collapsed');
      previewArrow.textContent = isCollapsed ? '▲' : '▼';
    });
  }



  // Insert Draft into Editor
  insertBtn.addEventListener('click', () => {
    if (activeEditor && draftTextarea.value.trim()) {
      injectTextIntoComposer(activeEditor, draftTextarea.value.trim());
      hideModal();
    }
  });

  // Tone segmented control
  const toneOptions = shadow.querySelectorAll('#toneControl .segmented-option');
  toneOptions.forEach((option) => {
    option.addEventListener('click', () => {
      toneOptions.forEach((opt) => opt.classList.remove('active'));
      option.classList.add('active');
      currentTone = option.getAttribute('data-value') || 'professional';
    });
  });

  // Length segmented control
  const lengthOptions = shadow.querySelectorAll('#lengthControl .segmented-option');
  lengthOptions.forEach((option) => {
    option.addEventListener('click', () => {
      lengthOptions.forEach((opt) => opt.classList.remove('active'));
      option.classList.add('active');
      currentLength = option.getAttribute('data-value') || 'short';
    });
  });

  // Regenerate Button handler
  regenerateBtn.addEventListener('click', () => {
    triggerGeneration();
  });

  return shadow;
}

/**
 * Triggers API call via background script to generate reply draft.
 */
function triggerGeneration() {
  if (isGenerating) {
    console.log('AI Reply Extension: Generation already in progress. Ignoring duplicate trigger.');
    return;
  }
  isGenerating = true;

  const shadow = ensureShadowRoot();
  const loadingOverlay = shadow.getElementById('loadingOverlay') as HTMLDivElement;
  const errorContainer = shadow.getElementById('errorContainer') as HTMLDivElement;
  const draftTextarea = shadow.getElementById('draftTextarea') as HTMLTextAreaElement;
  const insertBtn = shadow.getElementById('insertBtn') as HTMLButtonElement;
  const regenerateBtn = shadow.getElementById('regenerateBtn') as HTMLButtonElement;

  // Clear states
  errorContainer.classList.remove('active');
  loadingOverlay.classList.add('active');
  insertBtn.disabled = true;
  if (regenerateBtn) {
    regenerateBtn.disabled = true;
  }

  chrome.runtime.sendMessage(
    {
      action: 'generateReply',
      postText: activePostText,
      tone: currentTone,
      length: currentLength
    },
    (response) => {
      isGenerating = false;
      loadingOverlay.classList.remove('active');
      if (regenerateBtn) {
        regenerateBtn.disabled = false;
      }

      if (chrome.runtime.lastError) {
        console.error('AI Reply Extension: Message error:', chrome.runtime.lastError);
        errorContainer.textContent = `Extension communication error: ${chrome.runtime.lastError.message}`;
        errorContainer.classList.add('active');
        return;
      }

      if (response && response.success) {
        draftTextarea.value = response.reply;
        insertBtn.disabled = false;
      } else {
        const errorMsg = response?.error || 'Unknown error occurred while generating reply.';
        errorContainer.textContent = `Error: ${errorMsg}`;
        errorContainer.classList.add('active');
      }
    }
  );
}

/**
 * Open the modal, prefill contexts, and start generation.
 */
function openAIModal(editor: HTMLElement, container: HTMLElement) {
  activeEditor = editor;
  activeContainer = container;
  activePostText = extractPostText(editor);

  const shadow = ensureShadowRoot();
  
  // Set preview text
  const postPreviewBody = shadow.getElementById('postPreviewBody') as HTMLDivElement;
  if (postPreviewBody) {
    postPreviewBody.textContent = activePostText || '(No post text detected. A generic reply will be generated.)';
  }

  // Reset text area
  const draftTextarea = shadow.getElementById('draftTextarea') as HTMLTextAreaElement;
  draftTextarea.value = '';

  // Detect and set Dark Theme dynamically based on LinkedIn page status
  const backdrop = shadow.querySelector('.backdrop') as HTMLDivElement;
  const isDark = document.documentElement.classList.contains('theme--dark') || 
                 document.body.classList.contains('theme--dark') ||
                 document.documentElement.getAttribute('data-theme') === 'dark';
  
  if (isDark) {
    backdrop.classList.add('dark');
  } else {
    backdrop.classList.remove('dark');
  }

  // Show backdrop
  backdrop.classList.add('active');

  // Trigger generation
  triggerGeneration();
}

/**
 * Creates the inline "AI Reply" button.
 */
function createReplyButton(editor: HTMLElement, container: HTMLElement): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ai-reply-trigger';
  
  // Clean Google-style AI sparkles icon with text
  btn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px; vertical-align: middle; display: inline-block;">
      <path d="M9 21c-.5 0-.9-.3-1-.8l-1.5-4.7L1.8 14c-.5-.1-.8-.5-.8-1s.3-.9.8-1l4.7-1.5L8 5.8c.1-.5.5-.8 1-.8s.9.3 1 .8l1.5 4.7 4.7 1.5c.5.1.8.5.8 1s-.3.9-.8 1l-4.7 1.5-1.5 4.7c-.1.5-.5.8-1 .8zM19 8c-.3 0-.5-.2-.6-.4l-.8-2.2-2.2-.8c-.3-.1-.4-.3-.4-.6s.2-.5.4-.6l2.2-.8.8-2.2c.1-.3.3-.4.6-.4s.5.2.6.4l.8 2.2 2.2.8c.3.1.4.3.4.6s-.2.5-.4.6l-2.2.8-.8 2.2c-.1.3-.3.4-.6.4z"/>
    </svg>
    <span>AI Reply</span>
  `;

  // Apply LinkedIn's exact font stack, height, and borderless design
  btn.style.display = 'inline-flex';
  btn.style.alignItems = 'center';
  btn.style.justifyContent = 'center';
  btn.style.background = 'transparent';
  btn.style.border = 'none';
  btn.style.color = 'inherit'; // Inherit text color (adapts to light/dark mode automatically)
  btn.style.opacity = '0.75';  // Matches LinkedIn's subtle toolbar icons
  btn.style.borderRadius = '16px';
  btn.style.padding = '0 12px';
  btn.style.height = '32px';
  btn.style.fontSize = '14px';
  btn.style.fontWeight = '600';
  btn.style.cursor = 'pointer';
  btn.style.marginLeft = '4px';
  btn.style.marginRight = '4px';
  btn.style.transition = 'all 0.16s ease-in-out';
  btn.style.fontFamily = '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  // Hover background matches standard LinkedIn transparent hover layers (works in dark/light mode)
  btn.addEventListener('mouseenter', () => {
    btn.style.background = 'rgba(128, 128, 128, 0.15)';
    btn.style.opacity = '1';
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.background = 'transparent';
    btn.style.opacity = '0.75';
  });

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openAIModal(editor, container);
  });

  return btn;
}

/**
 * Helper to identify a submit or post button inside a container using class-agnostic rules.
 */
function findSubmitButton(root: HTMLElement): HTMLElement | null {
  // 1. Try finding standard type="submit" buttons
  const submitBtn = root.querySelector('button[type="submit"]');
  if (submitBtn) return submitBtn as HTMLElement;

  // 2. Search all buttons in this root for common text matches
  const buttons = root.querySelectorAll('button');
  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    const text = (btn.textContent || '').trim().toLowerCase();
    
    // Exact matches for common action labels
    if (['post', 'comment', 'reply', 'send', 'publish', 'share'].includes(text)) {
      return btn;
    }
    
    // Check aria-labels or titles
    const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
    if (ariaLabel.includes('post') || ariaLabel.includes('comment') || ariaLabel.includes('reply')) {
      return btn;
    }
  }
  return null;
}

/**
 * Helper to locate the comment box toolbar container (containing Emoji and Photo buttons).
 */
function findToolbar(editor: HTMLElement): HTMLElement | null {
  let parent: HTMLElement | null = editor;
  let depth = 0;
  while (parent && depth < 6) {
    const emojiBtn = parent.querySelector('button[aria-label*="Emoji"], button[aria-label*="emoji"], button[aria-label*="photo"], button[aria-label*="photo" i], button[aria-label*="image"]');
    if (emojiBtn && emojiBtn.parentElement) {
      return emojiBtn.parentElement;
    }
    parent = parent.parentElement;
    depth++;
  }
  return null;
}

/**
 * Scans page for comment boxes and injects the "AI Reply" button.
 */
function scanAndInject() {
  // Query all contenteditable fields or textareas on the page
  const editors = document.querySelectorAll('div[contenteditable="true"], textarea.comments-comment-textbox__textarea');

  editors.forEach((editor) => {
    const htmlEditor = editor as HTMLElement;

    // Check if we've already injected for this editor
    if (htmlEditor.getAttribute('data-ai-reply-injected') === 'true') {
      return;
    }

    // Skip if it is our own draft editor modal
    if (htmlEditor.closest('#ai-reply-assistant-root') || htmlEditor.classList.contains('draft-textarea')) {
      return;
    }

    // 1. Try to find the toolbar (Emoji/Photo buttons row) first
    const toolbar = findToolbar(htmlEditor);
    if (toolbar) {
      const btn = createReplyButton(htmlEditor, toolbar);
      
      // Inject before the first child (so it sits on the left of Emoji/Photo icons)
      toolbar.insertBefore(btn, toolbar.firstChild);
      
      htmlEditor.setAttribute('data-ai-reply-injected', 'true');
      console.log('AI Reply Extension: Injected button into toolbar next to emoji/photo icons.');
      return;
    }

    // 2. Fallback: Climb parents to find any container that has a Post/Submit button
    let parent: HTMLElement | null = htmlEditor;
    let submitBtn: HTMLElement | null = null;
    let depth = 0;

    while (parent && depth < 6) {
      submitBtn = findSubmitButton(parent);
      if (submitBtn) {
        break;
      }
      parent = parent.parentElement;
      depth++;
    }

    const targetContainer = parent || htmlEditor;

    if (submitBtn && submitBtn.parentElement) {
      const btn = createReplyButton(htmlEditor, targetContainer);
      
      // Inject next to the submit button (usually right before it)
      submitBtn.parentElement.insertBefore(btn, submitBtn);
      
      htmlEditor.setAttribute('data-ai-reply-injected', 'true');
      console.log('AI Reply Extension: Injected button next to submit button (class-agnostic).');
    } else {
      // 3. Fallback: If no toolbar or submit button structure is resolved, inject an ad-hoc panel directly after the editor
      const btn = createReplyButton(htmlEditor, targetContainer);
      const editorParent = htmlEditor.parentElement;
      if (editorParent) {
        const adhocBar = document.createElement('div');
        adhocBar.className = 'ai-reply-adhoc-bar';
        adhocBar.style.display = 'inline-flex';
        adhocBar.style.justifyContent = 'flex-end';
        adhocBar.style.width = '100%';
        adhocBar.style.padding = '4px 0';
        adhocBar.appendChild(btn);

        if (htmlEditor.nextSibling) {
          editorParent.insertBefore(adhocBar, htmlEditor.nextSibling);
        } else {
          editorParent.appendChild(adhocBar);
        }
        
        htmlEditor.setAttribute('data-ai-reply-injected', 'true');
        console.log('AI Reply Extension: Succeeded in fallback button injection after editor.');
      }
    }
  });
}

/**
 * Initializes DOM observers to support dynamic feed content loading
 */
function initObserver() {
  // Perform an initial scan
  scanAndInject();

  // Watch for dynamic insertions (like expanding comments or scrolling feed)
  const observer = new MutationObserver(() => {
    if (scanTimeout) {
      clearTimeout(scanTimeout);
    }
    // Debounce scan calls to prevent lag
    scanTimeout = window.setTimeout(() => {
      scanAndInject();
    }, 150);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('AI Reply Extension: MutationObserver initialized.');
}

// Start extension
initObserver();
