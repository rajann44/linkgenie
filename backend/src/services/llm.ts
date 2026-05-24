import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Interface representing the standardized generation request
 */
export interface LLMRequest {
  prompt: string;
  systemInstruction: string;
}

/**
 * Abstract Service class managing multi-provider LLM inference
 */
export class LLMService {
  private static geminiClient: GoogleGenerativeAI | null = null;
  private static openaiClient: OpenAI | null = null;
  private static anthropicClient: Anthropic | null = null;

  /**
   * Initializes and retrieves the Gemini API client
   */
  private static getGeminiClient(): GoogleGenerativeAI {
    if (!this.geminiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not defined in environment variables.');
      }
      this.geminiClient = new GoogleGenerativeAI(apiKey);
    }
    return this.geminiClient;
  }

  /**
   * Initializes and retrieves the OpenAI API client
   */
  private static getOpenAIClient(): OpenAI {
    if (!this.openaiClient) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not defined in environment variables.');
      }
      this.openaiClient = new OpenAI({ apiKey });
    }
    return this.openaiClient;
  }

  /**
   * Initializes and retrieves the Anthropic API client
   */
  private static getAnthropicClient(): Anthropic {
    if (!this.anthropicClient) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY is not defined in environment variables.');
      }
      this.anthropicClient = new Anthropic({ apiKey });
    }
    return this.anthropicClient;
  }

  /**
   * Routes the generation request to the selected provider
   */
  public static async generate(provider: string, params: LLMRequest): Promise<string> {
    const activeProvider = (provider || process.env.LLM_PROVIDER || 'gemini').toLowerCase();

    switch (activeProvider) {
      case 'gemini':
        return this.callGemini(params);
      case 'openai':
        return this.callOpenAI(params);
      case 'anthropic':
        return this.callAnthropic(params);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}. Use 'gemini', 'openai', or 'anthropic'.`);
    }
  }

  /**
   * Generates text using Google Gemini
   */
  private static async callGemini(params: LLMRequest): Promise<string> {
    const client = this.getGeminiClient();
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    
    console.log(`LLMService: Calling Gemini model (${modelName})...`);
    
    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction: params.systemInstruction
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });

    const response = result.response;
    const text = response.text();
    if (!text) {
      throw new Error('Gemini API returned an empty completion.');
    }
    return text.trim();
  }

  /**
   * Generates text using OpenAI
   */
  private static async callOpenAI(params: LLMRequest): Promise<string> {
    const client = this.getOpenAIClient();
    const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    console.log(`LLMService: Calling OpenAI model (${modelName})...`);

    const chatCompletion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: params.systemInstruction },
        { role: 'user', content: params.prompt }
      ],
      model: modelName,
      max_tokens: 500,
      temperature: 0.7,
    });

    const choice = chatCompletion.choices[0];
    const text = choice.message?.content;
    if (!text) {
      throw new Error('OpenAI API returned an empty completion.');
    }
    return text.trim();
  }

  /**
   * Generates text using Anthropic Claude
   */
  private static async callAnthropic(params: LLMRequest): Promise<string> {
    const client = this.getAnthropicClient();
    const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307';

    console.log(`LLMService: Calling Anthropic model (${modelName})...`);

    const message = await client.messages.create({
      model: modelName,
      max_tokens: 500,
      temperature: 0.7,
      system: params.systemInstruction,
      messages: [
        { role: 'user', content: params.prompt }
      ]
    });

    const contentBlock = message.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error('Anthropic API returned a non-text block.');
    }
    const text = contentBlock.text;
    if (!text) {
      throw new Error('Anthropic API returned an empty completion.');
    }
    return text.trim();
  }
}
