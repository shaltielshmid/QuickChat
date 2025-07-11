import { useEffect, useCallback } from 'react';

export const useWindowManager = (showSettings, handleClear) => {
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

  const handleClose = useCallback(async () => {
    // Hide window via Electron IPC
    if (window.electronAPI) {
      handleClear();
      await window.electronAPI.hideWindow();
    }
  }, [handleClear]);

  return {
    handleClose
  };
};