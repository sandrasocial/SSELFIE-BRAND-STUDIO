declare module '@anthropic-ai/sdk' {
  export class Anthropic {
    constructor(options: { apiKey: string });
    messages: {
      create: (options: {
        model: string;
        max_tokens: number;
        messages: Array<{ role: string; content: string }>;
      }) => Promise<{
        content: Array<{ text: string }>;
        model: string;
        usage: {
          input_tokens: number;
          output_tokens: number;
        };
      }>;
    };
  }
  export default Anthropic;
}

declare module '@google/genai' {
  export interface Type {
    text: string;
    image: string;
  }

  export class GoogleGenAI {
    constructor(apiKey: string);
    getGenerativeModel(options: {
      model: string;
      generationConfig?: {
        temperature?: number;
        maxOutputTokens?: number;
      };
    }): GenerativeModel;
  }

  export interface GenerativeModel {
    generateContent(prompt: string | Array<{ text: string }>): Promise<GenerateContentResult>;
  }

  export interface GenerateContentResult {
    response: {
      text(): string;
      candidates: Array<{
        content: {
          parts: Array<{ text: string }>;
        };
      }>;
    };
  }
}

export {};