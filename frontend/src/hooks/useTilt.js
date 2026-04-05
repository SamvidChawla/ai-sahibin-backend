import { useRef, useCallback } from "react";

export function useTilt(maxDeg = 5) {
  const ref = useRef(null);

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * maxDeg}deg) rotateX(${-y * maxDeg}deg) scale3d(1.012,1.012,1.012)`;
    el.style.borderColor = `rgba(245,158,11,${0.1 + Math.abs(x + y) * 0.15})`;
  }, [maxDeg]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
    el.style.borderColor = "";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
