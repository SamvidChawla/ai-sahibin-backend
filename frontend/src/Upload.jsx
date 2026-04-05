import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { detectWaste } from "./services/api";
import { useToast } from "./components/Toast";

const CATEGORIES = ["Plastic", "Organic", "E-waste", "Glass", "Metal", "Cardboard"];

const STAGES = [
  { label: "Uploading image…",       ms: 900 },
  { label: "Running ML inference…",  ms: 99999 },
];

const ease = [0.16, 1, 0.3, 1];

export default function Upload() {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef   = useRef(null);
  const stageTimer = useRef(null);
  const navigate   = useNavigate();
  const { toast }  = useToast();

  const applyFile = useCallback((f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast({ type: "error", message: "Please select a valid image file (JPG, PNG, WEBP)." });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, [toast]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    applyFile(e.dataTransfer.files[0]);
  }, [applyFile]);

  const clearFile = useCallback((e) => {
    e?.stopPropagation();
    setFile(null);
    setPreview(null);
  }, []);

  const handleUpload = async () => {
    if (!file || loading) return;
    setLoading(true);
    setStageIdx(0);
    stageTimer.current = setTimeout(() => setStageIdx(1), STAGES[0].ms);
    try {
      const data = await detectWaste(file);
      if (!data.category) throw new Error("Invalid response from ML model.");
      navigate("/result", { state: { ...data, imagePreview: preview } });
    } catch (err) {
      toast({
        type: "error",
        message: err.message?.includes("timed out")
          ? "Detection timed out — the model may be warming up. Try again."
          : `Detection failed: ${err.message || "Unknown error"}`,
        duration: 6000,
      });
    } finally {
      clearTimeout(stageTimer.current);
      setLoading(false);
      setStageIdx(0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease }}
      style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative" }}
    >
      {/* Background */}
      <div className="dot-grid" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 640, height: 480, borderRadius: "50%", zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 65%)",
        filter: "blur(40px)",
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5, ease }}
          style={{ textAlign: "center" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1rem", boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
            }}>♻</div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              SahiBin
            </span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--accent-text)",
              background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
              padding: "0.12rem 0.45rem", borderRadius: 4, letterSpacing: "0.1em",
              alignSelf: "flex-start", marginTop: "0.3rem",
            }}>AI</span>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.04em" }}>
            Identify waste · Get disposal guidance
          </p>
        </motion.div>

        {/* Drop zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.55, ease }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !preview && !loading && inputRef.current?.click()}
          style={{
            background: dragOver ? "rgba(245,158,11,0.04)" : "var(--bg-card)",
            border: `1px ${dragOver ? "solid" : "dashed"} ${dragOver ? "rgba(245,158,11,0.4)" : "var(--border-soft)"}`,
            borderRadius: "var(--radius-xl)",
            cursor: preview || loading ? "default" : "pointer",
            overflow: "hidden",
            transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
            boxShadow: dragOver ? "0 0 0 3px rgba(245,158,11,0.12)" : "var(--shadow-card)",
          }}
        >
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ padding: "3rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}
              >
                {/* Spinner */}
                <div style={{ position: "relative", width: 48, height: 48 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid var(--border-dim)", borderTopColor: "var(--accent)" }}
                  />
                  <div style={{ position: "absolute", inset: 8, borderRadius: "50%", border: "1px solid var(--border-dim)", borderTopColor: "rgba(245,158,11,0.35)" }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <AnimatePresence mode="wait">
                    <motion.p key={stageIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}
                    >{STAGES[stageIdx].label}</motion.p>
                  </AnimatePresence>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.63rem", color: "var(--text-muted)" }}>
                    This may take a few seconds
                  </p>
                </div>
              </motion.div>
            )}

            {!loading && preview && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: "relative" }}
              >
                <img src={preview} alt="Waste preview"
                  style={{ width: "100%", maxHeight: 240, objectFit: "cover", display: "block" }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, transparent 50%, rgba(13,13,15,0.9) 100%)",
                  pointerEvents: "none",
                }} />
                <div style={{ position: "absolute", bottom: "0.875rem", left: "1rem", right: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "rgba(161,159,154,0.8)" }}>
                    {file?.name} · {file ? (file.size / 1024).toFixed(0) : 0} KB
                  </span>
                  <motion.button whileHover={{ background: "rgba(248,113,113,0.6)" }} whileTap={{ scale: 0.95 }}
                    onClick={clearFile}
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "var(--text-primary)", border: "1px solid var(--border-soft)", borderRadius: "var(--radius-sm)", padding: "0.22rem 0.6rem", fontFamily: "var(--font-mono)", fontSize: "0.63rem", cursor: "pointer", transition: "background 0.15s" }}
                  >✕ remove</motion.button>
                </div>
              </motion.div>
            )}

            {!loading && !preview && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ padding: "2.75rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}
              >
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    width: 56, height: 56, borderRadius: 14, border: "1px dashed var(--border-mid)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--text-dim)", background: "var(--bg-elevated)",
                  }}
                >
                  <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
                    <path d="M11 3v14M6 8l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 17h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
                  </svg>
                </motion.div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 500, fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                    Drop your waste image here
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.67rem", color: "var(--text-muted)" }}>
                    or click to browse · JPG · PNG 
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => applyFile(e.target.files[0])} />

        {/* Category pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", justifyContent: "center" }}
        >
          {CATEGORIES.map((cat, i) => (
            <motion.span key={cat}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.32 + i * 0.05, ease }}
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-muted)", background: "var(--bg-elevated)", border: "1px solid var(--border-dim)", padding: "0.18rem 0.55rem", borderRadius: 999, letterSpacing: "0.04em" }}
            >{cat}</motion.span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, ease }}>
          <motion.button
            onClick={handleUpload}
            disabled={!file || loading}
            whileHover={file && !loading ? { y: -2, boxShadow: "0 8px 32px rgba(245,158,11,0.28), 0 0 0 1px rgba(245,158,11,0.4)" } : {}}
            whileTap={file && !loading ? { scale: 0.98, y: 0 } : {}}
            style={{
              width: "100%", padding: "0.9rem 1.5rem",
              background: file && !loading
                ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                : "var(--bg-elevated)",
              color: file && !loading ? "#0d0d0f" : "var(--text-muted)",
              border: `1px solid ${file && !loading ? "transparent" : "var(--border-dim)"}`,
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.92rem",
              cursor: file && !loading ? "pointer" : "not-allowed",
              transition: "background 0.25s, color 0.2s, border-color 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              letterSpacing: "-0.01em",
            }}
          >
            {loading ? (
              <>
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                  style={{ width: 14, height: 14, border: "1.5px solid rgba(13,13,15,0.3)", borderTopColor: "#0d0d0f", borderRadius: "50%", display: "inline-block" }}
                />
                {STAGES[stageIdx].label}
              </>
            ) : "Analyze Waste →"}
          </motion.button>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-dim)", letterSpacing: "0.03em" }}
        >
          This App is meant for Demo Purposes Only
        </motion.p>
      </div>
    </motion.div>
  );
}
