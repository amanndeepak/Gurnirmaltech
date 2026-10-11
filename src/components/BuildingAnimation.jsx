import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Massing modelled on the GurNirmal tower rendering: a wide glass podium,
// a greenery band where the podium roof terrace sits, then a slimmer
// tower above alternating glass floors with planted balcony floors, plus
// a stone service-core fin stepped beside it.
const LEVELS = [
  { type: "glass", bricks: 10 },
  { type: "glass", bricks: 10 },
  { type: "glass", bricks: 10 },
  { type: "terrace", bricks: 10 },
  { type: "glass", bricks: 6 },
  { type: "terrace", bricks: 6 },
  { type: "glass", bricks: 6 },
  { type: "terrace", bricks: 6 },
  { type: "glass", bricks: 6 },
  { type: "terrace", bricks: 6 },
  { type: "glass", bricks: 6 },
];
const TOWER_LEVELS = LEVELS.filter((l) => l.bricks === 6).length;

const BRICK_W = 16;
const BRICK_H = 13;
const GAP = 2;
const BRICK_STEP = 0.035;

const TOWER_W = 6 * BRICK_W + 5 * GAP;
const LEVEL_H = BRICK_H + GAP;
const TOWER_H = TOWER_LEVELS * LEVEL_H;

const COLORS = {
  glass: "#bcdcff",
  terrace: "var(--green-bright)",
};

// Cumulative brick index each level starts at, so the stagger reads as
// one continuous build from the ground up rather than resetting per row.
const START_INDEX = LEVELS.reduce((acc, l, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + LEVELS[i - 1].bricks);
  return acc;
}, []);

const totalBricks = LEVELS.reduce((sum, l) => sum + l.bricks, 0);
const buildDuration = totalBricks * BRICK_STEP;
const finDelay = buildDuration + 0.15;
const roofDelay = finDelay + 0.3;
const signDelay = roofDelay + 0.35;
const CYCLE_MS = (signDelay + 3.4) * 1000;

function Level({ level, startIndex }) {
  return (
    <div style={{ display: "flex", gap: GAP }}>
      {Array.from({ length: level.bricks }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: (startIndex + i) * BRICK_STEP,
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            width: BRICK_W,
            height: BRICK_H,
            borderRadius: 2,
            background: COLORS[level.type],
            boxShadow: level.type === "glass" ? "inset 0 0 0 1px rgba(20,30,40,0.12)" : "none",
          }}
        />
      ))}
    </div>
  );
}

// Builds the tower brick by brick, floor by floor, then caps it with a
// roof, a stone fin and the GurNirmal mark, holds for a moment, and
// resets — an ambient idle animation for anyone who lingers on the hero
// rather than a one-shot reveal.
export default function BuildingAnimation() {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const levels = useMemo(
    () => LEVELS.map((level, i) => ({ ...level, startIndex: START_INDEX[i] })),
    []
  );

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={cycle}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {/* GurNirmal mark, riding on top once the tower is capped */}
          <motion.img
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: signDelay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            src="/images/logo-color.png"
            alt="GurNirmal"
            style={{ height: 15, display: "block", marginBottom: 6 }}
          />

          {/* Roof cap */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.4 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: roofDelay, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: TOWER_W + 8, height: 6, borderRadius: 2, background: "var(--ink)" }}
          />

          {/* Tower + stepped stone fin beside it */}
          <div style={{ position: "relative" }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: finDelay, duration: 0.35 }}
              style={{
                position: "absolute",
                right: -16,
                bottom: 0,
                width: 10,
                height: TOWER_H + 10,
                borderRadius: 2,
                background: "#cdbfa0",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column-reverse", gap: GAP }}>
              {levels
                .filter((l) => l.bricks === 6)
                .map((level, i) => (
                  <Level key={i} level={level} startIndex={level.startIndex} />
                ))}
            </div>
          </div>

          {/* Podium, widest at the base */}
          <div style={{ display: "flex", flexDirection: "column-reverse", gap: GAP, marginTop: GAP }}>
            {levels
              .filter((l) => l.bricks === 10)
              .map((level, i) => (
                <Level key={i} level={level} startIndex={level.startIndex} />
              ))}
          </div>

          {/* Entrance plaque + ground trees */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: START_INDEX[0] * BRICK_STEP + 0.2, duration: 0.3 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
            }}
          >
            <span style={{ fontSize: 8, color: "var(--green-bright)" }}>●</span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "var(--ink-soft)",
                letterSpacing: "0.04em",
              }}
            >
              GurNirmal
            </span>
            <span style={{ fontSize: 8, color: "var(--green-bright)" }}>●</span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
