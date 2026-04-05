import { motion } from "framer-motion";
import { useTilt } from "../hooks/useTilt";
import ErrorState from "./ErrorState";

const ease = [0.16, 1, 0.3, 1];

function SkeletonRow({ delay }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}
      style={{ padding: "0.75rem", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "0.4rem" }}
    >
      <div className="skeleton" style={{ height: 10, width: "48%" }} />
      <div className="skeleton" style={{ height: 8, width: "30%" }} />
    </motion.div>
  );
}

export default function CentersList({ centers, loading, error, isFallback, onRetry }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(3);
  const notFetchedYet = centers === null && !loading && !error;

  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      className="card"
      style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", transition: "transform 0.18s ease, border-color 0.2s", willChange: "transform", transformStyle: "preserve-3d" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p className="eyebrow">nearby disposal centers</p>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-dim)" }}>
          {loading ? "—" : error ? "unavailable" : centers !== null ? `${centers.length} found` : "—"}
        </span>
      </div>

      {/* Waiting for coords */}
      {notFetchedYet && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <motion.span animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--text-dim)", display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)" }}>Waiting for location…</span>
        </div>
      )}

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
          {[0,1,2].map(i => <SkeletonRow key={i} delay={i * 0.07} />)}
        </div>
      )}

      {!loading && error && <ErrorState title="Nearby centers unavailable" detail={error} onRetry={onRetry} compact />}

      {!error && isFallback && centers?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            display: "flex", alignItems: "center", gap: "0.45rem",
            background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
            borderRadius: "var(--radius-sm)", padding: "0.5rem 0.75rem",
            fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--accent-text)",
          }}
        >
          <span style={{ fontSize: "0.7rem" }}>⚡</span>
          Google Maps limited — showing sample results
        </motion.div>
      )}

      {!loading && !error && centers?.length > 0 && (
        <motion.ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
        >
          {centers.map((c, i) => (
            <motion.li key={c.id || i}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease } } }}
              whileHover={{ borderColor: "var(--border-mid)", background: "var(--bg-elevated)", x: 2 }}
              style={{
                border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)",
                transition: "border-color 0.15s, background 0.15s, transform 0.15s",
                overflow: "hidden" // Keeps the hover background inside the rounded borders
              }}
            >
              {/* FIX 3: Make the whole row a clickable Google Maps link */}
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}&query_place_id=${c.id}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "0.875rem",
                  padding: "0.7rem 0.875rem", textDecoration: "none", color: "inherit",
                  width: "100%", cursor: "pointer"
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.57rem", color: "var(--text-dim)", flexShrink: 0, minWidth: 18 }}>
                  {String(i+1).padStart(2,"0")}
                </span>
                
                {/* The flex: 1 minWidth: 0 container is vital for child truncation */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  
                  {/* FIX 1: display: "block" forces the ellipsis to work on flex children */}
                  <p style={{ fontWeight: 500, fontSize: "0.83rem", color: "var(--text-secondary)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                    {c.name}
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.63rem", color: "var(--text-muted)", margin: "0.15rem 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                    {c.address}
                  </p>
                </div>

                {/* FIX 2: Bulletproof rating check to prevent UI crashes if backend sends weird strings */}
                {c.rating != null && !isNaN(Number(c.rating)) && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--text-muted)", flexShrink: 0 }}>
                    <span style={{ color: "var(--accent)" }}>★</span>
                    {Number(c.rating).toFixed(1)}
                  </span>
                )}
              </a>
            </motion.li>
          ))}
        </motion.ul>
      )}

      {!loading && !error && centers !== null && centers.length === 0 && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.74rem", color: "var(--text-muted)" }}>
          No disposal centers found in your area.
        </p>
      )}
    </div>
  );
}