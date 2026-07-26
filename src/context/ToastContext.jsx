import { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const success = useCallback((msg) => addToast(msg, "success"), [addToast]);
  const error = useCallback((msg) => addToast(msg, "error", 6000), [addToast]);
  const info = useCallback((msg) => addToast(msg, "info"), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, info }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((t) => (
            <Toast key={t.id} {...t} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function Toast({ message, type }) {
  const styles = {
    success: "bg-green-600 text-white",
    error: "bg-destructive text-destructive-foreground",
    info: "bg-card text-foreground border border-border",
  };

  return (
    <div
      className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-bottom-5 ${
        styles[type]
      }`}
    >
      {message}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
