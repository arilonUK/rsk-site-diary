import { useState, useCallback, useEffect, createElement } from 'react';
import { Toast } from '../components/Toast';

interface ToastState {
  message: string;
  type: 'error' | 'success';
  id: number;
}

/**
 * useToast - Hook for showing toast notifications
 *
 * Returns:
 * - showToast(message, type): Function to display a toast
 * - ToastContainer: Component to render in your view
 *
 * Auto-dismisses after 4 seconds, supports manual dismiss
 */
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast?.id]);

  // ToastContainer component
  const ToastContainer = useCallback(() => {
    if (!toast) return null;

    return createElement(Toast, {
      message: toast.message,
      type: toast.type,
      onDismiss: dismissToast,
    });
  }, [toast, dismissToast]);

  return { showToast, ToastContainer };
}
