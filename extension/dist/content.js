"use strict";(()=>{var x=null,h="professional",k="short",L=null,m=null,u=null,f=!1;function T(n,o){n.focus();try{let e=window.getSelection(),t=document.createRange();t.selectNodeContents(n),e?.removeAllRanges(),e?.addRange(t),document.execCommand("insertText",!1,o)||(n.innerText=o),n.dispatchEvent(new Event("input",{bubbles:!0})),n.dispatchEvent(new Event("change",{bubbles:!0})),console.log("AI Reply Extension: Text successfully injected into active composer.")}catch(e){console.error("AI Reply Extension: Error inserting text:",e),n.innerText=o,n.dispatchEvent(new Event("input",{bubbles:!0}))}}function E(){if(m)return m;let n=document.createElement("div");n.id="ai-reply-assistant-root",n.style.position="fixed",n.style.zIndex="999999",document.body.appendChild(n);let o=n.attachShadow({mode:"open"});m=o;let e=document.createElement("style");e.textContent=`
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
  
  `,o.appendChild(e);let t=document.createElement("div");t.className="backdrop",t.innerHTML=`
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-title" style="display: flex; align-items: center; gap: 8px;">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24" style="display: inline-block; vertical-align: middle;">
            <defs>
              <linearGradient id="modal-instagram-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#fdf497" />
                <stop offset="5%" stop-color="#fdf497" />
                <stop offset="45%" stop-color="#fd5949" />
                <stop offset="60%" stop-color="#d6249f" />
                <stop offset="90%" stop-color="#285AEB" />
              </linearGradient>
            </defs>
            <path fill="url(#modal-instagram-grad)" d="M11 21V2.352A3.451 3.451 0 0 0 9.5 2a3.5 3.5 0 0 0-3.261 2.238A3.5 3.5 0 0 0 4.04 8.015a3.518 3.518 0 0 0-.766 1.128c-.042.1-.064.209-.1.313a3.34 3.34 0 0 0-.106.344 3.463 3.463 0 0 0 .02 1.468A4.017 4.017 0 0 0 2.3 12.5l-.015.036a3.861 3.861 0 0 0-.216.779A3.968 3.968 0 0 0 2 14c.003.24.027.48.072.716a4 4 0 0 0 .235.832c.006.014.015.027.021.041a3.85 3.85 0 0 0 .417.727c.105.146.219.285.342.415.072.076.148.146.225.216.1.091.205.179.315.26.11.081.2.14.308.2.02.013.039.028.059.04v.053a3.506 3.506 0 0 0 3.03 3.469 3.426 3.426 0 0 0 4.154.577A.972.972 0 0 1 11 21Zm10.934-7.68a3.956 3.956 0 0 0-.215-.779l-.017-.038a4.016 4.016 0 0 0-.79-1.235 3.417 3.417 0 0 0 .017-1.468 3.387 3.387 0 0 0-.1-.333c-.034-.108-.057-.22-.1-.324a3.517 3.517 0 0 0-.766-1.128 3.5 3.5 0 0 0-2.202-3.777A3.5 3.5 0 0 0 14.5 2a3.451 3.451 0 0 0-1.5.352V21a.972.972 0 0 1-.184.546 3.426 3.426 0 0 0 4.154-.577A3.506 3.506 0 0 0 20 17.5v-.049c.02-.012.039-.027.059-.04.106-.064.208-.13.308-.2s.214-.169.315-.26c.077-.07.153-.14.225-.216a4.007 4.007 0 0 0 .459-.588c.115-.176.215-.361.3-.554.006-.014.015-.027.021-.041.087-.213.156-.434.205-.659.013-.057.024-.115.035-.173.046-.237.07-.478.073-.72a3.948 3.948 0 0 0-.066-.68Z"/>
          </svg>
          <span>LinkGenie Draft Assistant</span>
        </div>
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
  `,o.appendChild(t);let r=o.getElementById("closeModal"),i=o.getElementById("cancelBtn"),s=o.getElementById("insertBtn"),l=o.getElementById("generateBtn"),a=o.getElementById("draftTextarea"),d=()=>{t.classList.remove("active")};r.addEventListener("click",d),i.addEventListener("click",d),t.addEventListener("click",p=>{p.target===t&&d()}),document.addEventListener("keydown",p=>{p.key==="Escape"&&t.classList.contains("active")&&d()}),s.addEventListener("click",()=>{x&&a.value.trim()&&(T(x,a.value.trim()),d())});let c=o.querySelectorAll("#toneControl .segmented-option");c.forEach(p=>{p.addEventListener("click",()=>{c.forEach(b=>b.classList.remove("active")),p.classList.add("active"),h=p.getAttribute("data-value")||"professional"})});let v=o.querySelectorAll("#lengthControl .segmented-option");return v.forEach(p=>{p.addEventListener("click",()=>{v.forEach(b=>b.classList.remove("active")),p.classList.add("active"),k=p.getAttribute("data-value")||"short"})}),l.addEventListener("click",()=>{w()}),o}function w(){if(f){console.log("AI Reply Extension: Generation already in progress. Ignoring duplicate trigger.");return}let n=E(),o=n.getElementById("postContentInput"),e=o?o.value.trim():"",t=n.getElementById("errorContainer"),r=n.getElementById("loadingOverlay"),i=n.getElementById("draftTextarea"),s=n.getElementById("insertBtn"),l=n.getElementById("generateBtn");if(!e){t.textContent="Please paste or type some LinkedIn post content first.",t.classList.add("active");return}f=!0,t.classList.remove("active"),r.classList.add("active"),s.disabled=!0,l&&(l.disabled=!0),chrome.runtime.sendMessage({action:"generateReply",postText:e,tone:h,length:k},a=>{if(f=!1,r.classList.remove("active"),l&&(l.disabled=!1),chrome.runtime.lastError){console.error("AI Reply Extension: Message error:",chrome.runtime.lastError),t.textContent=`Extension communication error: ${chrome.runtime.lastError.message}`,t.classList.add("active");return}if(a&&a.success)a.reply==="POST_TEXT_NOT_FOUND"?(i.value="",t.textContent="LinkGenie could not detect a clear post body from the provided text to generate a reply.",t.classList.add("active"),s.disabled=!0):(i.value=a.reply,s.disabled=!1);else{let d=a?.error||"Unknown error occurred while generating reply.";t.textContent=`Error: ${d}`,t.classList.add("active")}})}function B(n){let o=n,e=0,t=15;for(;o&&e<t;){let r=o.querySelector('p[componentkey^="feed-commentary"]');if(r)return(r.innerText||"").trim();o=o.parentElement,e++}return""}function M(n,o){x=n,L=o;let e=E(),t=B(n),r=e.getElementById("postContentInput");r&&(r.value=t);let i=e.getElementById("draftTextarea");i&&(i.value="");let s=e.getElementById("errorContainer");s&&(s.classList.remove("active"),s.textContent="");let l=e.getElementById("insertBtn");l&&(l.disabled=!0);let a=e.querySelector(".backdrop");document.documentElement.classList.contains("theme--dark")||document.body.classList.contains("theme--dark")||document.documentElement.getAttribute("data-theme")==="dark"?a.classList.add("dark"):a.classList.remove("dark"),a.classList.add("active"),r&&r.focus()}function g(n,o){let e=document.createElement("button");return e.type="button",e.className="ai-reply-trigger",e.innerHTML=`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px; vertical-align: middle; display: inline-block;">
      <defs>
        <linearGradient id="btn-instagram-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#fdf497" />
          <stop offset="5%" stop-color="#fdf497" />
          <stop offset="45%" stop-color="#fd5949" />
          <stop offset="60%" stop-color="#d6249f" />
          <stop offset="90%" stop-color="#285AEB" />
        </linearGradient>
      </defs>
      <path fill="url(#btn-instagram-grad)" d="M11 21V2.352A3.451 3.451 0 0 0 9.5 2a3.5 3.5 0 0 0-3.261 2.238A3.5 3.5 0 0 0 4.04 8.015a3.518 3.518 0 0 0-.766 1.128c-.042.1-.064.209-.1.313a3.34 3.34 0 0 0-.106.344 3.463 3.463 0 0 0 .02 1.468A4.017 4.017 0 0 0 2.3 12.5l-.015.036a3.861 3.861 0 0 0-.216.779A3.968 3.968 0 0 0 2 14c.003.24.027.48.072.716a4 4 0 0 0 .235.832c.006.014.015.027.021.041a3.85 3.85 0 0 0 .417.727c.105.146.219.285.342.415.072.076.148.146.225.216.1.091.205.179.315.26.11.081.2.14.308.2.02.013.039.028.059.04v.053a3.506 3.506 0 0 0 3.03 3.469 3.426 3.426 0 0 0 4.154.577A.972.972 0 0 1 11 21Zm10.934-7.68a3.956 3.956 0 0 0-.215-.779l-.017-.038a4.016 4.016 0 0 0-.79-1.235 3.417 3.417 0 0 0 .017-1.468 3.387 3.387 0 0 0-.1-.333c-.034-.108-.057-.22-.1-.324a3.517 3.517 0 0 0-.766-1.128 3.5 3.5 0 0 0-2.202-3.777A3.5 3.5 0 0 0 14.5 2a3.451 3.451 0 0 0-1.5.352V21a.972.972 0 0 1-.184.546 3.426 3.426 0 0 0 4.154-.577A3.506 3.506 0 0 0 20 17.5v-.049c.02-.012.039-.027.059-.04.106-.064.208-.13.308-.2s.214-.169.315-.26c.077-.07.153-.14.225-.216a4.007 4.007 0 0 0 .459-.588c.115-.176.215-.361.3-.554.006-.014.015-.027.021-.041.087-.213.156-.434.205-.659.013-.057.024-.115.035-.173.046-.237.07-.478.073-.72a3.948 3.948 0 0 0-.066-.68Z"/>
    </svg>
    <span>AI Reply</span>
  `,e.style.display="inline-flex",e.style.alignItems="center",e.style.justifyContent="center",e.style.background="transparent",e.style.border="none",e.style.color="inherit",e.style.opacity="0.75",e.style.borderRadius="16px",e.style.padding="0 12px",e.style.height="32px",e.style.fontSize="14px",e.style.fontWeight="600",e.style.cursor="pointer",e.style.marginLeft="4px",e.style.marginRight="4px",e.style.transition="all 0.16s ease-in-out",e.style.fontFamily='-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',e.addEventListener("mouseenter",()=>{e.style.background="rgba(128, 128, 128, 0.15)",e.style.opacity="1"}),e.addEventListener("mouseleave",()=>{e.style.background="transparent",e.style.opacity="0.75"}),e.addEventListener("click",t=>{t.preventDefault(),t.stopPropagation(),M(n,o)}),e}function C(n){let o=n.querySelector('button[type="submit"]');if(o)return o;let e=n.querySelectorAll("button");for(let t=0;t<e.length;t++){let r=e[t],i=(r.textContent||"").trim().toLowerCase();if(["post","comment","reply","send","publish","share"].includes(i))return r;let s=(r.getAttribute("aria-label")||"").toLowerCase();if(s.includes("post")||s.includes("comment")||s.includes("reply"))return r}return null}function I(n){let o=n,e=0;for(;o&&e<6;){let t=o.querySelector('button[aria-label*="Emoji"], button[aria-label*="emoji"], button[aria-label*="photo"], button[aria-label*="photo" i], button[aria-label*="image"]');if(t&&t.parentElement)return t.parentElement;o=o.parentElement,e++}return null}function y(){document.querySelectorAll('div[contenteditable="true"], textarea.comments-comment-textbox__textarea').forEach(o=>{let e=o;if(e.getAttribute("data-ai-reply-injected")==="true"||e.closest("#ai-reply-assistant-root")||e.classList.contains("draft-textarea"))return;let t=I(e);if(t){let a=g(e,t);t.insertBefore(a,t.firstChild),e.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Injected button into toolbar next to emoji/photo icons.");return}let r=e,i=null,s=0;for(;r&&s<6&&(i=C(r),!i);)r=r.parentElement,s++;let l=r||e;if(i&&i.parentElement){let a=g(e,l);i.parentElement.insertBefore(a,i),e.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Injected button next to submit button (class-agnostic).")}else{let a=g(e,l),d=e.parentElement;if(d){let c=document.createElement("div");c.className="ai-reply-adhoc-bar",c.style.display="inline-flex",c.style.justifyContent="flex-end",c.style.width="100%",c.style.padding="4px 0",c.appendChild(a),e.nextSibling?d.insertBefore(c,e.nextSibling):d.appendChild(c),e.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Succeeded in fallback button injection after editor.")}}})}function A(){y(),new MutationObserver(()=>{u&&clearTimeout(u),u=window.setTimeout(()=>{y()},150)}).observe(document.body,{childList:!0,subtree:!0}),console.log("AI Reply Extension: MutationObserver initialized.")}A();})();
