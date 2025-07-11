import { useState, useCallback } from 'react';

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
      const apiKey = localStorage.getItem('openaiApiKey');
      if (!apiKey) {
        throw new Error('API key not configured. Press Ctrl+, to set it up.');
      }

      const model = localStorage.getItem('model') || 'gpt-4.1-mini';
      const systemPrompt = localStorage.getItem('systemPrompt') || 'You are a helpful AI assistant. Follow these rules in every response:\n\n1. **Be concise.** Provide the shortest answer that fully addresses the user\'s question—no background, no extra commentary.\n\n2. **Code-only responses.** If the user asks for code or a shell command, reply with *only* the code in a properly fenced code block. If possible, keep it to one line. Do not include any explanation, commentary, or surrounding text.\n\n3. **No unsolicited information.** Unless the user explicitly asks for examples, alternatives, or details, do not add any additional information.';
      
      // Import OpenAI dynamically
      const { OpenAI } = await import('openai');
      
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ];

      const stream = await openai.chat.completions.create({
        model: model,
        messages: messages,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          setResponse(prev => prev + content);
        }
      }
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
    
  return {
    input,
    setInput,
    response,
    isLoading,
    error,
    originalPrompt,
    handleSubmit,
    handleClear
  };
};