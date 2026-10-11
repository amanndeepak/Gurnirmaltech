import { motion } from "framer-motion";

// A card whose top-right corner lifts and curls back on hover/tap,
// revealing a flat accent-colour "underside" — like peeling back a
// sticker corner. Two identically-sized/positioned triangles: the
// accent underside sits still, the paper-coloured flap on top animates
// away from it to reveal it.
export default function PeelCard({ children, accentColor = "var(--green-bright)", style = {} }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 24, ...style }}>
      {children}

      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 92,
          height: 92,
          background: accentColor,
          clipPath: "polygon(100% 0, 0 0, 100% 100%)",
        }}
      />

      <motion.div
        initial={{ rotate: 0, x: 0, y: 0 }}
        whileHover={{ rotate: -14, x: -7, y: 7 }}
        whileTap={{ rotate: -14, x: -7, y: 7 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 92,
          height: 92,
          background: "var(--card)",
          clipPath: "polygon(100% 0, 0 0, 100% 100%)",
          transformOrigin: "100% 0%",
          boxShadow: "-8px 8px 18px -8px rgba(20, 20, 10, 0.28)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
