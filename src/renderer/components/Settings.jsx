import React, { useState, useEffect, useCallback } from 'react';
import { Settings as SettingsIcon, Save, X } from 'lucide-react';

const Settings = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4.1');
  const [hotkey, setHotkey] = useState('CommandOrControl+Space');
  const [theme, setTheme] = useState('light');
  const [maxTokens, setMaxTokens] = useState(1000);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    if (window.electronAPI) {
      const settings = await Promise.all([
        window.electronAPI.getSetting('openaiApiKey', ''),
        window.electronAPI.getSetting('model', 'gpt-4.1'),
        window.electronAPI.getSetting('hotkey', 'CommandOrControl+Space'),
        window.electronAPI.getSetting('theme', 'light'),
        window.electronAPI.getSetting('maxTokens', 1000),
      ]);
      
      setApiKey(settings[0]);
      setModel(settings[1]);
      setHotkey(settings[2]);
      setTheme(settings[3]);
      setMaxTokens(settings[4]);
    }
  }, []);

  const saveSettings = useCallback(async () => {
    if (!window.electronAPI) return;
    
    setIsSaving(true);
    try {
      await Promise.all([
        window.electronAPI.setSetting('openaiApiKey', apiKey),
        window.electronAPI.setSetting('model', model),
        window.electronAPI.setSetting('hotkey', hotkey),
        window.electronAPI.setSetting('theme', theme),
        window.electronAPI.setSetting('maxTokens', maxTokens),
      ]);
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  }, [apiKey, model, hotkey, theme, maxTokens, onClose]);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, loadSettings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <SettingsIcon size={20} />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your API key is stored locally and never shared
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="gpt-4.1">GPT-4.1</option>
              <option value="gpt-4.1-mini">GPT-4.1-Mini</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Global Hotkey
            </label>
            <input
              type="text"
              value={hotkey}
              onChange={(e) => setHotkey(e.target.value)}
              placeholder="CommandOrControl+Space"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use CommandOrControl for cross-platform compatibility
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Tokens
            </label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              min="100"
              max="4000"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum tokens in the response (100-4000)
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;