import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthGuard = () => {
  const { isAuthenticated } = useAuth();
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);

  const requireAuth = useCallback((callback: () => void) => {
    if (isAuthenticated) {
      callback();
    } else {
      setShowRegistrationPrompt(true);
    }
  }, [isAuthenticated]);

  const closeRegistrationPrompt = useCallback(() => {
    setShowRegistrationPrompt(false);
  }, []);

  return {
    requireAuth,
    showRegistrationPrompt,
    closeRegistrationPrompt,
    isAuthenticated,
  };
}; 