"use strict";(()=>{var E=null,k="",L="professional",T="short",B=null,x=null,v=null,y=!1;function I(o){let t=o,e=null;for(;t;){let s=t.getAttribute("role")||"",i=t.getAttribute("componentkey")||"";if(!(t.classList.contains("comments-comment-item")||t.classList.contains("comment-item")||t.closest(".comments-comment-item")||t.closest(".comment-item")||(t.getAttribute("data-id")||"").startsWith("comment-"))&&(t.tagName==="ARTICLE"||t.hasAttribute("data-urn")||s==="listitem"||i.includes("FeedType_MAIN_FEED")||t.classList.contains("feed-shared-update-v2")||t.classList.contains("occludable-update")||t.classList.contains("feed-shared-update"))){e=t;break}t=t.parentElement}if(!e){let s=o;for(let i=0;i<16;i++)s.parentElement&&(s=s.parentElement);e=s}if(!e)return console.warn("AI Reply Extension: Could not resolve parent post card."),"";console.log("AI Reply Extension: Found post card container:",e.tagName,e.className);let n=null,r=o;for(;r&&r.parentElement&&r.parentElement!==e;)r=r.parentElement;r&&r.parentElement===e&&(n=r);let a=null,c=e.querySelector('a[href*="/in/"], a[href*="/company/"]');if(c){let s=c;for(;s&&s.parentElement&&s.parentElement!==e;)s=s.parentElement;s&&s.parentElement===e&&(a=s)}let g=[".expandable-text-box",".feed-shared-inline-show-more-text",'p[componentkey*="feed-commentary"]','[class*="commentary"]'];for(let s of g){let i=e.querySelector(s);if(i){let d=n&&n.contains(i),u=a&&a.contains(i);if(!d&&!u){let l=(i.textContent||"").trim();if(l=l.replace(/\bsee\s+more\b/gi,"").trim(),l.length>15)return console.log(`AI Reply Extension: Found post text via primary selector "${s}":`,l),l}}}console.log("AI Reply Extension: Primary selectors failed. Falling back to class-agnostic scanner...");let b=e.querySelectorAll("p, span"),p=[];b.forEach(s=>{let i=s;if(n&&n.contains(i)||a&&a.contains(i)||i.closest('a[href*="/in/"], a[href*="/company/"]')||i.closest("#ai-reply-assistant-root")||i.closest('div[contenteditable="true"]')||i.tagName==="TEXTAREA"||i.closest('[class*="social-"]')||i.closest('[class*="action-bar"]')||i.closest('[class*="footer"]')||i.closest(".feed-shared-social-action-bar")||i.closest(".feed-shared-social-counts"))return;let d=(i.textContent||"").trim();d=d.replace(/\bsee\s+more\b/gi,"").trim();let u=d.toLowerCase();if(d.length>10&&!u.includes("like")&&!u.includes("comment")&&!u.includes("repost")&&!u.includes("send")&&!/^\d+$/.test(d)&&!u.includes("reactions")){let l=p.findIndex(f=>f.includes(d)||d.includes(f));l!==-1?d.length>p[l].length&&(p[l]=d):p.push(d)}});let m=p.join(`

`).trim();return console.log("AI Reply Extension: Scraped Post Content (Final):",m),m}function A(o,t){o.focus();try{let e=window.getSelection(),n=document.createRange();n.selectNodeContents(o),e?.removeAllRanges(),e?.addRange(n),document.execCommand("insertText",!1,t)||(o.innerText=t),o.dispatchEvent(new Event("input",{bubbles:!0})),o.dispatchEvent(new Event("change",{bubbles:!0})),console.log("AI Reply Extension: Text successfully injected into active composer.")}catch(e){console.error("AI Reply Extension: Error inserting text:",e),o.innerText=t,o.dispatchEvent(new Event("input",{bubbles:!0}))}}function C(){if(x)return x;let o=document.createElement("div");o.id="ai-reply-assistant-root",o.style.position="fixed",o.style.zIndex="999999",document.body.appendChild(o);let t=o.attachShadow({mode:"open"});x=t;let e=document.createElement("style");e.textContent=`
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
  
  `,t.appendChild(e);let n=document.createElement("div");n.className="backdrop",n.innerHTML=`
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
            <span id="previewArrow">\u25BC</span>
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
  `,t.appendChild(n);let r=t.getElementById("closeModal"),a=t.getElementById("cancelBtn"),c=t.getElementById("insertBtn"),g=t.getElementById("regenerateBtn"),b=t.getElementById("draftTextarea"),p=()=>{n.classList.remove("active")};r.addEventListener("click",p),a.addEventListener("click",p),n.addEventListener("click",l=>{l.target===n&&p()}),document.addEventListener("keydown",l=>{l.key==="Escape"&&n.classList.contains("active")&&p()});let m=t.getElementById("togglePreview"),s=t.getElementById("postPreviewBody"),i=t.getElementById("previewArrow");m&&s&&i&&m.addEventListener("click",()=>{let l=s.classList.toggle("collapsed");i.textContent=l?"\u25B2":"\u25BC"}),c.addEventListener("click",()=>{E&&b.value.trim()&&(A(E,b.value.trim()),p())});let d=t.querySelectorAll("#toneControl .segmented-option");d.forEach(l=>{l.addEventListener("click",()=>{d.forEach(f=>f.classList.remove("active")),l.classList.add("active"),L=l.getAttribute("data-value")||"professional"})});let u=t.querySelectorAll("#lengthControl .segmented-option");return u.forEach(l=>{l.addEventListener("click",()=>{u.forEach(f=>f.classList.remove("active")),l.classList.add("active"),T=l.getAttribute("data-value")||"short"})}),g.addEventListener("click",()=>{M()}),t}function M(){if(y){console.log("AI Reply Extension: Generation already in progress. Ignoring duplicate trigger.");return}y=!0;let o=C(),t=o.getElementById("loadingOverlay"),e=o.getElementById("errorContainer"),n=o.getElementById("draftTextarea"),r=o.getElementById("insertBtn"),a=o.getElementById("regenerateBtn");e.classList.remove("active"),t.classList.add("active"),r.disabled=!0,a&&(a.disabled=!0),chrome.runtime.sendMessage({action:"generateReply",postText:k,tone:L,length:T},c=>{if(y=!1,t.classList.remove("active"),a&&(a.disabled=!1),chrome.runtime.lastError){console.error("AI Reply Extension: Message error:",chrome.runtime.lastError),e.textContent=`Extension communication error: ${chrome.runtime.lastError.message}`,e.classList.add("active");return}if(c&&c.success)n.value=c.reply,r.disabled=!1;else{let g=c?.error||"Unknown error occurred while generating reply.";e.textContent=`Error: ${g}`,e.classList.add("active")}})}function H(o,t){E=o,B=t,k=I(o);let e=C(),n=e.getElementById("postPreviewBody");n&&(n.textContent=k||"(No post text detected. A generic reply will be generated.)");let r=e.getElementById("draftTextarea");r.value="";let a=e.querySelector(".backdrop");document.documentElement.classList.contains("theme--dark")||document.body.classList.contains("theme--dark")||document.documentElement.getAttribute("data-theme")==="dark"?a.classList.add("dark"):a.classList.remove("dark"),a.classList.add("active"),M()}function h(o,t){let e=document.createElement("button");return e.type="button",e.className="ai-reply-trigger",e.innerHTML=`
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px; vertical-align: middle; display: inline-block;">
      <path d="M9 21c-.5 0-.9-.3-1-.8l-1.5-4.7L1.8 14c-.5-.1-.8-.5-.8-1s.3-.9.8-1l4.7-1.5L8 5.8c.1-.5.5-.8 1-.8s.9.3 1 .8l1.5 4.7 4.7 1.5c.5.1.8.5.8 1s-.3.9-.8 1l-4.7 1.5-1.5 4.7c-.1.5-.5.8-1 .8zM19 8c-.3 0-.5-.2-.6-.4l-.8-2.2-2.2-.8c-.3-.1-.4-.3-.4-.6s.2-.5.4-.6l2.2-.8.8-2.2c.1-.3.3-.4.6-.4s.5.2.6.4l.8 2.2 2.2.8c.3.1.4.3.4.6s-.2.5-.4.6l-2.2.8-.8 2.2c-.1.3-.3.4-.6.4z"/>
    </svg>
    <span>AI Reply</span>
  `,e.style.display="inline-flex",e.style.alignItems="center",e.style.justifyContent="center",e.style.background="transparent",e.style.border="none",e.style.color="inherit",e.style.opacity="0.75",e.style.borderRadius="16px",e.style.padding="0 12px",e.style.height="32px",e.style.fontSize="14px",e.style.fontWeight="600",e.style.cursor="pointer",e.style.marginLeft="4px",e.style.marginRight="4px",e.style.transition="all 0.16s ease-in-out",e.style.fontFamily='-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',e.addEventListener("mouseenter",()=>{e.style.background="rgba(128, 128, 128, 0.15)",e.style.opacity="1"}),e.addEventListener("mouseleave",()=>{e.style.background="transparent",e.style.opacity="0.75"}),e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),H(o,t)}),e}function S(o){let t=o.querySelector('button[type="submit"]');if(t)return t;let e=o.querySelectorAll("button");for(let n=0;n<e.length;n++){let r=e[n],a=(r.textContent||"").trim().toLowerCase();if(["post","comment","reply","send","publish","share"].includes(a))return r;let c=(r.getAttribute("aria-label")||"").toLowerCase();if(c.includes("post")||c.includes("comment")||c.includes("reply"))return r}return null}function R(o){let t=o,e=0;for(;t&&e<6;){let n=t.querySelector('button[aria-label*="Emoji"], button[aria-label*="emoji"], button[aria-label*="photo"], button[aria-label*="photo" i], button[aria-label*="image"]');if(n&&n.parentElement)return n.parentElement;t=t.parentElement,e++}return null}function w(){document.querySelectorAll('div[contenteditable="true"], textarea.comments-comment-textbox__textarea').forEach(t=>{let e=t;if(e.getAttribute("data-ai-reply-injected")==="true"||e.closest("#ai-reply-assistant-root")||e.classList.contains("draft-textarea"))return;let n=R(e);if(n){let b=h(e,n);n.insertBefore(b,n.firstChild),e.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Injected button into toolbar next to emoji/photo icons.");return}let r=e,a=null,c=0;for(;r&&c<6&&(a=S(r),!a);)r=r.parentElement,c++;let g=r||e;if(a&&a.parentElement){let b=h(e,g);a.parentElement.insertBefore(b,a),e.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Injected button next to submit button (class-agnostic).")}else{let b=h(e,g),p=e.parentElement;if(p){let m=document.createElement("div");m.className="ai-reply-adhoc-bar",m.style.display="inline-flex",m.style.justifyContent="flex-end",m.style.width="100%",m.style.padding="4px 0",m.appendChild(b),e.nextSibling?p.insertBefore(m,e.nextSibling):p.appendChild(m),e.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Succeeded in fallback button injection after editor.")}}})}function P(){w(),new MutationObserver(()=>{v&&clearTimeout(v),v=window.setTimeout(()=>{w()},150)}).observe(document.body,{childList:!0,subtree:!0}),console.log("AI Reply Extension: MutationObserver initialized.")}P();})();
