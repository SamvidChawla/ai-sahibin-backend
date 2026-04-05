import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import DetectionCard from "./components/DetectionCard";
import InfoCard from "./components/InfoCard";
import CentersList from "./components/CentersList";
import MapView from "./components/MapView";
import { getWasteInfo, getCenters } from "./services/api";
import { useToast } from "./components/Toast";

const ease = [0.16, 1, 0.3, 1];

function getGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error("Geolocation not supported")); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => reject(new Error(e.message || "Location denied"))
    );
  });
}

export default function Result() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { toast } = useToast();
  const detection = location.state;

  const [info,        setInfo]        = useState(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [infoError,   setInfoError]   = useState(null);

  const [coords,      setCoords]      = useState(null);
  const [coordsError, setCoordsError] = useState(null);

  const [centers,         setCenters]         = useState(null);
  const [centersLoading, setCentersLoading] = useState(false);
  const [centersError,   setCentersError]   = useState(null);
  const [centersFallback, setCentersFallback] = useState(false);

  useEffect(() => { if (!detection?.category) navigate("/"); }, [detection, navigate]);

  const fetchInfo = useCallback(async () => {
    if (!detection?.category) return;
    setInfoLoading(true); setInfoError(null);
    try { setInfo(await getWasteInfo(detection.category)); }
    catch (err) {
      setInfoError(err.message || "Failed to load disposal info");
      toast({ type: "warning", message: "Disposal info unavailable." });
    }
    finally { setInfoLoading(false); }
  }, [detection?.category, toast]);

  useEffect(() => { fetchInfo(); }, [fetchInfo]);

  useEffect(() => {
    getGeolocation()
      .then(setCoords)
      .catch((err) => {
        setCoordsError(err.message);
        toast({ type: "warning", message: "Location denied — map and nearby centers unavailable." });
      });
  }, []);

  const fetchCenters = useCallback(async () => {
    if (!coords || !detection?.category) return;
    setCentersLoading(true); setCentersError(null);
    try {
      const res = await getCenters(coords.lat, coords.lng, detection.category);
      setCenters(res.results ?? []);
      setCentersFallback(!!res.is_fallback);
    }
    catch (err) {
      setCentersError(err.message || "Failed to load nearby centers");
      toast({ type: "warning", message: "Nearby centers unavailable." });
    }
    finally { setCentersLoading(false); }
  }, [coords, detection?.category, toast]);

  useEffect(() => { fetchCenters(); }, [fetchCenters]);

  if (!detection?.category) return null;

  const cardAnim = (i) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { delay: i * 0.09, duration: 0.55, ease } },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease } }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
      style={{ minHeight: "100vh", background: "var(--bg-base)", position: "relative" }}
    >
      <div className="dot-grid" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
      {/* Ambient glow top-right */}
      <div style={{
        position: "fixed", top: -160, right: -160, width: 520, height: 520, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)",
        filter: "blur(50px)", pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 30,
        background: "rgba(13,13,15,0.78)", backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-dim)",
      }}>
        {/* FIX 1: Responsive padding in header */}
        <div className="max-w-[1160px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6, fontSize: "0.85rem",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>♻</div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>SahiBin</span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.56rem", color: "var(--accent-text)",
              background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
              padding: "0.1rem 0.35rem", borderRadius: 3, letterSpacing: "0.1em",
              alignSelf: "center",
            }}>AI</span>
          </div>

          {/* FIX 2: Responsive gap and hiding "Demo Mode" on tiny mobile screens */}
          <div className="flex items-center gap-2 md:gap-3">
            {detection.is_fallback && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="hidden sm:flex" // Hides on screens smaller than 640px
                style={{
                  alignItems: "center", gap: "0.4rem",
                  fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--accent-text)",
                  background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
                  padding: "0.25rem 0.65rem", borderRadius: 999,
                }}
              >
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }}
                />
                Demo mode
              </motion.div>
            )}
            <motion.button onClick={() => navigate("/")} whileHover={{ borderColor: "var(--border-mid)" }} whileTap={{ scale: 0.97 }}
              style={{
                background: "transparent", border: "1px solid var(--border-dim)", color: "var(--text-muted)",
                fontFamily: "var(--font-mono)", fontSize: "0.7rem", padding: "0.35rem 0.875rem",
                borderRadius: "var(--radius-sm)", cursor: "pointer", letterSpacing: "0.02em",
                transition: "border-color 0.2s, color 0.2s",
                whiteSpace: "nowrap"
              }}
            >← New scan</motion.button>
          </div>
        </div>
      </header>

      {/* ── Dashboard ── */}
      {/* FIX 3: Replaced inline grid styles & the <style> hack with Tailwind responsive grid classes */}
      <main className="relative z-10 max-w-[1160px] mx-auto px-4 md:px-6 py-5 md:py-6 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        
        <motion.div {...cardAnim(0)}>
          <DetectionCard data={detection} imagePreview={detection.imagePreview} />
        </motion.div>
        
        <motion.div {...cardAnim(1)}>
          <InfoCard info={info} loading={infoLoading} error={infoError} onRetry={fetchInfo} />
        </motion.div>
        
        <motion.div {...cardAnim(2)}>
          <CentersList centers={centers} loading={centersLoading} error={centersError || coordsError}
            isFallback={centersFallback} onRetry={coords ? fetchCenters : null} />
        </motion.div>
        
        <motion.div {...cardAnim(3)}>
          <MapView userLocation={coords} centers={centers ?? []} locationError={coordsError} />
        </motion.div>
      
      </main>
    </motion.div>
  );
}