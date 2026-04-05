import { motion } from "framer-motion";
import { useTilt } from "../hooks/useTilt";
import ErrorState from "./ErrorState";

const HAZARD = {
  low:    { color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)"  },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  },
  high:   { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
};

const ease = [0.16, 1, 0.3, 1];

function Skel({ w = "80%", delay = 0 }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}
    className="skeleton" style={{ height: 11, width: w, borderRadius: 4, marginBottom: "0.5rem" }} />;
}

export default function InfoCard({ info, loading, error, onRetry }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(3.5);
  const hz = HAZARD[info?.hazard_level?.toLowerCase()] || HAZARD.low;

  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      className="card"
      style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.125rem", height: "100%", transition: "transform 0.18s ease, border-color 0.2s", willChange: "transform", transformStyle: "preserve-3d" }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p className="eyebrow">disposal guide</p>
        {!loading && !error && info?.hazard_level && (
          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.28, type: "spring" }}
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.2rem 0.55rem", borderRadius: 999, color: hz.color, background: hz.bg, border: `1px solid ${hz.border}` }}
          >{info.hazard_level} hazard</motion.span>
        )}
      </div>

      {loading && (
        <div>{[78,92,68,85,55].map((w,i) => <Skel key={i} w={`${w}%`} delay={i*0.05} />)}</div>
      )}

      {!loading && error && <ErrorState title="Info unavailable" detail={error} onRetry={onRetry} compact />}

      {!loading && !error && info && (
        <>
          {/* Recyclable */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <motion.span
              animate={info.recyclable ? { boxShadow: ["0 0 0 0 rgba(52,211,153,0.4)", "0 0 0 5px rgba(52,211,153,0)", "0 0 0 0 rgba(52,211,153,0.4)"] } : {}}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: info.recyclable ? "#34d399" : "#f87171" }}
            />
            <span style={{ fontSize: "0.84rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              {info.recyclable ? "Recyclable material" : "Not recyclable"}
            </span>
          </motion.div>

          {/* Steps */}
          <motion.ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.65rem" }}
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          >
            {info.steps?.map((step, i) => (
              <motion.li key={i} variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.35, ease } } }}
                style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-dim)", paddingTop: "0.14rem", flexShrink: 0, minWidth: 20, letterSpacing: "0.04em" }}>
                  {String(i+1).padStart(2,"0")}
                </span>
                <span style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{step}</span>
              </motion.li>
            ))}
          </motion.ol>

          {info.warning && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{
                display: "flex", gap: "0.625rem", alignItems: "flex-start",
                background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)",
                borderRadius: "var(--radius-md)", padding: "0.75rem 1rem",
              }}
            >
              <span style={{ color: "#f87171", fontSize: "0.8rem", flexShrink: 0 }}>⚠</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "rgba(248,113,113,0.75)", lineHeight: 1.5 }}>
                {info.warning}
              </span>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
