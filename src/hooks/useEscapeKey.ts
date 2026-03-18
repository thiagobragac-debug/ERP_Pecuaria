import { useEffect } from 'react';

/**
 * Custom hook that triggers a callback when the Escape key is pressed.
 * @param handleClose Callback function to close the modal or screen.
 */
export const useEscapeKey = (handleClose: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose]);
};
