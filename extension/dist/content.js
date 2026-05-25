"use strict";(()=>{var B=null,I="professional",A="short",R=null,T=null,w=null,C=!1;function N(o,a){o.focus();try{let e=window.getSelection(),t=document.createRange();t.selectNodeContents(o),e?.removeAllRanges(),e?.addRange(t),document.execCommand("insertText",!1,a)||(o.innerText=a),o.dispatchEvent(new Event("input",{bubbles:!0})),o.dispatchEvent(new Event("change",{bubbles:!0})),console.log("AI Reply Extension: Text successfully injected into active composer.")}catch(e){console.error("AI Reply Extension: Error inserting text:",e),o.innerText=a,o.dispatchEvent(new Event("input",{bubbles:!0}))}}function _(){if(T)return T;let o=document.createElement("div");o.id="ai-reply-assistant-root",o.style.position="fixed",o.style.zIndex="999999",document.body.appendChild(o);let a=o.attachShadow({mode:"open"});T=a;let e=document.createElement("style");e.textContent=`
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
  
  `,a.appendChild(e);let t=document.createElement("div");t.className="backdrop",t.innerHTML=`
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
  `,a.appendChild(t);let n=a.getElementById("closeModal"),i=a.getElementById("cancelBtn"),s=a.getElementById("insertBtn"),r=a.getElementById("generateBtn"),p=a.getElementById("draftTextarea"),m=()=>{t.classList.remove("active")};n.addEventListener("click",m),i.addEventListener("click",m),t.addEventListener("click",l=>{l.target===t&&m()}),document.addEventListener("keydown",l=>{l.key==="Escape"&&t.classList.contains("active")&&m()}),s.addEventListener("click",()=>{B&&p.value.trim()&&(N(B,p.value.trim()),m())});let u=a.querySelectorAll("#toneControl .segmented-option");u.forEach(l=>{l.addEventListener("click",()=>{u.forEach(f=>f.classList.remove("active")),l.classList.add("active"),I=l.getAttribute("data-value")||"professional"})});let g=a.querySelectorAll("#lengthControl .segmented-option");return g.forEach(l=>{l.addEventListener("click",()=>{g.forEach(f=>f.classList.remove("active")),l.classList.add("active"),A=l.getAttribute("data-value")||"short"})}),r.addEventListener("click",()=>{P()}),a}function P(){if(C){console.log("AI Reply Extension: Generation already in progress. Ignoring duplicate trigger.");return}let o=_(),a=o.getElementById("postContentInput"),e=a?a.value.trim():"",t=o.getElementById("errorContainer"),n=o.getElementById("loadingOverlay"),i=o.getElementById("draftTextarea"),s=o.getElementById("insertBtn"),r=o.getElementById("generateBtn");if(!e){t.textContent="Please paste or type some LinkedIn post content first.",t.classList.add("active");return}C=!0,t.classList.remove("active"),n.classList.add("active"),s.disabled=!0,r&&(r.disabled=!0),chrome.runtime.sendMessage({action:"generateReply",postText:e,tone:I,length:A},p=>{if(C=!1,n.classList.remove("active"),r&&(r.disabled=!1),chrome.runtime.lastError){console.error("AI Reply Extension: Message error:",chrome.runtime.lastError),t.textContent=`Extension communication error: ${chrome.runtime.lastError.message}`,t.classList.add("active");return}if(p&&p.success)p.reply==="POST_TEXT_NOT_FOUND"?(i.value="",t.textContent="LinkGenie could not detect a clear post body from the provided text to generate a reply.",t.classList.add("active"),s.disabled=!0):(i.value=p.reply,s.disabled=!1);else{let m=p?.error||"Unknown error occurred while generating reply.";t.textContent=`Error: ${m}`,t.classList.add("active")}})}function z(o,a){B=o,R=a;let e=_(),t=e.getElementById("postContentInput");t&&(t.value="");let n=e.getElementById("draftTextarea");n&&(n.value="");let i=e.getElementById("errorContainer");i&&(i.classList.remove("active"),i.textContent="");let s=e.getElementById("insertBtn");s&&(s.disabled=!0);let r=e.querySelector(".backdrop");document.documentElement.classList.contains("theme--dark")||document.body.classList.contains("theme--dark")||document.documentElement.getAttribute("data-theme")==="dark"?r.classList.add("dark"):r.classList.remove("dark"),r.classList.add("active"),t&&t.focus()}function M(o,a){let e=document.createElement("button");return e.type="button",e.className="ai-reply-trigger",e.innerHTML=`
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px; vertical-align: middle; display: inline-block;">
      <path d="M9 21c-.5 0-.9-.3-1-.8l-1.5-4.7L1.8 14c-.5-.1-.8-.5-.8-1s.3-.9.8-1l4.7-1.5L8 5.8c.1-.5.5-.8 1-.8s.9.3 1 .8l1.5 4.7 4.7 1.5c.5.1.8.5.8 1s-.3.9-.8 1l-4.7 1.5-1.5 4.7c-.1.5-.5.8-1 .8zM19 8c-.3 0-.5-.2-.6-.4l-.8-2.2-2.2-.8c-.3-.1-.4-.3-.4-.6s.2-.5.4-.6l2.2-.8.8-2.2c.1-.3.3-.4.6-.4s.5.2.6.4l.8 2.2 2.2.8c.3.1.4.3.4.6s-.2.5-.4.6l-2.2.8-.8 2.2c-.1.3-.3.4-.6.4z"/>
    </svg>
    <span>AI Reply</span>
  `,e.style.display="inline-flex",e.style.alignItems="center",e.style.justifyContent="center",e.style.background="transparent",e.style.border="none",e.style.color="inherit",e.style.opacity="0.75",e.style.borderRadius="16px",e.style.padding="0 12px",e.style.height="32px",e.style.fontSize="14px",e.style.fontWeight="600",e.style.cursor="pointer",e.style.marginLeft="4px",e.style.marginRight="4px",e.style.transition="all 0.16s ease-in-out",e.style.fontFamily='-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',e.addEventListener("mouseenter",()=>{e.style.background="rgba(128, 128, 128, 0.15)",e.style.opacity="1"}),e.addEventListener("mouseleave",()=>{e.style.background="transparent",e.style.opacity="0.75"}),e.addEventListener("click",t=>{t.preventDefault(),t.stopPropagation(),z(o,a)}),e}function D(o){let a=o.querySelector('button[type="submit"]');if(a)return a;let e=o.querySelectorAll("button");for(let t=0;t<e.length;t++){let n=e[t],i=(n.textContent||"").trim().toLowerCase();if(["post","comment","reply","send","publish","share"].includes(i))return n;let s=(n.getAttribute("aria-label")||"").toLowerCase();if(s.includes("post")||s.includes("comment")||s.includes("reply"))return n}return null}function q(o){let a=o,e=0;for(;a&&e<6;){let t=a.querySelector('button[aria-label*="Emoji"], button[aria-label*="emoji"], button[aria-label*="photo"], button[aria-label*="photo" i], button[aria-label*="image"]');if(t&&t.parentElement)return t.parentElement;a=a.parentElement,e++}return null}function O(){let o="linkgenie-main-styles";if(document.getElementById(o))return;let a=document.createElement("style");a.id=o,a.textContent=`
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
  `,document.head.appendChild(a)}function $(){let o=new Set;[".feed-shared-social-action-bar",".social-actions",".feed-shared-social-actions"].forEach(n=>{document.querySelectorAll(n).forEach(i=>o.add(i))}),["#comment-small","#comment-medium","#repost-small","#repost-medium","#send-privately-small","#send-privately-medium"].forEach(n=>{document.querySelectorAll(`svg${n}`).forEach(i=>{let s=i.closest("button, a");s&&s.parentElement&&o.add(s.parentElement)})});let t=Array.from(o);return t.filter(n=>!t.some(i=>i!==n&&i.contains(n)))}function v(o,a,e){let{spanClasses:t,textDivClasses:n,textSpanClasses:i}=e,s=a?`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="linkgenie-copy-icon" style="margin-right: 4px; vertical-align: middle;">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `:`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="linkgenie-copy-icon" style="margin-right: 4px; vertical-align: middle;">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  `;if(t){let r=`<span class="${t}">${s}`;return n?(r+=`<div class="${n}">`,i?r+=`<span class="${i}"><span class="linkgenie-btn-text">${o}</span></span>`:r+=`<span class="linkgenie-btn-text">${o}</span>`,r+="</div>"):i?r+=`<span class="${i}"><span class="linkgenie-btn-text">${o}</span></span>`:r+=`<span class="linkgenie-btn-text">${o}</span>`,r+="</span>",r}else return`
      <span class="artdeco-button__text">
        ${s}
        <span class="linkgenie-btn-text">${o}</span>
      </span>
    `}function S(){O(),[".feed-shared-inline-show-more-text",".expandable-text-box",".feed-shared-update-v2__description-text",".update-components-text"].forEach(t=>{document.querySelectorAll(t).forEach(i=>{let s=i;if(s.closest(".comments-comment-item")||s.closest(".comment-item")||(s.className||"").toLowerCase().includes("comment")||s.getAttribute("data-lg-copy-injected")==="true")return;let r=document.createElement("button");r.type="button",r.className="linkgenie-copy-btn",r.setAttribute("aria-label","Copy post content"),r.innerHTML=`
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `,r.addEventListener("click",p=>{p.preventDefault(),p.stopPropagation();let m=s.cloneNode(!0),u=m.querySelector(".linkgenie-copy-btn");u&&u.remove();let g=(m.textContent||"").trim();g=g.replace(/\bsee\s+more\b/gi,"").trim(),navigator.clipboard.writeText(g).then(()=>{r.classList.add("success"),r.innerHTML=`
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `,setTimeout(()=>{r.classList.remove("success"),r.innerHTML=`
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            `},1500)}).catch(l=>{console.error("LinkGenie: Failed to copy text:",l)})}),s.appendChild(r),s.setAttribute("data-lg-copy-injected","true"),console.log("AI Reply Extension: Injected copy button overlay into description element.")})}),$().forEach(t=>{let n=t;if(n.getAttribute("data-lg-copy-bar-injected")==="true")return;let i=n.querySelector('button[aria-label*="Comment"], button:nth-child(2), a:nth-child(2)');if(i||(i=n.querySelector("button, a")),!i)return;let s=i.className,r=i.querySelector("span"),p=r?r.className:"",m=r?r.querySelector("div"):null,u=m?m.className:"",g=r?r.querySelector("span:not(:first-child), div span"):null,l=g?g.className:"",f={spanClasses:p,textDivClasses:u,textSpanClasses:l},b=document.createElement("button");b.type="button",s?b.className=s+" linkgenie-action-bar-copy-btn":b.className="artdeco-button artdeco-button--muted artdeco-button--4 artdeco-button--tertiary react-button__trigger linkgenie-action-bar-copy-btn",b.setAttribute("aria-label","Copy post content"),b.innerHTML=v("Copy Post",!1,f),b.addEventListener("click",H=>{H.preventDefault(),H.stopPropagation();let d=n;for(;d&&d!==document.body&&!(d.querySelector(".expandable-text-box, .feed-shared-inline-show-more-text, .feed-shared-update-v2__description-text")||d.classList.contains("feed-shared-update-v2")||d.getAttribute("role")==="listitem"||d.tagName.toLowerCase()==="article"||d.classList.contains("feed-shared-update")||d.getAttribute("componentkey")&&d.getAttribute("componentkey").includes("FeedType")||d.className.includes("feed-shared-")||d.className.includes("update-v2"));)d=d.parentElement;if(d||(d=n.parentElement),!d){console.warn("LinkGenie: Could not find parent post card container.");return}let j=[".feed-shared-inline-show-more-text",".expandable-text-box",".feed-shared-update-v2__description-text",".update-components-text",".feed-shared-update-v2__commentary",".update-components-update-v2__commentary",".feed-shared-text"],L=null;for(let x of j){let y=d.querySelectorAll(x);for(let k of y){let c=k,E=c.closest(".comments-comment-item")||c.closest(".comment-item")||c.className.toLowerCase().includes("comment"),h=c.closest(".update-components-actor")||c.closest(".feed-shared-actor")||c.closest('[class*="actor"]')||c.closest('[class*="header"]')||c.closest('[class*="profile"]');if(!E&&!h){L=c;break}}if(L)break}if(L){let x=L.cloneNode(!0),y=x.querySelector(".linkgenie-copy-btn");y&&y.remove(),x.querySelectorAll(".feed-shared-inline-show-more-text__see-more-less-toggle, .see-more, button").forEach(E=>E.remove());let c=(x.textContent||"").trim();c=c.replace(/\bsee\s+more\b/gi,"").trim(),c=c.replace(/\bsee\s+translation\b/gi,"").trim(),navigator.clipboard.writeText(c).then(()=>{b.classList.add("success"),b.innerHTML=v("Copied!",!0,f),setTimeout(()=>{b.classList.remove("success"),b.innerHTML=v("Copy Post",!1,f)},1500)}).catch(E=>{console.error("LinkGenie: Failed to copy text:",E)})}else{let x=d.querySelectorAll("p, span"),y="";for(let k of x){let c=k;if(c.closest(".update-components-actor")||c.closest(".feed-shared-actor")||c.closest('[class*="actor"]')||c.closest('[class*="header"]')||c.closest('[class*="profile"]'))continue;let h=(c.textContent||"").trim();if(h.length>50&&!h.includes("reactions")&&!h.includes("Comment")&&!h.includes("Repost")){y=h;break}}y?navigator.clipboard.writeText(y).then(()=>{b.classList.add("success"),b.innerHTML=v("Copied!",!0,f),setTimeout(()=>{b.classList.remove("success"),b.innerHTML=v("Copy Post",!1,f)},1500)}).catch(k=>{console.error("LinkGenie: Failed fallback copy:",k)}):(b.innerHTML=v("No text found",!1,f),setTimeout(()=>{b.innerHTML=v("Copy Post",!1,f)},1500))}}),n.appendChild(b),n.setAttribute("data-lg-copy-bar-injected","true"),console.log('AI Reply Extension: Injected "Copy Post" button into social action bar.')}),document.querySelectorAll('div[contenteditable="true"], textarea.comments-comment-textbox__textarea').forEach(t=>{let n=t;if(n.getAttribute("data-ai-reply-injected")==="true"||n.closest("#ai-reply-assistant-root")||n.classList.contains("draft-textarea"))return;let i=q(n);if(i){let u=M(n,i);i.insertBefore(u,i.firstChild),n.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Injected button into toolbar next to emoji/photo icons.");return}let s=n,r=null,p=0;for(;s&&p<6&&(r=D(s),!r);)s=s.parentElement,p++;let m=s||n;if(r&&r.parentElement){let u=M(n,m);r.parentElement.insertBefore(u,r),n.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Injected button next to submit button (class-agnostic).")}else{let u=M(n,m),g=n.parentElement;if(g){let l=document.createElement("div");l.className="ai-reply-adhoc-bar",l.style.display="inline-flex",l.style.justifyContent="flex-end",l.style.width="100%",l.style.padding="4px 0",l.appendChild(u),n.nextSibling?g.insertBefore(l,n.nextSibling):g.appendChild(l),n.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Succeeded in fallback button injection after editor.")}}})}function F(){S(),new MutationObserver(()=>{w&&clearTimeout(w),w=window.setTimeout(()=>{S()},150)}).observe(document.body,{childList:!0,subtree:!0}),console.log("AI Reply Extension: MutationObserver initialized.")}F();})();
