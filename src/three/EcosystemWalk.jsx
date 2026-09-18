import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useScroll, Billboard, Text, RoundedBox } from "@react-three/drei";
import { hill, smoothstep, makeRng } from "./utils";
import { PAGES, SECTIONS, frac } from "./sections";

const ECO_START = SECTIONS.ecopark.start;
const ECO_LEN = SECTIONS.ecopark.length;
const ECO_END = ECO_START + ECO_LEN;
const FLOOR_H = 0.85;

const CURVE_POINTS = [
  [0, 0, 9],
  [-1.6, 0, 4.5],
  [1.6, 0, 0],
  [-1.6, 0, -4.5],
  [1.6, 0, -9],
  [-1.6, 0, -13.5],
  [1.6, 0, -18],
  [-1.6, 0, -22.5],
  [1.6, 0, -27],
  [0, 0, -32],
].map((p) => new THREE.Vector3(...p));

const BUILDINGS = [
  {
    id: "it",
    x: -5.4,
    z: 6,
    floors: 5,
    width: 2.4,
    color: "#3f6fa8",
    icon: "code",
    label: "IT Offices & Startups",
    desc: "Startups & enterprise tech teams",
  },
  {
    id: "ai",
    x: 5.6,
    z: 2,
    floors: 6,
    width: 2.2,
    color: "#2f9082",
    icon: "cpu",
    label: "AI & R&D Centers",
    desc: "Research labs & innovation studios",
  },
  {
    id: "health",
    x: -5.6,
    z: -2,
    floors: 3,
    width: 3.0,
    color: "#e7ece7",
    icon: "heart-pulse",
    label: "Hospitals & Healthcare",
    desc: "Clinics, diagnostics & emergency care",
  },
  {
    id: "edu",
    x: 5.6,
    z: -6,
    floors: 4,
    width: 2.6,
    color: "#cf9a4e",
    icon: "graduation-cap",
    label: "Education & Skill-Development",
    desc: "Schools & professional skilling",
  },
  {
    id: "stay",
    x: -5.6,
    z: -10,
    floors: 7,
    width: 2.1,
    color: "#c9a86a",
    icon: "hotel",
    label: "Hotels & Residences",
    desc: "Serviced apartments & guest stays",
  },
  {
    id: "play",
    x: 5.6,
    z: -14,
    floors: 3,
    width: 2.8,
    color: "#8a53ad",
    icon: "clapperboard",
    label: "Gaming, Esports & Cinemas",
    desc: "Arcades, esports arenas & screens",
  },
  {
    id: "retail",
    x: -5.6,
    z: -18,
    floors: 2,
    width: 3.2,
    color: "#dd7f42",
    icon: "shopping-bag",
    label: "Retail & Food Courts",
    desc: "Shops, cafes & restaurants",
  },
  {
    id: "sport",
    x: 5.6,
    z: -22,
    floors: 2,
    width: 2.6,
    color: "#4f9a3f",
    icon: "dumbbell",
    label: "Gyms & Sports Complexes",
    desc: "Fitness studios & sports courts",
  },
  {
    id: "transit",
    x: -5.6,
    z: -26,
    floors: 2,
    width: 2.8,
    color: "#5f6f7c",
    icon: "train",
    label: "Metro, Bus & EV Hub",
    desc: "Metro, bus stop & EV charging",
  },
  {
    id: "civic",
    x: 5.6,
    z: -30,
    floors: 4,
    width: 2.6,
    color: "#2c3f5e",
    icon: "landmark",
    label: "Banks, Daycare & Civic Center",
    desc: "Banking, daycare & security desk",
  },
];

function buildRibbon(curve, width, divisions) {
  const positions = [];
  const indices = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= divisions; i++) {
    const t = i / divisions;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const normal = new THREE.Vector3().crossVectors(tan, up).normalize();
    const left = p.clone().addScaledVector(normal, width / 2);
    const right = p.clone().addScaledVector(normal, -width / 2);
    positions.push(left.x, 0.02, left.z, right.x, 0.02, right.z);
  }
  for (let i = 0; i < divisions; i++) {
    const a = i * 2,
      b = i * 2 + 1,
      c = i * 2 + 2,
      d = i * 2 + 3;
    indices.push(a, b, c, b, d, c);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function Building({ data, avatarState, visibleRef }) {
  const segRefs = useRef([]);
  const pinRef = useRef();

  const segments = useMemo(() => {
    const rand = makeRng(data.z * 13.37 + 1000);
    return Array.from({ length: data.floors }, (_, i) => ({
      w: data.width - i * 0.05,
      scatterX: (rand() - 0.5) * 3.4,
      scatterZ: (rand() - 0.5) * 3.4,
      scatterRotY: (i % 2 === 0 ? 1 : -1) * (0.4 + rand() * 0.4),
    }));
  }, [data]);

  useFrame(() => {
    const avatarZ = avatarState.current.pos.z;
    const raw = avatarZ - data.z;
    const t = 1 - THREE.MathUtils.clamp(raw / 8, 0, 1);
    // Gate by overall section visibility too, so buildings don't appear
    // "pre-assembled" from the resting camera position before the
    // ecopark section has actually scrolled into view.
    const reveal = smoothstep(t) * visibleRef.current;

    segments.forEach((s, i) => {
      const ref = segRefs.current[i];
      if (!ref) return;
      const finalY = i * FLOOR_H + FLOOR_H / 2;
      const scatterY = finalY + 5 + i * 1.5;
      const segReveal = THREE.MathUtils.clamp(reveal * segments.length - i, 0, 1);
      ref.position.set(
        THREE.MathUtils.lerp(s.scatterX, 0, segReveal),
        THREE.MathUtils.lerp(scatterY, finalY, segReveal),
        THREE.MathUtils.lerp(s.scatterZ, 0, segReveal)
      );
      ref.rotation.y = THREE.MathUtils.lerp(s.scatterRotY, 0, segReveal);
    });

    // Fade the pin in as the avatar approaches and out again once past —
    // a sign you pass, not a permanent tag. Real 3D text/geometry (not a
    // screen-projected Html overlay) so it behaves consistently regardless
    // of camera angle. Window is wide since the walk itself is slow now,
    // so there's plenty of time to actually read each sign.
    const entryFade = smoothstep(THREE.MathUtils.clamp((9 - raw) / 2, 0, 1));
    const exitFade = smoothstep(THREE.MathUtils.clamp((raw + 6) / 2, 0, 1));
    const pinReveal = Math.min(entryFade, exitFade) * visibleRef.current;
    if (pinRef.current) {
      pinRef.current.scale.setScalar(
        THREE.MathUtils.lerp(pinRef.current.scale.x, pinReveal, 0.15)
      );
    }
  });

  const totalH = data.floors * FLOOR_H;
  const windowCols = data.width > 2.7 ? 4 : 3;

  return (
    <group position={[data.x, 0, data.z]}>
      {segments.map((s, i) => {
        const isGround = i === 0;
        const isTop = i === segments.length - 1;
        return (
          <group key={i} ref={(el) => (segRefs.current[i] = el)}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[s.w, FLOOR_H * 0.94, s.w]} />
              <meshStandardMaterial color={data.color} roughness={0.65} metalness={0.08} />
            </mesh>

            {/* Window grid on the front face — small individual panes read
                as an actual facade rather than one flat glass sheet. */}
            {Array.from({ length: windowCols }).map((_, wx) => (
              <mesh
                key={wx}
                position={[
                  (wx - (windowCols - 1) / 2) * (s.w / (windowCols + 0.4)),
                  0,
                  s.w / 2 + 0.02,
                ]}
              >
                <planeGeometry args={[s.w / (windowCols + 1.4), FLOOR_H * 0.55]} />
                <meshStandardMaterial
                  color="#eaf4ff"
                  emissive="#bcdcff"
                  emissiveIntensity={0.18}
                  transparent
                  opacity={0.88}
                  roughness={0.2}
                />
              </mesh>
            ))}

            {/* Ground-floor entrance */}
            {isGround && (
              <>
                <mesh position={[0, -FLOOR_H * 0.22, s.w / 2 + 0.03]}>
                  <planeGeometry args={[s.w * 0.3, FLOOR_H * 0.46]} />
                  <meshStandardMaterial color="#22301f" roughness={0.4} />
                </mesh>
                <mesh position={[0, FLOOR_H * 0.28, s.w / 2 + 0.05]} rotation={[0.5, 0, 0]}>
                  <boxGeometry args={[s.w * 0.42, 0.05, 0.35]} />
                  <meshStandardMaterial color={data.color} roughness={0.5} />
                </mesh>
              </>
            )}

            {/* Roof parapet on the top floor */}
            {isTop && (
              <mesh position={[0, FLOOR_H * 0.52, 0]} castShadow>
                <boxGeometry args={[s.w * 1.04, FLOOR_H * 0.12, s.w * 1.04]} />
                <meshStandardMaterial color={data.color} roughness={0.7} />
              </mesh>
            )}
          </group>
        );
      })}

      <group ref={pinRef} position={[0, totalH + 1.35, 0]} scale={0.001}>
        <Billboard>
          <RoundedBox args={[2.6, 0.72, 0.04]} radius={0.12} smoothness={4}>
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </RoundedBox>
          <Text
            position={[0, 0.13, 0.03]}
            fontSize={0.15}
            lineHeight={1.1}
            color="#16241a"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.3}
            textAlign="center"
          >
            {data.label}
          </Text>
          <Text
            position={[0, -0.15, 0.03]}
            fontSize={0.105}
            color="#5c6e5c"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.3}
            textAlign="center"
          >
            {data.desc}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

function Trees() {
  const trees = useMemo(() => {
    const arr = [];
    const rand = makeRng(7);
    for (let i = 0; i < 34; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (7.6 + rand() * 3.2);
      const z = 10 - rand() * 44;
      const s = 0.7 + rand() * 0.6;
      const hue = 0.34 + rand() * 0.05;
      const green = new THREE.Color().setHSL(hue, 0.42, 0.36 + rand() * 0.1);
      arr.push({ x, z, s, key: i, rot: rand() * Math.PI * 2, green: `#${green.getHexString()}` });
    }
    return arr;
  }, []);

  return (
    <group>
      {trees.map((t) => (
        <group key={t.key} position={[t.x, 0, t.z]} scale={t.s} rotation={[0, t.rot, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.14, 1, 6]} />
            <meshStandardMaterial color="#6b4d30" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.3, 0]} castShadow>
            <coneGeometry args={[0.7, 1.5, 8]} />
            <meshStandardMaterial color={t.green} roughness={0.85} />
          </mesh>
          <mesh position={[0, 1.9, 0]} castShadow>
            <coneGeometry args={[0.5, 1.1, 8]} />
            <meshStandardMaterial color={t.green} roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SolarPavilion({ position }) {
  return (
    <group position={position}>
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
          <meshStandardMaterial color="#8a9a8a" />
        </mesh>
      ))}
      <mesh position={[0, 1.25, 0]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[2.2, 0.08, 1.4]} />
        <meshStandardMaterial color="#1c2b45" emissive="#2f5c8a" emissiveIntensity={0.25} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

export default function EcosystemWalk() {
  const scroll = useScroll();
  const group = useRef();
  const avatarGroup = useRef();
  const leftLeg = useRef();
  const rightLeg = useRef();
  const leftArm = useRef();
  const rightArm = useRef();
  const mouse = useRef({ x: 0, y: 0 });
  const avatarState = useRef({ pos: new THREE.Vector3(0, 0, 9), tangent: new THREE.Vector3(0, 0, -1) });
  const visibleRef = useRef(0);
  const prevU = useRef(0);
  const walkPhase = useRef(0);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(CURVE_POINTS, false, "catmullrom", 0.5), []);
  const ribbonGeo = useMemo(() => buildRibbon(curve, 2.2, 120), [curve]);
  const camPos = useRef(new THREE.Vector3());
  const camLook = useRef(new THREE.Vector3());

  useEffect(() => {
    const handler = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", handler);
    return () => window.removeEventListener("pointermove", handler);
  }, []);

  useFrame((state) => {
    const p = scroll.offset * PAGES;
    const active = p >= ECO_START && p < ECO_END;

    const { start, length } = frac("ecopark");
    const visibility = hill(scroll.offset, start, length, 0.35 / PAGES);
    const targetScale = THREE.MathUtils.lerp(0.001, 1, visibility);
    if (group.current) {
      group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, targetScale, 0.12));
    }
    visibleRef.current = visibility;

    const u = THREE.MathUtils.clamp((p - ECO_START) / ECO_LEN, 0, 1);
    const point = curve.getPointAt(u);
    const tangent = curve.getTangentAt(u);
    avatarState.current.pos.copy(point);
    avatarState.current.tangent.copy(tangent);

    // Tie the walk cycle to actual distance travelled (not wall-clock
    // time), so the avatar's legs only stride while you're scrolling — a
    // real walk, not a figure sliding along on legs that never sync up.
    const du = u - prevU.current;
    prevU.current = u;
    walkPhase.current += Math.abs(du) * 60;
    const swing = Math.sin(walkPhase.current) * 0.55;

    if (avatarGroup.current) {
      const bob = Math.abs(Math.sin(walkPhase.current)) * 0.07;
      avatarGroup.current.position.set(point.x, bob, point.z);
      avatarGroup.current.rotation.y = Math.atan2(tangent.x, tangent.z);
    }
    if (leftLeg.current) leftLeg.current.rotation.x = swing;
    if (rightLeg.current) rightLeg.current.rotation.x = -swing;
    if (leftArm.current) leftArm.current.rotation.x = -swing * 0.8;
    if (rightArm.current) rightArm.current.rotation.x = swing * 0.8;

    if (active) {
      const behind = tangent.clone().multiplyScalar(-6.2);
      camPos.current.copy(point).add(behind).add(new THREE.Vector3(0, 3.3, 0));
      camLook.current
        .copy(point)
        .add(tangent.clone().multiplyScalar(5))
        .add(new THREE.Vector3(0, 1.1, 0));

      camPos.current.x += mouse.current.x * 0.5;
      camPos.current.y += -mouse.current.y * 0.3;

      state.camera.position.copy(camPos.current);
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, 50, 0.1);
      state.camera.updateProjectionMatrix();
      state.camera.lookAt(camLook.current);
    }
  });

  return (
    <group ref={group}>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -12]} receiveShadow>
        <planeGeometry args={[40, 60]} />
        <meshStandardMaterial color="#8fbb63" roughness={0.95} />
      </mesh>

      {/* Path */}
      <mesh geometry={ribbonGeo} receiveShadow>
        <meshStandardMaterial color="#e8e4d8" roughness={0.85} />
      </mesh>

      {/* Lake */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9.5, 0.03, -9]}>
        <circleGeometry args={[3.4, 32]} />
        <meshStandardMaterial color="#6fb3d9" roughness={0.15} metalness={0.35} emissive="#3d7fa8" emissiveIntensity={0.15} />
      </mesh>

      {/* Cycling / walking track loop near the entrance */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 7]}>
        <ringGeometry args={[3.6, 4, 48]} />
        <meshStandardMaterial color="#c96b4e" roughness={0.9} />
      </mesh>

      <Trees />
      <SolarPavilion position={[-8.6, 0, -25]} />

      {BUILDINGS.map((b) => (
        <Building key={b.id} data={b} avatarState={avatarState} visibleRef={visibleRef} />
      ))}

      {/* Walking avatar */}
      <group ref={avatarGroup}>
        <mesh position={[0, 0.95, 0]} castShadow>
          <capsuleGeometry args={[0.16, 0.5, 4, 8]} />
          <meshStandardMaterial color="#2c3e2c" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.42, 0]} castShadow>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#e8b48a" roughness={0.6} />
        </mesh>
        <mesh ref={leftLeg} position={[-0.09, 0.55, 0]} castShadow>
          <capsuleGeometry args={[0.06, 0.5, 4, 8]} />
          <meshStandardMaterial color="#16241a" roughness={0.7} />
        </mesh>
        <mesh ref={rightLeg} position={[0.09, 0.55, 0]} castShadow>
          <capsuleGeometry args={[0.06, 0.5, 4, 8]} />
          <meshStandardMaterial color="#16241a" roughness={0.7} />
        </mesh>
        <mesh ref={leftArm} position={[-0.24, 0.98, 0]} castShadow>
          <capsuleGeometry args={[0.05, 0.42, 4, 8]} />
          <meshStandardMaterial color="#2c3e2c" roughness={0.7} />
        </mesh>
        <mesh ref={rightArm} position={[0.24, 0.98, 0]} castShadow>
          <capsuleGeometry args={[0.05, 0.42, 4, 8]} />
          <meshStandardMaterial color="#2c3e2c" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[0.4, 0.16, 0.24]} />
          <meshStandardMaterial color="#86bc25" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
