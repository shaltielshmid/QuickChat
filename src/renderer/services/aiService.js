import { OpenAI } from 'openai';
import { GoogleGenAI } from '@google/genai'
import { Ollama } from 'ollama/browser'

/**
 * AI Service - Abstraction for different AI providers
 * Supports OpenAI, Google Gemini, and Ollama APIs
 */

/**
 * Generates a response using the selected AI provider
 * @param {Object} params - Parameters for the AI request
 * @param {string} params.provider - 'openai', 'gemini', or 'ollama'
 * @param {string} params.apiKey - API key for the selected provider (not needed for Ollama)
 * @param {string} params.model - Model name
 * @param {string} params.systemPrompt - System prompt
 * @param {string} params.userPrompt - User prompt
 * @param {Function} params.onChunk - Callback for streaming chunks
 * @param {string} params.baseUrl - Base URL for Ollama (optional)
 * @returns {Promise<void>}
 */
export const generateResponse = async ({
  provider,
  apiKey,
  model,
  systemPrompt,
  userPrompt,
  onChunk,
  baseUrl
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
  } else if (provider === 'ollama') {
    await generateOllamaResponse({
      baseUrl,
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

/**
 * Generates a response using Ollama API (OpenAI-compatible endpoint)
 * @param {Object} params - Parameters for the Ollama request
 */
const generateOllamaResponse = async ({
  baseUrl,
  model,
  systemPrompt,
  userPrompt,
  onChunk
}) => {

  const ollama = new Ollama({
    host: baseUrl,
  });

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const stream = await ollama.chat({
    model,
    messages,
    stream: true
  });

  for await (const chunk of stream) {
    const content = chunk.message.content;
    if (content) {
      onChunk(content);
    }
  }
};
