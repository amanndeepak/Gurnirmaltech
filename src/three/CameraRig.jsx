import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { smoothstep } from "./utils";
import { PAGES, SECTIONS } from "./sections";

// Camera keyframes at each section boundary (in page units, 0..PAGES).
// "ecoparkIn" / "ecoparkOut" bracket the walking-tour section: CameraRig
// interpolates up to ecoparkIn, then hands the camera fully over to
// EcosystemWalk until ecoparkOut, then resumes from there.
const KEYFRAMES = [
  { t: SECTIONS.hero.start, pos: [0, 0.4, 9], look: [0, 0, 0], fov: 45 },
  { t: SECTIONS.whoWeAre.start, pos: [2.6, 0.6, 7], look: [0.4, 0, 0], fov: 42 },
  { t: SECTIONS.capabilities.start, pos: [0, 1.6, 11], look: [0, 0.3, 0], fov: 48 },
  { t: SECTIONS.ekdiary.start, pos: [-2.8, 0.2, 6.5], look: [0.6, 0, 0], fov: 40 },
  { t: SECTIONS.ecopark.start, pos: [0, 5.5, 11], look: [0, 0, 2], fov: 52 },
  {
    t: SECTIONS.ecopark.start + SECTIONS.ecopark.length,
    pos: [0, 3.5, 12],
    look: [0, 1, -4],
    fov: 48,
  },
  { t: SECTIONS.mission.start, pos: [0, 0.2, 7.5], look: [0, 0, 0], fov: 42 },
  { t: SECTIONS.whyUs.start, pos: [2.8, -0.2, 8], look: [-0.5, 0, 0], fov: 44 },
  { t: SECTIONS.contact.start, pos: [0, 6.5, 23], look: [0, 0, -6], fov: 55 },
  { t: PAGES, pos: [0, 6.5, 23], look: [0, 0, -6], fov: 55 },
];

const ECO_START = SECTIONS.ecopark.start;
const ECO_END = SECTIONS.ecopark.start + SECTIONS.ecopark.length;

export default function CameraRig() {
  const scroll = useScroll();
  const pos = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const mouse = useRef({ x: 0, y: 0 });

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

    // EcosystemWalk owns the camera entirely while inside its range.
    if (p >= ECO_START && p < ECO_END) return;

    let i = 0;
    while (i < KEYFRAMES.length - 2 && KEYFRAMES[i + 1].t <= p) i++;
    const a = KEYFRAMES[i];
    const b = KEYFRAMES[i + 1];
    const e = smoothstep((p - a.t) / (b.t - a.t || 1));

    pos.current.set(
      THREE.MathUtils.lerp(a.pos[0], b.pos[0], e),
      THREE.MathUtils.lerp(a.pos[1], b.pos[1], e),
      THREE.MathUtils.lerp(a.pos[2], b.pos[2], e)
    );
    look.current.set(
      THREE.MathUtils.lerp(a.look[0], b.look[0], e),
      THREE.MathUtils.lerp(a.look[1], b.look[1], e),
      THREE.MathUtils.lerp(a.look[2], b.look[2], e)
    );

    pos.current.x += mouse.current.x * 0.35;
    pos.current.y += -mouse.current.y * 0.22;

    state.camera.position.copy(pos.current);
    state.camera.fov = THREE.MathUtils.lerp(a.fov, b.fov, e);
    state.camera.updateProjectionMatrix();
    state.camera.lookAt(look.current);
  });

  return null;
}
