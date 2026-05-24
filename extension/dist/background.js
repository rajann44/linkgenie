"use strict";(()=>{function b(l,f,r){let t="";switch(l){case"warm":t="friendly, encouraging, supportive, and appreciative. Show genuine interest.";break;case"thoughtful":t="analytical, inquisitive, adding constructive value, or asking an insightful question. Deepen the conversation.";break;case"concise":t="extremely direct, crisp, and to-the-point. Eliminate all filler words.";break;case"professional":default:t="knowledgeable, polite, balanced, objective, and constructive. Sound like an experienced industry professional.";break}let a="";switch(f){case"medium":a="Keep the reply around 3 to 4 sentences max. Provide a bit of substance.";break;case"short":default:a="Keep the reply very brief, around 1 to 2 sentences max. Absolutely no fluff.";break}let d=r?`Write from the perspective of this persona: "${r}". Incorporate this background naturally into your writing style, terminology, and viewpoint.`:"Write as a polite and qualified industry peer.";return`You are an expert copywriter helping a user draft comment replies on LinkedIn.
Your goal is to write a reply that is organic, authentic, highly personalized to the post, and adds value.

CRITICAL: The reply must be highly contextual and specific to the post content provided.
- Do NOT write generic, vague statements that could apply to any post.
- Explicitly reference a specific point, key concept, lesson, or terminology mentioned in the post to prove you read it and are engaging with their ideas.
- Provide a brief, constructive thought, personal agreement/disagreement, or ask a specific relevant question about their main topic.

IMPORTANT: Avoid "LinkedIn Cringe" and hype.
- Do NOT use exaggerated praise (e.g., "Incredible achievement!", "Congrats on the launch!", "Game-changing!", "Super exciting!").
- Do NOT use typical spam-bot phrases (e.g., "Thanks for sharing!", "Spot on!", "Couldn't agree more!", "Let's connect!").
- Do NOT use call-to-action (CTA) language or self-promotional pitches.
- Do NOT use hashtags unless absolutely critical. Prefer zero.
- Limit emojis to 0 or 1 at most.
- Sound like a real, competent professional having a normal, intelligent conversation.
- If the original post content is too short, generic, or unclear, generate a safe, polite, neutral reply.

Writing Style Guidelines:
- Tone: ${t}
- Length: ${a}
- Persona Context: ${d}

Format: Return ONLY the raw reply text. Do not wrap the response in quotation marks, and do not prefix it with label text like "Reply:" or "Here is your reply:".`}chrome.runtime.onMessage.addListener((l,f,r)=>{if(l.action==="generateReply"){let{postText:t,tone:a,length:d}=l;return chrome.storage.sync.get(["provider","apiKey","model","persona"],async p=>{let s=(p.provider||"gemini").toLowerCase(),u=p.apiKey||"",g=p.model||"",x=p.persona||"";if(!u){r({success:!1,error:"API Key is missing. Please open the LinkGenie options page (from the extension icon) and enter your API Key."});return}let h=b(a||"professional",d||"short",x),w=t&&typeof t=="string"?t.trim():"",i="";w?i=`Here is the LinkedIn post text I want to reply to:
"""
${w.substring(0,3e3)}
"""

Draft a reply to this post following your system instructions.`:i="Draft a polite, professional, and generalized LinkedIn comment that is engaging, supportive, and adds general value to a professional network post in this user's industry.";try{console.log(`LinkGenie: Generating reply using provider "${s}"...`);let n="";if(s==="gemini"){let y=`https://generativelanguage.googleapis.com/v1beta/models/${g||"gemini-1.5-flash"}:generateContent?key=${u}`,e=await fetch(y,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:i}]}],systemInstruction:{parts:[{text:h}]},generationConfig:{maxOutputTokens:500,temperature:.7}})});if(!e.ok){let c=(await e.json().catch(()=>({}))).error?.message||e.statusText;throw new Error(`Google API error (${e.status}): ${c}`)}let o=(await e.json()).candidates?.[0]?.content?.parts?.[0]?.text;if(!o)throw new Error("Gemini API returned an empty content candidate.");n=o.trim()}else if(s==="openai"){let m=g||"gpt-4o-mini",e=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${u}`},body:JSON.stringify({model:m,messages:[{role:"system",content:h},{role:"user",content:i}],max_tokens:500,temperature:.7})});if(!e.ok){let c=(await e.json().catch(()=>({}))).error?.message||e.statusText;throw new Error(`OpenAI API error (${e.status}): ${c}`)}let o=(await e.json()).choices?.[0]?.message?.content;if(!o)throw new Error("OpenAI API returned an empty choices content.");n=o.trim()}else if(s==="anthropic"){let e=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":u,"anthropic-version":"2023-06-01","dangerously-allow-browser":"true"},body:JSON.stringify({model:g||"claude-3-haiku-20240307",max_tokens:500,temperature:.7,system:h,messages:[{role:"user",content:i}]})});if(!e.ok){let c=(await e.json().catch(()=>({}))).error?.message||e.statusText;throw new Error(`Anthropic API error (${e.status}): ${c}`)}let o=(await e.json()).content?.[0]?.text;if(!o)throw new Error("Anthropic API returned an empty messages text content.");n=o.trim()}else throw new Error(`Unsupported provider: ${s}`);r({success:!0,reply:n})}catch(n){console.error("LinkGenie: Generation error:",n),r({success:!1,error:n.message||"Failed to generate reply."})}}),!0}});})();
