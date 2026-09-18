import { ArrowDown } from "lucide-react";
import { scrollStore } from "../../three/scrollStore";

export default function Hero() {
  return (
    <section
      className="section"
      style={{
        alignItems: "flex-start",
        padding: 0,
        justifyContent: "flex-end",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/images/hero-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(190deg, rgba(6,14,8,0.15) 0%, rgba(6,14,8,0.35) 45%, rgba(6,14,8,0.86) 100%)",
        }}
      />

      <div
        className="section-inner"
        style={{ position: "relative", paddingBottom: 100, pointerEvents: "auto" }}
      >
        <span className="eyebrow" style={{ color: "#c3e88a" }}>
          Technology Private Limited
        </span>
        <h1
          style={{
            color: "#fff",
            fontSize: "clamp(34px, 6.2vw, 76px)",
            fontWeight: 800,
            lineHeight: 1.04,
            marginTop: 16,
            maxWidth: 920,
            textShadow: "0 4px 30px rgba(0,0,0,0.35)",
          }}
        >
          One connected ecosystem — work, live, learn &amp; grow
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.82)",
            fontSize: "clamp(15px,1.8vw,19px)",
            maxWidth: 620,
            marginTop: 20,
            lineHeight: 1.6,
          }}
        >
          GurNirmal builds landmark technology parks — IT towers, hospitals,
          schools, homes, retail, sport and green space — designed and
          engineered end to end, alongside the AI systems that run inside
          them.
        </p>

        <div style={{ display: "flex", gap: 14, marginTop: 34, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => scrollStore.goToSection("ecopark")}>
            Walk the ecosystem
          </button>
          <button className="btn btn-ghost" onClick={() => scrollStore.goToSection("whoWeAre")}>
            Explore
          </button>
        </div>
      </div>

      <button
        onClick={() => scrollStore.goToSection("whoWeAre")}
        style={{
          position: "absolute",
          bottom: 26,
          left: "50%",
          transform: "translateX(-50%)",
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.75)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          animation: "bob 2s ease-in-out infinite",
        }}
      >
        Scroll
        <ArrowDown size={16} />
      </button>

      <style>{`
        @keyframes bob {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </section>
  );
}
