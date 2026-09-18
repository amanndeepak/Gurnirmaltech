import { useState, useSyncExternalStore } from "react";
import { Menu, X } from "lucide-react";
import { scrollStore } from "../three/scrollStore";
import { NAV_ITEMS, activeKey } from "../three/sections";

const DARK_SECTIONS = new Set(["hero", "contact"]);

export default function Navbar() {
  const offset = useSyncExternalStore(scrollStore.subscribe, scrollStore.getOffset);
  const [open, setOpen] = useState(false);
  const isDark = DARK_SECTIONS.has(activeKey(offset));
  const scrolled = !isDark;
  const textColor = scrolled ? "#16241a" : "#fff";

  const go = (key) => {
    scrollStore.goToSection(key);
    setOpen(false);
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: scrolled ? "14px clamp(20px,5vw,64px)" : "22px clamp(20px,5vw,64px)",
        background: scrolled ? "rgba(255,255,255,0.82)" : "linear-gradient(180deg, rgba(6,14,8,0.55), rgba(6,14,8,0))",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(20,30,20,0.08)" : "1px solid transparent",
        boxShadow: scrolled ? "0 8px 30px -18px rgba(20,40,20,0.3)" : "none",
        transition: "all 0.35s ease",
      }}
    >
      <button
        onClick={() => go("hero")}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        aria-label="GurNirmal home"
      >
        <img
          src={scrolled ? "/images/logo-color.png" : "/images/logo-white.png"}
          alt="GurNirmal"
          style={{ height: 26, display: "block" }}
        />
      </button>

      <nav style={{ display: "flex", alignItems: "center", gap: 28 }} className="nav-desktop">
        {NAV_ITEMS.map((l) => (
          <button
            key={l.key}
            onClick={() => go(l.key)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: textColor,
              opacity: 0.85,
              fontSize: 14,
              fontWeight: 600,
              padding: 0,
              transition: "color 0.3s ease",
            }}
          >
            {l.label}
          </button>
        ))}
        <button className="btn btn-primary" onClick={() => go("contact")}>
          Let's talk
        </button>
      </nav>

      <button
        className="nav-toggle"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "none",
          background: scrolled ? "rgba(20,30,20,0.06)" : "rgba(255,255,255,0.14)",
          border: scrolled ? "1px solid rgba(20,30,20,0.14)" : "1px solid rgba(255,255,255,0.25)",
          borderRadius: 10,
          width: 42,
          height: 42,
          color: textColor,
          cursor: "pointer",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            top: 64,
            background: "rgba(247,249,243,0.98)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            zIndex: 49,
          }}
        >
          {NAV_ITEMS.map((l) => (
            <button
              key={l.key}
              onClick={() => go(l.key)}
              style={{
                background: "none",
                border: "none",
                color: "#16241a",
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                cursor: "pointer",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .nav-desktop { display: none !important; }
          .nav-toggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
