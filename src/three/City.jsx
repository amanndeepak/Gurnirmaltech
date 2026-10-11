import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { isParkLot } from "./layout";

/* facade palette: warm neutrals + sage, with a few deep-green glass towers */
const FACADES = [
  { color: "#f3ede1", weight: 30, windows: 1 }, // cream
  { color: "#e4d7c0", weight: 20, windows: 1 }, // sand
  { color: "#cddabd", weight: 18, windows: 1 }, // sage
  { color: "#dcd6ca", weight: 14, windows: 1 }, // stone
  { color: "#cfae8e", weight: 6, windows: 1 }, // terracotta
  { color: "#33503b", weight: 12, windows: 2 }, // deep green glass
];
const ROOF_UNIT = "#bdb6a6";
const GARDEN = "#6fa82a";
const TRIM = "#f8f5ee";

const WINDOW_NONE = 0;

function rng(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function pickFacade(r) {
  const total = FACADES.reduce((s, f) => s + f.weight, 0);
  let k = r * total;
  for (const f of FACADES) {
    if ((k -= f.weight) <= 0) return f;
  }
  return FACADES[0];
}

/* signboards: label, panel color, text color */
const SIGNS = [
  ["EK Diary", "#16241a", "#a4d94a"],
  ["+ Hospital", "#ffffff", "#d64545"],
  ["Court", "#5a3e2b", "#f1d18a"],
  ["Bank", "#1d3557", "#f1d18a"],
  ["Police Station", "#1d3557", "#ffffff"],
  ["School", "#f2c14e", "#1f2a1c"],
  ["IT Office", "#1f3d14", "#ffffff"],
  ["Fire Station", "#c0392b", "#ffffff"],
  ["Library", "#2f5a3a", "#ffffff"],
  ["Data Center", "#16241a", "#a4d94a"],
  ["Cinema", "#16241a", "#f2c14e"],
  ["Post Office", "#f2c14e", "#c0392b"],
  ["Hotel", "#5a3e6b", "#ffffff"],
  ["Museum", "#ffffff", "#5a3e2b"],
  ["AI Lab", "#5b9c1f", "#ffffff"],
  ["Metro Station", "#2a4d6e", "#ffffff"],
  ["Mall", "#d9774b", "#ffffff"],
  ["Town Hall", "#ffffff", "#1d3557"],
  ["Startup Hub", "#ffffff", "#2c5a1a"],
  ["Pharmacy", "#2f8f5b", "#ffffff"],
  ["Co-Working", "#2a4d6e", "#ffffff"],
  ["Food Court", "#c0392b", "#fff4e0"],
  ["R&D Center", "#33503b", "#ffffff"],
  ["Fitness Club", "#1f2a1c", "#f2c14e"],
  ["Residences", "#cfae8e", "#1f2a1c"],
  ["Expo Center", "#ffffff", "#1d3557"],
];

/* picks in-view buildings, spread across the scene, for rooftop name signs */
const CAMERA = { x: 0, y: 4.2, z: 14 };

function assignSigns(buildings) {
  const candidates = buildings.filter((b) => {
    const depth = CAMERA.z - b.z;
    if (b.h < 0.6 || b.h > 3.6 || b.z < -11) return false;
    if (Math.abs(b.x) / depth > 0.55) return false; // outside the camera's view
    if (b.z < 0 && Math.abs(b.x) / depth < 0.075) return false; // hidden behind the central tower
    // skip if a nearer building would cover the sign on screen
    const signX = b.x / depth;
    const signY = (b.h + 0.3 - CAMERA.y) / depth;
    return !buildings.some((o) => {
      if (o === b || o.z <= b.z) return false;
      const od = CAMERA.z - o.z;
      return Math.abs(o.x / od - signX) < 0.07 && (o.h - CAMERA.y) / od > signY;
    });
  });
  candidates.sort((a, b) => Math.hypot(a.x * 0.6, a.z - 2) - Math.hypot(b.x * 0.6, b.z - 2));
  const chosen = [];
  for (const b of candidates) {
    if (chosen.length >= SIGNS.length) break;
    // keep signs apart on screen (rough projection from the camera) and on the ground
    const screen = (o) => [o.x / (CAMERA.z - o.z), (o.h + 0.4 - CAMERA.y) / (CAMERA.z - o.z)];
    const [sx, sy] = screen(b);
    const tooClose = chosen.some((c) => {
      const [cx, cy] = screen(c);
      return Math.hypot(c.x - b.x, c.z - b.z) < 1.9 || (Math.abs(cx - sx) < 0.085 && Math.abs(cy - sy) < 0.045);
    });
    if (tooClose) continue;
    chosen.push(b);
  }
  chosen.forEach((b, i) => {
    const [label, panel, text] = SIGNS[i];
    b.sign = { label, panel, text, facing: Math.atan2(CAMERA.x - b.x, CAMERA.z - b.z) };
  });
}

/* lays out a street grid around an open plaza and generates each building as parts */
export function useCity() {
  return useMemo(() => {
    const rand = rng(11);
    const LOT = 1.3;
    const buildings = [];
    const parks = [];

    for (let gx = -11; gx <= 11; gx++) {
      for (let gz = -11; gz <= 6; gz++) {
        // avenues every 4th row/column
        if (gx % 4 === 0 || gz % 4 === 0) continue;

        const x = gx * LOT + (rand() - 0.5) * 0.15;
        const z = gz * LOT + (rand() - 0.5) * 0.15;
        const dist = Math.hypot(x, z);
        if (dist < 5) continue; // plaza around the core
        if (z > 1 && Math.abs(x) < 5.6) continue; // keep the view to the core open

        const facade = pickFacade(rand());
        const w = 0.55 + rand() * 0.45;
        const d = 0.55 + rand() * 0.45;

        // taller toward the back and around the plaza, low-rise toward the camera
        const backness = THREE.MathUtils.clamp((-z + 6) / 16, 0, 1);
        const ring = THREE.MathUtils.clamp(1 - Math.abs(dist - 6) / 6, 0, 1);
        const roll = rand();
        let h;
        if (roll < 0.35) h = 0.35 + rand() * 0.45; // small
        else if (roll < 0.85) h = 0.9 + rand() * 1.4 * (0.6 + backness); // normal
        else h = 2.4 + rand() * 2.6 * (0.5 + backness * 0.5 + ring * 0.5); // tower
        if (facade.windows === 2) h = Math.max(h, 1.6 + rand() * 2.5);

        const parts = [];
        const add = (px, py, pz, pw, ph, pd, color, windows) =>
          parts.push({ px, py, pz, pw, ph, pd, color, windows });

        let top;
        if (h > 1.8 && rand() < 0.6) {
          // setback tower: podium + slimmer shaft
          const podium = h * (0.25 + rand() * 0.25);
          add(0, 0, 0, w, podium, d, facade.color, facade.windows);
          add(0, podium, 0, w * 0.96, 0.05, d * 0.96, TRIM, WINDOW_NONE);
          const sw = w * (0.62 + rand() * 0.18);
          const sd = d * (0.62 + rand() * 0.18);
          add(0, podium + 0.05, 0, sw, h - podium - 0.05, sd, facade.color, facade.windows);
          top = { y: h, w: sw, d: sd };
        } else {
          add(0, 0, 0, w, h, d, facade.color, facade.windows);
          top = { y: h, w, d };
        }

        // parapet trim
        add(0, top.y, 0, top.w * 1.03, 0.04, top.d * 1.03, TRIM, WINDOW_NONE);

        let antenna = null;
        if (h < 1.1 && rand() < 0.55) {
          add(0, top.y + 0.04, 0, top.w * 0.86, 0.035, top.d * 0.86, GARDEN, WINDOW_NONE);
        } else {
          const uw = top.w * (0.3 + rand() * 0.2);
          add((rand() - 0.5) * top.w * 0.3, top.y + 0.04, (rand() - 0.5) * top.d * 0.3, uw, 0.12 + rand() * 0.1, uw, ROOF_UNIT, WINDOW_NONE);
          if (h > 3.2) antenna = { y: top.y + 0.04, h: 0.4 + rand() * 0.5 };
        }

        buildings.push({
          x,
          z,
          h: top.y,
          parts,
          antenna,
          delay: 0.35 + (dist / 16) * 1.4 + rand() * 0.35,
          lit: h > 1.4 && rand() > 0.4,
        });
        // generated first, then dropped, so every other building keeps its exact look
        if (isParkLot(gx, gz)) parks.push({ x: gx * LOT, z: gz * LOT, size: LOT * 0.92, delay: buildings.pop().delay });
      }
    }
    assignSigns(buildings);
    return { buildings, parks };
  }, []);
}

/* window grid drawn in the shader so every facade gets evenly spaced, aligned windows */
function useBuildingMaterial() {
  return useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0.05 });
    m.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
          attribute float aWindows;
          varying vec3 vUnit;
          varying vec3 vSize;
          varying vec3 vLocalN;
          varying float vWindows;
          varying float vSeed;`
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          vUnit = position + 0.5;
          vLocalN = normal;
          vWindows = aWindows;
          vSeed = float(gl_InstanceID);
          vSize = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          varying vec3 vUnit;
          varying vec3 vSize;
          varying vec3 vLocalN;
          varying float vWindows;
          varying float vSeed;
          float cityHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }`
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          float wall = 1.0 - step(0.5, abs(vLocalN.y));
          bool xFace = abs(vLocalN.x) > 0.5;
          float along = xFace ? vUnit.z : vUnit.x;
          float span = xFace ? vSize.z : vSize.x;
          float nx = max(1.0, floor(span / 0.15));
          float ny = max(1.0, floor(vSize.y / 0.2));
          vec2 cell = vec2(along * nx, vUnit.y * ny);
          vec2 f = fract(cell);
          float ribbon = step(1.5, vWindows);
          float wx = mix(step(0.27, f.x) * step(f.x, 0.73), step(0.04, f.x) * step(f.x, 0.96), ribbon);
          float wy = mix(step(0.3, f.y) * step(f.y, 0.76), step(0.12, f.y) * step(f.y, 0.88), ribbon);
          float win = wx * wy * wall * step(0.5, vWindows) * step(0.18, vSize.y);
          float h = cityHash(floor(cell) + vSeed * 3.17 + (xFace ? 41.0 : 0.0));
          vec3 glass = mix(vec3(0.3, 0.38, 0.38), vec3(0.5, 0.6, 0.58), h * 0.7);
          glass = mix(glass, vec3(0.42, 0.58, 0.5), ribbon * 0.5);
          diffuseColor.rgb = mix(diffuseColor.rgb, glass, win);
          float litWin = win * step(0.9, h);`
        )
        .replace(
          "#include <roughnessmap_fragment>",
          `#include <roughnessmap_fragment>
          roughnessFactor = mix(roughnessFactor, 0.12, win);`
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          totalEmissiveRadiance += litWin * mix(vec3(1.0, 0.82, 0.5), vec3(0.75, 0.95, 0.45), step(0.95, h)) * 0.9;`
        );
    };
    m.customProgramCacheKey = () => "city-windows-v1";
    return m;
  }, []);
}

const SIGN_FONT = "/fonts/PlusJakartaSans-ExtraBold.ttf";

function Sign({ building, progress, index, onEnter }) {
  const ref = useRef();
  const board = useRef();
  const hovered = useRef(false);
  const { label, panel, text, facing } = building.sign;
  const width = label.length * 0.1 + 0.22;
  const LIFT = 0.22;

  useFrame(() => {
    const k = progress.current[index];
    const pop = k > 0.97 ? 1 : Math.max((k - 0.7) / 0.27, 0);
    ref.current.position.y = building.h * k + 0.04;
    ref.current.scale.setScalar(Math.max(pop, 0.0001));
    const target = hovered.current && onEnter ? 1.18 : 1;
    board.current.scale.setScalar(THREE.MathUtils.lerp(board.current.scale.x, target, 0.2));
  });

  const enter = (e) => {
    e.stopPropagation();
    if (!onEnter) return;
    document.body.style.cursor = "";
    onEnter(label.replace(/^\+\s*/, ""), [building.x, building.h + 0.04 + LIFT + 0.15, building.z]);
  };

  return (
    <group ref={ref} position={[building.x, building.h, building.z]} rotation={[0, facing, 0]}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * width * 0.32, LIFT / 2, 0]} castShadow>
          <boxGeometry args={[0.025, LIFT, 0.025]} />
          <meshStandardMaterial color="#3d4a40" roughness={0.6} />
        </mesh>
      ))}
      <group
        ref={board}
        position={[0, LIFT + 0.15, 0]}
        onClick={enter}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          if (onEnter) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          hovered.current = false;
          document.body.style.cursor = "";
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[width, 0.3, 0.035]} />
          <meshStandardMaterial color={panel} roughness={0.35} />
        </mesh>
        <Text
          font={SIGN_FONT}
          fontSize={0.17}
          color={text}
          anchorX="center"
          anchorY="middle"
          position={[0, 0, 0.02]}
          letterSpacing={0.02}
        >
          {label}
        </Text>
      </group>
    </group>
  );
}

export default function City({ buildings, onEnter }) {
  const mesh = useRef();
  const antennas = useRef();
  const material = useBuildingMaterial();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const progress = useRef(buildings.map(() => 0));

  const parts = useMemo(
    () => buildings.flatMap((b, bi) => b.parts.map((p) => ({ ...p, bi }))),
    [buildings]
  );
  const withAntenna = useMemo(
    () => buildings.map((b, bi) => ({ b, bi })).filter(({ b }) => b.antenna),
    [buildings]
  );

  const windowsAttr = useMemo(
    () => new THREE.InstancedBufferAttribute(new Float32Array(parts.map((p) => p.windows)), 1),
    [parts]
  );

  useLayoutEffect(() => {
    const c = new THREE.Color();
    parts.forEach((p, i) => mesh.current.setColorAt(i, c.set(p.color)));
    mesh.current.instanceColor.needsUpdate = true;
    mesh.current.geometry.setAttribute("aWindows", windowsAttr);
  }, [parts, windowsAttr]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    buildings.forEach((b, i) => {
      const target = t > b.delay ? 1 : 0;
      progress.current[i] = THREE.MathUtils.damp(progress.current[i], target, 3, dt);
    });
    parts.forEach((p, i) => {
      const k = Math.max(progress.current[p.bi], 0.0001);
      const b = buildings[p.bi];
      dummy.position.set(b.x + p.px, (p.py + p.ph / 2) * k, b.z + p.pz);
      dummy.scale.set(p.pw, p.ph * k, p.pd);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;

    withAntenna.forEach(({ b, bi }, i) => {
      const k = Math.max(progress.current[bi], 0.0001);
      dummy.position.set(b.x, (b.antenna.y + b.antenna.h / 2) * k, b.z);
      dummy.scale.set(1, b.antenna.h * k, 1);
      dummy.updateMatrix();
      antennas.current.setMatrixAt(i, dummy.matrix);
    });
    antennas.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={mesh} args={[null, material, parts.length]} castShadow receiveShadow>
        <boxGeometry />
      </instancedMesh>
      <instancedMesh ref={antennas} args={[null, null, withAntenna.length]} castShadow>
        <cylinderGeometry args={[0.015, 0.025, 1, 6]} />
        <meshStandardMaterial color="#3d4a40" roughness={0.5} />
      </instancedMesh>
      <Suspense fallback={null}>
        {buildings.map((b, i) =>
          b.sign ? <Sign key={i} building={b} progress={progress} index={i} onEnter={onEnter} /> : null
        )}
      </Suspense>
    </group>
  );
}
