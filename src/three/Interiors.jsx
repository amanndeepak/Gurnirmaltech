import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

/* Walk-in rooms for every signed building. Built from simple shapes so they load instantly. */

const FONT = "/fonts/PlusJakartaSans-ExtraBold.ttf";
export const EKDIARY_URL = "https://ekdiary.com";

const openEkDiary = (e) => {
  e.stopPropagation();
  window.open(EKDIARY_URL, "_blank", "noopener");
};
const W = 14; // room width/depth
const H = 4.2; // ceiling height
const HALF = W / 2;

export const INTERIOR_INFO = {
  Hospital: "Reception, wards and care around the clock.",
  Bank: "Tellers, ATMs and a secure vault.",
  "IT Office": "Open-plan desks, meeting rooms and focus zones.",
  "Data Center": "Server racks, cooling aisles and live monitoring.",
  "AI Lab": "Model training, robotics and research screens.",
  School: "Bright classrooms built for learning.",
  Hotel: "A lobby with reception, lounges and lifts.",
  Mall: "Shops, a fountain court and escalators.",
  "Startup Hub": "Hot desks, games and a demo stage.",
  Pharmacy: "Medicines, wellness shelves and a counter.",
  "Co-Working": "Shared tables, phone booths and a coffee bar.",
  "Food Court": "Food stalls and plenty of seating.",
  "R&D Center": "Lab benches, fume hoods and prototypes.",
  "Fitness Club": "Treadmills, free weights and a mirror wall.",
  Residences: "A lived-in apartment: lounge, dining and kitchen.",
  "Expo Center": "Exhibition booths, podiums and a main screen.",
  "EK Diary": "Our AI journaling companion — capture your days and reflect with AI.",
  Court: "The courtroom: judge's bench, witness box and public gallery.",
  "Police Station": "Front desk, officers' bay and holding cells.",
  "Fire Station": "Engine bay, turnout gear and the fire pole.",
  "Post Office": "Counters, PO boxes and parcels on the move.",
  Library: "Tall shelves, reading tables and quiet corners.",
  Museum: "Glass cases, paintings and a statue gallery.",
  Cinema: "Big screen, tiered seats and the projector booth.",
  "Metro Station": "Platform, train, turnstiles and the route map.",
  "Town Hall": "Council chamber with podium, seating and flags.",
};

/* ---------- primitives ---------- */
function Box({ p, s, c, r = 0, rough = 0.6, metal = 0, e, ei = 1, opacity }) {
  return (
    <mesh position={p} rotation={[0, r, 0]}>
      <boxGeometry args={s} />
      <meshStandardMaterial
        color={c}
        roughness={rough}
        metalness={Math.min(metal, 0.45)}
        emissive={e || "#000000"}
        emissiveIntensity={e ? ei : 0}
        transparent={opacity !== undefined}
        opacity={opacity ?? 1}
      />
    </mesh>
  );
}

function Cyl({ p, r1, r2 = r1, h, c, rot = [0, 0, 0], seg = 24, rough = 0.5, metal = 0, e, opacity }) {
  return (
    <mesh position={p} rotation={rot}>
      <cylinderGeometry args={[r1, r2, h, seg]} />
      <meshStandardMaterial
        color={c}
        roughness={rough}
        metalness={Math.min(metal, 0.45)}
        emissive={e || "#000000"}
        emissiveIntensity={e ? 1 : 0}
        transparent={opacity !== undefined}
        opacity={opacity ?? 1}
      />
    </mesh>
  );
}

function Ball({ p, r, c, e, scale = [1, 1, 1] }) {
  return (
    <mesh position={p} scale={scale}>
      <sphereGeometry args={[r, 24, 16]} />
      <meshStandardMaterial color={c} roughness={0.5} emissive={e || "#000000"} emissiveIntensity={e ? 1 : 0} />
    </mesh>
  );
}

function Label({ p, r = 0, size = 0.3, color = "#16241a", children, maxWidth }) {
  return (
    <Text
      font={FONT}
      position={p}
      rotation={[0, r, 0]}
      fontSize={size}
      color={color}
      anchorX="center"
      anchorY="middle"
      maxWidth={maxWidth}
      textAlign="center"
    >
      {children}
    </Text>
  );
}

/* wall-mounted label: side is "back" (-z), "front" (+z), "left" (-x), "right" (+x) */
const WALL = {
  back: (x, y) => ({ p: [x, y, -HALF + 0.1], r: 0 }),
  front: (x, y) => ({ p: [x, y, HALF - 0.1], r: Math.PI }),
  left: (z, y) => ({ p: [-HALF + 0.1, y, z], r: Math.PI / 2 }),
  right: (z, y) => ({ p: [HALF - 0.1, y, z], r: -Math.PI / 2 }),
};

function Plant({ p, s = 1 }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 0.22, 0]} r1={0.2} r2={0.16} h={0.44} c="#d8cfbf" />
      <Ball p={[0, 0.7, 0]} r={0.34} c="#4f8a2a" />
      <Ball p={[0.15, 0.95, 0.05]} r={0.22} c="#6fa82a" />
    </group>
  );
}

function Chair({ p, r = 0, c = "#2f3a33" }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Box p={[0, 0.45, 0]} s={[0.45, 0.06, 0.45]} c={c} />
      <Box p={[0, 0.75, -0.2]} s={[0.45, 0.55, 0.06]} c={c} />
      <Cyl p={[0, 0.22, 0]} r1={0.03} h={0.44} c="#9aa29c" metal={0.6} />
    </group>
  );
}

function Desk({ p, r = 0, top = "#e8dcc6", monitor = true, chair = true }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Box p={[0, 0.74, 0]} s={[1.4, 0.05, 0.7]} c={top} />
      {[-0.65, 0.65].map((x) => (
        <Box key={x} p={[x, 0.37, 0]} s={[0.05, 0.74, 0.65]} c="#bfb6a5" />
      ))}
      {monitor && (
        <group position={[0, 0.77, -0.18]}>
          <Box p={[0, 0.3, 0]} s={[0.62, 0.38, 0.03]} c="#1a1f1c" e="#3f6fb5" ei={0.6} />
          <Box p={[0, 0.06, 0]} s={[0.06, 0.12, 0.06]} c="#2a2f2c" />
          <Box p={[0, 0.01, 0.3]} s={[0.45, 0.02, 0.15]} c="#2a2f2c" />
        </group>
      )}
      {chair && <Chair p={[0, 0, 0.55]} r={Math.PI} />}
    </group>
  );
}

function Sofa({ p, r = 0, c = "#5a6b5c", w = 2 }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Box p={[0, 0.25, 0]} s={[w, 0.5, 0.9]} c={c} rough={0.9} />
      <Box p={[0, 0.65, -0.35]} s={[w, 0.6, 0.2]} c={c} rough={0.9} />
      <Box p={[-w / 2, 0.45, 0]} s={[0.18, 0.4, 0.9]} c={c} rough={0.9} />
      <Box p={[w / 2, 0.45, 0]} s={[0.18, 0.4, 0.9]} c={c} rough={0.9} />
    </group>
  );
}

function RoundTable({ p, c = "#e8dcc6", stools = 4, stoolColor = "#2f3a33" }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.74, 0]} r1={0.5} h={0.05} c={c} />
      <Cyl p={[0, 0.37, 0]} r1={0.05} h={0.74} c="#9aa29c" metal={0.5} />
      {Array.from({ length: stools }, (_, i) => {
        const a = (i / stools) * Math.PI * 2;
        return <Cyl key={i} p={[Math.sin(a) * 0.8, 0.45, Math.cos(a) * 0.8]} r1={0.18} h={0.06} c={stoolColor} />;
      })}
    </group>
  );
}

/* ---------- room shell ---------- */
function Room({ floor, wall, accent = "#86bc25", title, titleColor = "#16241a", windows = true, art = true, dark = false, children }) {
  const panels = useMemo(() => {
    const list = [];
    for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) list.push([x * 4, z * 4]);
    return list;
  }, []);

  return (
    <group>
      <hemisphereLight args={[dark ? "#9fb3c8" : "#ffffff", dark ? "#1a1f1c" : "#cfc6b4", dark ? 0.6 : 1.4]} />
      <pointLight position={[0, H - 0.4, 0]} intensity={dark ? 6 : 18} distance={16} decay={1.6} />
      <pointLight position={[-4, H - 0.4, -4]} intensity={dark ? 4 : 10} distance={10} decay={1.6} />
      <pointLight position={[4, H - 0.4, 4]} intensity={dark ? 4 : 10} distance={10} decay={1.6} />

      {/* floor, ceiling, walls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, W]} />
        <meshStandardMaterial color={floor} roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, W]} />
        <meshStandardMaterial
          color={dark ? "#1d2420" : "#f7f5f0"}
          emissive={dark ? "#000000" : "#f7f5f0"}
          emissiveIntensity={dark ? 0 : 0.45}
          roughness={0.9}
        />
      </mesh>
      {[
        [0, -HALF, 0],
        [0, HALF, Math.PI],
        [-HALF, 0, Math.PI / 2],
        [HALF, 0, -Math.PI / 2],
      ].map(([x, z, r], i) => (
        <mesh key={i} position={[x, H / 2, z]} rotation={[0, r, 0]}>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial color={wall} roughness={0.85} />
        </mesh>
      ))}

      {/* skirting + accent stripe */}
      {[
        [0, -HALF + 0.02, 0, W],
        [0, HALF - 0.02, 0, W],
        [-HALF + 0.02, 0, Math.PI / 2, W],
        [HALF - 0.02, 0, Math.PI / 2, W],
      ].map(([x, z, r, len], i) => (
        <group key={i}>
          <Box p={[x, 0.06, z]} s={[len, 0.12, 0.04]} r={r} c={dark ? "#2a302c" : "#e2dccd"} />
          <Box p={[x, 2.55, z]} s={[len, 0.06, 0.04]} r={r} c={accent} />
        </group>
      ))}

      {/* ceiling light panels */}
      {panels.map(([x, z]) => (
        <Box key={`${x}${z}`} p={[x, H - 0.03, z]} s={[1.6, 0.04, 0.6]} c="#ffffff" e="#ffffff" ei={dark ? 0.4 : 1} />
      ))}

      {/* windows on the side walls */}
      {windows &&
        [-1, 1].map((side) =>
          [-4, 0, 4].map((z) => (
            <group key={`${side}${z}`} position={[side * (HALF - 0.04), 1.9, z]} rotation={[0, -side * (Math.PI / 2), 0]}>
              <Box p={[0, 0, 0]} s={[2.6, 1.6, 0.02]} c="#cfe6f2" e="#bfe0f0" ei={0.6} />
              <Box p={[0, 0, 0.02]} s={[0.05, 1.6, 0.03]} c="#f2efe6" />
              <Box p={[0, 0, 0.02]} s={[2.6, 0.05, 0.03]} c="#f2efe6" />
            </group>
          ))
        )}

      {/* framed art on the wall behind the starting view */}
      {art &&
        [-4.2, 4.2].map((x, i) => (
          <group key={x} position={[x, 1.9, HALF - 0.05]} rotation={[0, Math.PI, 0]}>
            <Box p={[0, 0, 0]} s={[1.5, 1.1, 0.05]} c="#3a3226" />
            <Box p={[0, 0, -0.03]} s={[1.32, 0.92, 0.02]} c={i ? "#a9c7a0" : "#e3c9a0"} />
            <Ball p={[i ? 0.25 : -0.2, 0.05, -0.05]} r={0.22} c={accent} scale={[1, 1, 0.1]} />
            <Box p={[0, -0.25, -0.05]} s={[1.1, 0.12, 0.01]} c={i ? "#5b7f52" : "#b9894f"} />
          </group>
        ))}

      {title && <Label {...WALL.back(0, 3.6)} size={0.5} color={titleColor}>{title}</Label>}
      {children}
    </group>
  );
}

/* ---------- rooms ---------- */
function Hospital() {
  return (
    <Room floor="#e6f0ea" wall="#f8faf8" accent="#2f8f5b" title="Hospital" titleColor="#d64545">
      {/* red cross */}
      <Box p={[-3.2, 3.25, -HALF + 0.08]} s={[0.6, 0.18, 0.04]} c="#d64545" />
      <Box p={[-3.2, 3.25, -HALF + 0.08]} s={[0.18, 0.6, 0.04]} c="#d64545" />
      <Box p={[3.2, 3.25, -HALF + 0.08]} s={[0.6, 0.18, 0.04]} c="#d64545" />
      <Box p={[3.2, 3.25, -HALF + 0.08]} s={[0.18, 0.6, 0.04]} c="#d64545" />
      {/* reception */}
      <Box p={[0, 0.55, -4.6]} s={[4, 1.1, 0.7]} c="#ffffff" />
      <Box p={[0, 1.12, -4.6]} s={[4.1, 0.05, 0.8]} c="#2f8f5b" />
      <Desk p={[-1, 0, -5.4]} monitor chair={false} top="#ffffff" />
      <Desk p={[1, 0, -5.4]} monitor chair={false} top="#ffffff" />
      {/* ward beds on the left */}
      {[-4.5, -1.5, 1.5, 4.5].map((z) => (
        <group key={z} position={[-5.4, 0, z]}>
          <Box p={[0, 0.45, 0]} s={[2, 0.12, 0.95]} c="#d9dfe0" metal={0.4} />
          <Box p={[0, 0.58, 0]} s={[1.95, 0.14, 0.9]} c="#ffffff" />
          <Box p={[0.35, 0.67, 0]} s={[1.1, 0.04, 0.92]} c="#7fb3d5" />
          <Box p={[-0.78, 0.7, 0]} s={[0.35, 0.1, 0.6]} c="#ffffff" />
          <Box p={[-1, 0.75, 0]} s={[0.05, 0.6, 0.95]} c="#c9d0d2" metal={0.5} />
          {[-0.4, 0.4].map((zz) => (
            <Box key={zz} p={[0, 0.22, zz]} s={[1.9, 0.04, 0.04]} c="#9aa29c" />
          ))}
          <Cyl p={[0.2, 1, 0.75]} r1={0.015} h={2} c="#c9d0d2" metal={0.6} />
          <Box p={[0.2, 1.8, 0.75]} s={[0.15, 0.25, 0.05]} c="#e8f6ff" opacity={0.85} />
          <Box p={[0.6, 1.4, 0.7]} s={[1.6, 2.4, 0.02]} c="#bfe3d0" opacity={0.6} />
        </group>
      ))}
      {/* waiting chairs on the right */}
      {[-3, -1.2, 0.6, 2.4].map((z) =>
        [5, 4.3].map((x) => <Chair key={`${x}${z}`} p={[x, 0, z]} r={-Math.PI / 2} c="#2a4d6e" />)
      )}
      <Plant p={[5.6, 0, 5.6]} />
      <Plant p={[-5.6, 0, 6]} />
      <Label {...WALL.right(0, 3.1)} size={0.32} color="#2f8f5b">Emergency · OPD · Pharmacy</Label>
    </Room>
  );
}

function Bank() {
  return (
    <Room floor="#e9e6df" wall="#f4efe6" accent="#c9a24a" title="Bank" titleColor="#1d3557" windows={false}>
      {/* teller counter with glass and windows */}
      <Box p={[0, 0.55, -4.4]} s={[10, 1.1, 0.8]} c="#6b4a33" rough={0.4} />
      <Box p={[0, 1.13, -4.4]} s={[10.1, 0.06, 0.9]} c="#e9e6df" rough={0.2} />
      <Box p={[0, 1.8, -4.1]} s={[10, 1.3, 0.03]} c="#cfe6f2" opacity={0.35} rough={0.05} />
      {[-3.75, -1.25, 1.25, 3.75].map((x, i) => (
        <group key={x}>
          <Box p={[x, 2.55, -4.1]} s={[1.6, 0.25, 0.05]} c="#1d3557" />
          <Label p={[x, 2.55, -4.06]} size={0.13} color="#f1d18a">{`Counter ${i + 1}`}</Label>
          <Desk p={[x, 0, -5.3]} chair={false} top="#8a6447" />
          <Chair p={[x, 0, -5.9]} c="#1d3557" />
        </group>
      ))}
      {/* vault door on the left wall */}
      <Box p={[-HALF + 0.08, 1.7, 0]} s={[0.1, 3.2, 3.2]} c="#6e767b" />
      <group position={[-HALF + 0.25, 1.7, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <Cyl p={[0, 0, 0]} r1={1.35} h={0.3} c="#c9ced3" metal={0.9} rough={0.35} seg={48} />
        <Cyl p={[0, 0.17, 0]} r1={1.05} h={0.08} c="#8d959a" metal={0.9} rough={0.4} seg={48} />
        <Cyl p={[0, 0.3, 0]} r1={0.18} h={0.2} c="#d4af37" metal={1} rough={0.2} />
        {[0, 1, 2].map((i) => (
          <Box key={i} p={[0, 0.32, 0]} s={[1.1, 0.06, 0.06]} r={(i * Math.PI) / 3} c="#d4af37" metal={1} rough={0.2} />
        ))}
      </group>
      <Label {...WALL.left(0, 3.65)} size={0.3} color="#1d3557">Secure Vault</Label>
      {/* ATMs on the right wall */}
      {[-2.4, 0, 2.4].map((z) => (
        <group key={z} position={[HALF - 0.45, 0, z]} rotation={[0, -Math.PI / 2, 0]}>
          <Box p={[0, 0.9, 0]} s={[0.9, 1.8, 0.6]} c="#1d3557" />
          <Box p={[0, 1.25, 0.31]} s={[0.55, 0.4, 0.02]} c="#0d1b2a" e="#4fa3ff" ei={0.8} />
          <Box p={[0, 0.85, 0.32]} s={[0.4, 0.2, 0.04]} c="#c9ced3" />
          <Label p={[0, 1.65, 0.31]} size={0.12} color="#f1d18a">ATM</Label>
        </group>
      ))}
      {/* queue posts */}
      {[-2, -0.7, 0.6, 1.9].map((x) => (
        <group key={x}>
          <Cyl p={[x, 0.5, -3.1]} r1={0.04} h={1} c="#d4af37" metal={1} rough={0.2} />
          <Cyl p={[x, 0.02, -3.1]} r1={0.16} h={0.04} c="#d4af37" metal={1} rough={0.2} />
        </group>
      ))}
      {[-1.35, -0.05, 1.25].map((x) => (
        <Box key={x} p={[x, 0.85, -3.1]} s={[1.2, 0.05, 0.05]} c="#b23a3a" />
      ))}
      <Sofa p={[0, 0, 4.6]} r={Math.PI} c="#1d3557" w={3} />
      <Box p={[0, 0.25, 3.4]} s={[1.4, 0.06, 0.7]} c="#6b4a33" />
      <Plant p={[-5.8, 0, 5.8]} />
      <Plant p={[5.8, 0, 5.8]} />
    </Room>
  );
}

function ITOffice({ title = "IT Office" }) {
  const desks = [];
  for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) desks.push([-4.5 + col * 3, -2.5 + row * 2.6]);
  return (
    <Room floor="#dedbd3" wall="#f6f4ee" title={title} titleColor="#1f3d14">
      {desks.map(([x, z]) => (
        <Desk key={`${x}${z}`} p={[x, 0, z]} />
      ))}
      {/* whiteboard */}
      <Box p={[0, 1.7, -HALF + 0.05]} s={[4.5, 1.6, 0.04]} c="#ffffff" />
      <Label {...WALL.back(0, 1.95)} size={0.2} color="#2c5a1a">Sprint 42 · Ship it</Label>
      <Label {...WALL.back(0, 1.55)} size={0.14} color="#7c8c7c">API done · UI done · Tests next</Label>
      {/* glass meeting room in the corner */}
      <group position={[4.6, 0, 4.6]}>
        <Box p={[-1.6, 1.3, 0]} s={[0.04, 2.6, 3.2]} c="#cfe6f2" opacity={0.3} />
        <Box p={[0, 1.3, -1.6]} s={[3.2, 2.6, 0.04]} c="#cfe6f2" opacity={0.3} />
        <Box p={[0, 0.74, 0]} s={[1.8, 0.05, 0.9]} c="#6b4a33" />
        {[-0.6, 0.6].map((x) => [-0.8, 0.8].map((z) => <Chair key={`${x}${z}`} p={[x, 0, z]} r={z > 0 ? Math.PI : 0} />))}
      </group>
      <Plant p={[-5.8, 0, 5.8]} />
      <Plant p={[-5.8, 0, -5.8]} />
      <Plant p={[5.8, 0, -5.8]} />
    </Room>
  );
}

function Blinkers({ count, area }) {
  const refs = useRef([]);
  const leds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        p: area(i),
        speed: 1 + ((i * 37) % 10) / 3,
        phase: (i * 1.7) % 6,
        color: i % 3 === 0 ? "#4fa3ff" : "#86ff5a",
      })),
    [count, area]
  );
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (m) m.visible = Math.sin(t * leds[i].speed + leds[i].phase) > -0.2;
    });
  });
  return leds.map((l, i) => (
    <mesh key={i} position={l.p} ref={(el) => (refs.current[i] = el)}>
      <boxGeometry args={[0.05, 0.03, 0.01]} />
      <meshBasicMaterial color={l.color} />
    </mesh>
  ));
}

const RACKS = [-4.5, -1.5, 1.5, 4.5].flatMap((x) => [-4, -2.6, -1.2, 1.2, 2.6, 4].map((z) => [x, z]));

/* LED position on a rack face for blinker i */
function rackLed(i) {
  const [x, z] = RACKS[i % RACKS.length];
  const level = Math.floor(i / RACKS.length);
  const side = x < 0 ? 0.36 : -0.36;
  return [x + side, 0.35 + level * 0.32, z + ((i * 13) % 5) * 0.1 - 0.2];
}

function DataCenter() {
  const racks = RACKS;
  const area = rackLed;
  return (
    <Room floor="#3a3f3c" wall="#2a302c" accent="#4fa3ff" title="Data Center" titleColor="#a4d94a" windows={false} art={false} dark>
      {racks.map(([x, z]) => (
        <group key={`${x}${z}`}>
          <Box p={[x, 1.1, z]} s={[0.7, 2.2, 1.2]} c="#14181a" metal={0.4} rough={0.4} />
          <Box p={[x + (x < 0 ? 0.36 : -0.36), 1.1, z]} s={[0.01, 2.1, 1.1]} c="#1f2629" metal={0.6} />
        </group>
      ))}
      <Blinkers count={racks.length * 6} area={area} />
      {/* cold aisle glow + cable trays */}
      {[-3, 0, 3].map((x) => (
        <Box key={x} p={[x, 0.01, 0]} s={[1.1, 0.01, 10]} c="#1b2a3a" e="#2e6cff" ei={0.12} />
      ))}
      {[-4.5, -1.5, 1.5, 4.5].map((x) => (
        <Box key={x} p={[x, 3.2, 0]} s={[0.4, 0.06, 11]} c="#f2c14e" metal={0.5} />
      ))}
      <Box p={[0, 1.7, HALF - 0.05]} s={[5, 2, 0.04]} c="#0d1b2a" e="#123a6b" ei={0.8} />
      <Label {...WALL.front(0, 2.2)} size={0.26} color="#86ff5a">Uptime 99.99%</Label>
      <Label {...WALL.front(0, 1.6)} size={0.18} color="#9fc6ff">PUE 1.2 · 48 racks online</Label>
    </Room>
  );
}

function Spinner({ children, speed = 0.4, axis = "y", ...props }) {
  const ref = useRef();
  useFrame((_, dt) => {
    ref.current.rotation[axis] += dt * speed;
  });
  return (
    <group ref={ref} {...props}>
      {children}
    </group>
  );
}

function AILab() {
  return (
    <Room floor="#eef0ec" wall="#f9faf7" accent="#5b9c1f" title="AI Lab" titleColor="#2c5a1a">
      {/* holographic core */}
      <Cyl p={[3.6, 0.3, -3.2]} r1={0.7} r2={0.8} h={0.6} c="#e3e7e2" />
      <Spinner position={[3.6, 1.6, -3.2]} speed={0.5}>
        <mesh>
          <icosahedronGeometry args={[0.7, 1]} />
          <meshBasicMaterial color="#86bc25" wireframe />
        </mesh>
        <Ball p={[0, 0, 0]} r={0.3} c="#a4d94a" e="#86bc25" />
      </Spinner>
      {/* research screen */}
      <Box p={[0, 1.9, -HALF + 0.05]} s={[6, 2.2, 0.04]} c="#0f1a12" e="#0f1a12" />
      <Label {...WALL.back(0, 2.5)} size={0.24} color="#a4d94a">Training run · epoch 128</Label>
      <Label {...WALL.back(0, 2)} size={0.18} color="#cfe6c0">accuracy 97.4% · loss 0.031</Label>
      {Array.from({ length: 12 }, (_, i) => (
        <Box key={i} p={[-2.4 + i * 0.44, 1.2 + Math.sin(i * 0.9) * 0.25, -HALF + 0.08]} s={[0.3, 0.3 + (i % 4) * 0.1, 0.02]} c="#86bc25" e="#86bc25" ei={0.6} />
      ))}
      {/* workstations */}
      {[-4.5, 4.5].map((x) => [0, 2.6].map((z) => <Desk key={`${x}${z}`} p={[x, 0, z]} r={x < 0 ? Math.PI / 2 : -Math.PI / 2} />))}
      {/* robot arm */}
      <group position={[0, 0, 3]}>
        <Box p={[0, 0.4, 0]} s={[1.6, 0.8, 1]} c="#d9dcd7" />
        <Cyl p={[0, 0.95, 0]} r1={0.22} h={0.3} c="#f2c14e" />
        <Spinner position={[0, 1.1, 0]} speed={0.6}>
          <Cyl p={[0.3, 0.4, 0]} r1={0.08} h={0.9} c="#f2c14e" rot={[0, 0, -0.6]} />
          <Cyl p={[0.75, 0.75, 0]} r1={0.06} h={0.6} c="#2f3a33" rot={[0, 0, 0.9]} />
          <Ball p={[1, 0.6, 0]} r={0.09} c="#86bc25" e="#5b9c1f" />
        </Spinner>
      </group>
      <Plant p={[5.8, 0, -5.8]} />
      <Plant p={[-5.8, 0, -5.8]} />
    </Room>
  );
}

function School() {
  const desks = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) desks.push([-4 + c * 2, -1 + r * 1.7]);
  return (
    <Room floor="#d9c7a8" wall="#fbf3df" accent="#f2c14e" title="School" titleColor="#2c5a1a">
      <Box p={[0, 1.7, -HALF + 0.05]} s={[6, 1.8, 0.05]} c="#2f5a3a" />
      <Box p={[0, 0.78, -HALF + 0.12]} s={[6, 0.06, 0.15]} c="#8a6447" />
      <Label {...WALL.back(-1.5, 2)} size={0.32} color="#ffffff">ABC</Label>
      <Label {...WALL.back(1.5, 2)} size={0.32} color="#ffffff">1 + 2 = 3</Label>
      <Label {...WALL.back(0, 1.3)} size={0.18} color="#f2c14e">Welcome back, class!</Label>
      {/* teacher desk + globe */}
      <Box p={[3.5, 0.4, -4.6]} s={[1.6, 0.8, 0.8]} c="#8a6447" />
      <Cyl p={[3.9, 0.95, -4.6]} r1={0.03} h={0.3} c="#8a6447" />
      <Ball p={[3.9, 1.22, -4.6]} r={0.2} c="#3f87c6" />
      {desks.map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0, z]}>
          <Box p={[0, 0.65, 0]} s={[0.9, 0.04, 0.55]} c="#e0c79a" />
          {[-0.4, 0.4].map((dx) => (
            <Box key={dx} p={[dx, 0.32, 0]} s={[0.04, 0.64, 0.5]} c="#3d7a17" />
          ))}
          <Chair p={[0, 0, 0.5]} r={Math.PI} c="#f2c14e" />
        </group>
      ))}
      {/* bookshelves */}
      {[-3, 0, 3].map((z) => (
        <group key={z} position={[HALF - 0.3, 0, z]}>
          <Box p={[0, 1, 0]} s={[0.5, 2, 2.2]} c="#8a6447" />
          {[0.4, 0.95, 1.5].map((y) =>
            Array.from({ length: 9 }, (_, i) => (
              <Box key={`${y}${i}`} p={[-0.05, y + 0.18, -0.95 + i * 0.23]} s={[0.35, 0.34, 0.16]} c={["#d64545", "#3f87c6", "#f2c14e", "#5b9c1f"][(i + y * 10) % 4 | 0]} />
            ))
          )}
        </group>
      ))}
      <Plant p={[-5.8, 0, 5.8]} />
    </Room>
  );
}

function Hotel() {
  return (
    <Room floor="#efe6d6" wall="#f6efe3" accent="#b08a4a" title="Hotel" titleColor="#5a3e6b">
      {/* reception with backlit wall */}
      <Box p={[0, 1.6, -HALF + 0.05]} s={[6, 2.6, 0.05]} c="#5a3e6b" e="#3a2547" ei={0.4} />
      <Box p={[0, 0.55, -4.8]} s={[4.5, 1.1, 0.8]} c="#2a1f2f" rough={0.3} />
      <Box p={[0, 1.13, -4.8]} s={[4.6, 0.06, 0.9]} c="#d4af37" metal={0.9} rough={0.2} />
      <Label {...WALL.back(0, 2.4)} size={0.24} color="#f1d18a">Welcome · Reception</Label>
      {/* chandelier */}
      <Spinner position={[0, 3.3, 0]} speed={0.15}>
        <Cyl p={[0, 0.45, 0]} r1={0.02} h={0.9} c="#d4af37" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <Ball key={i} p={[Math.sin(a) * 0.9, 0, Math.cos(a) * 0.9]} r={0.09} c="#fff6d8" e="#ffe6a3" />;
        })}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.9, 0.02, 8, 48]} />
          <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
        </mesh>
      </Spinner>
      <pointLight position={[0, 3, 0]} color="#ffd98a" intensity={8} distance={8} />
      {/* lounge */}
      <Sofa p={[-3.5, 0, 1]} r={Math.PI / 2} c="#7a5c8a" w={2.4} />
      <Sofa p={[3.5, 0, 1]} r={-Math.PI / 2} c="#7a5c8a" w={2.4} />
      <Box p={[0, 0.25, 1]} s={[1.6, 0.06, 0.9]} c="#2a1f2f" />
      <Box p={[0, 0.01, 1]} s={[5, 0.02, 3.4]} c="#d9c7a8" />
      {/* lifts */}
      {[-1.6, 1.6].map((x) => (
        <group key={x}>
          <Box p={[x, 1.2, HALF - 0.06]} s={[1.3, 2.4, 0.05]} c="#b8bec2" metal={0.9} rough={0.25} />
          <Box p={[x, 1.2, HALF - 0.09]} s={[0.02, 2.4, 0.02]} c="#6e767b" />
        </group>
      ))}
      <Label {...WALL.front(0, 2.8)} size={0.2} color="#5a3e6b">Lifts</Label>
      {/* luggage cart */}
      <group position={[4.5, 0, -3]}>
        <Box p={[0, 0.15, 0]} s={[1, 0.05, 0.6]} c="#d4af37" metal={1} />
        <Box p={[0, 0.45, 0]} s={[0.5, 0.5, 0.3]} c="#3f87c6" />
        <Box p={[0.1, 0.85, 0]} s={[0.4, 0.3, 0.25]} c="#d64545" />
      </group>
      <Plant p={[-5.8, 0, -5.8]} s={1.3} />
      <Plant p={[5.8, 0, -5.8]} s={1.3} />
    </Room>
  );
}

function Mall() {
  const shops = [
    ["Fashion", "#d64545"],
    ["Shoes", "#3f87c6"],
    ["Books", "#5b9c1f"],
    ["Café", "#b08a4a"],
    ["Toys", "#f2c14e"],
    ["Tech", "#2f3a33"],
  ];
  return (
    <Room floor="#efece6" wall="#f8f6f1" accent="#d9774b" title="Mall" titleColor="#d9774b" windows={false} art={false}>
      {shops.map(([name, color], i) => {
        const side = i < 3 ? -1 : 1;
        const z = -4 + (i % 3) * 4;
        return (
          <group key={name} position={[side * (HALF - 0.05), 0, z]} rotation={[0, side < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
            <Box p={[0, 1.3, 0]} s={[3.4, 2.6, 0.02]} c="#cfe6f2" opacity={0.5} />
            <Box p={[0, 2.85, 0.15]} s={[3.6, 0.5, 0.3]} c={color} />
            <Label p={[0, 2.85, 0.31]} size={0.24} color="#ffffff">{name}</Label>
            <Box p={[-0.8, 0.6, 0.4]} s={[0.6, 1.2, 0.4]} c="#f2efe6" />
            <Box p={[0.8, 0.6, 0.4]} s={[0.6, 1.2, 0.4]} c="#f2efe6" />
          </group>
        );
      })}
      {/* fountain */}
      <Cyl p={[0, 0.25, 0]} r1={1.6} h={0.5} c="#d8d2c4" seg={48} />
      <Cyl p={[0, 0.48, 0]} r1={1.45} h={0.04} c="#7fc6e6" seg={48} e="#5fb3d9" />
      <Cyl p={[0, 0.9, 0]} r1={0.12} h={1} c="#d8d2c4" />
      <Spinner position={[0, 1.45, 0]} speed={1}>
        <Ball p={[0, 0, 0]} r={0.25} c="#bfe7f7" e="#7fc6e6" />
      </Spinner>
      {/* escalator */}
      <group position={[0, 0, -4.8]} rotation={[0, 0, 0]}>
        <mesh position={[0, 1.4, 0]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[1.2, 0.2, 4]} />
          <meshStandardMaterial color="#9aa1a6" metalness={0.7} roughness={0.3} />
        </mesh>
        {[-0.65, 0.65].map((x) => (
          <mesh key={x} position={[x, 1.8, 0]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.05, 0.8, 4]} />
            <meshStandardMaterial color="#cfe6f2" transparent opacity={0.4} />
          </mesh>
        ))}
      </group>
      {[-2.5, 2.5].map((x) => (
        <Box key={x} p={[x, 0.3, 2.8]} s={[1.6, 0.1, 0.5]} c="#8a6447" />
      ))}
      <Plant p={[-2.4, 0, 0]} s={1.2} />
      <Plant p={[2.4, 0, 0]} s={1.2} />
    </Room>
  );
}

function StartupHub() {
  return (
    <Room floor="#e3ddd0" wall="#f7f3ea" accent="#86bc25" title="Startup Hub" titleColor="#2c5a1a">
      <Label {...WALL.right(0, 2.6)} size={0.45} color="#86bc25">Build. Ship. Repeat.</Label>
      {/* bean bags */}
      {[
        [-4.5, 3, "#d64545"],
        [-3.3, 4.3, "#f2c14e"],
        [-5, 4.6, "#3f87c6"],
      ].map(([x, z, c]) => (
        <Ball key={`${x}${z}`} p={[x, 0.3, z]} r={0.55} c={c} scale={[1, 0.6, 1]} />
      ))}
      {/* ping-pong table */}
      <group position={[3, 0, 3]}>
        <Box p={[0, 0.76, 0]} s={[2.7, 0.04, 1.5]} c="#2f6b8a" />
        <Box p={[0, 0.85, 0]} s={[0.02, 0.15, 1.5]} c="#ffffff" />
        {[-1.2, 1.2].map((x) => [-0.6, 0.6].map((z) => <Box key={`${x}${z}`} p={[x, 0.38, z]} s={[0.05, 0.76, 0.05]} c="#2f3a33" />))}
      </group>
      {/* standing desks */}
      {[-4.5, -1.5, 1.5, 4.5].map((x) => (
        <group key={x} position={[x, 0, -3]}>
          <Box p={[0, 1.05, 0]} s={[1.4, 0.05, 0.7]} c="#e8dcc6" />
          <Box p={[0, 0.52, 0]} s={[0.08, 1.05, 0.08]} c="#2f3a33" />
          <Box p={[0, 1.35, -0.2]} s={[0.6, 0.36, 0.03]} c="#1a1f1c" e="#5b9c1f" ei={0.5} />
        </group>
      ))}
      {/* demo stage */}
      <Box p={[0, 0.1, -5.6]} s={[4, 0.2, 1.4]} c="#2f3a33" />
      <Box p={[0, 1.7, -HALF + 0.05]} s={[4, 1.4, 0.04]} c="#16241a" e="#16241a" />
      <Label {...WALL.back(0, 1.7)} size={0.22} color="#a4d94a">Demo Day · Fri 5 PM</Label>
      <Sofa p={[0, 0, 5.4]} r={Math.PI} c="#2c5a1a" w={3} />
      <Plant p={[5.8, 0, -5.8]} />
    </Room>
  );
}

function Pharmacy() {
  const colors = ["#ffffff", "#d64545", "#3f87c6", "#5b9c1f", "#f2c14e"];
  const shelf = (key, p, r) => (
    <group key={key} position={p} rotation={[0, r, 0]}>
      <Box p={[0, 1.1, 0]} s={[3.2, 2.2, 0.45]} c="#f4f6f4" />
      {[0.35, 0.85, 1.35, 1.85].map((y) =>
        Array.from({ length: 12 }, (_, i) => (
          <Box key={`${y}${i}`} p={[-1.4 + i * 0.255, y + 0.12, 0.3]} s={[0.18, 0.24, 0.16]} c={colors[(i + Math.round(y * 4)) % colors.length]} />
        ))
      )}
    </group>
  );
  return (
    <Room floor="#eef3ef" wall="#fafcfa" accent="#2f8f5b" title="Pharmacy" titleColor="#2f8f5b">
      <Box p={[-3.2, 3.25, -HALF + 0.08]} s={[0.6, 0.18, 0.04]} c="#2f8f5b" e="#2f8f5b" ei={0.5} />
      <Box p={[-3.2, 3.25, -HALF + 0.08]} s={[0.18, 0.6, 0.04]} c="#2f8f5b" e="#2f8f5b" ei={0.5} />
      {shelf("b1", [-3.5, 0, -HALF + 0.3], 0)}
      {shelf("b2", [3.5, 0, -HALF + 0.3], 0)}
      {shelf("l1", [-HALF + 0.3, 0, -2], Math.PI / 2)}
      {shelf("l2", [-HALF + 0.3, 0, 2], Math.PI / 2)}
      {shelf("c1", [0, 0, 1.5], 0)}
      {/* counter */}
      <Box p={[3, 0.55, -2.5]} s={[3, 1.1, 0.8]} c="#2f8f5b" />
      <Box p={[3, 1.13, -2.5]} s={[3.1, 0.05, 0.9]} c="#ffffff" />
      <Box p={[3.6, 1.3, -2.5]} s={[0.4, 0.3, 0.35]} c="#2a2f2c" e="#5b9c1f" ei={0.3} />
      {/* fridge */}
      <Box p={[HALF - 0.45, 1.1, 2]} s={[0.8, 2.2, 1.6]} c="#e8eef0" />
      <Box p={[HALF - 0.86, 1.1, 2]} s={[0.02, 2, 1.5]} c="#cfe6f2" opacity={0.5} e="#bfe0f0" ei={0.3} />
      <Label {...WALL.right(-2.5, 2.8)} size={0.25} color="#2f8f5b">Prescriptions</Label>
      <Plant p={[5.8, 0, 5.8]} />
    </Room>
  );
}

function CoWorking() {
  return (
    <Room floor="#e6e1d6" wall="#f5f2ea" accent="#2a4d6e" title="Co-Working" titleColor="#2a4d6e">
      {[-2.2, 2.2].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <Box p={[0, 0.74, 0]} s={[7, 0.06, 1.3]} c="#c9a77c" />
          {[-3, 3].map((x) => (
            <Box key={x} p={[x, 0.37, 0]} s={[0.08, 0.74, 1.1]} c="#2f3a33" />
          ))}
          {[-2.6, -1.3, 0, 1.3, 2.6].map((x) =>
            [-1, 1].map((side) => (
              <group key={`${x}${side}`}>
                <Box p={[x, 0.79, side * 0.3]} s={[0.4, 0.02, 0.28]} c="#c0c5c9" metal={0.6} />
                <mesh position={[x, 0.92, side * 0.43]} rotation={[side * -0.35, 0, 0]}>
                  <boxGeometry args={[0.4, 0.26, 0.015]} />
                  <meshStandardMaterial color="#1a1f1c" emissive="#3f6fb5" emissiveIntensity={0.5} />
                </mesh>
                <Chair p={[x, 0, side * 0.95]} r={side > 0 ? Math.PI : 0} c="#2a4d6e" />
              </group>
            ))
          )}
        </group>
      ))}
      {/* phone booths */}
      {[-4, -2, 0].map((x) => (
        <group key={x} position={[x, 0, -HALF + 0.8]}>
          <Box p={[0, 1.1, 0]} s={[1.4, 2.2, 1.3]} c="#2a4d6e" />
          <Box p={[0, 1.1, 0.66]} s={[1.1, 1.8, 0.02]} c="#cfe6f2" opacity={0.5} />
        </group>
      ))}
      {/* coffee bar */}
      <Box p={[4, 0.55, -HALF + 0.6]} s={[3.5, 1.1, 0.8]} c="#6b4a33" />
      <Box p={[3.4, 1.35, -HALF + 0.6]} s={[0.5, 0.5, 0.4]} c="#b8bec2" metal={0.8} />
      <Label {...WALL.back(4, 2.4)} size={0.24} color="#6b4a33">Coffee Bar</Label>
      <Sofa p={[-4, 0, 5.2]} r={Math.PI} c="#c9a77c" w={2.4} />
      <Sofa p={[2, 0, 5.2]} r={Math.PI} c="#c9a77c" w={2.4} />
      <Plant p={[5.8, 0, 5.8]} />
    </Room>
  );
}

function FoodCourt() {
  const stalls = [
    ["Pizza", "#d64545"],
    ["Noodles", "#f2c14e"],
    ["Burgers", "#b08a4a"],
    ["Juice", "#5b9c1f"],
  ];
  return (
    <Room floor="#ece4d4" wall="#fbf5ea" accent="#c0392b" title="Food Court" titleColor="#c0392b">
      {stalls.map(([name, color], i) => {
        const x = -4.5 + i * 3;
        return (
          <group key={name} position={[x, 0, -HALF + 1]}>
            <Box p={[0, 0.55, 0.5]} s={[2.6, 1.1, 0.6]} c="#ffffff" />
            <Box p={[0, 1.13, 0.5]} s={[2.7, 0.05, 0.7]} c={color} />
            <Box p={[0, 2.6, 0]} s={[2.8, 0.6, 0.2]} c={color} />
            <Label p={[0, 2.6, 0.11]} size={0.28} color="#ffffff">{name}</Label>
            <Box p={[0, 1.6, -0.4]} s={[2.4, 0.9, 0.05]} c="#2a2f2c" e="#ffd98a" ei={0.25} />
          </group>
        );
      })}
      {[-4, -1.3, 1.3, 4].map((x) => [0.5, 3.3].map((z) => <RoundTable key={`${x}${z}`} p={[x, 0, z]} stoolColor="#c0392b" />))}
      <Plant p={[-5.8, 0, 5.8]} />
      <Plant p={[5.8, 0, 5.8]} />
    </Room>
  );
}

function RDCenter() {
  const liquids = ["#5fb3d9", "#86bc25", "#d64545", "#f2c14e"];
  return (
    <Room floor="#e9ece9" wall="#f9faf9" accent="#33503b" title="R&D Center" titleColor="#33503b">
      {[-2.5, 1].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <Box p={[0, 0.9, 0]} s={[7, 0.06, 1.2]} c="#2f3a33" />
          <Box p={[0, 0.45, 0]} s={[6.8, 0.9, 1.1]} c="#e3e7e2" />
          {Array.from({ length: 10 }, (_, i) => (
            <group key={i} position={[-3 + i * 0.66, 0.93, (i % 2) * 0.3 - 0.15]}>
              <Cyl p={[0, 0.15, 0]} r1={0.07} h={0.3} c="#e8f6ff" opacity={0.4} />
              <Cyl p={[0, 0.08, 0]} r1={0.065} h={0.15} c={liquids[i % 4]} e={liquids[i % 4]} />
            </group>
          ))}
          {/* microscope */}
          <group position={[2.8, 0.93, 0]}>
            <Box p={[0, 0.05, 0]} s={[0.3, 0.1, 0.3]} c="#2a2f2c" />
            <Cyl p={[0, 0.35, -0.05]} r1={0.04} h={0.5} c="#2a2f2c" rot={[0.3, 0, 0]} />
          </group>
        </group>
      ))}
      {/* fume hoods */}
      {[-4, 0, 4].map((x) => (
        <group key={x} position={[x, 0, -HALF + 0.6]}>
          <Box p={[0, 1.2, 0]} s={[2.2, 2.4, 1]} c="#d9dcd7" />
          <Box p={[0, 1.3, 0.51]} s={[1.8, 1.1, 0.02]} c="#cfe6f2" opacity={0.5} />
        </group>
      ))}
      <Box p={[HALF - 0.05, 1.8, 2]} s={[0.04, 1.4, 3.5]} c="#ffffff" />
      <Label {...WALL.right(2, 2)} size={0.2} color="#33503b">Lab notes · Batch 07</Label>
      <Label {...WALL.right(2, 1.6)} size={0.16} color="#7c8c7c">Prototype v3 — in testing</Label>
      <Spinner position={[0, 1.4, 4.5]} speed={0.6}>
        <mesh>
          <torusKnotGeometry args={[0.35, 0.1, 120, 16]} />
          <meshStandardMaterial color="#86bc25" metalness={0.6} roughness={0.2} />
        </mesh>
      </Spinner>
      <Cyl p={[0, 0.45, 4.5]} r1={0.4} h={0.9} c="#2f3a33" />
    </Room>
  );
}

function FitnessClub() {
  return (
    <Room floor="#3a3f3c" wall="#eef0ec" accent="#f2c14e" title="Fitness Club" titleColor="#1f2a1c">
      {/* treadmills */}
      {[-4.5, -2.5, -0.5, 1.5, 3.5].map((x) => (
        <group key={x} position={[x, 0, -HALF + 1.5]}>
          <Box p={[0, 0.12, 0]} s={[0.8, 0.2, 1.8]} c="#1f2a1c" />
          <Box p={[0, 0.23, 0.05]} s={[0.6, 0.02, 1.5]} c="#2f3a33" />
          {[-0.36, 0.36].map((dx) => (
            <Box key={dx} p={[dx, 0.75, -0.75]} s={[0.05, 1.1, 0.05]} c="#9aa29c" metal={0.6} />
          ))}
          <Box p={[0, 1.3, -0.8]} s={[0.7, 0.35, 0.1]} c="#1f2a1c" e="#f2c14e" ei={0.3} />
        </group>
      ))}
      {/* mirror wall */}
      <Box p={[-HALF + 0.05, 1.6, 0]} s={[0.03, 2.6, 10]} c="#dfe7ea" metal={1} rough={0.05} />
      {/* dumbbell rack */}
      <group position={[HALF - 0.6, 0, 0]}>
        <Box p={[0, 0.5, 0]} s={[0.7, 0.08, 4]} c="#2f3a33" />
        <Box p={[0, 0.9, 0]} s={[0.7, 0.08, 4]} c="#2f3a33" />
        {[0.58, 0.98].map((y) =>
          Array.from({ length: 8 }, (_, i) => (
            <group key={`${y}${i}`} position={[0, y, -1.75 + i * 0.5]}>
              <Cyl p={[0, 0, -0.12]} r1={0.08} h={0.08} c="#1a1a1a" rot={[Math.PI / 2, 0, 0]} />
              <Cyl p={[0, 0, 0.12]} r1={0.08} h={0.08} c="#1a1a1a" rot={[Math.PI / 2, 0, 0]} />
              <Cyl p={[0, 0, 0]} r1={0.02} h={0.2} c="#9aa29c" rot={[Math.PI / 2, 0, 0]} metal={0.8} />
            </group>
          ))
        )}
      </group>
      {/* benches + mats */}
      {[-1, 1.5].map((x) => (
        <group key={x} position={[x, 0, 2]}>
          <Box p={[0, 0.45, 0]} s={[0.4, 0.1, 1.3]} c="#c0392b" />
          <Box p={[0, 0.22, 0]} s={[0.08, 0.44, 0.08]} c="#2f3a33" />
        </group>
      ))}
      {[-3, -1.5, 0, 1.5, 3].map((x) => (
        <Box key={x} p={[x, 0.01, 5]} s={[0.7, 0.02, 1.8]} c={["#5b9c1f", "#3f87c6", "#f2c14e"][Math.abs(x * 2) % 3]} />
      ))}
      <Label {...WALL.right(0, 2.8)} size={0.32} color="#c0392b">No pain · No gain</Label>
    </Room>
  );
}

function Residences() {
  return (
    <Room floor="#cdb592" wall="#f6f0e4" accent="#cfae8e" title="Residences" titleColor="#6b4a33">
      {/* lounge */}
      <Box p={[0, 0.01, -2]} s={[4.5, 0.02, 3]} c="#e8dcc6" />
      <Sofa p={[0, 0, -0.8]} r={Math.PI} c="#5a6b5c" w={2.6} />
      <Box p={[0, 0.25, -2.2]} s={[1.3, 0.06, 0.7]} c="#6b4a33" />
      <Box p={[0, 1.6, -HALF + 0.08]} s={[2.6, 1.5, 0.05]} c="#111" e="#1f3d5a" ei={0.6} />
      <Box p={[0, 0.3, -HALF + 0.35]} s={[3.5, 0.6, 0.5]} c="#6b4a33" />
      {/* lamp */}
      <Cyl p={[2.2, 0.8, -1]} r1={0.02} h={1.6} c="#2f3a33" />
      <Cyl p={[2.2, 1.65, -1]} r1={0.18} r2={0.26} h={0.3} c="#fff3d6" e="#ffe2a3" />
      {/* dining */}
      <Box p={[-4, 0.74, 3]} s={[1.8, 0.05, 1]} c="#8a6447" />
      {[-4.6, -3.4].map((x) => [2.3, 3.7].map((z) => <Chair key={`${x}${z}`} p={[x, 0, z]} r={z > 3 ? Math.PI : 0} c="#8a6447" />))}
      {/* kitchen island */}
      <Box p={[3.5, 0.5, 3.5]} s={[2.4, 1, 1]} c="#f4f1e8" />
      <Box p={[3.5, 1.02, 3.5]} s={[2.5, 0.05, 1.1]} c="#2f3a33" />
      <Box p={[HALF - 0.35, 0.5, 3.5]} s={[0.6, 1, 4]} c="#f4f1e8" />
      <Box p={[HALF - 0.35, 1.8, 3.5]} s={[0.5, 0.8, 4]} c="#e6dccb" />
      <Label {...WALL.front(0, 2.8)} size={0.25} color="#6b4a33">Home sweet home</Label>
      <Plant p={[-5.8, 0, -5.8]} s={1.3} />
      <Plant p={[-2.3, 0, -1]} />
    </Room>
  );
}

function ExpoCenter() {
  const booths = [
    ["Robotics", "#3f87c6"],
    ["Green Energy", "#5b9c1f"],
    ["Smart City", "#d9774b"],
    ["FinTech", "#1d3557"],
  ];
  return (
    <Room floor="#e2ddd2" wall="#f5f3ee" accent="#1d3557" title="Expo Center" titleColor="#1d3557" windows={false} art={false}>
      <Box p={[0, 2, -HALF + 0.05]} s={[7, 2.4, 0.04]} c="#0d1b2a" e="#1d3557" ei={0.7} />
      <Label {...WALL.back(0, 2.3)} size={0.3} color="#f1d18a">Tech Expo 2026</Label>
      {booths.map(([name, color], i) => {
        const x = i < 2 ? -4 : 4;
        const z = i % 2 === 0 ? -1.5 : 3;
        return (
          <group key={name} position={[x, 0, z]}>
            <Box p={[0, 1.2, -1]} s={[3, 2.4, 0.08]} c={color} />
            <Box p={[x < 0 ? -1.5 : 1.5, 1.2, 0]} s={[0.08, 2.4, 2]} c="#ffffff" />
            <Label p={[0, 2, -0.95]} size={0.26} color="#ffffff">{name}</Label>
            <Box p={[0, 0.5, 0.2]} s={[1.6, 1, 0.6]} c="#ffffff" />
            <Spinner position={[0, 1.25, 0.2]} speed={0.8}>
              <mesh>
                <boxGeometry args={[0.35, 0.35, 0.35]} />
                <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
              </mesh>
            </Spinner>
          </group>
        );
      })}
      {[-3, 0, 3].map((x) => (
        <Box key={x} p={[x, 3.5, 0]} s={[1.6, 0.6, 0.03]} c={["#d64545", "#5b9c1f", "#3f87c6"][(x / 3 + 1) | 0]} />
      ))}
      <Plant p={[5.8, 0, 5.8]} />
      <Plant p={[-5.8, 0, 5.8]} />
    </Room>
  );
}

/* EK Diary office: the product's home, with a 3D login kiosk that opens ekdiary.com */
function EkDiary() {
  const kiosk = useRef();
  const hovered = useRef(false);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = hovered.current ? 1.08 : 1 + Math.sin(t * 2.4) * 0.025;
    kiosk.current.scale.setScalar(THREE.MathUtils.lerp(kiosk.current.scale.x, pulse, 0.2));
  });

  const entries = [
    ["Mon", "A calm, focused morning."],
    ["Tue", "Shipped the new feature!"],
    ["Wed", "Ideas for the roadmap."],
  ];

  return (
    <Room floor="#e7e1d3" wall="#f7f3ea" accent="#86bc25" title="EK Diary" titleColor="#2c5a1a">
      {/* app screen on the back wall */}
      <Box p={[0, 2.3, -HALF + 0.05]} s={[6.4, 2, 0.05]} c="#16241a" e="#16241a" />
      <Label p={[-1.6, 3.0, -HALF + 0.14]} size={0.22} color="#a4d94a">My Diary</Label>
      {entries.map(([day, text], i) => (
        <group key={day}>
          <Box p={[-1.6, 2.6 - i * 0.42, -HALF + 0.09]} s={[2.6, 0.34, 0.02]} c="#24382a" />
          <Label p={[-2.55, 2.6 - i * 0.42, -HALF + 0.14]} size={0.13} color="#a4d94a">{day}</Label>
          <Label p={[-1.3, 2.6 - i * 0.42, -HALF + 0.14]} size={0.12} color="#f3efe5">{text}</Label>
        </group>
      ))}
      <Box p={[1.7, 2.25, -HALF + 0.09]} s={[2.4, 1.5, 0.02]} c="#24382a" />
      <Label p={[1.7, 2.75, -HALF + 0.14]} size={0.16} color="#a4d94a">AI reflection</Label>
      <Text
        font={FONT}
        position={[1.7, 2.15, -HALF + 0.14]}
        fontSize={0.12}
        maxWidth={2.1}
        color="#f3efe5"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        lineHeight={1.35}
      >
        You did your best work on calm mornings. Plan deep work before noon this week.
      </Text>

      {/* giant open book sculpture */}
      <group position={[-4.3, 0, -4.6]} rotation={[0, 0.5, 0]}>
        <Cyl p={[0, 0.35, 0]} r1={0.7} h={0.7} c="#e3dccd" />
        <group position={[0, 1.05, 0]}>
          <mesh position={[-0.55, 0, 0]} rotation={[0, 0, 0.18]}>
            <boxGeometry args={[1.1, 0.06, 1.4]} />
            <meshStandardMaterial color="#fbf8ef" />
          </mesh>
          <mesh position={[0.55, 0, 0]} rotation={[0, 0, -0.18]}>
            <boxGeometry args={[1.1, 0.06, 1.4]} />
            <meshStandardMaterial color="#fbf8ef" />
          </mesh>
          <Box p={[0, -0.08, 0]} s={[2.3, 0.05, 1.5]} c="#2c5a1a" />
          <Box p={[0, 0.06, 0]} s={[0.04, 0.04, 1.4]} c="#86bc25" />
        </group>
      </group>

      {/* phone on a stand showing the app */}
      <group position={[4.3, 0, -4.6]} rotation={[0, -0.5, 0]}>
        <Cyl p={[0, 0.45, 0]} r1={0.35} h={0.9} c="#e3dccd" />
        <group position={[0, 1.45, 0]} rotation={[-0.15, 0, 0]}>
          <Box p={[0, 0, 0]} s={[0.55, 1.05, 0.05]} c="#16241a" rough={0.2} />
          <Box p={[0, 0, 0.03]} s={[0.48, 0.95, 0.01]} c="#24382a" e="#1f3d14" ei={0.5} />
          <Label p={[0, 0.3, 0.04]} size={0.07} color="#a4d94a">EK Diary</Label>
          {[0.1, -0.08, -0.26].map((y) => (
            <Box key={y} p={[0, y, 0.04]} s={[0.38, 0.12, 0.005]} c="#355a3d" />
          ))}
        </group>
      </group>

      {/* desks */}
      {[-4.5, 4.5].map((x) => [1.5, 4].map((z) => <Desk key={`${x}${z}`} p={[x, 0, z]} r={x < 0 ? Math.PI / 2 : -Math.PI / 2} />))}

      {/* login kiosk — click to open ekdiary.com */}
      <group
        ref={kiosk}
        position={[0, 0, -2.6]}
        onClick={openEkDiary}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          hovered.current = false;
          document.body.style.cursor = "";
        }}
      >
        <Box p={[0, 0.35, 0]} s={[0.5, 0.7, 0.4]} c="#16241a" />
        <group position={[0, 1.0, 0]} rotation={[-0.45, 0, 0]}>
          <Box p={[0, 0, 0]} s={[1.5, 0.9, 0.06]} c="#16241a" />
          <Box p={[0, 0, 0.035]} s={[1.38, 0.78, 0.01]} c="#fbf8ef" />
          <Label p={[0, 0.2, 0.05]} size={0.1} color="#16241a">Welcome to EK Diary</Label>
          <Box p={[0, -0.12, 0.045]} s={[1, 0.22, 0.02]} c="#5b9c1f" e="#5b9c1f" ei={0.3} />
          <Label p={[0, -0.12, 0.06]} size={0.09} color="#ffffff">Login to EK Diary</Label>
        </group>
      </group>
      <Box p={[0, 0.01, -2.6]} s={[1.6, 0.02, 1.2]} c="#86bc25" e="#86bc25" ei={0.25} />

      <Label {...WALL.front(0, 2.8)} size={0.3} color="#2c5a1a">Capture your days. Reflect with AI.</Label>
      <Plant p={[-5.8, 0, -5.8]} s={1.2} />
      <Plant p={[5.8, 0, -5.8]} s={1.2} />
    </Room>
  );
}

/* ---------- civic buildings ---------- */
function Court() {
  return (
    <Room floor="#cdb592" wall="#efe6d6" accent="#8a6447" title="Court" titleColor="#5a3e2b">
      {/* emblem: scales of justice */}
      <group position={[0, 2.85, -HALF + 0.15]}>
        <Cyl p={[0, 0, 0]} r1={0.03} h={0.7} c="#d4af37" metal={1} />
        <Box p={[0, 0.33, 0]} s={[1.1, 0.04, 0.04]} c="#d4af37" metal={1} />
        {[-0.5, 0.5].map((x) => (
          <Cyl key={x} p={[x, 0.1, 0]} r1={0.18} r2={0.08} h={0.1} c="#d4af37" metal={1} />
        ))}
      </group>
      {/* raised judge's bench */}
      <Box p={[0, 0.25, -5.2]} s={[5, 0.5, 2]} c="#6b4a33" />
      <Box p={[0, 1, -4.4]} s={[4, 1.5, 0.4]} c="#5a3e2b" rough={0.4} />
      <Box p={[0, 1.77, -4.4]} s={[4.1, 0.06, 0.5]} c="#3d2a1d" />
      <Chair p={[0, 0.5, -5.3]} c="#3d2a1d" />
      <Box p={[0, 1.95, -5.3]} s={[0.7, 0.9, 0.08]} c="#3d2a1d" />
      {/* witness box + clerk */}
      <group position={[-3.4, 0, -3.6]}>
        <Box p={[0, 0.55, 0]} s={[1.3, 1.1, 1.3]} c="#6b4a33" />
        <Box p={[0, 1.13, 0]} s={[1.35, 0.05, 1.35]} c="#3d2a1d" />
      </group>
      <Desk p={[3.4, 0, -3.6]} top="#6b4a33" />
      {/* counsel tables */}
      {[-2.2, 2.2].map((x) => (
        <group key={x} position={[x, 0, -1]}>
          <Box p={[0, 0.74, 0]} s={[2.4, 0.06, 0.9]} c="#8a6447" />
          {[-1.1, 1.1].map((dx) => (
            <Box key={dx} p={[dx, 0.37, 0]} s={[0.06, 0.74, 0.8]} c="#5a3e2b" />
          ))}
          {[-0.6, 0.6].map((dx) => (
            <Chair key={dx} p={[dx, 0, 0.6]} r={Math.PI} c="#3d2a1d" />
          ))}
        </group>
      ))}
      {/* railing + public gallery */}
      <Box p={[0, 0.5, 1.3]} s={[9, 0.08, 0.08]} c="#5a3e2b" />
      {Array.from({ length: 10 }, (_, i) => (
        <Box key={i} p={[-4.5 + i, 0.25, 1.3]} s={[0.06, 0.5, 0.06]} c="#5a3e2b" />
      ))}
      {[2.6, 3.9, 5.2].map((z) =>
        [-2.6, 2.6].map((x) => (
          <group key={`${x}${z}`} position={[x, 0, z]}>
            <Box p={[0, 0.45, 0]} s={[3.6, 0.08, 0.5]} c="#8a6447" />
            <Box p={[0, 0.8, 0.22]} s={[3.6, 0.6, 0.06]} c="#8a6447" />
          </group>
        ))
      )}
      {/* flags */}
      {[-2.8, 2.8].map((x, i) => (
        <group key={x} position={[x, 0, -5.8]}>
          <Cyl p={[0, 1.3, 0]} r1={0.03} h={2.6} c="#d4af37" metal={1} />
          <Box p={[0.35, 2.3, 0]} s={[0.7, 0.45, 0.02]} c={i ? "#1d3557" : "#5b9c1f"} />
        </group>
      ))}
    </Room>
  );
}

function PoliceStation() {
  return (
    <Room floor="#d9dde0" wall="#eef1f4" accent="#1d3557" title="Police Station" titleColor="#1d3557">
      {/* badge */}
      <group position={[-3.6, 3.2, -HALF + 0.12]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.05, 6]} />
          <meshStandardMaterial color="#d4af37" metalness={0.45} roughness={0.3} />
        </mesh>
        <Ball p={[0, 0, 0.03]} r={0.12} c="#1d3557" scale={[1, 1, 0.3]} />
      </group>
      {/* front desk */}
      <Box p={[0, 0.6, -4]} s={[5, 1.2, 0.8]} c="#1d3557" />
      <Box p={[0, 1.23, -4]} s={[5.1, 0.06, 0.9]} c="#c9ced3" />
      <Desk p={[-1.2, 0, -5]} chair={false} top="#c9ced3" />
      <Desk p={[1.2, 0, -5]} chair={false} top="#c9ced3" />
      {/* light bar on the desk */}
      <Box p={[-0.25, 1.32, -4]} s={[0.4, 0.1, 0.15]} c="#d64545" e="#d64545" ei={0.8} />
      <Box p={[0.25, 1.32, -4]} s={[0.4, 0.1, 0.15]} c="#3f87c6" e="#3f87c6" ei={0.8} />
      {/* holding cells on the left wall */}
      {[-3, 0.5].map((z) => (
        <group key={z} position={[-HALF + 1.6, 0, z]}>
          <Box p={[0, 0.01, 0]} s={[3, 0.02, 3]} c="#b9bfc4" />
          {Array.from({ length: 13 }, (_, i) => (
            <Cyl key={i} p={[1.5, 1.3, -1.5 + i * 0.25]} r1={0.025} h={2.6} c="#4a5560" metal={0.8} />
          ))}
          <Box p={[1.5, 2.6, 0]} s={[0.08, 0.08, 3]} c="#4a5560" />
          <Box p={[-0.9, 0.3, 0]} s={[1, 0.15, 2]} c="#7d868d" />
        </group>
      ))}
      <Label {...WALL.left(-1.2, 3.2)} size={0.26} color="#1d3557">Holding</Label>
      {/* officers' desks */}
      {[2.5, 4.8].map((x) => [0, 2.6].map((z) => <Desk key={`${x}${z}`} p={[x, 0, z]} r={-Math.PI / 2} />))}
      {/* notice board */}
      <Box p={[HALF - 0.05, 1.8, -3.5]} s={[0.04, 1.4, 2.4]} c="#b08a5a" />
      {[-0.7, 0, 0.7].map((dz, i) => (
        <Box key={dz} p={[HALF - 0.08, 1.85 + (i % 2) * 0.15, -3.5 + dz]} s={[0.02, 0.6, 0.5]} c="#fbf8ef" />
      ))}
      <Label {...WALL.right(-3.5, 2.7)} size={0.2} color="#1d3557">Notices</Label>
    </Room>
  );
}

function FireStation() {
  return (
    <Room floor="#9aa0a3" wall="#efe9e2" accent="#c0392b" title="Fire Station" titleColor="#c0392b">
      {/* fire engine */}
      <group position={[0, 0, -4.6]}>
        <Box p={[0, 0.85, 0]} s={[5.2, 1.3, 1.8]} c="#c0392b" rough={0.3} />
        <Box p={[2.2, 1.65, 0]} s={[1.1, 0.4, 1.7]} c="#c0392b" rough={0.3} />
        <Box p={[2.65, 1.55, 0]} s={[0.04, 0.5, 1.5]} c="#cfe6f2" opacity={0.7} />
        <Box p={[-0.4, 1.6, 0]} s={[4, 0.12, 0.3]} c="#c9ced3" metal={0.6} />
        <Box p={[0, 0.65, 0.91]} s={[5.2, 0.1, 0.02]} c="#f2c14e" e="#f2c14e" ei={0.3} />
        <Box p={[2.3, 1.95, 0]} s={[0.6, 0.12, 0.6]} c="#d64545" e="#ff4040" ei={0.8} />
        {[-1.8, 1.6].map((x) =>
          [-0.85, 0.85].map((z) => (
            <Cyl key={`${x}${z}`} p={[x, 0.32, z]} r1={0.32} h={0.25} c="#1a1a1a" rot={[Math.PI / 2, 0, 0]} />
          ))
        )}
      </group>
      {/* gear lockers with helmets */}
      {[-4.5, -3, -1.5, 0, 1.5, 3, 4.5].map((x) => (
        <group key={x} position={[x, 0, HALF - 0.45]}>
          <Box p={[0, 1.1, 0]} s={[1.2, 2.2, 0.6]} c="#3a3f3c" />
          <Box p={[0, 1.3, -0.2]} s={[0.7, 1, 0.3]} c="#c9a24a" />
          <Ball p={[0, 2.05, -0.15]} r={0.2} c={x === 0 ? "#ffffff" : "#c0392b"} scale={[1, 0.7, 1]} />
        </group>
      ))}
      {/* fire pole */}
      <Cyl p={[-4.5, H / 2, -1]} r1={0.05} h={H} c="#d4af37" metal={1} rough={0.2} />
      <Cyl p={[-4.5, 0.02, -1]} r1={0.5} h={0.04} c="#3a3f3c" />
      {/* hose reels */}
      {[-1.5, 1.5].map((z) => (
        <group key={z} position={[HALF - 0.4, 1.4, z]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.4, 0.12, 12, 32]} />
            <meshStandardMaterial color="#c0392b" />
          </mesh>
        </group>
      ))}
      <Label {...WALL.right(0, 2.6)} size={0.26} color="#c0392b">Dial 101</Label>
    </Room>
  );
}

function PostOffice() {
  return (
    <Room floor="#e6dccb" wall="#f7f1e6" accent="#c0392b" title="Post Office" titleColor="#c0392b">
      {/* counters */}
      <Box p={[0, 0.55, -4.4]} s={[8, 1.1, 0.8]} c="#c0392b" />
      <Box p={[0, 1.13, -4.4]} s={[8.1, 0.05, 0.9]} c="#f2c14e" />
      {[-3, -1, 1, 3].map((x, i) => (
        <group key={x}>
          <Box p={[x, 2.4, -4.4]} s={[1.4, 0.3, 0.05]} c="#f2c14e" />
          <Label p={[x, 2.4, -4.36]} size={0.12} color="#c0392b">{["Letters", "Parcels", "Savings", "Stamps"][i]}</Label>
          <Desk p={[x, 0, -5.4]} chair={false} />
        </group>
      ))}
      {/* PO boxes wall */}
      <group position={[-HALF + 0.08, 1.6, 0]}>
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 10 }, (_, c) => (
            <group key={`${r}${c}`} position={[0, (r - 2.5) * 0.4, (c - 4.5) * 0.45]}>
              <Box p={[0.04, 0, 0]} s={[0.06, 0.34, 0.39]} c="#b8bec2" metal={0.6} />
              <Box p={[0.08, 0.05, 0]} s={[0.01, 0.06, 0.2]} c="#2a2f2c" />
            </group>
          ))
        )}
      </group>
      <Label {...WALL.left(0, 3.1)} size={0.24} color="#c0392b">PO Boxes</Label>
      {/* parcels + red mailbox */}
      {[
        [3.5, 0.3, 1, 0.6],
        [4.2, 0.25, 1.4, 0.5],
        [3.8, 0.72, 1.2, 0.4],
        [4.6, 0.2, 0.6, 0.4],
      ].map(([x, y, z, sz], i) => (
        <Box key={i} p={[x, y, z]} s={[sz, sz, sz]} c="#c9a77c" r={i * 0.4} />
      ))}
      <group position={[4.5, 0, 4.2]}>
        <Cyl p={[0, 0.65, 0]} r1={0.35} h={1.3} c="#c0392b" />
        <Ball p={[0, 1.3, 0]} r={0.35} c="#c0392b" scale={[1, 0.5, 1]} />
        <Box p={[0, 1.05, 0.34]} s={[0.35, 0.05, 0.04]} c="#1a1a1a" />
      </group>
      {[-4, -1.5].map((x) => (
        <Box key={x} p={[x, 0.45, 3]} s={[1.8, 0.08, 0.5]} c="#8a6447" />
      ))}
    </Room>
  );
}

function Library() {
  const bookColors = ["#7a2e2e", "#2f5a3a", "#1d3557", "#b08a4a", "#5a3e6b", "#c9a77c"];
  const shelf = (key, p, r, len = 3) => (
    <group key={key} position={p} rotation={[0, r, 0]}>
      <Box p={[0, 1.5, 0]} s={[len, 3, 0.5]} c="#5a3e2b" />
      {[0.35, 0.95, 1.55, 2.15, 2.75].map((y) =>
        Array.from({ length: Math.floor(len / 0.14) }, (_, i) => (
          <Box
            key={`${y}${i}`}
            p={[-len / 2 + 0.1 + i * 0.14, y + 0.16 - ((i * 7) % 3) * 0.02, 0.2]}
            s={[0.11, 0.38 - ((i * 7) % 3) * 0.04, 0.3]}
            c={bookColors[(i + Math.round(y * 3)) % bookColors.length]}
          />
        ))
      )}
    </group>
  );
  return (
    <Room floor="#b89b74" wall="#efe4d0" accent="#2f5a3a" title="Library" titleColor="#2f5a3a">
      {shelf("b1", [-3.5, 0, -HALF + 0.3], 0, 4)}
      {shelf("b2", [3.5, 0, -HALF + 0.3], 0, 4)}
      {shelf("l1", [-HALF + 0.3, 0, -2.5], Math.PI / 2, 4)}
      {shelf("l2", [-HALF + 0.3, 0, 2.5], Math.PI / 2, 4)}
      {shelf("r1", [HALF - 0.3, 0, -2.5], -Math.PI / 2, 4)}
      {shelf("r2", [HALF - 0.3, 0, 2.5], -Math.PI / 2, 4)}
      {/* reading tables with lamps */}
      {[-2, 2].map((x) =>
        [-2.5, 1].map((z) => (
          <group key={`${x}${z}`} position={[x, 0, z]}>
            <Box p={[0, 0.74, 0]} s={[2.4, 0.06, 1.1]} c="#6b4a33" />
            {[-1.1, 1.1].map((dx) => (
              <Box key={dx} p={[dx, 0.37, 0]} s={[0.06, 0.74, 1]} c="#5a3e2b" />
            ))}
            <Cyl p={[0, 0.95, 0]} r1={0.02} h={0.4} c="#d4af37" />
            <Cyl p={[0, 1.15, 0]} r1={0.08} r2={0.2} h={0.15} c="#2f5a3a" e="#ffe2a3" />
            {[-0.6, 0.6].map((dx) =>
              [-0.75, 0.75].map((dz) => <Chair key={`${dx}${dz}`} p={[dx, 0, dz]} r={dz > 0 ? Math.PI : 0} c="#5a3e2b" />)
            )}
          </group>
        ))
      )}
      {/* reading nook */}
      <Sofa p={[0, 0, 5.3]} r={Math.PI} c="#2f5a3a" w={2.6} />
      <Box p={[0, 0.01, 4.4]} s={[3.6, 0.02, 2.2]} c="#7a2e2e" />
      <Label {...WALL.front(0, 2.9)} size={0.24} color="#2f5a3a">Silence please · Happy reading</Label>
    </Room>
  );
}

function Museum() {
  const art = ["#c9a77c", "#7fb3d5", "#d9774b", "#5b9c1f"];
  return (
    <Room floor="#e8e4dc" wall="#fbfaf7" accent="#5a3e2b" title="Museum" titleColor="#5a3e2b" windows={false} art={false}>
      {/* glass display cases with artefacts */}
      {[
        [-3, -2, "vase"],
        [0, -2.6, "gem"],
        [3, -2, "helmet"],
        [-3, 2, "gem"],
        [3, 2, "vase"],
      ].map(([x, z, kind], i) => (
        <group key={i} position={[x, 0, z]}>
          <Box p={[0, 0.45, 0]} s={[0.9, 0.9, 0.9]} c="#f4f1ea" />
          <Box p={[0, 1.35, 0]} s={[0.85, 0.9, 0.85]} c="#e8f6ff" opacity={0.25} rough={0.05} />
          {kind === "vase" && <Cyl p={[0, 1.2, 0]} r1={0.12} r2={0.2} h={0.5} c="#b08a4a" />}
          {kind === "gem" && (
            <Spinner position={[0, 1.25, 0]} speed={0.6}>
              <mesh>
                <octahedronGeometry args={[0.2]} />
                <meshStandardMaterial color="#5fb3d9" emissive="#2e6cff" emissiveIntensity={0.3} />
              </mesh>
            </Spinner>
          )}
          {kind === "helmet" && <Ball p={[0, 1.15, 0]} r={0.2} c="#d4af37" scale={[1, 0.8, 1]} />}
          <Box p={[0, 0.7, 0.46]} s={[0.4, 0.12, 0.01]} c="#5a3e2b" />
        </group>
      ))}
      {/* paintings with spotlights */}
      {[-4.5, -1.5, 1.5, 4.5].map((x, i) => (
        <group key={x} position={[x, 2, -HALF + 0.08]}>
          <Box p={[0, 0, 0]} s={[2, 1.4, 0.06]} c="#b08a4a" metal={0.5} />
          <Box p={[0, 0, 0.035]} s={[1.75, 1.15, 0.01]} c={art[i]} />
          <Ball p={[(i - 1.5) * 0.15, 0.1, 0.05]} r={0.3} c={art[(i + 2) % 4]} scale={[1, 0.8, 0.1]} />
          <Box p={[0, 0.95, 0.15]} s={[0.3, 0.08, 0.2]} c="#2a2f2c" e="#fff3d6" ei={0.5} />
        </group>
      ))}
      {/* statue */}
      <group position={[0, 0, 3.6]}>
        <Box p={[0, 0.5, 0]} s={[1.2, 1, 1.2]} c="#f4f1ea" />
        <Cyl p={[0, 1.5, 0]} r1={0.22} r2={0.3} h={1} c="#e3dccd" />
        <Ball p={[0, 2.2, 0]} r={0.22} c="#e3dccd" />
        <Cyl p={[0.3, 1.6, 0]} r1={0.07} h={0.7} c="#e3dccd" rot={[0, 0, 0.5]} />
      </group>
      {/* rope barrier */}
      {[-1.5, 1.5].map((x) => (
        <Cyl key={x} p={[x, 0.45, 2.3]} r1={0.04} h={0.9} c="#d4af37" metal={1} />
      ))}
      <Box p={[0, 0.8, 2.3]} s={[3, 0.04, 0.04]} c="#7a2e2e" />
      <Label {...WALL.left(0, 2.2)} size={0.3} color="#5a3e2b">Heritage Gallery</Label>
      <Label {...WALL.right(0, 2.2)} size={0.3} color="#5a3e2b">Modern Art</Label>
    </Room>
  );
}

function Cinema() {
  const rows = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 10; c++) rows.push([-4.05 + c * 0.9, r]);
  return (
    <Room floor="#2a1f2f" wall="#3a2a3f" accent="#f2c14e" title="Cinema" titleColor="#f2c14e" windows={false} art={false} dark>
      {/* screen */}
      <Box p={[0, 2.2, -HALF + 0.1]} s={[10, 3.2, 0.05]} c="#ffffff" e="#bfd9ff" ei={0.55} />
      <Label p={[0, 2.4, -HALF + 0.16]} size={0.5} color="#1d3557">Now Showing</Label>
      <Label p={[0, 1.8, -HALF + 0.16]} size={0.26} color="#5a3e6b">GurNirmal · The Future City</Label>
      <Box p={[0, 0.2, -HALF + 0.6]} s={[11, 0.4, 1]} c="#2a1f2f" />
      {/* tiered red seats */}
      {rows.map(([x, r]) => {
        const z = -2 + r * 1.2;
        const y = r * 0.25;
        return (
          <group key={`${x}${r}`} position={[x, y, z]}>
            <Box p={[0, y > 0 ? -y / 2 : 0, 0]} s={[0.9, y || 0.01, 1.2]} c="#2a1f2f" />
            <Box p={[0, 0.35, 0]} s={[0.7, 0.18, 0.6]} c="#a3282b" />
            <Box p={[0, 0.7, 0.28]} s={[0.7, 0.6, 0.12]} c="#a3282b" />
          </group>
        );
      })}
      {/* projector beam */}
      <mesh position={[0, 3.3, 0]} rotation={[Math.PI / 2 - 0.08, 0, 0]}>
        <coneGeometry args={[2.2, 13, 24, 1, true]} />
        <meshBasicMaterial color="#fff6d8" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Box p={[0, 3.4, HALF - 0.3]} s={[0.6, 0.4, 0.4]} c="#1a1a1a" e="#fff6d8" ei={0.3} />
      {/* aisle lights */}
      {Array.from({ length: 8 }, (_, i) => (
        <Box key={i} p={[-HALF + 0.3, 0.05, -4 + i * 1.3]} s={[0.15, 0.04, 0.15]} c="#f2c14e" e="#f2c14e" />
      ))}
    </Room>
  );
}

function MetroStation() {
  return (
    <Room floor="#d8d4cc" wall="#eef0f2" accent="#2a4d6e" title="Metro Station" titleColor="#2a4d6e" windows={false}>
      {/* track pit along the back */}
      <Box p={[0, -0.01, -5.4]} s={[W, 0.02, 2.4]} c="#4a4f52" />
      {[-5.9, -4.9].map((z) => (
        <Box key={z} p={[0, 0.06, z]} s={[W, 0.08, 0.08]} c="#9aa1a6" metal={0.8} />
      ))}
      <Box p={[0, 0.03, -4.12]} s={[W, 0.06, 0.25]} c="#f2c14e" />
      {/* train */}
      <group position={[0, 0, -5.4]}>
        <Box p={[0, 1.35, 0]} s={[12, 2.3, 2]} c="#e9edf0" rough={0.3} />
        <Box p={[0, 0.55, 0]} s={[12, 0.25, 2.02]} c="#2a4d6e" />
        <Box p={[0, 2.2, 0]} s={[12, 0.15, 2.02]} c="#86bc25" />
        {[-4.5, -1.5, 1.5, 4.5].map((x) => (
          <group key={x}>
            <Box p={[x, 1.25, 1.01]} s={[1.2, 1.6, 0.02]} c="#2a3b46" />
            <Box p={[x, 1.25, 1.02]} s={[0.02, 1.6, 0.02]} c="#9aa1a6" />
          </group>
        ))}
        {[-3, 0, 3].map((x) => (
          <Box key={x} p={[x, 1.6, 1.01]} s={[1.4, 0.6, 0.02]} c="#cfe6f2" opacity={0.8} />
        ))}
      </group>
      {/* route map + sign */}
      <Box p={[-HALF + 0.05, 1.9, 0.5]} s={[0.04, 1.4, 3.2]} c="#ffffff" />
      {[
        ["#d64545", 0.3],
        ["#3f87c6", 0],
        ["#86bc25", -0.3],
      ].map(([c, dy]) => (
        <Box key={c} p={[-HALF + 0.09, 1.9 + dy, 0.5]} s={[0.01, 0.05, 2.8]} c={c} />
      ))}
      <Label {...WALL.left(0.5, 2.85)} size={0.22} color="#2a4d6e">Route Map</Label>
      {/* turnstiles */}
      {[-1.6, -0.5, 0.6, 1.7].map((x) => (
        <group key={x} position={[x, 0, 3.2]}>
          <Box p={[0, 0.5, 0]} s={[0.25, 1, 0.9]} c="#c9ced3" metal={0.6} />
          <Box p={[0.3, 0.85, 0]} s={[0.5, 0.04, 0.04]} c="#2a2f2c" />
          <Box p={[0, 1.02, -0.3]} s={[0.15, 0.02, 0.15]} c="#86bc25" e="#86bc25" />
        </group>
      ))}
      {[-4, 4].map((x) => (
        <Box key={x} p={[x, 0.45, 0.2]} s={[2, 0.08, 0.5]} c="#8a6447" />
      ))}
      <Box p={[0, 2.85, -3.4]} s={[3.4, 0.45, 0.08]} c="#2a4d6e" />
      <Label p={[0, 2.85, -3.35]} size={0.2} color="#ffffff">Platform 1 · Tech Park Line</Label>
    </Room>
  );
}

function TownHall() {
  const seats = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) seats.push([-3.5 + c, r]);
  return (
    <Room floor="#cdb592" wall="#f6f2ea" accent="#1d3557" title="Town Hall" titleColor="#1d3557">
      {/* stage + podium */}
      <Box p={[0, 0.2, -5.3]} s={[7, 0.4, 2.4]} c="#8a6447" />
      <group position={[0, 0.4, -4.8]}>
        <Box p={[0, 0.55, 0]} s={[0.9, 1.1, 0.6]} c="#5a3e2b" />
        <Box p={[0, 1.12, 0]} s={[1, 0.05, 0.7]} c="#3d2a1d" />
        <Cyl p={[0, 1.35, 0.15]} r1={0.015} h={0.45} c="#2a2f2c" rot={[-0.4, 0, 0]} />
      </group>
      {[-2.5, 2.5].map((x) => <Chair key={x} p={[x, 0.4, -5.6]} c="#1d3557" />)}
      {/* emblem */}
      <Cyl p={[0, 2.6, -HALF + 0.1]} r1={0.55} h={0.05} c="#d4af37" rot={[Math.PI / 2, 0, 0]} metal={1} />
      <Ball p={[0, 2.6, -HALF + 0.14]} r={0.3} c="#1d3557" scale={[1, 1, 0.2]} />
      {/* flags */}
      {[-3.2, 3.2].map((x, i) => (
        <group key={x} position={[x, 0.4, -5.8]}>
          <Cyl p={[0, 1.3, 0]} r1={0.03} h={2.6} c="#d4af37" metal={1} />
          <Box p={[0.35, 2.3, 0]} s={[0.7, 0.45, 0.02]} c={i ? "#5b9c1f" : "#f2c14e"} />
        </group>
      ))}
      {/* audience */}
      {seats.map(([x, r]) => (
        <Chair key={`${x}${r}`} p={[x, 0, -1.6 + r * 1.2]} r={Math.PI} c="#1d3557" />
      ))}
      <Label {...WALL.front(0, 2.8)} size={0.26} color="#1d3557">Of the people · For the people</Label>
      <Plant p={[-5.8, 0, -5.8]} s={1.2} />
      <Plant p={[5.8, 0, -5.8]} s={1.2} />
    </Room>
  );
}

const ROOMS = {
  Court,
  "Police Station": PoliceStation,
  "Fire Station": FireStation,
  "Post Office": PostOffice,
  Library,
  Museum,
  Cinema,
  "Metro Station": MetroStation,
  "Town Hall": TownHall,
  "EK Diary": EkDiary,
  Hospital,
  Bank,
  "IT Office": ITOffice,
  "Data Center": DataCenter,
  "AI Lab": AILab,
  School,
  Hotel,
  Mall,
  "Startup Hub": StartupHub,
  Pharmacy,
  "Co-Working": CoWorking,
  "Food Court": FoodCourt,
  "R&D Center": RDCenter,
  "Fitness Club": FitnessClub,
  Residences,
  "Expo Center": ExpoCenter,
};

/* 360° look-around: the pointer's horizontal position sweeps a full turn, vertical tilts the view */
function LookAround() {
  const yaw = useRef(0);
  const pitch = useRef(0);
  const { camera } = useThree();

  useEffect(() => {
    camera.fov = 72;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame((state, dt) => {
    const { camera, pointer } = state;
    yaw.current = THREE.MathUtils.damp(yaw.current, -pointer.x * Math.PI, 4, dt);
    pitch.current = THREE.MathUtils.damp(pitch.current, pointer.y * 0.55, 4, dt);
    camera.position.set(0, 1.65, 0);
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
  });
  return null;
}

export default function Interior({ type }) {
  const RoomComponent = ROOMS[type] || ITOffice;
  return (
    <Suspense fallback={null}>
      <color attach="background" args={["#f3efe5"]} />
      <RoomComponent />
      <LookAround />
    </Suspense>
  );
}
