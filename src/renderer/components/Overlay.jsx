import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// Remove Tauri imports - using browser APIs instead

const Overlay = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Clear on reload functionality
  useEffect(() => {
    const clearOnReload = localStorage.getItem('clearOnReload') !== 'false';
    if (clearOnReload) {
      setInput('');
      setResponse('');
      setError('');
      setOriginalPrompt('');
    }
  }, []);

  // Resize window when settings toggle
  useEffect(() => {
    if (window.electronAPI) {
      if (showSettings) {
        // Larger size for settings
        window.electronAPI.resizeWindow(600, 950);
      } else {
        // Normal size for main interface
        window.electronAPI.resizeWindow(600, 450);
      }
    }
  }, [showSettings]);
  const textareaRef = useRef(null);
  const responseRef = useRef(null);

  const handleClose = useCallback(async () => {
    // Auto clear on close
    setInput('');
    setResponse('');
    setError('');
    setOriginalPrompt('');
    
    // Hide window via Electron IPC
    if (window.electronAPI) {
      await window.electronAPI.hideWindow();
    }
  }, []);

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

  const handleCopy = useCallback(async () => {
    if (response) {
      try {
        // Remove code block markers like ```python, ```js, etc.
        const cleanedResponse = response.replace(/```[\w]*\n?/g, '').replace(/```\n?/g, '');
        await navigator.clipboard.writeText(cleanedResponse.trim());
        
        // Show copy success indicator
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  }, [response]);

  const handleFocus = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleClear = useCallback(() => {
    setInput('');
    setResponse('');
    setError('');
    setOriginalPrompt('');
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      if (showSettings) {
        setShowSettings(false);
      } else {
        handleClose();
      }
    } else if (e.ctrlKey && e.key === ',') {
      e.preventDefault();
      setShowSettings(true);
    } else if (e.ctrlKey && e.key === 'j') {
      e.preventDefault();
      handleCopy();
    } else if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      handleClear();
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      handleFocus();
    }
  }, [handleSubmit, handleClose, handleCopy, handleClear, handleFocus, showSettings]);
  
  const overlayRef = useRef(null);

  useEffect(() => {
    // Focus the overlay container for keyboard events
    const timer = setTimeout(() => {
      if (overlayRef.current) {
        overlayRef.current.focus();
      }
      // Then focus textarea if not in settings
      if (textareaRef.current && !showSettings) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [showSettings]);

  useEffect(() => {
    // Also focus when showSettings changes back to false
    if (!showSettings && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showSettings]);

  // Force focus when overlay becomes visible
  useEffect(() => {
    const focusInput = () => {
      if (textareaRef.current && !showSettings) {
        textareaRef.current.focus();
      }
    };

    // Focus on window focus
    window.addEventListener('focus', focusInput);
    // Focus on click anywhere in overlay (except settings)
    document.addEventListener('click', focusInput);
    
    return () => {
      window.removeEventListener('focus', focusInput);
      document.removeEventListener('click', focusInput);
    };
  }, [showSettings]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown]);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  if (showSettings) {
    return (
      <div 
        ref={overlayRef}
        className="overlay-window relative settings"
        tabIndex={-1}
        style={{ outline: 'none' }}
      >
        <SettingsPanel onClose={() => setShowSettings(false)} />
      </div>
    );
  }

  const windowClass = `overlay-window relative ${!response && !error ? 'compact' : 'expanded'}`;

  return (
    <div 
      ref={overlayRef}
      className={windowClass}
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      <div className="toolbar">
        <span className="text-sm font-medium text-gray-700">QuickChat</span>
        <div className="flex items-center gap-2">
          <div className="hotkey-hint">
            Ctrl+L to focus
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Settings (Ctrl+,)"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      <div className="input-area">
          <form onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full p-3 bg-transparent border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows={3}
              disabled={isLoading}
            />
          </form>
        </div>

        {error && (
          <div className="px-4 pb-2">
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {(response || isLoading) && (
          <div className="response-area">
            <div 
              ref={responseRef}
              className="prose prose-sm max-w-none text-gray-800"
            >
              {response && <ReactMarkdown>{response}</ReactMarkdown>}
              {isLoading && !response && (
                <div className="text-gray-500 text-sm">Thinking...</div>
              )}
            </div>
          </div>
        )}

        {(response || originalPrompt) && (
          <div className="action-buttons">
            {response && (
              <button 
                onClick={handleCopy} 
                className={`btn-ghost ${copySuccess ? 'bg-green-100 text-green-800 border-green-300' : ''}`}
              >
                {copySuccess ? '✓ Copied!' : 'Copy Ctrl+J'}
              </button>
            )}
            <button onClick={handleClear} className="btn-ghost">
              Clear Ctrl+K
            </button>
          </div>
        )}
      </div>
  );
};

const SettingsPanel = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4.1-mini');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [clearOnReload, setClearOnReload] = useState(true);
  
  const defaultSystemPrompt = 'You are a helpful AI assistant. Follow these rules in every response:\n\n1. **Be concise.** Provide the shortest answer that fully addresses the user\'s question—no background, no extra commentary.\n\n2. **Code-only responses.** If the user asks for code or a shell command, reply with *only* the code in a properly fenced code block. Do not include any explanation, commentary, or surrounding text.\n\n3. **No unsolicited information.** Unless the user explicitly asks for examples, alternatives, or details, do not add any additional information.\n\n4. **Clarify when needed.** If the user\'s request is ambiguous or missing critical details, ask a brief clarifying question—but still keep it as short as possible.';

  const loadSettings = useCallback(async () => {
    const key = localStorage.getItem('openaiApiKey') || '';
    const mdl = localStorage.getItem('model') || 'gpt-4.1-mini';
    const sysPrompt = localStorage.getItem('systemPrompt') || defaultSystemPrompt;
    const clearReload = localStorage.getItem('clearOnReload') !== 'false'; // default true
    
    setApiKey(key);
    setModel(mdl);
    setSystemPrompt(sysPrompt);
    setClearOnReload(clearReload);
  }, []);

  const saveApiKey = useCallback(async (newKey) => {
    localStorage.setItem('openaiApiKey', newKey);
  }, []);

  const saveModel = useCallback(async (newModel) => {
    localStorage.setItem('model', newModel);
  }, []);

  const saveSystemPrompt = useCallback(async (newPrompt) => {
    localStorage.setItem('systemPrompt', newPrompt);
  }, []);

  const saveClearOnReload = useCallback(async (value) => {
    localStorage.setItem('clearOnReload', value.toString());
  }, []);

  const restoreDefaultPrompt = useCallback(async () => {
    setSystemPrompt(defaultSystemPrompt);
    await saveSystemPrompt(defaultSystemPrompt);
  }, [saveSystemPrompt]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);


  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
        <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          esc
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OpenAI API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              saveApiKey(e.target.value);
            }}
            placeholder="sk-..."
            className="w-full p-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <select
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              saveModel(e.target.value);
            }}
            className="w-full p-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="gpt-4.1">GPT-4.1</option>
            <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Clear on Window Reload
            </label>
            <input
              type="checkbox"
              checked={clearOnReload}
              onChange={(e) => {
                setClearOnReload(e.target.checked);
                saveClearOnReload(e.target.checked);
              }}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              System Prompt
            </label>
            <button
              onClick={restoreDefaultPrompt}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Restore Default
            </button>
          </div>
          <textarea
            value={systemPrompt}
            onChange={(e) => {
              setSystemPrompt(e.target.value);
              saveSystemPrompt(e.target.value);
            }}
            placeholder="Instructions for how the AI should behave..."
            className="w-full p-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            rows={12}
          />
        </div>
      </div>
    </div>
  );
};

export default Overlay;