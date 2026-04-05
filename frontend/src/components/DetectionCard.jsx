import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTilt } from "../hooks/useTilt";

// Category color system — all neutral except the specific accent for that type
const CAT = {
  plastic:   { color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.2)",  icon: "🧴", label: "Plastic"   },
  organic:   { color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.2)",  icon: "🌿", label: "Organic"   },
  "e-waste": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", icon: "💻", label: "E-waste"   },
  glass:     { color: "#22d3ee", bg: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.2)",  icon: "🫙", label: "Glass"     },
  metal:     { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)", icon: "🔩", label: "Metal"     },
  cardboard: { color: "#fb923c", bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.2)",  icon: "📦", label: "Cardboard" },
};
const DEFAULT_CAT = { color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.2)", icon: "🗑", label: "Unknown" };

export default function DetectionCard({ data, imagePreview }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  const [barPct, setBarPct] = useState(0);

  const key  = data?.category?.toLowerCase();
  const meta = CAT[key] || DEFAULT_CAT;
  const pct  = Math.round((data?.confidence || 0) );
  const confLabel = pct >= 85 ? "High confidence" : pct >= 60 ? "Moderate — verify visually" : "Low — manual check recommended";

  useEffect(() => {
    const t = setTimeout(() => setBarPct(pct), 350);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="card noise"
      style={{ transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.2s", willChange: "transform", transformStyle: "preserve-3d" }}
    >
      {/* Image */}
      {imagePreview && (
        <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "var(--bg-base)" }}>
          <motion.img src={imagePreview} alt="Waste"
            initial={{ scale: 1.06, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, var(--bg-card) 100%)" }} />
          {data?.is_fallback && (
            <div style={{
              position: "absolute", top: "0.75rem", right: "0.75rem",
              fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em",
              color: "var(--accent-text)", background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
              padding: "0.18rem 0.5rem", borderRadius: 4, backdropFilter: "blur(8px)",
            }}>DEMO</div>
          )}
        </div>
      )}

      <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
        <p className="eyebrow" style={{ marginBottom: "0.875rem" }}>detected category</p>

        {/* Category row */}
        <motion.div
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.18, duration: 0.4 }}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.375rem", flexWrap: "wrap" }}
        >
          <motion.span
            initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.22, type: "spring", stiffness: 260, damping: 16 }}
            style={{ fontSize: "1.75rem", lineHeight: 1 }}
          >{meta.icon}</motion.span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.65rem", fontWeight: 700, color: meta.color, letterSpacing: "-0.025em", lineHeight: 1 }}>
            {data?.category}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase",
            padding: "0.2rem 0.6rem", borderRadius: 999,
            color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`,
          }}>{key}</span>
        </motion.div>

        {/* Confidence */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="eyebrow">confidence</span>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.88rem", fontWeight: 500, color: meta.color }}
            >{pct}%</motion.span>
          </div>

          {/* Track */}
          <div style={{ height: 4, background: "var(--bg-elevated)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 999,
              background: `linear-gradient(90deg, ${meta.color}60, ${meta.color})`,
              boxShadow: `0 0 8px ${meta.color}40`,
              width: `${barPct}%`,
              transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
            }} />
          </div>

          {/* Tick marks */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {[0, 25, 50, 75, 100].map((v) => (
              <span key={v} style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-dim)" }}>{v}</span>
            ))}
          </div>

          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.63rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
            {confLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
