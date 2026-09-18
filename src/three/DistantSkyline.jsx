import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { hill } from "./utils";
import { frac } from "./sections";

const CONTACT = frac("contact");

function makeSkyline(count) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const x = (i - count / 2) * 2.4 + (Math.random() - 0.5) * 1.2;
    const h = 2 + Math.random() * 6;
    arr.push({ x, h, z: -14 - Math.random() * 6, key: i });
  }
  return arr;
}

export default function DistantSkyline() {
  const group = useRef();
  const scroll = useScroll();
  const towers = useMemo(() => makeSkyline(16), []);

  useFrame(() => {
    const o = hill(scroll.offset, CONTACT.start, CONTACT.length, 0.4 / 10);
    const targetScale = THREE.MathUtils.lerp(0.001, 1, o);
    group.current.scale.setScalar(
      THREE.MathUtils.lerp(group.current.scale.x, targetScale, 0.1)
    );
  });

  return (
    <group ref={group} position={[0, -3, 0]}>
      {towers.map((t) => (
        <mesh key={t.key} position={[t.x, t.h / 2, t.z]}>
          <boxGeometry args={[1.4, t.h, 1.4]} />
          <meshStandardMaterial color="#0f1c14" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}
