"use strict";(()=>{var C={commentEditor:'div[contenteditable="true"]',commentBoxContainer:".comments-comment-box, .comments-comment-box-comment__text-editor, .comments-comment-textarea, .comment-box",actionBar:".comments-comment-box__actions, .comments-comment-box__form-container, .comments-comment-box__form, .comments-comment-box__editor-container",submitContainer:".comments-comment-box__submit-button-container, .comments-comment-box__post-button",postCard:"div.feed-shared-update-v2, div[data-urn], article, .feed-shared-update, .occludable-update, .feed-shared-update-v2__comments-container",postText:['p[componentkey*="feed-commentary"]','[componentkey*="commentary"]','[class*="commentary"]',".feed-shared-update-v2__description-text",".update-components-text",".feed-shared-text",'[class*="description-text"]','[class*="update-components-text"]',".feed-shared-update-v2__commentary",".feed-shared-update-v2__commentary-wrapper",".feed-shared-inline-show-more-text"]},y=null,k="",E="professional",L="short",M=null,b=null,u=null,g=!1;function f(n,t){let e=n;for(;e&&!(t&&e===t);){let o=(e.getAttribute("componentkey")||"").toLowerCase(),l=(e.getAttribute("data-testid")||"").toLowerCase(),s=(e.className||"").toLowerCase();if(o.includes("commentary")||s.includes("commentary")){e=e.parentElement;continue}if(o.includes("comment-")||o.includes("replaceablecomment_")||o.includes("commentlist")||o.includes("commentbox")||l.includes("comment")||s.includes("comment")&&!s.includes("commentary"))return!0;e=e.parentElement}return!1}function B(n){let t=n,e=null;for(;t;){if(t.querySelector('p[componentkey*="feed-commentary"], [componentkey*="commentary"], [class*="commentary"], [class*="description-text"]')){e=t;break}let r=t.getAttribute("role")||"",i=t.getAttribute("componentkey")||"";if(t.tagName==="ARTICLE"||t.hasAttribute("data-urn")||r==="listitem"||i.includes("FeedType_MAIN_FEED")||t.classList.contains("feed-shared-update-v2")||t.classList.contains("occludable-update")){e=t;break}t=t.parentElement}if(!e){let a=n;for(let r=0;r<16;r++)a.parentElement&&(a=a.parentElement);e=a}if(!e)return console.warn("AI Reply Extension: Could not resolve parent post card."),"";console.log("AI Reply Extension: Found post card container:",e);for(let a of C.postText){let r=e.querySelectorAll(a);for(let i=0;i<r.length;i++){let c=r[i];if(!f(c,e)&&!c.closest("#ai-reply-assistant-root")){let d=(c.textContent||"").trim();if(d=d.replace(/\bsee\s+more\b/gi,"").trim(),d.length>15)return console.log(`AI Reply Extension: Found post text via selector "${a}":`,d),d}}}let o=[];e.querySelectorAll("span, div, p").forEach(a=>{let r=a;if(f(r,e)||r.closest("#ai-reply-assistant-root")||r.closest('div[contenteditable="true"]')||r.closest("form")||r.closest(".ai-reply-adhoc-bar")||r.closest('[class*="actor"]')||r.closest('[class*="profile"]')||r.closest('[class*="header"]')||r.closest(".feed-shared-actor")||r.closest(".update-components-actor")||r.closest('[class*="social-"]')||r.closest('[class*="action-bar"]')||r.closest('[class*="footer"]')||r.closest(".feed-shared-social-action-bar")||r.closest(".feed-shared-social-counts"))return;let i=(r.textContent||"").trim();if(i.length>15&&!i.includes("Like")&&!i.includes("Comment")&&!i.includes("Repost")&&!i.includes("Send")&&!i.startsWith("http")){let c=i.replace(/\bsee\s+more\b/gi,"").trim();c&&o.push(c)}});let s="";if(o.length>0)o.sort((a,r)=>r.length-a.length),s=o[0],console.log("AI Reply Extension: Scraped Post Content (Fallback Candidates):",o);else{let a=e.querySelectorAll("p"),r="";a.forEach(i=>{let c=i;!f(c,e)&&!c.closest("#ai-reply-assistant-root")&&(r+=(c.textContent||"").trim()+" ")}),s=r.trim()}return console.log("AI Reply Extension: Scraped Post Content (Final):",s),s}function I(n,t){n.focus();try{let e=window.getSelection(),o=document.createRange();o.selectNodeContents(n),e?.removeAllRanges(),e?.addRange(o),document.execCommand("insertText",!1,t)||(n.innerText=t),n.dispatchEvent(new Event("input",{bubbles:!0})),n.dispatchEvent(new Event("change",{bubbles:!0})),console.log("AI Reply Extension: Text successfully injected into active composer.")}catch(e){console.error("AI Reply Extension: Error inserting text:",e),n.innerText=t,n.dispatchEvent(new Event("input",{bubbles:!0}))}}function w(){if(b)return b;let n=document.createElement("div");n.id="ai-reply-assistant-root",n.style.position="fixed",n.style.zIndex="999999",document.body.appendChild(n);let t=n.attachShadow({mode:"open"});b=t;let e=document.createElement("style");e.textContent=`
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
  
  `,t.appendChild(e);let o=document.createElement("div");o.className="backdrop",o.innerHTML=`
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-title">LinkGenie Draft Assistant</div>
        <button class="close-btn" id="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        

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
  `,t.appendChild(o);let l=t.getElementById("closeModal"),s=t.getElementById("cancelBtn"),a=t.getElementById("insertBtn"),r=t.getElementById("regenerateBtn"),i=t.getElementById("draftTextarea"),c=()=>{o.classList.remove("active")};l.addEventListener("click",c),s.addEventListener("click",c),o.addEventListener("click",p=>{p.target===o&&c()}),document.addEventListener("keydown",p=>{p.key==="Escape"&&o.classList.contains("active")&&c()}),a.addEventListener("click",()=>{y&&i.value.trim()&&(I(y,i.value.trim()),c())});let d=t.querySelectorAll("#toneControl .segmented-option");d.forEach(p=>{p.addEventListener("click",()=>{d.forEach(m=>m.classList.remove("active")),p.classList.add("active"),E=p.getAttribute("data-value")||"professional"})});let v=t.querySelectorAll("#lengthControl .segmented-option");return v.forEach(p=>{p.addEventListener("click",()=>{v.forEach(m=>m.classList.remove("active")),p.classList.add("active"),L=p.getAttribute("data-value")||"short"})}),r.addEventListener("click",()=>{T()}),t}function T(){if(g){console.log("AI Reply Extension: Generation already in progress. Ignoring duplicate trigger.");return}g=!0;let n=w(),t=n.getElementById("loadingOverlay"),e=n.getElementById("errorContainer"),o=n.getElementById("draftTextarea"),l=n.getElementById("insertBtn"),s=n.getElementById("regenerateBtn");e.classList.remove("active"),t.classList.add("active"),l.disabled=!0,s&&(s.disabled=!0),chrome.runtime.sendMessage({action:"generateReply",postText:k,tone:E,length:L},a=>{if(g=!1,t.classList.remove("active"),s&&(s.disabled=!1),chrome.runtime.lastError){console.error("AI Reply Extension: Message error:",chrome.runtime.lastError),e.textContent=`Extension communication error: ${chrome.runtime.lastError.message}`,e.classList.add("active");return}if(a&&a.success)o.value=a.reply,l.disabled=!1;else{let r=a?.error||"Unknown error occurred while generating reply.";e.textContent=`Error: ${r}`,e.classList.add("active")}})}function A(n,t){y=n,M=t,k=B(n);let e=w(),o=e.getElementById("draftTextarea");o.value="";let l=e.querySelector(".backdrop");document.documentElement.classList.contains("theme--dark")||document.body.classList.contains("theme--dark")||document.documentElement.getAttribute("data-theme")==="dark"?l.classList.add("dark"):l.classList.remove("dark"),l.classList.add("active"),T()}function x(n,t){let e=document.createElement("button");return e.type="button",e.className="ai-reply-trigger",e.innerHTML=`
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px; vertical-align: middle; display: inline-block;">
      <path d="M9 21c-.5 0-.9-.3-1-.8l-1.5-4.7L1.8 14c-.5-.1-.8-.5-.8-1s.3-.9.8-1l4.7-1.5L8 5.8c.1-.5.5-.8 1-.8s.9.3 1 .8l1.5 4.7 4.7 1.5c.5.1.8.5.8 1s-.3.9-.8 1l-4.7 1.5-1.5 4.7c-.1.5-.5.8-1 .8zM19 8c-.3 0-.5-.2-.6-.4l-.8-2.2-2.2-.8c-.3-.1-.4-.3-.4-.6s.2-.5.4-.6l2.2-.8.8-2.2c.1-.3.3-.4.6-.4s.5.2.6.4l.8 2.2 2.2.8c.3.1.4.3.4.6s-.2.5-.4.6l-2.2.8-.8 2.2c-.1.3-.3.4-.6.4z"/>
    </svg>
    <span>AI Reply</span>
  `,e.style.display="inline-flex",e.style.alignItems="center",e.style.justifyContent="center",e.style.background="transparent",e.style.border="none",e.style.color="inherit",e.style.opacity="0.75",e.style.borderRadius="16px",e.style.padding="0 12px",e.style.height="32px",e.style.fontSize="14px",e.style.fontWeight="600",e.style.cursor="pointer",e.style.marginLeft="4px",e.style.marginRight="4px",e.style.transition="all 0.16s ease-in-out",e.style.fontFamily='-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',e.addEventListener("mouseenter",()=>{e.style.background="rgba(128, 128, 128, 0.15)",e.style.opacity="1"}),e.addEventListener("mouseleave",()=>{e.style.background="transparent",e.style.opacity="0.75"}),e.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation(),A(n,t)}),e}function H(n){let t=n.querySelector('button[type="submit"]');if(t)return t;let e=n.querySelectorAll("button");for(let o=0;o<e.length;o++){let l=e[o],s=(l.textContent||"").trim().toLowerCase();if(["post","comment","reply","send","publish","share"].includes(s))return l;let a=(l.getAttribute("aria-label")||"").toLowerCase();if(a.includes("post")||a.includes("comment")||a.includes("reply"))return l}return null}function S(n){let t=n,e=0;for(;t&&e<6;){let o=t.querySelector('button[aria-label*="Emoji"], button[aria-label*="emoji"], button[aria-label*="photo"], button[aria-label*="photo" i], button[aria-label*="image"]');if(o&&o.parentElement)return o.parentElement;t=t.parentElement,e++}return null}function h(){document.querySelectorAll('div[contenteditable="true"], textarea.comments-comment-textbox__textarea').forEach(t=>{let e=t;if(e.getAttribute("data-ai-reply-injected")==="true"||e.closest("#ai-reply-assistant-root")||e.classList.contains("draft-textarea"))return;let o=S(e);if(o){let i=x(e,o);o.insertBefore(i,o.firstChild),e.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Injected button into toolbar next to emoji/photo icons.");return}let l=e,s=null,a=0;for(;l&&a<6&&(s=H(l),!s);)l=l.parentElement,a++;let r=l||e;if(s&&s.parentElement){let i=x(e,r);s.parentElement.insertBefore(i,s),e.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Injected button next to submit button (class-agnostic).")}else{let i=x(e,r),c=e.parentElement;if(c){let d=document.createElement("div");d.className="ai-reply-adhoc-bar",d.style.display="inline-flex",d.style.justifyContent="flex-end",d.style.width="100%",d.style.padding="4px 0",d.appendChild(i),e.nextSibling?c.insertBefore(d,e.nextSibling):c.appendChild(d),e.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Succeeded in fallback button injection after editor.")}}})}function R(){h(),new MutationObserver(()=>{u&&clearTimeout(u),u=window.setTimeout(()=>{h()},150)}).observe(document.body,{childList:!0,subtree:!0}),console.log("AI Reply Extension: MutationObserver initialized.")}R();})();
