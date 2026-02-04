interface ToastProps {
  message: string;
  type: 'error' | 'success';
  onDismiss: () => void;
}

/**
 * Toast - User-visible notification component
 *
 * Following Prime Directives:
 * - Rule #2 (Glove-First): 80px+ touch target for dismiss button
 * - Rule #3 (High-Contrast): Red for errors, green for success
 */
export const Toast = ({ message, type, onDismiss }: ToastProps) => {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 p-4 ${
        type === 'error' ? 'bg-red-600' : 'bg-green-600'
      }`}
    >
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 min-h-[72px]">
        <p className="text-white font-bold text-lg flex-1">{message}</p>
        <button
          onClick={onDismiss}
          className="w-20 h-20 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
          aria-label="Dismiss notification"
        >
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
