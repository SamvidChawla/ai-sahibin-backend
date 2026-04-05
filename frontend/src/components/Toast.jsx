import { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ToastCtx = createContext(null);
let uid = 0;

const VARIANTS = {
  error:   { icon: "✕", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
  warning: { icon: "⚠", color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  },
  success: { icon: "✓", color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)"  },
  info:    { icon: "i", color: "#9ca3af", bg: "rgba(156,163,175,0.06)", border: "rgba(156,163,175,0.18)" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(({ message, type = "info", duration = 4500, action }) => {
    const id = ++uid;
    setToasts((t) => [...t.slice(-3), { id, message, type, action }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return (
    <ToastCtx.Provider value={{ toast, dismiss }}>
      {children}
      <div style={{
        position: "fixed", bottom: "1.5rem", right: "1.5rem",
        zIndex: 9999, display: "flex", flexDirection: "column",
        gap: "0.45rem", alignItems: "flex-end", pointerEvents: "none",
      }}>
        <AnimatePresence>
          {toasts.map((t) => {
            const v = VARIANTS[t.type] || VARIANTS.info;
            return (
              <motion.div key={t.id} layout
                initial={{ opacity: 0, y: 12, scale: 0.94, x: 12 }}
                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.92, x: 16, transition: { duration: 0.16 } }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                style={{
                  pointerEvents: "all",
                  display: "flex", alignItems: "flex-start", gap: "0.6rem",
                  background: "rgba(16,16,20,0.92)",
                  backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                  border: `1px solid ${v.border}`,
                  borderRadius: "var(--radius-md)",
                  padding: "0.75rem 1rem",
                  minWidth: 260, maxWidth: 340,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                }}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                  background: v.bg, border: `1px solid ${v.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.5rem", color: v.color, fontWeight: 700, marginTop: 1,
                }}>{v.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.74rem", color: "var(--text-secondary)", lineHeight: 1.45, margin: 0 }}>{t.message}</p>
                  {t.action && (
                    <button onClick={() => { t.action.onClick(); dismiss(t.id); }}
                      style={{ marginTop: "0.3rem", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: v.color, background: "none", border: "none", padding: 0, cursor: "pointer", letterSpacing: "0.03em" }}
                    >{t.action.label} →</button>
                  )}
                </div>
                <button onClick={() => dismiss(t.id)}
                  style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "0.68rem", padding: "0.1rem", flexShrink: 0, lineHeight: 1 }}
                >✕</button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
  return ctx;
}
