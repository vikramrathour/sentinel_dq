import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastContext = createContext(null);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_TOASTS = 5;
const AUTO_DISMISS_MS = 4000;

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-green-600',
    border: 'border-green-700',
    label: 'Success',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-600',
    border: 'border-red-700',
    label: 'Error',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-600',
    border: 'border-blue-700',
    label: 'Info',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500',
    border: 'border-amber-600',
    label: 'Warning',
  },
};

// ---------------------------------------------------------------------------
// Single Toast item
// ---------------------------------------------------------------------------

function Toast({ id, message, type, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef(null);

  // Trigger entrance animation on mount
  useEffect(() => {
    // rAF ensures the initial hidden state is painted before we add the
    // visible class so the CSS transition actually fires.
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Auto-dismiss
  useEffect(() => {
    timerRef.current = setTimeout(() => handleDismiss(), AUTO_DISMISS_MS);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDismiss() {
    clearTimeout(timerRef.current);
    setLeaving(true);
    // Wait for the fade-out transition before removing from DOM
    setTimeout(() => onDismiss(id), 300);
  }

  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;
  const Icon = config.icon;

  // Transition classes
  const baseTransition = 'transition-all duration-300 ease-in-out';
  const enterClass = visible && !leaving
    ? 'translate-x-0 opacity-100'
    : 'translate-x-full opacity-0';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        flex items-start gap-3 w-80 max-w-full
        ${config.bg} ${config.border}
        text-white rounded-xl shadow-lg border px-4 py-3
        ${baseTransition} ${enterClass}
      `}
    >
      <Icon className="shrink-0 mt-0.5" size={18} aria-hidden="true" />

      <p className="flex-1 text-sm leading-snug break-words">{message}</p>

      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 mt-0.5 p-0.5 rounded hover:bg-white/20 transition-colors"
      >
        <X size={15} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const showToast = useCallback(({ message, type = 'info' }) => {
    const id = ++counterRef.current;
    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      // Keep only the latest MAX_TOASTS
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
    });
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const portalNode =
    typeof document !== 'undefined' ? document.body : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {portalNode &&
        createPortal(
          <div
            aria-label="Notifications"
            className="fixed bottom-5 right-5 z-[9999] flex flex-col-reverse gap-2 items-end pointer-events-none"
          >
            {toasts.map((toast) => (
              <div key={toast.id} className="pointer-events-auto">
                <Toast
                  id={toast.id}
                  message={toast.message}
                  type={toast.type}
                  onDismiss={dismissToast}
                />
              </div>
            ))}
          </div>,
          portalNode
        )}
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
