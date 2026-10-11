import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const RING_INNER = 3.9; // ring road inner edge

const GRASS = "#9cc46a";
const PATH = "#e8dfcc";
const CANOPY = ["#5b9c1f", "#6fa82a", "#4f8a2a", "#7cb342", "#3f7a22"];
const FLOWERS = ["#f2c14e", "#d64545", "#f7f3ea", "#e58fb0", "#b48ad9"];
const WATER = "#6db3c6";

function rng(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/* grows in after `delay` seconds */
function useGrow(delay) {
  const k = useRef(0);
  return (state, dt) => {
    if (state.clock.elapsedTime > delay) k.current = THREE.MathUtils.damp(k.current, 1, 3, dt);
    return Math.max(k.current, 0.0001);
  };
}

/* ---------- trees: instanced trunks + two-blob canopies ---------- */
function Trees({ spots }) {
  const trunks = useRef();
  const crowns = useRef();
  const tops = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const grow = useGrow(1.4);

  useLayoutEffect(() => {
    const c = new THREE.Color();
    spots.forEach((t, i) => {
      crowns.current.setColorAt(i, c.set(t.color));
      tops.current.setColorAt(i, c.set(t.color).offsetHSL(0, 0, 0.06));
    });
    crowns.current.instanceColor.needsUpdate = true;
    tops.current.instanceColor.needsUpdate = true;
  }, [spots]);

  useFrame((state, dt) => {
    const k = grow(state, dt);
    const t = state.clock.elapsedTime;
    spots.forEach((s, i) => {
      const sway = Math.sin(t * 1.3 + s.x * 2 + s.z) * 0.03;
      dummy.rotation.set(0, 0, 0);
      dummy.position.set(s.x, (s.h * 0.5 * k) / 2, s.z);
      dummy.scale.set(1, s.h * 0.5 * k, 1);
      dummy.updateMatrix();
      trunks.current.setMatrixAt(i, dummy.matrix);

      dummy.position.set(s.x, s.h * 0.62 * k, s.z);
      dummy.rotation.set(sway, 0, sway);
      dummy.scale.setScalar(s.r * k);
      dummy.updateMatrix();
      crowns.current.setMatrixAt(i, dummy.matrix);

      dummy.position.set(s.x + s.r * 0.15, s.h * 0.62 * k + s.r * 0.55 * k, s.z - s.r * 0.1);
      dummy.scale.setScalar(s.r * 0.7 * k);
      dummy.updateMatrix();
      tops.current.setMatrixAt(i, dummy.matrix);
    });
    trunks.current.instanceMatrix.needsUpdate = true;
    crowns.current.instanceMatrix.needsUpdate = true;
    tops.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={trunks} args={[null, null, spots.length]} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 1, 6]} />
        <meshStandardMaterial color="#7a5a3a" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[null, null, spots.length]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={0.8} flatShading />
      </instancedMesh>
      <instancedMesh ref={tops} args={[null, null, spots.length]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={0.8} flatShading />
      </instancedMesh>
    </group>
  );
}

/* ---------- flowers: tiny instanced blooms in beds ---------- */
function Flowers({ spots }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const d = new THREE.Object3D();
    const c = new THREE.Color();
    spots.forEach((f, i) => {
      d.position.set(f.x, 0.06, f.z);
      d.scale.setScalar(0.05);
      d.updateMatrix();
      ref.current.setMatrixAt(i, d.matrix);
      ref.current.setColorAt(i, c.set(f.color));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor.needsUpdate = true;
  }, [spots]);
  return (
    <instancedMesh ref={ref} args={[null, null, spots.length]}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial roughness={0.6} />
    </instancedMesh>
  );
}

/* ---------- fountain: basin, pillar and arcing water drops ---------- */
const DROPS = 28;
function Fountain({ position, scale = 1, delay = 1.6 }) {
  const drops = useRef();
  const group = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const grow = useGrow(delay);

  useFrame((state, dt) => {
    const k = grow(state, dt);
    group.current.scale.setScalar(scale * k);
    const t = state.clock.elapsedTime;
    for (let i = 0; i < DROPS; i++) {
      const a = (i / DROPS) * Math.PI * 2;
      const p = (t * 0.7 + (i % 4) * 0.25) % 1;
      const r = p * 0.55;
      dummy.position.set(Math.cos(a) * r, 0.62 + p * 0.9 - p * p * 1.25, Math.sin(a) * r);
      dummy.scale.setScalar(0.035 * (1 - p * 0.4));
      dummy.updateMatrix();
      drops.current.setMatrixAt(i, dummy.matrix);
    }
    drops.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} position={position}>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.75, 0.82, 0.24, 40]} />
        <meshStandardMaterial color="#f1ece1" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.235, 0]}>
        <cylinderGeometry args={[0.66, 0.66, 0.02, 40]} />
        <meshStandardMaterial color={WATER} roughness={0.05} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 0.4, 12]} />
        <meshStandardMaterial color="#f1ece1" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.22, 0.12, 0.06, 20]} />
        <meshStandardMaterial color="#f1ece1" roughness={0.5} />
      </mesh>
      <instancedMesh ref={drops} args={[null, null, DROPS]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#d8f1fa" emissive="#9fd8ec" emissiveIntensity={0.4} transparent opacity={0.9} />
      </instancedMesh>
    </group>
  );
}

function Bench({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.45, 0.03, 0.14]} />
        <meshStandardMaterial color="#8a6447" />
      </mesh>
      <mesh position={[0, 0.17, -0.06]} castShadow>
        <boxGeometry args={[0.45, 0.1, 0.025]} />
        <meshStandardMaterial color="#8a6447" />
      </mesh>
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} position={[x, 0.05, 0]}>
          <boxGeometry args={[0.03, 0.1, 0.12]} />
          <meshStandardMaterial color="#3d4a40" />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- river: winding ribbon with animated ripples ---------- */
function useWaterMaterial() {
  return useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: WATER, roughness: 0.12, metalness: 0.25 });
    m.userData.time = { value: 0 };
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = m.userData.time;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec2 vRiverUv;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvRiverUv = uv;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform float uTime;\nvarying vec2 vRiverUv;")
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          float edge = smoothstep(0.0, 0.18, vRiverUv.y) * smoothstep(1.0, 0.82, vRiverUv.y);
          float w = sin(vRiverUv.x * 220.0 - uTime * 2.2 + sin(vRiverUv.y * 9.0 + uTime) * 1.5);
          float ripple = smoothstep(0.82, 1.0, w) * edge;
          diffuseColor.rgb = mix(diffuseColor.rgb * 0.82, diffuseColor.rgb, edge);
          diffuseColor.rgb += ripple * 0.22;`
        );
    };
    m.customProgramCacheKey = () => "river-v2";
    return m;
  }, []);
}

/* ring-shaped strip with uv.x running around the circle, uv.y across it */
function ringRibbon(rIn, rOut, y, steps = 180) {
  const pos = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    pos.push(c * rIn, y, sn * rIn, c * rOut, y, sn * rOut);
    uv.push(i / steps, 0, i / steps, 1);
    if (i < steps) {
      const k = i * 2;
      idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export const RIVER_IN = 2.55;
export const RIVER_OUT = 3.0;

/* river looping around the plaza, with a bridge on each path */
function River() {
  const water = useWaterMaterial();
  const bank = useMemo(() => ringRibbon(RIVER_IN - 0.08, RIVER_OUT + 0.08, 0.009), []);
  const surface = useMemo(() => ringRibbon(RIVER_IN, RIVER_OUT, 0.014), []);

  useFrame((state) => {
    water.userData.time.value = state.clock.elapsedTime;
  });

  return (
    <group>
      <mesh geometry={bank} receiveShadow>
        <meshStandardMaterial color="#d9cba8" roughness={0.95} />
      </mesh>
      <mesh geometry={surface} material={water} receiveShadow />
      {[0, 1, 2, 3].map((i) => (
        <Bridge key={i} angle={(i * Math.PI) / 2} />
      ))}
    </group>
  );
}

function Bridge({ angle }) {
  const r = (RIVER_IN + RIVER_OUT) / 2;
  const span = RIVER_OUT - RIVER_IN + 0.35;
  return (
    <group position={[Math.sin(angle) * r, 0, Math.cos(angle) * r]} rotation={[0, angle, 0]}>
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.04, span]} />
        <meshStandardMaterial color="#c9b48f" roughness={0.8} />
      </mesh>
      {[-0.2, 0.2].map((dx) => (
        <group key={dx}>
          <mesh position={[dx, 0.14, 0]} castShadow>
            <boxGeometry args={[0.03, 0.025, span]} />
            <meshStandardMaterial color="#f7f3ea" />
          </mesh>
          {[-1, 0, 1].map((k) => (
            <mesh key={k} position={[dx, 0.1, (k * span) / 2.4]}>
              <boxGeometry args={[0.03, 0.08, 0.03]} />
              <meshStandardMaterial color="#f7f3ea" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ---------- plaza garden + pocket parks ---------- */
function Grass({ position, size, delay, children }) {
  const ref = useRef();
  const grow = useGrow(delay);
  useFrame((state, dt) => {
    ref.current.scale.setScalar(grow(state, dt));
  });
  return (
    <group position={position}>
      <group ref={ref}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial color={GRASS} roughness={0.95} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]} receiveShadow>
          <planeGeometry args={[size * 0.16, size * 0.92]} />
          <meshStandardMaterial color={PATH} roughness={0.9} />
        </mesh>
        {children}
      </group>
    </group>
  );
}

function PlazaGarden() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <ringGeometry args={[1.85, RING_INNER - 0.05, 96]} />
        <meshStandardMaterial color={GRASS} roughness={0.95} />
      </mesh>
      {/* stone walkway ring + four radial paths */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, 0]} receiveShadow>
        <ringGeometry args={[2.18, 2.38, 96]} />
        <meshStandardMaterial color={PATH} roughness={0.9} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, (i * Math.PI) / 2]} position={[0, 0.007, 0]} receiveShadow>
          <planeGeometry args={[0.32, (RING_INNER - 0.05) * 2]} />
          <meshStandardMaterial color={PATH} roughness={0.9} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <circleGeometry args={[1.85, 64]} />
        <meshStandardMaterial color="#eee6d4" roughness={0.85} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = Math.PI / 4 + (i * Math.PI) / 2;
        return <Fountain key={i} position={[Math.cos(a) * 3.48, 0, Math.sin(a) * 3.48]} scale={0.48} delay={1.4 + i * 0.1} />;
      })}
      {[0, 1, 2, 3].map((i) => {
        const a = (i * Math.PI) / 2 + 0.32;
        return <Bench key={i} position={[Math.cos(a) * 2.05, 0, Math.sin(a) * 2.05]} rotation={-a - Math.PI / 2} />;
      })}
    </group>
  );
}

function useNatureLayout(parks) {
  return useMemo(() => {
    const rand = rng(23);
    const trees = [];
    const flowers = [];
    const tree = (x, z, scale = 1) =>
      trees.push({
        x,
        z,
        h: (0.55 + rand() * 0.3) * scale,
        r: (0.2 + rand() * 0.1) * scale,
        color: CANOPY[Math.floor(rand() * CANOPY.length)],
      });
    const bed = (cx, cz, radius, count) => {
      for (let i = 0; i < count; i++) {
        const a = rand() * Math.PI * 2;
        const r = Math.sqrt(rand()) * radius;
        flowers.push({ x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r, color: FLOWERS[Math.floor(rand() * FLOWERS.length)] });
      }
    };

    // plaza garden: a ring of trees between the fountains, flower beds by the paths
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + Math.PI / 16;
      const nearPath = [0, 1, 2, 3].some((k) => Math.abs(((a - (k * Math.PI) / 2 + Math.PI * 3) % (Math.PI * 2)) - Math.PI) > Math.PI - 0.2);
      const nearFountain = [0, 1, 2, 3].some((k) => Math.abs(((a - Math.PI / 4 - (k * Math.PI) / 2 + Math.PI * 3) % (Math.PI * 2)) - Math.PI) > Math.PI - 0.32);
      if (nearPath || nearFountain) continue;
      tree(Math.cos(a) * 3.5, Math.sin(a) * 3.5, 0.8);
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      bed(Math.cos(a) * 2.2, Math.sin(a) * 2.2, 0.14, 12);
    }

    // pocket parks: trees in the corners, flowers in the middle
    parks.forEach((p) => {
      const o = p.size * 0.3;
      [
        [-o, -o],
        [o, -o],
        [-o, o],
        [o, o],
      ].forEach(([dx, dz]) => {
        if (rand() < 0.85) tree(p.x + dx + (rand() - 0.5) * 0.1, p.z + dz + (rand() - 0.5) * 0.1);
      });
      bed(p.x + o * 0.9, p.z, 0.12, 10);
      bed(p.x - o * 0.9, p.z, 0.12, 10);
    });

    // street trees along the main boulevard toward the viewer
    for (let z = 5.9; z <= 12.5; z += 0.9) {
      tree(-0.75, z, 0.75);
      tree(0.75, z, 0.75);
    }

    return { trees, flowers };
  }, [parks]);
}

export default function Nature({ parks }) {
  const { trees, flowers } = useNatureLayout(parks);
  const bigPark = useMemo(
    () => parks.reduce((best, p) => (!best || Math.hypot(p.x, p.z) < Math.hypot(best.x, best.z) ? p : best), null),
    [parks]
  );

  return (
    <group>
      <PlazaGarden />
      {parks.map((p, i) => (
        <Grass key={i} position={[p.x, 0, p.z]} size={p.size} delay={p.delay}>
          {p === bigPark ? (
            <Fountain position={[0, 0, 0]} scale={0.6} delay={p.delay + 0.3} />
          ) : (
            <>
              <Bench position={[0.12, 0, 0]} rotation={-Math.PI / 2} />
              <Bench position={[-0.12, 0, 0]} rotation={Math.PI / 2} />
            </>
          )}
        </Grass>
      ))}
      <River />
      <Trees spots={trees} />
      <Flowers spots={flowers} />
    </group>
  );
}

