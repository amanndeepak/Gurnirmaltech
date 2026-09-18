import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useScroll, Sparkles } from "@react-three/drei";
import { hill } from "./utils";
import { frac } from "./sections";

// A rotating wireframe "neural core" with orbiting nodes — the AI motif that
// anchors the Who-We-Are and Why-Us sections (the hero has its own photo
// banner, so the core stays hidden there).
function NodeRing({ radius, count, speed, color }) {
  const ref = useRef();
  useFrame((_, delta) => {
    ref.current.rotation.z += delta * speed;
  });
  const nodes = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return [Math.cos(a) * radius, Math.sin(a) * radius, 0];
  });
  return (
    <group ref={ref}>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} />
        </mesh>
      ))}
    </group>
  );
}

const WHO_WE_ARE = frac("whoWeAre");
const WHY_US = frac("whyUs");

export default function AmbientCore() {
  const group = useRef();
  const core = useRef();
  const scroll = useScroll();

  useFrame((state, delta) => {
    const inWho = hill(scroll.offset, WHO_WE_ARE.start, WHO_WE_ARE.length, 0.4 / 10);
    const inWhy = hill(scroll.offset, WHY_US.start, WHY_US.length, 0.4 / 10);
    const o = Math.max(inWho, inWhy);

    const targetScale = THREE.MathUtils.lerp(0.001, 1, o);
    group.current.scale.setScalar(
      THREE.MathUtils.lerp(group.current.scale.x, targetScale, 0.12)
    );

    group.current.rotation.y += delta * 0.18;
    core.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.15;
  });

  return (
    <group ref={group} position={[3.4, -0.4, -6]}>
      <mesh ref={core}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshStandardMaterial
          color="#3c6b12"
          wireframe
          transparent
          opacity={0.28}
          roughness={0.4}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.22}
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>
      <NodeRing radius={1.9} count={7} speed={0.25} color="#5b9c1f" />
      <NodeRing radius={2.3} count={5} speed={-0.18} color="#86bc25" />
      <Sparkles count={40} scale={2.6} size={1.2} speed={0.3} color="#5b9c1f" opacity={0.35} />
    </group>
  );
}
