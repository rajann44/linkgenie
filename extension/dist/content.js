"use strict";(()=>{var v=null,k="professional",E="short",w=null,g=null,f=null,x=!1;function T(n,o){n.focus();try{let e=window.getSelection(),t=document.createRange();t.selectNodeContents(n),e?.removeAllRanges(),e?.addRange(t),document.execCommand("insertText",!1,o)||(n.innerText=o),n.dispatchEvent(new Event("input",{bubbles:!0})),n.dispatchEvent(new Event("change",{bubbles:!0})),console.log("AI Reply Extension: Text successfully injected into active composer.")}catch(e){console.error("AI Reply Extension: Error inserting text:",e),n.innerText=o,n.dispatchEvent(new Event("input",{bubbles:!0}))}}function L(){if(g)return g;let n=document.createElement("div");n.id="ai-reply-assistant-root",n.style.position="fixed",n.style.zIndex="999999",document.body.appendChild(n);let o=n.attachShadow({mode:"open"});g=o;let e=document.createElement("style");e.textContent=`
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
  `,o.appendChild(t);let i=o.getElementById("closeModal"),s=o.getElementById("cancelBtn"),c=o.getElementById("insertBtn"),r=o.getElementById("generateBtn"),a=o.getElementById("draftTextarea"),b=()=>{t.classList.remove("active")};i.addEventListener("click",b),s.addEventListener("click",b),t.addEventListener("click",l=>{l.target===t&&b()}),document.addEventListener("keydown",l=>{l.key==="Escape"&&t.classList.contains("active")&&b()}),c.addEventListener("click",()=>{v&&a.value.trim()&&(T(v,a.value.trim()),b())});let d=o.querySelectorAll("#toneControl .segmented-option");d.forEach(l=>{l.addEventListener("click",()=>{d.forEach(p=>p.classList.remove("active")),l.classList.add("active"),k=l.getAttribute("data-value")||"professional"})});let u=o.querySelectorAll("#lengthControl .segmented-option");return u.forEach(l=>{l.addEventListener("click",()=>{u.forEach(p=>p.classList.remove("active")),l.classList.add("active"),E=l.getAttribute("data-value")||"short"})}),r.addEventListener("click",()=>{C()}),o}function C(){if(x){console.log("AI Reply Extension: Generation already in progress. Ignoring duplicate trigger.");return}let n=L(),o=n.getElementById("postContentInput"),e=o?o.value.trim():"",t=n.getElementById("errorContainer"),i=n.getElementById("loadingOverlay"),s=n.getElementById("draftTextarea"),c=n.getElementById("insertBtn"),r=n.getElementById("generateBtn");if(!e){t.textContent="Please paste or type some LinkedIn post content first.",t.classList.add("active");return}x=!0,t.classList.remove("active"),i.classList.add("active"),c.disabled=!0,r&&(r.disabled=!0),chrome.runtime.sendMessage({action:"generateReply",postText:e,tone:k,length:E},a=>{if(x=!1,i.classList.remove("active"),r&&(r.disabled=!1),chrome.runtime.lastError){console.error("AI Reply Extension: Message error:",chrome.runtime.lastError),t.textContent=`Extension communication error: ${chrome.runtime.lastError.message}`,t.classList.add("active");return}if(a&&a.success)a.reply==="POST_TEXT_NOT_FOUND"?(s.value="",t.textContent="LinkGenie could not detect a clear post body from the provided text to generate a reply.",t.classList.add("active"),c.disabled=!0):(s.value=a.reply,c.disabled=!1);else{let b=a?.error||"Unknown error occurred while generating reply.";t.textContent=`Error: ${b}`,t.classList.add("active")}})}function M(n,o){v=n,w=o;let e=L(),t=e.getElementById("postContentInput");t&&(t.value="");let i=e.getElementById("draftTextarea");i&&(i.value="");let s=e.getElementById("errorContainer");s&&(s.classList.remove("active"),s.textContent="");let c=e.getElementById("insertBtn");c&&(c.disabled=!0);let r=e.querySelector(".backdrop");document.documentElement.classList.contains("theme--dark")||document.body.classList.contains("theme--dark")||document.documentElement.getAttribute("data-theme")==="dark"?r.classList.add("dark"):r.classList.remove("dark"),r.classList.add("active"),t&&t.focus()}function y(n,o){let e=document.createElement("button");return e.type="button",e.className="ai-reply-trigger",e.innerHTML=`
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px; vertical-align: middle; display: inline-block;">
      <path d="M9 21c-.5 0-.9-.3-1-.8l-1.5-4.7L1.8 14c-.5-.1-.8-.5-.8-1s.3-.9.8-1l4.7-1.5L8 5.8c.1-.5.5-.8 1-.8s.9.3 1 .8l1.5 4.7 4.7 1.5c.5.1.8.5.8 1s-.3.9-.8 1l-4.7 1.5-1.5 4.7c-.1.5-.5.8-1 .8zM19 8c-.3 0-.5-.2-.6-.4l-.8-2.2-2.2-.8c-.3-.1-.4-.3-.4-.6s.2-.5.4-.6l2.2-.8.8-2.2c.1-.3.3-.4.6-.4s.5.2.6.4l.8 2.2 2.2.8c.3.1.4.3.4.6s-.2.5-.4.6l-2.2.8-.8 2.2c-.1.3-.3.4-.6.4z"/>
    </svg>
    <span>AI Reply</span>
  `,e.style.display="inline-flex",e.style.alignItems="center",e.style.justifyContent="center",e.style.background="transparent",e.style.border="none",e.style.color="inherit",e.style.opacity="0.75",e.style.borderRadius="16px",e.style.padding="0 12px",e.style.height="32px",e.style.fontSize="14px",e.style.fontWeight="600",e.style.cursor="pointer",e.style.marginLeft="4px",e.style.marginRight="4px",e.style.transition="all 0.16s ease-in-out",e.style.fontFamily='-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',e.addEventListener("mouseenter",()=>{e.style.background="rgba(128, 128, 128, 0.15)",e.style.opacity="1"}),e.addEventListener("mouseleave",()=>{e.style.background="transparent",e.style.opacity="0.75"}),e.addEventListener("click",t=>{t.preventDefault(),t.stopPropagation(),M(n,o)}),e}function B(n){let o=n.querySelector('button[type="submit"]');if(o)return o;let e=n.querySelectorAll("button");for(let t=0;t<e.length;t++){let i=e[t],s=(i.textContent||"").trim().toLowerCase();if(["post","comment","reply","send","publish","share"].includes(s))return i;let c=(i.getAttribute("aria-label")||"").toLowerCase();if(c.includes("post")||c.includes("comment")||c.includes("reply"))return i}return null}function I(n){let o=n,e=0;for(;o&&e<6;){let t=o.querySelector('button[aria-label*="Emoji"], button[aria-label*="emoji"], button[aria-label*="photo"], button[aria-label*="photo" i], button[aria-label*="image"]');if(t&&t.parentElement)return t.parentElement;o=o.parentElement,e++}return null}function A(){document.querySelectorAll('p[componentkey^="feed-commentary"]').forEach(o=>{let e=o,t=e.closest("article")||e.closest("[data-urn]")||e.closest(".feed-shared-update-v2")||e.parentElement?.closest("div");if(!t||t.getAttribute("data-copy-injected")==="true")return;let i=Array.from(t.querySelectorAll("button, a")),s=i.find(d=>{let u=(d.textContent||"").toLowerCase().trim();return u==="comment"||u==="repost"||u==="send"})||i.find(d=>(d.textContent||"").toLowerCase().trim()==="like");if(!s)return;let c=s.parentElement;if(!c)return;t.setAttribute("data-copy-injected","true");let r=s.cloneNode(!0);r.removeAttribute("componentkey"),r.setAttribute("data-copy-button","true"),r.title="Copy post text",r.tagName.toLowerCase()==="a"&&(r.removeAttribute("href"),r.style.cursor="pointer");let a=r.querySelector("svg");a&&(a.setAttribute("viewBox","0 0 24 24"),a.setAttribute("fill","none"),a.setAttribute("stroke","currentColor"),a.setAttribute("stroke-width","2"),a.setAttribute("stroke-linecap","round"),a.setAttribute("stroke-linejoin","round"),a.innerHTML=`
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      `);let b=r.querySelector("span span, .artdeco-button__text");if(b)b.textContent="Copy";else{let u=Array.from(r.querySelectorAll("span")).find(l=>{let p=(l.textContent||"").trim().toLowerCase();return p==="comment"||p==="repost"||p==="send"||p==="like"});u&&(u.textContent="Copy")}r.addEventListener("click",async d=>{d.stopPropagation(),d.preventDefault();let u=e.innerText||"";if(u)try{await navigator.clipboard.writeText(u);let l=r.querySelector("svg");l&&(l.setAttribute("stroke","#05b03d"),l.setAttribute("stroke-width","2.5"),l.innerHTML='<polyline points="20 6 9 17 4 12"></polyline>');let p=r.querySelector("span span, .artdeco-button__text");p&&(p.innerHTML="Copied!",p.style.color="#05b03d"),setTimeout(()=>{let m=r.querySelector("svg");m&&(m.setAttribute("stroke","currentColor"),m.setAttribute("stroke-width","2"),m.innerHTML=`
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            `),p&&(p.innerHTML="Copy",p.style.color="")},1500)}catch(l){console.error("Failed to copy post text contents:",l)}}),c.appendChild(r)})}function h(){A(),document.querySelectorAll('div[contenteditable="true"], textarea.comments-comment-textbox__textarea').forEach(o=>{let e=o;if(e.getAttribute("data-ai-reply-injected")==="true"||e.closest("#ai-reply-assistant-root")||e.classList.contains("draft-textarea"))return;let t=I(e);if(t){let a=y(e,t);t.insertBefore(a,t.firstChild),e.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Injected button into toolbar next to emoji/photo icons.");return}let i=e,s=null,c=0;for(;i&&c<6&&(s=B(i),!s);)i=i.parentElement,c++;let r=i||e;if(s&&s.parentElement){let a=y(e,r);s.parentElement.insertBefore(a,s),e.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Injected button next to submit button (class-agnostic).")}else{let a=y(e,r),b=e.parentElement;if(b){let d=document.createElement("div");d.className="ai-reply-adhoc-bar",d.style.display="inline-flex",d.style.justifyContent="flex-end",d.style.width="100%",d.style.padding="4px 0",d.appendChild(a),e.nextSibling?b.insertBefore(d,e.nextSibling):b.appendChild(d),e.setAttribute("data-ai-reply-injected","true"),console.log("AI Reply Extension: Succeeded in fallback button injection after editor.")}}})}function H(){h(),new MutationObserver(()=>{f&&clearTimeout(f),f=window.setTimeout(()=>{h()},150)}).observe(document.body,{childList:!0,subtree:!0}),console.log("AI Reply Extension: MutationObserver initialized.")}H();})();
