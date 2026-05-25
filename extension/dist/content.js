"use strict";(()=>{var k=null,L="professional",w="short",C=null,x=null,h=null,y=!1;function M(a,r){a.focus();try{let e=window.getSelection(),o=document.createRange();o.selectNodeContents(a),e?.removeAllRanges(),e?.addRange(o),document.execCommand("insertText",!1,r)||(a.innerText=r),a.dispatchEvent(new Event("input",{bubbles:!0})),a.dispatchEvent(new Event("change",{bubbles:!0})),console.log("AI Reply Extension: Text successfully injected into active composer.")}catch(e){console.error("AI Reply Extension: Error inserting text:",e),a.innerText=r,a.dispatchEvent(new Event("input",{bubbles:!0}))}}function T(){if(x)return x;let a=document.createElement("div");a.id="ai-reply-assistant-root",a.style.position="fixed",a.style.zIndex="999999",document.body.appendChild(a);let r=a.attachShadow({mode:"open"});x=r;let e=document.createElement("style");e.textContent=`
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
  
  `,r.appendChild(e);let o=document.createElement("div");o.className="backdrop",o.innerHTML=`
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
  `,r.appendChild(o);let i=r.getElementById("closeModal"),l=r.getElementById("cancelBtn"),n=r.getElementById("insertBtn"),t=r.getElementById("generateBtn"),c=r.getElementById("draftTextarea"),d=()=>{o.classList.remove("active")};i.addEventListener("click",d),l.addEventListener("click",d),o.addEventListener("click",s=>{s.target===o&&d()}),document.addEventListener("keydown",s=>{s.key==="Escape"&&o.classList.contains("active")&&d()}),n.addEventListener("click",()=>{k&&c.value.trim()&&(M(k,c.value.trim()),d())});let u=r.querySelectorAll("#toneControl .segmented-option");u.forEach(s=>{s.addEventListener("click",()=>{u.forEach(p=>p.classList.remove("active")),s.classList.add("active"),L=s.getAttribute("data-value")||"professional"})});let b=r.querySelectorAll("#lengthControl .segmented-option");return b.forEach(s=>{s.addEventListener("click",()=>{b.forEach(p=>p.classList.remove("active")),s.classList.add("active"),w=s.getAttribute("data-value")||"short"})}),t.addEventListener("click",()=>{B()}),r}function B(){if(y){console.log("AI Reply Extension: Generation already in progress. Ignoring duplicate trigger.");return}let a=T(),r=a.getElementById("postContentInput"),e=r?r.value.trim():"",o=a.getElementById("errorContainer"),i=a.getElementById("loadingOverlay"),l=a.getElementById("draftTextarea"),n=a.getElementById("insertBtn"),t=a.getElementById("generateBtn");if(!e){o.textContent="Please paste or type some LinkedIn post content first.",o.classList.add("active");return}y=!0,o.classList.remove("active"),i.classList.add("active"),n.disabled=!0,t&&(t.disabled=!0),chrome.runtime.sendMessage({action:"generateReply",postText:e,tone:L,length:w},c=>{if(y=!1,i.classList.remove("active"),t&&(t.disabled=!1),chrome.runtime.lastError){console.error("AI Reply Extension: Message error:",chrome.runtime.lastError),o.textContent=`Extension communication error: ${chrome.runtime.lastError.message}`,o.classList.add("active");return}if(c&&c.success)c.reply==="POST_TEXT_NOT_FOUND"?(l.value="",o.textContent="LinkGenie could not detect a clear post body from the provided text to generate a reply.",o.classList.add("active"),n.disabled=!0):(l.value=c.reply,n.disabled=!1);else{let d=c?.error||"Unknown error occurred while generating reply.";o.textContent=`Error: ${d}`,o.classList.add("active")}})}function H(a,r){k=a,C=r;let e=T(),o=e.getElementById("postContentInput");o&&(o.value="");let i=e.getElementById("draftTextarea");i&&(i.value="");let l=e.getElementById("errorContainer");l&&(l.classList.remove("active"),l.textContent="");let n=e.getElementById("insertBtn");n&&(n.disabled=!0);let t=e.querySelector(".backdrop");document.documentElement.classList.contains("theme--dark")||document.body.classList.contains("theme--dark")||document.documentElement.getAttribute("data-theme")==="dark"?t.classList.add("dark"):t.classList.remove("dark"),t.classList.add("active"),o&&o.focus()}function v(a,r){let e=document.createElement("button");return e.type="button",e.className="ai-reply-trigger",e.innerHTML=`
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px; vertical-align: middle; display: inline-block;">
      <path d="M9 21c-.5 0-.9-.3-1-.8l-1.5-4.7L1.8 14c-.5-.1-.8-.5-.8-1s.3-.9.8-1l4.7-1.5L8 5.8c.1-.5.5-.8 1-.8s.9.3 1 .8l1.5 4.7 4.7 1.5c.5.1.8.5.8 1s-.3.9-.8 1l-4.7 1.5-1.5 4.7c-.1.5-.5.8-1 .8zM19 8c-.3 0-.5-.2-.6-.4l-.8-2.2-2.2-.8c-.3-.1-.4-.3-.4-.6s.2-.5.4-.6l2.2-.8.8-2.2c.1-.3.3-.4.6-.4s.5.2.6.4l.8 2.2 2.2.8c.3.1.4.3.4.6s-.2.5-.4.6l-2.2.8-.8 2.2c-.1.3-.3.4-.6.4z"/>
    </svg>
    <span>AI Reply</span>
  `,e.style.display="inline-flex",e.style.alignItems="center",e.style.justifyContent="center",e.style.background="transparent",e.style.border="none",e.style.color="inherit",e.style.opacity="0.75",e.style.borderRadius="16px",e.style.padding="0 12px",e.style.height="32px",e.style.fontSize="14px",e.style.fontWeight="600",e.style.cursor="pointer",e.style.marginLeft="4px",e.style.marginRight="4px",e.style.transition="all 0.16s ease-in-out",e.style.fontFamily='-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',e.addEventListener("mouseenter",()=>{e.style.background="rgba(128, 128, 128, 0.15)",e.style.opacity="1"}),e.addEventListener("mouseleave",()=>{e.style.background="transparent",e.style.opacity="0.75"}),e.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation(),H(a,r)}),e}function I(a){let r=a.querySelector('button[type="submit"]');if(r)return r;let e=a.querySelectorAll("button");for(let o=0;o<e.length;o++){let i=e[o],l=(i.textContent||"").trim().toLowerCase();if(["post","comment","reply","send","publish","share"].includes(l))return i;let n=(i.getAttribute("aria-label")||"").toLowerCase();if(n.includes("post")||n.includes("comment")||n.includes("reply"))return i}return null}function S(a){let r=a,e=0;for(;r&&e<6;){let o=r.querySelector('button[aria-label*="Emoji"], button[aria-label*="emoji"], button[aria-label*="photo"], button[aria-label*="photo" i], button[aria-label*="image"]');if(o&&o.parentElement)return o.parentElement;r=r.parentElement,e++}return null}function _(){let a="linkgenie-main-styles";if(document.getElementById(a))return;let r=document.createElement("style");r.id=a,r.textContent=`
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
  `,document.head.appendChild(r)}function E(){_(),[".feed-shared-inline-show-more-text",".expandable-text-box",".feed-shared-update-v2__description-text",".update-components-text"].forEach(o=>{document.querySelectorAll(o).forEach(l=>{let n=l;if(n.closest(".comments-comment-item")||n.closest(".comment-item")||(n.className||"").toLowerCase().includes("comment")||n.getAttribute("data-lg-copy-injected")==="true")return;let t=document.createElement("button");t.type="button",t.className="linkgenie-copy-btn",t.setAttribute("aria-label","Copy post content"),t.innerHTML=`
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `,t.addEventListener("click",c=>{c.preventDefault(),c.stopPropagation();let d=n.cloneNode(!0),u=d.querySelector(".linkgenie-copy-btn");u&&u.remove();let b=(d.textContent||"").trim();b=b.replace(/\bsee\s+more\b/gi,"").trim(),navigator.clipboard.writeText(b).then(()=>{t.classList.add("success"),t.innerHTML=`
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `,setTimeout(()=>{t.classList.remove("success"),t.innerHTML=`
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            `},1500)}).catch(s=>{console.error("LinkGenie: Failed to copy text:",s)})}),n.appendChild(t),n.setAttribute("data-lg-copy-injected","true"),console.log("AI Reply Extension: Injected copy button overlay into description element.")})}),[".feed-shared-social-action-bar",".social-actions",".feed-shared-social-actions"].forEach(o=>{document.querySelectorAll(o).forEach(l=>{let n=l;if(n.getAttribute("data-lg-copy-bar-injected")==="true")return;let t=document.createElement("button");t.type="button",t.className="artdeco-button artdeco-button--muted artdeco-button--4 artdeco-button--tertiary react-button__trigger linkgenie-action-bar-copy-btn",t.setAttribute("aria-label","Copy post content"),t.innerHTML=`
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="linkgenie-copy-icon">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span class="artdeco-button__text">Copy Post</span>
      `,t.addEventListener("click",c=>{c.preventDefault(),c.stopPropagation();let d=n.closest(".feed-shared-update-v2")||n.closest('[role="listitem"]')||n.closest(".feed-shared-update")||n.closest(".feed-shared-update-v4")||n.closest("article")||n.parentElement;if(!d){console.warn("LinkGenie: Could not find parent post card container.");return}let u=[".feed-shared-inline-show-more-text",".expandable-text-box",".feed-shared-update-v2__description-text",".update-components-text",".feed-shared-update-v2__commentary",".update-components-update-v2__commentary",".feed-shared-text"],b=null;for(let s of u){let p=d.querySelector(s);if(p&&!p.closest(".comments-comment-item")&&!p.closest(".comment-item")&&!p.className.toLowerCase().includes("comment")){b=p;break}}if(b){let s=b.cloneNode(!0),p=s.querySelector(".linkgenie-copy-btn");p&&p.remove(),s.querySelectorAll(".feed-shared-inline-show-more-text__see-more-less-toggle, .see-more, button").forEach(f=>f.remove());let m=(s.textContent||"").trim();m=m.replace(/\bsee\s+more\b/gi,"").trim(),m=m.replace(/\bsee\s+translation\b/gi,"").trim(),navigator.clipboard.writeText(m).then(()=>{t.classList.add("success"),t.innerHTML=`
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="linkgenie-copy-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="artdeco-button__text">Copied!</span>
            `,setTimeout(()=>{t.classList.remove("success"),t.innerHTML=`
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="linkgenie-copy-icon">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span class="artdeco-button__text">Copy Post</span>
              `},1500)}).catch(f=>{console.error("LinkGenie: Failed to copy text:",f)})}else{let s=d.querySelectorAll("p, span"),p="";for(let g of s){let m=(g.textContent||"").trim();if(m.length>50&&!m.includes("reactions")&&!m.includes("Comment")&&!m.includes("Repost")){p=m;break}}p?navigator.clipboard.writeText(p).then(()=>{t.classList.add("success"),t.innerHTML=`
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="linkgenie-copy-icon">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="artdeco-button__text">Copied!</span>
              `,setTimeout(()=>{t.classList.remove("success"),t.innerHTML=`
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="linkgenie-copy-icon">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span class="artdeco-button__text">Copy Post</span>
                `},1500)}).catch(g=>{console.error("LinkGenie: Failed fallback copy:",g)}):(t.innerHTML=`
              <span class="artdeco-button__text">No text found</span>
            `,setTimeout(()=>{t.innerHTML=`
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="linkgenie-copy-icon">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span class="artdeco-button__text">Copy Post</span>
              `},1500))}}),n.appendChild(t),n.setAttribute("data-lg-copy-bar-injected","true"),console.log('AI Reply Extension: Injected "Copy Post" button into social action bar.')})}),document.querySelectorAll('div[contenteditable="true"], textarea.comments-comment-textbox__textarea').forEach(o=>{let i=o;if(i.getAttribute("data-ai-reply-injected")==="true"||i.closest("#ai-reply-assistant-root")||i.classList.contains("draft-textarea"))return;let l=S(i);if(l){let u=v(i,l);l.insertBefore(u,l.firstChild),i.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Injected button into toolbar next to emoji/photo icons.");return}let n=i,t=null,c=0;for(;n&&c<6&&(t=I(n),!t);)n=n.parentElement,c++;let d=n||i;if(t&&t.parentElement){let u=v(i,d);t.parentElement.insertBefore(u,t),i.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Injected button next to submit button (class-agnostic).")}else{let u=v(i,d),b=i.parentElement;if(b){let s=document.createElement("div");s.className="ai-reply-adhoc-bar",s.style.display="inline-flex",s.style.justifyContent="flex-end",s.style.width="100%",s.style.padding="4px 0",s.appendChild(u),i.nextSibling?b.insertBefore(s,i.nextSibling):b.appendChild(s),i.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Succeeded in fallback button injection after editor.")}}})}function A(){E(),new MutationObserver(()=>{h&&clearTimeout(h),h=window.setTimeout(()=>{E()},150)}).observe(document.body,{childList:!0,subtree:!0}),console.log("AI Reply Extension: MutationObserver initialized.")}A();})();
