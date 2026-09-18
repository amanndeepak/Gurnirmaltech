import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useScroll, RoundedBox } from "@react-three/drei";
import { hill } from "./utils";
import { frac } from "./sections";

const EKDIARY = frac("ekdiary");

const SHARDS = [
  { pos: [3.2, 1.6, -3], size: [1.0, 1.3, 0.08], rot: 0.3, speed: 0.2 },
  { pos: [4.0, -1.0, -4], size: [0.7, 0.7, 0.08], rot: -0.4, speed: 0.28 },
  { pos: [2.6, -1.8, -2.5], size: [0.55, 1.4, 0.08], rot: 0.15, speed: 0.15 },
  { pos: [4.2, 0.4, -2], size: [0.8, 0.55, 0.08], rot: -0.2, speed: 0.24 },
];

function Shard({ pos, size, rot, speed, opacity }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime * speed + pos[0]) * 0.25;
    ref.current.rotation.z = rot + Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.15;
    ref.current.rotation.y += 0.0015;
  });
  return (
    <RoundedBox ref={ref} args={size} radius={0.06} position={pos} rotation={[0, 0.4, rot]}>
      <meshPhysicalMaterial
        color="#0e1912"
        transparent
        opacity={opacity}
        roughness={0.15}
        metalness={0.1}
        transmission={0.4}
        thickness={0.5}
        clearcoat={1}
        emissive="#86bc25"
        emissiveIntensity={0.08}
      />
    </RoundedBox>
  );
}

export default function FloatingShards() {
  const group = useRef();
  const scroll = useScroll();
  const opacity = useRef(0);

  useFrame(() => {
    const o = hill(scroll.offset, EKDIARY.start, EKDIARY.length, 0.4 / 10);
    opacity.current = THREE.MathUtils.lerp(opacity.current, o, 0.12);
    group.current.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, o));
  });

  return (
    <group ref={group}>
      {SHARDS.map((s, i) => (
        <Shard key={i} {...s} opacity={0.4} />
      ))}
    </group>
  );
}
