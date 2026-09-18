import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useScroll, Image as DreiImage } from "@react-three/drei";
import { hill } from "./utils";
import { frac } from "./sections";
import { parkImages } from "../data/content";

const TECH_PARKS = frac("techParks");
const PALETTE = ["#cfd6c8", "#d9c6a0", "#a9c1d9", "#c9d3b8"];

function makeBuildings(count, seedSpread) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (3.4 + Math.random() * 4.2);
    const z = -9 + (i / count) * seedSpread + (Math.random() - 0.5) * 1.6;
    const h = 1.6 + Math.random() * 4.6;
    const w = 0.9 + Math.random() * 1.1;
    const color = PALETTE[i % PALETTE.length];
    arr.push({ x, z, h, w, color, id: i });
  }
  return arr;
}

function Building({ x, z, h, w, color }) {
  return (
    <group position={[x, h / 2 - 2, z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, w]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0, w / 2 + 0.01]}>
        <planeGeometry args={[w * 0.7, h * 0.82]} />
        <meshStandardMaterial
          color="#eaf4ff"
          emissive="#bcdcff"
          emissiveIntensity={0.2}
          transparent
          opacity={0.55}
        />
      </mesh>
    </group>
  );
}

const POSTERS = [
  { url: parkImages[0], pos: [4.6, 1.4, 2.6], rot: -0.42, scale: [2.5, 3.1] },
  { url: parkImages[1], pos: [-4.7, 1.1, -1.4], rot: 0.42, scale: [2.2, 2.4] },
  { url: parkImages[2], pos: [5.1, 1.7, -5], rot: -0.36, scale: [2.2, 2.4] },
  { url: parkImages[3], pos: [-5.2, 1.9, 5.6], rot: 0.32, scale: [2.4, 3.1] },
];

export default function CityScape() {
  const group = useRef();
  const scroll = useScroll();
  const buildings = useMemo(() => makeBuildings(22, 18), []);

  useFrame(() => {
    const o = hill(scroll.offset, TECH_PARKS.start, TECH_PARKS.length, 0.35 / 10);
    const targetScale = THREE.MathUtils.lerp(0.001, 1, o);
    group.current.scale.setScalar(
      THREE.MathUtils.lerp(group.current.scale.x, targetScale, 0.1)
    );
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial color="#dde3d2" roughness={0.9} />
      </mesh>
      {buildings.map((b) => (
        <Building key={b.id} x={b.x} z={b.z} h={b.h} w={b.w} color={b.color} />
      ))}
      {POSTERS.map((p, i) => (
        <group key={i} position={p.pos} rotation={[0, p.rot, 0]}>
          <DreiImage url={p.url} scale={p.scale} radius={0.12} transparent />
        </group>
      ))}
    </group>
  );
}
