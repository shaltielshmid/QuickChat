import { useState, useCallback, useMemo } from 'react';
import { generateResponse } from '../services/aiService';

export const useChat = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [originalPrompt, setOriginalPrompt] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const prompt = input.trim();
    setOriginalPrompt(prompt);
    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      // Get the selected API provider
      const provider = localStorage.getItem('apiProvider') || 'openai';
      
      // Get the appropriate API key and base URL based on the provider
      let apiKey, baseUrl;
      if (provider === 'openai') {
        apiKey = localStorage.getItem('openaiApiKey');
        if (!apiKey) {
          throw new Error('OpenAI API key not configured. Press Ctrl+, to set it up.');
        }
      } else if (provider === 'gemini') {
        apiKey = localStorage.getItem('geminiApiKey');
        if (!apiKey) {
          throw new Error('Gemini API key not configured. Press Ctrl+, to set it up.');
        }
      } else if (provider === 'ollama') {
        baseUrl = localStorage.getItem('ollamaUrl') || 'http://localhost:11434';
        apiKey = 'ollama'; // Required but unused for Ollama
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      const model = localStorage.getItem('model') || 'gpt-4.1-mini';
      const systemPrompt = localStorage.getItem('systemPrompt') || 'You are a helpful AI assistant. Follow these rules in every response:\n\n1. **Be concise.** Provide the shortest answer that fully addresses the user\'s question—no background, no extra commentary.\n\n2. **Code-only responses.** If the user asks for code or a shell command, reply with *only* the code in a properly fenced code block. If possible, keep it to one line. Do not include any explanation, commentary, or surrounding text.\n\n3. **No unsolicited information.** Unless the user explicitly asks for examples, alternatives, or details, do not add any additional information.';
      
      // Use the abstracted AI service to generate a response
      await generateResponse({
        provider,
        apiKey,
        model,
        systemPrompt,
        userPrompt: prompt,
        baseUrl,
        onChunk: (content) => {
          setResponse(prev => prev + content);
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const handleClear = useCallback(() => {
    setInput('');
    setResponse('');
    setError('');
    setOriginalPrompt('');
  }, []);

  const isThinking = useMemo(() => response.startsWith("<think>") && !response.includes("</think>"), [response]);
  const finalResponse = useMemo(() => {
    if (!response.startsWith("<think>")) return response;
    return isThinking ? "Model is reasoning..." : response.substring(response.indexOf("</think>") + "</think>".length).trim();
  }, [response, isThinking]);
  
  return {
    input,
    setInput,
    response: finalResponse,
    isThinking,
    isLoading,
    error,
    originalPrompt,
    handleSubmit,
    handleClear
  };
};