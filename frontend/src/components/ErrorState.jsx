import { motion } from "framer-motion";

export default function ErrorState({ title, detail, onRetry, compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }}
      style={{
        display: "flex", flexDirection: "column",
        alignItems: compact ? "flex-start" : "center",
        gap: "0.6rem",
        padding: compact ? "0.5rem 0" : "2rem 1.5rem",
        textAlign: compact ? "left" : "center",
      }}
    >
      <div style={{
        width: compact ? 26 : 34, height: compact ? 26 : 34, flexShrink: 0,
        borderRadius: "50%", background: "var(--red-dim)", border: "1px solid rgba(248,113,113,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: compact ? "0.7rem" : "0.85rem", color: "var(--red)",
      }}>✕</div>
      <div>
        <p style={{ fontWeight: 500, fontSize: compact ? "0.82rem" : "0.88rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>{title}</p>
        {detail && <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{detail}</p>}
      </div>
      {onRetry && (
        <motion.button onClick={onRetry}
          whileHover={{ borderColor: "var(--border-mid)" }} whileTap={{ scale: 0.97 }}
          style={{
            background: "transparent", border: "1px solid var(--border-dim)",
            borderRadius: "var(--radius-sm)", padding: compact ? "0.28rem 0.65rem" : "0.38rem 0.875rem",
            fontFamily: "var(--font-mono)", fontSize: "0.68rem",
            color: "var(--text-muted)", cursor: "pointer",
            letterSpacing: "0.03em", transition: "border-color 0.2s, color 0.2s",
          }}
        >↻ Retry</motion.button>
      )}
    </motion.div>
  );
}
