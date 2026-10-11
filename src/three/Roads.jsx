import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* road grid follows the avenues left open by the city layout (every 4th lot) */
const LOT = 1.3;
const AVENUES_X = [-8, -4, 0, 4, 8].map((g) => g * LOT);
const STREETS_Z = [-8, -4, 0, 4].map((g) => g * LOT);
const X_RANGE = [-15, 15];
const Z_RANGE = [-15, 8.5];
const BOULEVARD_END = 13; // main road runs from the plaza toward the viewer
const RING = 4.35; // ring road around the plaza
const WIDTH = 0.82;
const Y = 0.012;

const ROAD = "#bdb7a9";
const MARK = "#fbfaf5";

/* splits a straight road so it stops at the ring road instead of crossing the plaza */
function segmentsFor(offset, from, to) {
  if (Math.abs(offset) >= RING) return [[from, to]];
  const cut = Math.sqrt(RING * RING - offset * offset);
  return [
    [from, -cut],
    [cut, to],
  ].filter(([a, b]) => b > a);
}

function useLayout() {
  return useMemo(() => {
    const strips = []; // {x, z, w, d}
    const lanes = []; // straight paths for cars and markings: {axis, offset, from, to}

    AVENUES_X.forEach((x) => {
      const end = x === 0 ? BOULEVARD_END : Z_RANGE[1];
      segmentsFor(x, Z_RANGE[0], end).forEach(([a, b]) => {
        strips.push({ x, z: (a + b) / 2, w: WIDTH, d: b - a });
        lanes.push({ axis: "z", offset: x, from: a, to: b });
      });
    });
    STREETS_Z.forEach((z) => {
      segmentsFor(z, X_RANGE[0], X_RANGE[1]).forEach(([a, b]) => {
        strips.push({ x: (a + b) / 2, z, w: b - a, d: WIDTH });
        lanes.push({ axis: "x", offset: z, from: a, to: b });
      });
    });

    // dashed centre line, skipping intersections
    const dashes = [];
    const crosses = (axis, p) =>
      (axis === "z" ? STREETS_Z : AVENUES_X).some((c) => Math.abs(c - p) < WIDTH * 0.8);
    lanes.forEach((l) => {
      for (let p = l.from + 0.4; p < l.to - 0.4; p += 0.62) {
        if (crosses(l.axis, p)) continue;
        dashes.push(l.axis === "z" ? { x: l.offset, z: p, rot: 0 } : { x: p, z: l.offset, rot: Math.PI / 2 });
      }
    });
    const ringDashes = Math.floor((2 * Math.PI * RING) / 0.62);
    for (let i = 0; i < ringDashes; i++) {
      const a = (i / ringDashes) * Math.PI * 2;
      dashes.push({ x: Math.sin(a) * RING, z: Math.cos(a) * RING, rot: a });
    }

    return { strips, lanes, dashes };
  }, []);
}

export default function Roads() {
  const { strips, dashes } = useLayout();
  const stripRef = useRef();
  const dashRef = useRef();

  useLayoutEffect(() => {
    const d = new THREE.Object3D();
    strips.forEach((s, i) => {
      d.position.set(s.x, Y, s.z);
      d.rotation.set(-Math.PI / 2, 0, 0);
      d.scale.set(s.w, s.d, 1);
      d.updateMatrix();
      stripRef.current.setMatrixAt(i, d.matrix);
    });
    stripRef.current.instanceMatrix.needsUpdate = true;
    dashes.forEach((s, i) => {
      d.position.set(s.x, Y + 0.002, s.z);
      d.rotation.set(-Math.PI / 2, 0, s.rot);
      d.scale.set(0.035, 0.26, 1);
      d.updateMatrix();
      dashRef.current.setMatrixAt(i, d.matrix);
    });
    dashRef.current.instanceMatrix.needsUpdate = true;
  }, [strips, dashes]);

  return (
    <group>
      <instancedMesh ref={stripRef} args={[null, null, strips.length]} receiveShadow>
        <planeGeometry />
        <meshStandardMaterial color={ROAD} roughness={0.9} />
      </instancedMesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, Y, 0]} receiveShadow>
        <ringGeometry args={[RING - WIDTH / 2, RING + WIDTH / 2, 128]} />
        <meshStandardMaterial color={ROAD} roughness={0.9} />
      </mesh>
      <instancedMesh ref={dashRef} args={[null, null, dashes.length]}>
        <planeGeometry />
        <meshBasicMaterial color={MARK} />
      </instancedMesh>
    </group>
  );
}
