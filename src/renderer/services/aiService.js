import { OpenAI } from 'openai';
import { GoogleGenAI } from '@google/genai'

/**
 * AI Service - Abstraction for different AI providers
 * Supports OpenAI and Google Gemini APIs
 */

/**
 * Creates an AI client based on the selected provider
 * @param {string} provider - 'openai' or 'gemini'
 * @param {string} apiKey - API key for the selected provider
 * @returns {Object} - AI client instance
 */
export const createAIClient = async (provider, apiKey) => {
  if (provider === 'openai') {
    return new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  } else if (provider === 'gemini') {
    return new GoogleGenAI({
      vertexai: false,
      apiKey
    });
  }
  throw new Error(`Unsupported provider: ${provider}`);
};

/**
 * Generates a response using the selected AI provider
 * @param {Object} params - Parameters for the AI request
 * @param {string} params.provider - 'openai' or 'gemini'
 * @param {string} params.apiKey - API key for the selected provider
 * @param {string} params.model - Model name
 * @param {string} params.systemPrompt - System prompt
 * @param {string} params.userPrompt - User prompt
 * @param {Function} params.onChunk - Callback for streaming chunks
 * @returns {Promise<void>}
 */
export const generateResponse = async ({
  provider,
  apiKey,
  model,
  systemPrompt,
  userPrompt,
  onChunk
}) => {
  if (provider === 'openai') {
    await generateOpenAIResponse({
      apiKey,
      model,
      systemPrompt,
      userPrompt,
      onChunk
    });
  } else if (provider === 'gemini') {
    await generateGeminiResponse({
      apiKey,
      model,
      systemPrompt,
      userPrompt,
      onChunk
    });
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
};

/**
 * Generates a response using OpenAI API
 * @param {Object} params - Parameters for the OpenAI request
 */
const generateOpenAIResponse = async ({
  apiKey,
  model,
  systemPrompt,
  userPrompt,
  onChunk
}) => {
  const { OpenAI } = await import('openai');
  
  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const stream = await openai.chat.completions.create({
    model,
    messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      onChunk(content);
    }
  }
};

/**
 * Generates a response using Google Gemini API
 * @param {Object} params - Parameters for the Gemini request
 */
const generateGeminiResponse = async ({
  apiKey,
  model,
  systemPrompt,
  userPrompt,
  onChunk
}) => {
  const { GoogleGenAI } = await import('@google/genai');
  
  const ai = new GoogleGenAI({
    vertexai: false,
    apiKey
  });

  // For Gemini, we need to use the generateContent method
  const generationConfig = {
    model,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      thinkingConfig: {
        thinkingBudget: 0
      }
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
    streamGenerateContent: true
  };

  // Get the model and generate content
  const response = await ai.models.generateContentStream(generationConfig);

  // Process the stream
  for await (const chunk of response) {
    if (chunk.text) {
      onChunk(chunk.text);
    }
  }
};
