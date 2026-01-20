/**
 * Type declarations for @google/generative-ai
 * This file provides type safety for the Google Generative AI SDK
 */

declare module "@google/generative-ai" {
  export interface GenerationConfig {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  }

  export interface SafetySetting {
    category: string;
    threshold: string;
  }

  export interface Part {
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }

  export interface Content {
    parts: Part[];
    role?: string;
  }

  export interface Candidate {
    content: Content;
    finishReason?: string;
    index?: number;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  }

  export interface GenerateContentResponse {
    response: EnhancedGenerateContentResponse;
  }

  export interface EnhancedGenerateContentResponse {
    text(): string;
    candidates?: Candidate[];
    promptFeedback?: {
      blockReason?: string;
      safetyRatings?: Array<{
        category: string;
        probability: string;
      }>;
    };
  }

  export interface GenerativeModel {
    generateContent(
      request: string | Content | Content[],
    ): Promise<GenerateContentResponse>;
    generateContentStream(
      request: string | Content | Content[],
    ): Promise<AsyncGenerator<GenerateContentResponse>>;
    countTokens(
      request: string | Content | Content[],
    ): Promise<{ totalTokens: number }>;
  }

  export interface ModelParams {
    model: string;
    generationConfig?: GenerationConfig;
    safetySettings?: SafetySetting[];
  }

  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(params: ModelParams): GenerativeModel;
  }
}
