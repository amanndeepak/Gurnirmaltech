import { Suspense, useRef, useState } from "react";
import Scene from "./three/Scene";
import Overlay from "./components/Overlay";
import { INTERIOR_INFO } from "./three/Interiors";
import "./app.css";

export default function App() {
  const [explore, setExplore] = useState(false);
  // ?room=Bank opens a building directly (handy for sharing a specific interior)
  const [view, setView] = useState(() => {
    const room = new URLSearchParams(window.location.search).get("room");
    return room && INTERIOR_INFO[room] ? room : "city";
  });
  const [fly, setFly] = useState(null);
  const [curtain, setCurtain] = useState(false);
  const busy = useRef(false);

  // fly to the clicked sign, fade out, then swap in that building's interior
  const enter = (type, position) => {
    if (busy.current) return;
    busy.current = true;
    // from the building menu there is no sign to fly to, so just fade
    const lead = position ? 700 : 0;
    if (position) setFly(position);
    setTimeout(() => setCurtain(true), lead);
    setTimeout(() => {
      setView(type);
      setFly(null);
      setExplore(false);
    }, lead + 400);
    setTimeout(() => {
      setCurtain(false);
      busy.current = false;
    }, lead + 600);
  };

  const exit = () => {
    if (busy.current) return;
    busy.current = true;
    setCurtain(true);
    setTimeout(() => setView("city"), 400);
    setTimeout(() => {
      setCurtain(false);
      busy.current = false;
    }, 600);
  };

  return (
    <main className="stage">
      <div className="canvas-wrap">
        <Suspense fallback={null}>
          <Scene explore={explore} view={view} fly={fly} onEnter={enter} />
        </Suspense>
      </div>
      <Overlay explore={explore} setExplore={setExplore} view={view} curtain={curtain} onExit={exit} onEnter={enter} />
    </main>
  );
}
