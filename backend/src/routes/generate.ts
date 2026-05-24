import { Router, Request, Response } from 'express';
import { LLMService } from '../services/llm';

const router = Router();

// Supported tones and lengths
const VALID_TONES = ['professional', 'warm', 'thoughtful', 'concise'];
const VALID_LENGTHS = ['short', 'medium'];

/**
 * Builds the system instruction for the LLM.
 * Encourages organic, human communication and discourages corporate sycophancy or generic hype.
 */
function buildSystemInstruction(tone: string, length: string, persona: string): string {
  let toneGuideline = '';
  switch (tone) {
    case 'warm':
      toneGuideline = 'friendly, encouraging, supportive, and appreciative. Show genuine interest.';
      break;
    case 'thoughtful':
      toneGuideline = 'analytical, inquisitive, adding constructive value, or asking an insightful question. Deepen the conversation.';
      break;
    case 'concise':
      toneGuideline = 'extremely direct, crisp, and to-the-point. Eliminate all filler words.';
      break;
    case 'professional':
    default:
      toneGuideline = 'knowledgeable, polite, balanced, objective, and constructive. Sound like an experienced industry professional.';
      break;
  }

  let lengthGuideline = '';
  switch (length) {
    case 'medium':
      lengthGuideline = 'Keep the reply around 3 to 4 sentences max. Provide a bit of substance.';
      break;
    case 'short':
    default:
      lengthGuideline = 'Keep the reply very brief, around 1 to 2 sentences max. Absolutely no fluff.';
      break;
  }

  const personaInstruction = persona
    ? `Write from the perspective of this persona: "${persona}". Incorporate this background naturally into your writing style, terminology, and viewpoint.`
    : 'Write as a polite and qualified industry peer.';

  return `You are an expert copywriter helping a user draft comment replies on LinkedIn.
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
- Tone: ${toneGuideline}
- Length: ${lengthGuideline}
- Persona Context: ${personaInstruction}

Format: Return ONLY the raw reply text. Do not wrap the response in quotation marks, and do not prefix it with label text like "Reply:" or "Here is your reply:".`;
}

/**
 * Endpoint: POST /api/generate
 * Request Body: { postText: string, tone?: string, length?: string, persona?: string }
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { 
      postText, 
      tone = 'professional', 
      length = 'short', 
      persona = '',
      provider: clientProvider = '',
      apiKey = '',
      model = ''
    } = req.body;

    // Sanitize postText - allow empty/unspecified postText for generic fallback comments
    const cleanPostText = (postText && typeof postText === 'string') ? postText.trim() : '';

    // Sanitize tone & length parameters
    const activeTone = VALID_TONES.includes(tone) ? tone : 'professional';
    const activeLength = VALID_LENGTHS.includes(length) ? length : 'short';

    const activeProvider = (clientProvider || process.env.LLM_PROVIDER || 'gemini').toLowerCase();

    // Structured server log for observability
    console.log(`==================================================`);
    console.log(`[POST /api/generate] Request Received:`);
    console.log(`  - Provider: ${activeProvider}`);
    console.log(`  - Tone: ${activeTone}`);
    console.log(`  - Length: ${activeLength}`);
    console.log(`  - Key provided: ${apiKey ? 'Yes (Client)' : 'No (Fallback to Server Env)'}`);
    console.log(`  - Model override: ${model || '(None)'}`);
    console.log(`  - Scraped Text: ${cleanPostText ? `"${cleanPostText.substring(0, 120)}..." (${cleanPostText.length} chars)` : "(EMPTY - FALLBACK TO GENERAL COMMENT)"}`);
    console.log(`==================================================`);

    const systemInstruction = buildSystemInstruction(activeTone, activeLength, persona);
    
    let prompt = '';
    if (!cleanPostText) {
      prompt = `Draft a polite, professional, and generalized LinkedIn comment that is engaging, supportive, and adds general value to a professional network post in this user's industry.`;
    } else {
      prompt = `Here is the LinkedIn post text I want to reply to:
"""
${cleanPostText.substring(0, 3000)}
"""

Draft a reply to this post following your system instructions.`;
    }

    const reply = await LLMService.generate(activeProvider, { 
      prompt, 
      systemInstruction, 
      apiKey, 
      model 
    });

    return res.json({ reply });
  } catch (error: any) {
    console.error('API Error generating reply:', error);
    let friendlyMessage = error.message || 'An internal error occurred while generating the reply.';
    
    if (
      friendlyMessage.includes('429') || 
      friendlyMessage.includes('Quota exceeded') || 
      friendlyMessage.includes('Too Many Requests') ||
      friendlyMessage.includes('quota')
    ) {
      friendlyMessage = `Gemini API rate limit or daily quota exceeded. You can:\n1. Switch your model to 'gemini-1.5-flash' (which has a much higher free daily quota of 1500 requests) in backend/.env by changing GEMINI_MODEL.\n2. Switch LLM_PROVIDER to 'openai' or 'anthropic' in backend/.env.\n3. Wait for the Google free tier quota to reset or enable pay-as-you-go.`;
    }
    
    return res.status(500).json({ 
      error: friendlyMessage
    });
  }
});

export default router;
