import React, { useState, useRef, useEffect, useCallback } from 'react';
import ChatInterface from './ChatInterface';
import SettingsPanel from './SettingsPanel';
import { useChat } from '../hooks/useChat';
import { useCopy } from '../hooks/useCopy';
import { useWindowManager } from '../hooks/useWindowManager';

const Overlay = () => {
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef(null);
  const responseRef = useRef(null);
  const overlayRef = useRef(null);

  // Custom hooks
  const {
    input,
    setInput,
    response,
    isThinking,
    isLoading,
    error,
    originalPrompt,
    handleSubmit,
    handleClear: clearChat
  } = useChat();

  const { copySuccess, handleCopy } = useCopy();
  const { handleClose } = useWindowManager(showSettings, clearChat);

  // Clear on reload functionality
  useEffect(() => {
    const clearOnReload = localStorage.getItem('clearOnReload') !== 'false';
    if (clearOnReload) {
      clearChat();
    }
  }, [clearChat]);

  // Resize window when settings toggle
  useEffect(() => {
    if (window.electronAPI) {
      if (showSettings) {
        window.electronAPI.resizeWindow(600, 950);
      } else {
        window.electronAPI.resizeWindow(600, 450);
      }
    }
  }, [showSettings]);

  const handleFocus = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleClearWithFocus = useCallback(() => {
    clearChat();
    textareaRef.current?.focus();
  }, [clearChat]);

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
      handleCopy(response);
    } else if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      handleClearWithFocus();
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      handleFocus();
    }
  }, [handleSubmit, handleClose, handleCopy, handleClearWithFocus, handleFocus, response, showSettings]);

  // Focus management
  useEffect(() => {
    const timer = setTimeout(() => {
      if (overlayRef.current) {
        overlayRef.current.focus();
      }
      if (textareaRef.current && !showSettings) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [showSettings]);

  useEffect(() => {
    if (!showSettings && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showSettings]);

  useEffect(() => {
    const focusInput = () => {
      if (textareaRef.current && !showSettings) {
        textareaRef.current.focus();
      }
    };

    window.addEventListener('focus', focusInput);
    document.addEventListener('click', focusInput);
    
    return () => {
      window.removeEventListener('focus', focusInput);
      document.removeEventListener('click', focusInput);
    };
  }, [showSettings]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
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

  return (
    <div 
      ref={overlayRef}
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      <ChatInterface
        input={input}
        setInput={setInput}
        response={response}
        isThinking={isThinking}
        isLoading={isLoading}
        error={error}
        originalPrompt={originalPrompt}
        copySuccess={copySuccess}
        onSubmit={handleSubmit}
        onCopy={handleCopy}
        onClear={handleClearWithFocus}
        onShowSettings={() => setShowSettings(true)}
        textareaRef={textareaRef}
        responseRef={responseRef}
      />
    </div>
  );
};

export default Overlay;