// ================================================================
// FUOTUOKE Campus Eats — Global Toast Notification Context
// Provides slick, animated notifications replacing raw alerts.
// ================================================================

import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Icon mapping
  const getIcon = (type) => {
    switch (type) {
      case "success": return "bi-check-circle-fill";
      case "error": return "bi-exclamation-triangle-fill";
      case "warning": return "bi-exclamation-circle-fill";
      case "info": return "bi-info-circle-fill";
      default: return "bi-bell-fill";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Overlay Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-item toast-${t.type} animate-slide-in-right`}
            onClick={() => removeToast(t.id)}
          >
            <i className={`bi ${getIcon(t.type)} toast-icon`} />
            <div className="toast-message">{t.message}</div>
            <button className="toast-close" onClick={(e) => { e.stopPropagation(); removeToast(t.id); }}>
              <i className="bi bi-x" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
