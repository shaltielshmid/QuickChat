import { useState, useCallback } from 'react';

export const useCopy = () => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = useCallback(async (text) => {
    if (text) {
      try {
        // Remove code block markers like ```python, ```js, etc.
        const cleanedResponse = text.replace(/```[\w]*\n?/g, '').replace(/```\n?/g, '');
        await navigator.clipboard.writeText(cleanedResponse.trim());
        
        // Show copy success indicator
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  }, []);

  return {
    copySuccess,
    handleCopy
  };
};