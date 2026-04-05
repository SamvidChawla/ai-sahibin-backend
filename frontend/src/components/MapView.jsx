import { motion } from "framer-motion";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

const MAP_STYLES = [
  { elementType: "geometry",                stylers: [{ color: "#13131a" }] },
  { elementType: "labels.text.stroke",      stylers: [{ color: "#13131a" }] },
  { elementType: "labels.text.fill",        stylers: [{ color: "#3d3d50" }] },
  { featureType: "road", elementType: "geometry",         stylers: [{ color: "#1e1e2a" }] },
  { featureType: "road", elementType: "geometry.stroke",  stylers: [{ color: "#111118" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#3d3d50" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#252535" }] },
  { featureType: "water", elementType: "geometry",        stylers: [{ color: "#0a0a12" }] },
  { featureType: "water", elementType: "labels.text.fill",stylers: [{ color: "#15151f" }] },
  { featureType: "poi",   elementType: "geometry",        stylers: [{ color: "#111118" }] },
  { featureType: "poi.park", elementType: "geometry",     stylers: [{ color: "#111118" }] },
  { featureType: "transit", elementType: "geometry",      stylers: [{ color: "#16161f" }] },
  { elementType: "labels.icon",            stylers: [{ visibility: "off" }] },
];

export default function MapView({ userLocation, centers, locationError }) {
  const apiKey    = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapCenter = userLocation ?? DEFAULT_CENTER;

  // FIX: Replaced <LoadScript> with useJsApiLoader hook
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || "", // Fallback to empty string to prevent hook crash
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="card"
      style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* Card header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1.125rem 1.5rem",
        borderBottom: "1px solid var(--border-dim)",
        background: "var(--bg-elevated)",
      }}>
        <p className="eyebrow">map view</p>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-dim)" }}>
          {userLocation ? (
            `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
          ) : locationError ? (
            <span style={{ color: "var(--red)" }}>Location unavailable</span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <motion.span animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.2, repeat: Infinity }}
                style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
              Acquiring…
            </span>
          )}
        </span>
      </div>

      {/* Map body */}
      <div style={{ height: 276, background: "var(--bg-base)", position: "relative" }}>
        {locationError ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.625rem" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--red-dim)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", color: "var(--red)" }}>✕</div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" }}>Location access denied</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-dim)", textAlign: "center", maxWidth: 200 }}>Enable location in browser settings and refresh</p>
          </div>
        ) : !apiKey ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)" }}>Map unavailable</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-dim)" }}>Set VITE_GOOGLE_MAPS_API_KEY</p>
          </div>
        ) : loadError ? (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--red)" }}>Failed to load map scripts</p>
          </div>
        ) : !isLoaded ? (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <motion.span animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.2, repeat: Infinity }}
                style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-dim)", display: "inline-block" }} />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={mapCenter}
            zoom={12}
            options={{ styles: MAP_STYLES, zoomControl: true, mapTypeControl: false, streetViewControl: false, fullscreenControl: false }}
          >
            {userLocation && (
              <Marker position={{ lat: userLocation.lat, lng: userLocation.lng }}
                label={{ text: "You", color: "#f1f0ee", fontSize: "10px", fontWeight: "600" }} />
            )}
            {centers.map((c, i) =>
              c.lat && c.lng ? (
                <Marker key={c.id || i} position={{ lat: c.lat, lng: c.lng }} title={c.name} />
              ) : null
            )}
          </GoogleMap>
        )}
      </div>
    </motion.div>
  );
}