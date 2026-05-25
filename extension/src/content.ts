// Centralized configuration for selectors and fallbacks
const SELECTORS = {
  // LinkedIn contenteditable comment input box
  commentEditor: 'div[contenteditable="true"]',
  
  // Containers representing comment blocks
  commentBoxContainer: '.comments-comment-box, .comments-comment-box-comment__text-editor, .comments-comment-textarea, .comment-box',
  
  // Sibling actions bar where we append our trigger button
  actionBar: '.comments-comment-box__actions, .comments-comment-box__form-container, .comments-comment-box__form, .comments-comment-box__editor-container',
  
  // Submit/post button container in the actions bar (for inserting nearby)
  submitContainer: '.comments-comment-box__submit-button-container, .comments-comment-box__post-button'
};

// State variables for currently active composer
let activeEditor: HTMLElement | null = null;
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

    /* Post Content Textarea */
    .post-textarea {
      width: 100%;
      height: 120px;
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

    .backdrop.dark .post-textarea {
      background: #151a1e;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.9);
    }

    .post-textarea:focus {
      outline: none;
      border-color: #0a66c2;
      box-shadow: 0 0 0 1px #0a66c2;
    }

    .backdrop.dark .post-textarea:focus {
      border-color: #ffffff;
      box-shadow: 0 0 0 1px #ffffff;
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
        
        <!-- Post Content Input Box -->
        <div class="control-group">
          <div class="control-label">LinkedIn Post Content</div>
          <textarea class="post-textarea" id="postContentInput" placeholder="Paste the LinkedIn post content here..."></textarea>
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
          <textarea class="draft-textarea" id="draftTextarea" placeholder="No draft generated yet. Paste post content and click Generate Draft..."></textarea>
        </div>

        <!-- Error displays -->
        <div class="error-container" id="errorContainer"></div>

      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
        <button class="btn btn-secondary" id="generateBtn">Generate Draft</button>
        <button class="btn btn-primary" id="insertBtn" disabled>Insert Reply</button>
      </div>
    </div>
  `;
  shadow.appendChild(backdrop);

  // Bind Events within Shadow DOM
  const closeBtn = shadow.getElementById('closeModal') as HTMLButtonElement;
  const cancelBtn = shadow.getElementById('cancelBtn') as HTMLButtonElement;
  const insertBtn = shadow.getElementById('insertBtn') as HTMLButtonElement;
  const generateBtn = shadow.getElementById('generateBtn') as HTMLButtonElement;

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

  // Generate Button handler
  generateBtn.addEventListener('click', () => {
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

  const shadow = ensureShadowRoot();
  const postContentInput = shadow.getElementById('postContentInput') as HTMLTextAreaElement;
  const postText = postContentInput ? postContentInput.value.trim() : '';

  const errorContainer = shadow.getElementById('errorContainer') as HTMLDivElement;
  const loadingOverlay = shadow.getElementById('loadingOverlay') as HTMLDivElement;
  const draftTextarea = shadow.getElementById('draftTextarea') as HTMLTextAreaElement;
  const insertBtn = shadow.getElementById('insertBtn') as HTMLButtonElement;
  const generateBtn = shadow.getElementById('generateBtn') as HTMLButtonElement;

  if (!postText) {
    errorContainer.textContent = 'Please paste or type some LinkedIn post content first.';
    errorContainer.classList.add('active');
    return;
  }

  isGenerating = true;

  // Clear states
  errorContainer.classList.remove('active');
  loadingOverlay.classList.add('active');
  insertBtn.disabled = true;
  if (generateBtn) {
    generateBtn.disabled = true;
  }

  chrome.runtime.sendMessage(
    {
      action: 'generateReply',
      postText: postText,
      tone: currentTone,
      length: currentLength
    },
    (response) => {
      isGenerating = false;
      loadingOverlay.classList.remove('active');
      if (generateBtn) {
        generateBtn.disabled = false;
      }

      if (chrome.runtime.lastError) {
        console.error('AI Reply Extension: Message error:', chrome.runtime.lastError);
        errorContainer.textContent = `Extension communication error: ${chrome.runtime.lastError.message}`;
        errorContainer.classList.add('active');
        return;
      }

      if (response && response.success) {
        if (response.reply === 'POST_TEXT_NOT_FOUND') {
          draftTextarea.value = '';
          errorContainer.textContent = 'LinkGenie could not detect a clear post body from the provided text to generate a reply.';
          errorContainer.classList.add('active');
          insertBtn.disabled = true;
        } else {
          draftTextarea.value = response.reply;
          insertBtn.disabled = false;
        }
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

  const shadow = ensureShadowRoot();
  
  // Clear post content input and draft textarea
  const postContentInput = shadow.getElementById('postContentInput') as HTMLTextAreaElement;
  if (postContentInput) {
    postContentInput.value = '';
  }
  const draftTextarea = shadow.getElementById('draftTextarea') as HTMLTextAreaElement;
  if (draftTextarea) {
    draftTextarea.value = '';
  }

  // Clear error states
  const errorContainer = shadow.getElementById('errorContainer') as HTMLDivElement;
  if (errorContainer) {
    errorContainer.classList.remove('active');
    errorContainer.textContent = '';
  }

  // Disable Insert button initially
  const insertBtn = shadow.getElementById('insertBtn') as HTMLButtonElement;
  if (insertBtn) {
    insertBtn.disabled = true;
  }

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

  // Focus on the post content input so the user can paste immediately
  if (postContentInput) {
    postContentInput.focus();
  }
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
 * Injects stylesheet rules into the main page's head for the Copy button overlays and action bar buttons.
 */
function injectMainPageStyles() {
  const styleId = 'linkgenie-main-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .feed-shared-inline-show-more-text,
    .expandable-text-box,
    .feed-shared-update-v2__description-text,
    .update-components-text {
      position: relative !important;
    }

    .linkgenie-copy-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.15);
      color: rgba(0, 0, 0, 0.6);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transition: all 0.2s ease-in-out;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .theme--dark .linkgenie-copy-btn,
    [data-theme="dark"] .linkgenie-copy-btn {
      background: #1d2226;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.6);
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    }

    .feed-shared-inline-show-more-text:hover .linkgenie-copy-btn,
    .expandable-text-box:hover .linkgenie-copy-btn,
    .feed-shared-update-v2__description-text:hover .linkgenie-copy-btn,
    .update-components-text:hover .linkgenie-copy-btn {
      opacity: 1;
      pointer-events: auto;
    }

    .linkgenie-copy-btn:hover {
      background: rgba(10, 102, 194, 0.08);
      color: #0a66c2;
      border-color: #0a66c2;
      transform: scale(1.1);
    }

    .theme--dark .linkgenie-copy-btn:hover,
    [data-theme="dark"] .linkgenie-copy-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border-color: #ffffff;
    }

    .linkgenie-copy-btn.success {
      background: #30d158 !important;
      border-color: #30d158 !important;
      color: #ffffff !important;
      opacity: 1 !important;
      transform: scale(1.1);
    }

    .linkgenie-copy-btn::after {
      content: 'Copy Post';
      position: absolute;
      bottom: 125%;
      left: 50%;
      transform: translateX(-50%) translateY(4px);
      background: rgba(0, 0, 0, 0.85);
      color: #ffffff;
      font-size: 11px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: all 0.15s ease-in-out;
      font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .linkgenie-copy-btn.success::after {
      content: 'Copied!';
    }

    .linkgenie-copy-btn:hover::after,
    .linkgenie-copy-btn.success::after {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* Social Action Bar Copy Button styling to match native buttons */
    .linkgenie-action-bar-copy-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: inherit !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      height: 48px !important;
      padding: 0 12px !important;
      color: rgba(0, 0, 0, 0.6) !important;
      background: transparent !important;
      border: none !important;
      cursor: pointer !important;
      border-radius: 4px !important;
      transition: background-color 0.15s ease, color 0.15s ease !important;
      vertical-align: middle !important;
      flex-grow: 1 !important;
    }

    .theme--dark .linkgenie-action-bar-copy-btn,
    [data-theme="dark"] .linkgenie-action-bar-copy-btn {
      color: rgba(255, 255, 255, 0.6) !important;
    }

    .linkgenie-action-bar-copy-btn:hover {
      background-color: rgba(0, 0, 0, 0.08) !important;
      color: rgba(0, 0, 0, 0.9) !important;
    }

    .theme--dark .linkgenie-action-bar-copy-btn:hover,
    [data-theme="dark"] .linkgenie-action-bar-copy-btn:hover {
      background-color: rgba(255, 255, 255, 0.08) !important;
      color: rgba(255, 255, 255, 0.9) !important;
    }

    .linkgenie-action-bar-copy-btn svg {
      margin-right: 4px !important;
      flex-shrink: 0 !important;
    }

    .linkgenie-action-bar-copy-btn.success {
      color: #30d158 !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Resolves all action bars on the page, including standard and obfuscated layout versions.
 */
function findActionBars(): HTMLElement[] {
  const bars = new Set<HTMLElement>();
  
  // 1. Try standard selectors
  const selectors = [
    '.feed-shared-social-action-bar',
    '.social-actions',
    '.feed-shared-social-actions'
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => bars.add(el as HTMLElement));
  });
  
  // 2. Try SVG-based resolution (helps with obfuscated/dynamic class structures)
  // We exclude thumbs-up to avoid selecting separate reaction wrapper containers
  const svgIds = [
    '#comment-small',
    '#comment-medium',
    '#repost-small',
    '#repost-medium',
    '#send-privately-small',
    '#send-privately-medium'
  ];
  svgIds.forEach(id => {
    document.querySelectorAll(`svg${id}`).forEach(svg => {
      const btn = svg.closest('button, a');
      if (btn && btn.parentElement) {
        bars.add(btn.parentElement as HTMLElement);
      }
    });
  });
  
  const resolvedBars = Array.from(bars);
  // Filter out any nested sub-containers to ensure we only target the main outer action row
  return resolvedBars.filter(bar => {
    return !resolvedBars.some(otherBar => otherBar !== bar && otherBar.contains(bar));
  });
}

/**
 * Programmatically constructs custom-styled SVG and text structure matching LinkedIn's native buttons.
 */
function buildButtonContent(label: string, isSuccess: boolean, classes: { spanClasses: string; textDivClasses: string; textSpanClasses: string }): string {
  const { spanClasses, textDivClasses, textSpanClasses } = classes;
  
  const iconSvg = isSuccess ? `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="linkgenie-copy-icon" style="margin-right: 4px; vertical-align: middle;">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ` : `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="linkgenie-copy-icon" style="margin-right: 4px; vertical-align: middle;">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  `;

  if (spanClasses) {
    let html = `<span class="${spanClasses}">${iconSvg}`;
    if (textDivClasses) {
      html += `<div class="${textDivClasses}">`;
      if (textSpanClasses) {
        html += `<span class="${textSpanClasses}"><span class="linkgenie-btn-text">${label}</span></span>`;
      } else {
        html += `<span class="linkgenie-btn-text">${label}</span>`;
      }
      html += `</div>`;
    } else if (textSpanClasses) {
      html += `<span class="${textSpanClasses}"><span class="linkgenie-btn-text">${label}</span></span>`;
    } else {
      html += `<span class="linkgenie-btn-text">${label}</span>`;
    }
    html += `</span>`;
    return html;
  } else {
    return `
      <span class="artdeco-button__text">
        ${iconSvg}
        <span class="linkgenie-btn-text">${label}</span>
      </span>
    `;
  }
}

/**
 * Scans page for comment boxes and injects the "AI Reply" button,
 * and also injects "Copy Post" overlay/action-bar buttons.
 */
function scanAndInject() {
  // Inject main page styles if not already present
  injectMainPageStyles();

  // 1. Inject Clipboard Copy buttons into post descriptions (floating overlay fallback)
  const descriptionSelectors = [
    '.feed-shared-inline-show-more-text',
    '.expandable-text-box',
    '.feed-shared-update-v2__description-text',
    '.update-components-text'
  ];

  descriptionSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;

      // Skip elements that reside inside comments
      if (
        htmlEl.closest('.comments-comment-item') ||
        htmlEl.closest('.comment-item') ||
        (htmlEl.className || '').toLowerCase().includes('comment')
      ) {
        return;
      }

      // Check if we've already injected for this description
      if (htmlEl.getAttribute('data-lg-copy-injected') === 'true') {
        return;
      }

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'linkgenie-copy-btn';
      copyBtn.setAttribute('aria-label', 'Copy post content');
      copyBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;

      copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Resolve clean post text by cloning and removing the copy button element
        const clone = htmlEl.cloneNode(true) as HTMLElement;
        const btnToRemove = clone.querySelector('.linkgenie-copy-btn');
        if (btnToRemove) {
          btnToRemove.remove();
        }
        let text = (clone.textContent || '').trim();
        text = text.replace(/\bsee\s+more\b/gi, '').trim();

        navigator.clipboard.writeText(text).then(() => {
          copyBtn.classList.add('success');
          copyBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;

          setTimeout(() => {
            copyBtn.classList.remove('success');
            copyBtn.innerHTML = `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            `;
          }, 1500);
        }).catch((err) => {
          console.error('LinkGenie: Failed to copy text:', err);
        });
      });

      htmlEl.appendChild(copyBtn);
      htmlEl.setAttribute('data-lg-copy-injected', 'true');
      console.log('AI Reply Extension: Injected copy button overlay into description element.');
    });
  });

  // 1.5. Inject Clipboard Copy buttons into social action bars (Like/Comment/Repost/Send row)
  const bars = findActionBars();
  bars.forEach((bar) => {
    const htmlBar = bar as HTMLElement;

    // Check if we've already injected for this action bar
    if (htmlBar.getAttribute('data-lg-copy-bar-injected') === 'true') {
      return;
    }

    // Find a sibling button in the action bar to clone classes and nested structures from
    // Select the second child button/a or comment button (which usually has nested structure)
    let sibling = htmlBar.querySelector('button[aria-label*="Comment"], button:nth-child(2), a:nth-child(2)') as HTMLElement;
    if (!sibling) {
      sibling = htmlBar.querySelector('button, a') as HTMLElement;
    }
    if (!sibling) {
      return;
    }

    const siblingClasses = sibling.className;

    // Parse the inner classes
    const siblingSpan = sibling.querySelector('span');
    const spanClasses = siblingSpan ? siblingSpan.className : '';

    const siblingTextDiv = siblingSpan ? siblingSpan.querySelector('div') : null;
    const textDivClasses = siblingTextDiv ? siblingTextDiv.className : '';

    const siblingTextSpan = siblingSpan ? siblingSpan.querySelector('span:not(:first-child), div span') : null;
    const textSpanClasses = siblingTextSpan ? siblingTextSpan.className : '';

    const classesInfo = {
      spanClasses,
      textDivClasses,
      textSpanClasses
    };

    // Create action bar copy button
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    
    // Copy all classes from sibling so it matches LinkedIn's styling exactly
    if (siblingClasses) {
      copyBtn.className = siblingClasses + ' linkgenie-action-bar-copy-btn';
    } else {
      copyBtn.className = 'artdeco-button artdeco-button--muted artdeco-button--4 artdeco-button--tertiary react-button__trigger linkgenie-action-bar-copy-btn';
    }
    
    copyBtn.setAttribute('aria-label', 'Copy post content');
    copyBtn.innerHTML = buildButtonContent('Copy Post', false, classesInfo);

    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Find the parent post container by climbing up to the first outer card structure
      let postCard: HTMLElement | null = htmlBar;
      while (postCard && postCard !== document.body) {
        // Stop if this element contains a description element (meaning it's the post container or above)
        const hasDesc = postCard.querySelector('.expandable-text-box, .feed-shared-inline-show-more-text, .feed-shared-update-v2__description-text');
        if (hasDesc) {
          break;
        }
        if (
          postCard.classList.contains('feed-shared-update-v2') ||
          postCard.getAttribute('role') === 'listitem' ||
          postCard.tagName.toLowerCase() === 'article' ||
          postCard.classList.contains('feed-shared-update') ||
          (postCard.getAttribute('componentkey') && postCard.getAttribute('componentkey')!.includes('FeedType')) ||
          postCard.className.includes('feed-shared-') ||
          postCard.className.includes('update-v2')
        ) {
          break;
        }
        postCard = postCard.parentElement;
      }
      if (!postCard) {
        postCard = htmlBar.parentElement; // fallback to parent
      }

      if (!postCard) {
        console.warn('LinkGenie: Could not find parent post card container.');
        return;
      }

      // Find description elements
      const descriptionSelectors = [
        '.feed-shared-inline-show-more-text',
        '.expandable-text-box',
        '.feed-shared-update-v2__description-text',
        '.update-components-text',
        '.feed-shared-update-v2__commentary',
        '.update-components-update-v2__commentary',
        '.feed-shared-text'
      ];

      let descriptionEl: HTMLElement | null = null;
      for (const descSel of descriptionSelectors) {
        const foundElements = postCard.querySelectorAll(descSel);
        for (const found of foundElements) {
          const htmlFound = found as HTMLElement;
          
          // Ensure it's not inside a comment, nor inside the post header/actor/profile block (to avoid copying job title)
          const isComment = htmlFound.closest('.comments-comment-item') || 
                            htmlFound.closest('.comment-item') || 
                            htmlFound.className.toLowerCase().includes('comment');
                            
          const isHeader = htmlFound.closest('.update-components-actor') || 
                           htmlFound.closest('.feed-shared-actor') || 
                           htmlFound.closest('[class*="actor"]') || 
                           htmlFound.closest('[class*="header"]') ||
                           htmlFound.closest('[class*="profile"]');
                           
          if (!isComment && !isHeader) {
            descriptionEl = htmlFound;
            break;
          }
        }
        if (descriptionEl) {
          break;
        }
      }

      if (descriptionEl) {
        const clone = descriptionEl.cloneNode(true) as HTMLElement;
        
        // Remove injected elements
        const btnToRemove = clone.querySelector('.linkgenie-copy-btn');
        if (btnToRemove) {
          btnToRemove.remove();
        }
        const seeMoreElements = clone.querySelectorAll('.feed-shared-inline-show-more-text__see-more-less-toggle, .see-more, button');
        seeMoreElements.forEach(el => el.remove());

        let text = (clone.textContent || '').trim();
        text = text.replace(/\bsee\s+more\b/gi, '').trim();
        text = text.replace(/\bsee\s+translation\b/gi, '').trim();

        navigator.clipboard.writeText(text).then(() => {
          copyBtn.classList.add('success');
          copyBtn.innerHTML = buildButtonContent('Copied!', true, classesInfo);

          setTimeout(() => {
            copyBtn.classList.remove('success');
            copyBtn.innerHTML = buildButtonContent('Copy Post', false, classesInfo);
          }, 1500);
        }).catch((err) => {
          console.error('LinkGenie: Failed to copy text:', err);
        });
      } else {
        // fallback if no description selector matched: search for any paragraph inside the postcard
        const paragraphs = postCard.querySelectorAll('p, span');
        let text = '';
        for (const p of paragraphs) {
          const htmlP = p as HTMLElement;
          const isHeader = htmlP.closest('.update-components-actor') || 
                           htmlP.closest('.feed-shared-actor') || 
                           htmlP.closest('[class*="actor"]') || 
                           htmlP.closest('[class*="header"]') ||
                           htmlP.closest('[class*="profile"]');
                           
          if (isHeader) continue;

          const txt = (htmlP.textContent || '').trim();
          if (txt.length > 50 && !txt.includes('reactions') && !txt.includes('Comment') && !txt.includes('Repost')) {
            text = txt;
            break;
          }
        }
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            copyBtn.classList.add('success');
            copyBtn.innerHTML = buildButtonContent('Copied!', true, classesInfo);
            setTimeout(() => {
              copyBtn.classList.remove('success');
              copyBtn.innerHTML = buildButtonContent('Copy Post', false, classesInfo);
            }, 1500);
          }).catch((err) => {
            console.error('LinkGenie: Failed fallback copy:', err);
          });
        } else {
          copyBtn.innerHTML = buildButtonContent('No text found', false, classesInfo);
          setTimeout(() => {
            copyBtn.innerHTML = buildButtonContent('Copy Post', false, classesInfo);
          }, 1500);
        }
      }
    });

    // Append to the action bar
    htmlBar.appendChild(copyBtn);
    htmlBar.setAttribute('data-lg-copy-bar-injected', 'true');
    console.log('AI Reply Extension: Injected "Copy Post" button into social action bar.');
  });

  // 2. Inject AI Reply buttons next to editors
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
