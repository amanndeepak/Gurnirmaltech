import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  Sparkles,
} from "@react-three/drei";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { easing } from "maath";
import City, { useCity } from "./City";
import Tower, { TOWER_TOP } from "./Tower";
import Roads from "./Roads";
import Nature from "./Nature";
import Interior from "./Interiors";

/* brand palette (matches src/index.css) */
const GREEN = "#5b9c1f";
const GREEN_BRIGHT = "#86bc25";
const GREEN_LIGHT = "#a4d94a";
const PAPER = "#f3efe5";
const CORE_Y = 2.6;

/* glowing rings on the plaza floor under the core, pulsing outward */
function PlazaRings() {
  const rings = useRef([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    rings.current.forEach((m, i) => {
      if (!m) return;
      const k = (t * 0.35 + i / 3) % 1;
      m.scale.setScalar(1 + k * 1.8);
      m.material.opacity = (1 - k) * 0.55;
    });
  });
  return (
    <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[1.5, 1.6, 128]} />
        <meshBasicMaterial color={GREEN} transparent opacity={0.85} />
      </mesh>
      <mesh>
        <circleGeometry args={[1.5, 128]} />
        <meshBasicMaterial color={GREEN_LIGHT} transparent opacity={0.18} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => (rings.current[i] = el)}>
          <ringGeometry args={[1.55, 1.6, 128]} />
          <meshBasicMaterial color={GREEN_BRIGHT} transparent depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- reflective floor + grid ---------- */
function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <MeshReflectorMaterial
          blur={[400, 120]}
          resolution={1024}
          mixBlur={1}
          mixStrength={1.2}
          roughness={0.9}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#e9e3d5"
          metalness={0.1}
        />
      </mesh>
      <gridHelper args={[120, 120, "#cfd8bd", "#e0dccd"]} position={[0, 0.005, 0]} />
    </group>
  );
}

/* ---------- camera: intro fly-in, mouse parallax, explore mode, fly to a sign ---------- */
function CameraRig({ explore, fly }) {
  const look = useMemo(() => new THREE.Vector3(0, CORE_Y, 0), []);
  const { camera } = useThree();

  useEffect(() => {
    camera.fov = 40;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame((state, dt) => {
    const { pointer, clock } = state;
    const t = clock.elapsedTime;

    if (fly) {
      // swoop in to stand just in front of the clicked sign
      const target = new THREE.Vector3(...fly);
      const away = new THREE.Vector3(camera.position.x - target.x, 0, camera.position.z - target.z).normalize();
      easing.damp3(camera.position, [target.x + away.x * 1.4, target.y + 0.15, target.z + away.z * 1.4], 0.3, dt);
      easing.damp3(look, target, 0.2, dt);
      camera.lookAt(look);
      return;
    }

    const narrow = state.size.width < 700;
    const base = explore
      ? new THREE.Vector3(Math.sin(Math.sin(t * 0.25) * 0.9) * 8.5, CORE_Y + 1.2, Math.cos(Math.sin(t * 0.25) * 0.9) * 8.5)
      : new THREE.Vector3(0, 4.2, narrow ? 19 : 14);
    base.x += pointer.x * (explore ? 1 : 2.4);
    base.y += pointer.y * (explore ? 0.6 : 1.4);
    easing.damp3(camera.position, base, t < 3 ? 1.1 : 0.55, dt);
    easing.damp3(look, [pointer.x * 0.4, CORE_Y + (explore ? 0 : 0.5), 0], 0.4, dt);
    camera.lookAt(look);
  });
  return null;
}

export default function Scene({ explore, view, fly, onEnter }) {
  const { buildings, parks } = useCity();
  const inCity = view === "city";
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 16, 38], fov: 40, near: 0.05, far: 200 }}
    >
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={4} position={[0, 5, -9]} scale={2} />
          <Lightformer form="rect" color={GREEN_LIGHT} intensity={2} position={[-5, 1, -1]} scale={[3, 6, 1]} />
          <Lightformer form="rect" intensity={2} position={[10, 1, 0]} scale={[10, 2, 1]} />
        </group>
      </Environment>

      {inCity ? (
        <>
          <color attach="background" args={[PAPER]} />
          <fog attach="fog" args={[PAPER, 14, 40]} />
          <CameraRig explore={explore} fly={fly} />
        </>
      ) : (
        <Interior type={view} />
      )}

      <group visible={inCity}>
        <hemisphereLight args={["#fffaf0", "#d9cdb4", 1.3]} />
        <directionalLight
          position={[9, 16, 7]}
          intensity={1.8}
          color="#fff6e6"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-camera-far={60}
        />
        <directionalLight position={[-10, 6, -4]} intensity={0.6} color="#e6f4d2" />

        <Tower explore={explore} />
        <PlazaRings />
        <pointLight position={[0, TOWER_TOP + 1, 0]} color={GREEN_LIGHT} intensity={5} distance={9} decay={2} />
        <City buildings={buildings} onEnter={fly ? undefined : onEnter} />
        <Roads />
        <Nature parks={parks} />
        <Floor />

        <Sparkles count={140} scale={[22, 10, 22]} position={[0, 4, 0]} size={2.4} speed={0.35} color={GREEN} />
      </group>

      <EffectComposer multisampling={4}>
        <Vignette eskil={false} offset={0.3} darkness={0.35} />
      </EffectComposer>
    </Canvas>
  );
}
