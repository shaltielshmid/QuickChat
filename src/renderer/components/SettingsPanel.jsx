import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import Combobox from './Combobox';

const defaultSystemPrompt = 'You are a helpful AI assistant. Follow these rules in every response:\n\n1. **Be concise.** Provide the shortest answer that fully addresses the user\'s question—no background, no extra commentary.\n\n2. **Code-only responses.** If the user asks for code or a shell command, reply with *only* the code in a properly fenced code block. Do not include any explanation, commentary, or surrounding text.\n\n3. **No unsolicited information.** Unless the user explicitly asks for examples, alternatives, or details, do not add any additional information.\n\n4. **Clarify when needed.** If the user\'s request is ambiguous or missing critical details, ask a brief clarifying question—but still keep it as short as possible.';


// Define suggested models for each provider
const providerModels = {
  openai: [
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4o',
    'gpt-4o-mini'
  ],
  gemini: [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite-preview-06-17',
    'gemini-2.5-pro'
  ],
  ollama: [
    'qwen3'
  ]
};

// Get default model for a provider
const getDefaultModelForProvider = (provider) => {
  if (provider === 'openai') return 'gpt-4.1-mini';
  if (provider === 'gemini') return 'gemini-2.5-flash';
  if (provider === 'ollama') return 'qwen3';
  return 'gpt-4.1-mini'; // Fallback to OpenAI
};

const SettingsPanel = ({ onClose }) => {
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [model, setModel] = useState('gpt-4.1-mini');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [clearOnReload, setClearOnReload] = useState(true);
  const [apiProvider, setApiProvider] = useState('openai');
  
  const loadSettings = useCallback(async () => {
    const openaiKey = localStorage.getItem('openaiApiKey') || '';
    const geminiKey = localStorage.getItem('geminiApiKey') || '';
    const ollamaBaseUrl = localStorage.getItem('ollamaUrl') || 'http://localhost:11434';
    const provider = localStorage.getItem('apiProvider') || 'openai';
    const mdl = localStorage.getItem('model') || 'gpt-4.1-mini';
    const sysPrompt = localStorage.getItem('systemPrompt') || defaultSystemPrompt;
    const clearReload = localStorage.getItem('clearOnReload') !== 'false'; // default true
    
    setOpenaiApiKey(openaiKey);
    setGeminiApiKey(geminiKey);
    setOllamaUrl(ollamaBaseUrl);
    setApiProvider(provider);
    setModel(mdl);
    setSystemPrompt(sysPrompt);
    setClearOnReload(clearReload);
  }, []);

  const saveOpenaiApiKey = useCallback(async (newKey) => {
    localStorage.setItem('openaiApiKey', newKey);
  }, []);

  const saveGeminiApiKey = useCallback(async (newKey) => {
    localStorage.setItem('geminiApiKey', newKey);
  }, []);

  const saveOllamaUrl = useCallback(async (newUrl) => {
    localStorage.setItem('ollamaUrl', newUrl);
  }, []);

  const saveModel = useCallback(async (newModel) => {
    localStorage.setItem('model', newModel);
  }, []);

  const saveApiProvider = useCallback(async (provider) => {
    localStorage.setItem('apiProvider', provider);
    
    // Update model to default for the new provider
    const defaultModel = getDefaultModelForProvider(provider);
    setModel(defaultModel);
    saveModel(defaultModel);
  }, [saveModel]);

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
            API Provider
          </label>
          <select
            value={apiProvider}
            onChange={(e) => {
              setApiProvider(e.target.value);
              saveApiProvider(e.target.value);
            }}
            className="w-full p-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Google Gemini</option>
            <option value="ollama">Ollama</option>
          </select>
        </div>

        {apiProvider === 'openai' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={openaiApiKey}
              onChange={(e) => {
                setOpenaiApiKey(e.target.value);
                saveOpenaiApiKey(e.target.value);
              }}
              placeholder="sk-..."
              className="w-full p-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        )}

        {apiProvider === 'gemini' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => {
                setGeminiApiKey(e.target.value);
                saveGeminiApiKey(e.target.value);
              }}
              placeholder="AI..."
              className="w-full p-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        )}

        {apiProvider === 'ollama' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ollama Base URL
            </label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => {
                setOllamaUrl(e.target.value);
                saveOllamaUrl(e.target.value);
              }}
              placeholder="http://localhost:11434"
              className="w-full p-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default port is 11434. No API key required for Ollama.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <Combobox
            value={model}
            onChange={useCallback((value) => {
              setModel(value);
              saveModel(value);
            }, [saveModel])}
            options={providerModels[apiProvider] || []}
            placeholder="Type or select a model"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can type any model name or select from suggested models.
          </p>
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

SettingsPanel.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default SettingsPanel;