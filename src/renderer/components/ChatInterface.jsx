import React from 'react';
import PropTypes from 'prop-types';
import { Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatInterface = ({
  input,
  setInput,
  response,
  isLoading,
  error,
  originalPrompt,
  copySuccess,
  onSubmit,
  onCopy,
  onClear,
  onShowSettings,
  textareaRef,
  responseRef
}) => {
  const windowClass = `overlay-window relative ${!response && !error ? 'compact' : 'expanded'}`;

  return (
    <div className={windowClass}>
      <div className="toolbar">
        <span className="text-sm font-medium text-gray-700">QuickChat</span>
        <div className="flex items-center gap-2">
          <div className="hotkey-hint">
            Ctrl+L to focus
          </div>
          <button
            onClick={onShowSettings}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Settings (Ctrl+,)"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      <div className="input-area">
        <form onSubmit={onSubmit}>
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
              onClick={() => onCopy(response)} 
              className={`btn-ghost ${copySuccess ? 'bg-green-100 text-green-800 border-green-300' : ''}`}
            >
              {copySuccess ? '✓ Copied!' : 'Copy Ctrl+J'}
            </button>
          )}
          <button onClick={onClear} className="btn-ghost">
            Clear Ctrl+K
          </button>
        </div>
      )}
    </div>
  );
};

ChatInterface.propTypes = {
  input: PropTypes.string.isRequired,
  setInput: PropTypes.func.isRequired,
  response: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  originalPrompt: PropTypes.string.isRequired,
  copySuccess: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onShowSettings: PropTypes.func.isRequired,
  textareaRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
  responseRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired
};

export default ChatInterface;