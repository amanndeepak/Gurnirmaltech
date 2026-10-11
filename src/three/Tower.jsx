import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const FLOORS = 30;
const FLOOR_H = 0.13;
const WIDTH = 1.4;
export const TOWER_TOP = FLOORS * FLOOR_H;

const SLAB_WHITE = new THREE.Color("#f8f5ee");
const SLAB_LIME = new THREE.Color("#86bc25");

/* landmark HQ: glass floors stack themselves up, twist, and carry a light wave upward */
export default function Tower({ explore }) {
  const glass = useRef();
  const slabs = useRef();
  const crown = useRef();
  const beacon = useRef();
  const scanner = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const built = useRef(new Array(FLOORS).fill(0));
  const twist = useRef(0.05);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    twist.current = THREE.MathUtils.damp(
      twist.current,
      (explore ? 0.075 : 0.05) + Math.sin(t * 0.4) * 0.012,
      2,
      dt
    );
    const wave = ((t * 0.3) % 1.5) * FLOORS;

    for (let i = 0; i < FLOORS; i++) {
      built.current[i] = THREE.MathUtils.damp(built.current[i], t > 0.8 + i * 0.07 ? 1 : 0, 7, dt);
      const k = built.current[i];
      const drop = (1 - k) * 1.2;
      const taper = 1 - (i / FLOORS) * 0.28;
      const rot = i * twist.current;
      const y = i * FLOOR_H + drop;
      const s = Math.max(taper * k, 0.0001);

      dummy.position.set(0, y + FLOOR_H * 0.46, 0);
      dummy.rotation.set(0, rot, 0);
      dummy.scale.set(WIDTH * s, FLOOR_H * 0.92, WIDTH * s);
      dummy.updateMatrix();
      glass.current.setMatrixAt(i, dummy.matrix);

      dummy.position.set(0, y + FLOOR_H * 0.96, 0);
      dummy.scale.set(WIDTH * s * 1.05, 0.016, WIDTH * s * 1.05);
      dummy.updateMatrix();
      slabs.current.setMatrixAt(i, dummy.matrix);

      const glow = Math.max(0, 1 - Math.abs(wave - i) / 3.5);
      slabs.current.setColorAt(i, color.copy(SLAB_WHITE).lerp(SLAB_LIME, glow));
    }
    glass.current.instanceMatrix.needsUpdate = true;
    slabs.current.instanceMatrix.needsUpdate = true;
    slabs.current.instanceColor.needsUpdate = true;

    const top = built.current[FLOORS - 1];
    crown.current.position.y = TOWER_TOP + (1 - top) * 1.2;
    crown.current.rotation.y = (FLOORS - 1) * twist.current;
    crown.current.scale.setScalar(Math.max(top, 0.0001));
    beacon.current.scale.setScalar(1 + Math.sin(t * 3) * 0.25);

    const h = (Math.sin(t * 0.7) * 0.5 + 0.5) * (TOWER_TOP - 0.2) + 0.1;
    const taperAt = 1 - (h / TOWER_TOP) * 0.28;
    scanner.current.position.y = h;
    scanner.current.scale.setScalar(taperAt * Math.min(top * 2, 1) + 0.0001);
  });

  return (
    <group>
      <instancedMesh ref={glass} args={[null, null, FLOORS]} castShadow receiveShadow>
        <boxGeometry />
        <meshPhysicalMaterial
          color="#7fae6c"
          roughness={0.1}
          metalness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.03}
          iridescence={0.25}
          envMapIntensity={1.4}
        />
      </instancedMesh>
      <instancedMesh ref={slabs} args={[null, null, FLOORS]} castShadow>
        <boxGeometry />
        <meshBasicMaterial />
      </instancedMesh>

      <group ref={crown}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[WIDTH * 0.62, 0.1, WIDTH * 0.62]} />
          <meshStandardMaterial color="#f8f5ee" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.04, 0.9, 8]} />
          <meshStandardMaterial color="#f8f5ee" roughness={0.3} />
        </mesh>
        <mesh ref={beacon} position={[0, 1.02, 0]}>
          <sphereGeometry args={[0.06, 20, 20]} />
          <meshBasicMaterial color="#a4d94a" />
        </mesh>
      </group>

      <group ref={scanner}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.12, 0.014, 12, 96]} />
          <meshBasicMaterial color="#a4d94a" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.98, 1.12, 96]} />
          <meshBasicMaterial color="#a4d94a" transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
