import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowLeft, ArrowUpRight, BookOpen, Building2, FolderOpen, Info, LogIn, Move, Phone, Send, X } from "lucide-react";
import { EKDIARY_URL, INTERIOR_INFO } from "../three/Interiors";
import { AboutModal, ConnectModal, ProjectsModal } from "./Modals";

const PHONES = ["9958699095", "7909010776"];
const ease = [0.22, 1, 0.36, 1];

function MagneticButton({ children, onClick }) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 220, damping: 15 });
  const y = useSpring(0, { stiffness: 220, damping: 15 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      className="magnetic"
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={reset}
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
    >
      <span className="magnetic-glow" />
      {children}
    </motion.button>
  );
}

function CursorGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 300, damping: 30 });
  const sy = useSpring(y, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  return (
    <>
      <motion.div className="cursor-dot" style={{ x, y }} />
      <motion.div className="cursor-ring" style={{ x: sx, y: sy }} />
    </>
  );
}

function CallUs() {
  const [open, setOpen] = useState(false);
  return (
    <div className="call" onMouseLeave={() => setOpen(false)}>
      <AnimatePresence>
        {open && (
          <motion.div
            className="call-panel"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.25, ease }}
          >
            <span className="call-label">Talk to us</span>
            {PHONES.map((p) => (
              <a key={p} className="call-number" href={`tel:+91${p}`}>
                <Phone size={15} /> {p}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button className="call-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="call-pulse" />
        <Phone size={17} /> Call us
      </button>
    </div>
  );
}

function BuildingMenu({ onEnter }) {
  const [open, setOpen] = useState(false);
  const names = ["EK Diary", ...Object.keys(INTERIOR_INFO).filter((n) => n !== "EK Diary")];
  return (
    <div className="menu">
      <AnimatePresence>
        {open && (
          <motion.div
            className="menu-panel"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease }}
          >
            <span className="call-label">Step inside</span>
            <div className="menu-grid">
              {names.map((name) => (
                <button
                  key={name}
                  className="menu-item"
                  onClick={() => {
                    setOpen(false);
                    onEnter(name, null);
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button className="menu-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <Building2 size={17} /> All buildings
      </button>
    </div>
  );
}

export default function Overlay({ explore, setExplore, view, curtain, onExit, onEnter }) {
  const [modal, setModal] = useState(null);
  const inCity = view === "city";
  return (
    <div className="overlay">
      <motion.div
        className="curtain"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.6, ease, delay: 0.2 }}
      />
      <motion.div
        className="curtain curtain-fade"
        animate={{ opacity: curtain ? 1 : 0 }}
        transition={{ duration: curtain ? 0.35 : 0.6, ease }}
      />

      <AnimatePresence>
        {inCity && !explore && (
          <motion.div
            key="brand"
            className="brand"
            initial={{ opacity: 0, rotateX: -70, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, rotateX: 0, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
            transition={{ duration: 1.1, ease, delay: 1.2 }}
          >
            <img src="/images/logo.svg" alt="GurNirmal" className="brand-logo" />
            <motion.p
              className="motto"
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease, delay: 1.8 }}
            >
              Turning <em>Vision</em> into <em>Reality</em>
            </motion.p>
            <motion.p
              className="tagline"
              initial={{ opacity: 0, letterSpacing: "1.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.45em" }}
              transition={{ duration: 1.6, ease, delay: 2.3 }}
            >
              AI · Technology Parks
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {inCity && (
          <motion.div
            key="cta"
            className="cta-wrap"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 1, ease, delay: 2.6 }}
          >
            <p className="hint">Click a building sign to step inside</p>
            <MagneticButton onClick={() => setExplore((v) => !v)}>
              {explore ? (
                <>
                  Close <X size={16} />
                </>
              ) : (
                <>
                  Explore <ArrowUpRight size={16} />
                </>
              )}
            </MagneticButton>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!inCity && (
          <motion.div
            key="inside"
            className="inside"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.3 }}
          >
            <button className="back-btn" onClick={onExit}>
              <ArrowLeft size={16} /> Back to park
            </button>
            <div className="inside-card">
              <h2>{view}</h2>
              <p>{INTERIOR_INFO[view]}</p>
            </div>
            {view === "EK Diary" && (
              <motion.div
                className="ek-login"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease, delay: 0.9 }}
              >
                <span className="ek-icon">
                  <BookOpen size={20} />
                </span>
                <div className="ek-text">
                  <strong>Your diary is waiting</strong>
                  <span>Log in to EK Diary to continue your journal.</span>
                </div>
                <a className="ek-btn" href={EKDIARY_URL} target="_blank" rel="noopener noreferrer">
                  <LogIn size={16} /> Login to EK Diary
                </a>
              </motion.div>
            )}
            <p className="inside-hint">
              <Move size={15} /> Move your mouse to look around 360°
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {inCity && <BuildingMenu onEnter={onEnter} />}
      <div className="actions">
        <button className="action-btn" onClick={() => setModal("about")}>
          <Info size={16} /> About us
        </button>
        <button className="action-btn" onClick={() => setModal("projects")}>
          <FolderOpen size={16} /> Our projects
        </button>
        <button className="action-btn action-primary" onClick={() => setModal("connect")}>
          <Send size={16} /> Connect with us
        </button>
        <CallUs />
      </div>

      <ConnectModal open={modal === "connect"} onClose={() => setModal(null)} />
      <ProjectsModal open={modal === "projects"} onClose={() => setModal(null)} />
      <AboutModal open={modal === "about"} onClose={() => setModal(null)} onConnect={() => setModal("connect")} />
      <CursorGlow />
    </div>
  );
}
