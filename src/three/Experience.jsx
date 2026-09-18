import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll } from "@react-three/drei";
import ScrollBridge from "./ScrollBridge";
import CameraRig from "./CameraRig";
import AmbientCore from "./AmbientCore";
import FloatingShards from "./FloatingShards";
import EcosystemWalk from "./EcosystemWalk";
import CityScape from "./CityScape";
import DistantSkyline from "./DistantSkyline";
import { PAGES } from "./sections";

export default function Experience({ children }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 9], fov: 45, near: 0.1, far: 90 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#e9f1e6"]} />
      <fog attach="fog" args={["#e9f1e6", 20, 48]} />

      <ambientLight intensity={0.85} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.5}
        color="#fff8ec"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-camera-near={1}
        shadow-camera-far={45}
        shadow-bias={-0.0015}
      />
      <directionalLight position={[-8, 4, -6]} intensity={0.35} color="#cfe8c8" />
      <hemisphereLight args={["#e9f3ff", "#cfe0b8", 0.6]} />

      <Suspense fallback={null}>
        <ScrollControls pages={PAGES} damping={0.25}>
          <ScrollBridge />
          <CameraRig />

          <AmbientCore />
          <FloatingShards />
          <EcosystemWalk />
          <CityScape />
          <DistantSkyline />

          <Scroll html style={{ width: "100%" }}>
            {children}
          </Scroll>
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
}
