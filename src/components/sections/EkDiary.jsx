import { useRef } from "react";
import { BookOpen, Plus } from "lucide-react";
import Icon from "../Icon";
import { ekdiaryFeatures, diaryEntries } from "../../data/content";

export default function EkDiary() {
  const phoneRef = useRef(null);

  const handleMove = (e) => {
    const el = phoneRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateY(${px * 16}deg) rotateX(${-py * 16}deg) translateZ(20px)`;
  };
  const handleLeave = () => {
    const el = phoneRef.current;
    if (el) el.style.transform = "rotateY(-8deg) rotateX(4deg)";
  };

  return (
    <section className="section">
      <div
        className="section-inner two-col"
        style={{ gridTemplateColumns: "1.05fr 0.95fr" }}
      >
        <div>
          <span className="eyebrow">Our flagship product</span>
          <h2
            style={{
              color: "var(--ink)",
              fontSize: "clamp(32px,4.4vw,56px)",
              fontWeight: 800,
              marginTop: 16,
            }}
          >
            EkDiary
          </h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 16.5, lineHeight: 1.7, marginTop: 18, maxWidth: 480 }}>
            An AI-powered journaling and productivity companion. EkDiary
            helps people capture their days, reflect with intelligent
            prompts, and turn scattered notes into clarity — privately and
            effortlessly.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28 }}>
            {ekdiaryFeatures.map((f) => (
              <div key={f.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span className="pill" style={{ width: 38, height: 38 }}>
                  <Icon name={f.icon} size={17} />
                </span>
                <div>
                  <span style={{ color: "var(--ink)", fontWeight: 700, fontSize: 15 }}>{f.title}</span>{" "}
                  <span style={{ color: "var(--ink-dim)", fontSize: 14.5 }}>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{ display: "flex", justifyContent: "center", perspective: 1200 }}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
        >
          <div
            ref={phoneRef}
            style={{
              width: 250,
              borderRadius: 32,
              padding: 14,
              background: "linear-gradient(160deg, #16241a, #0b1410)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 50px 90px -20px rgba(0,0,0,0.7)",
              transform: "rotateY(-8deg) rotateX(4deg)",
              transition: "transform 0.25s ease-out",
              transformStyle: "preserve-3d",
            }}
          >
            <div style={{ background: "#f3f6ef", borderRadius: 20, padding: 14, minHeight: 340 }}>
              <div
                style={{
                  background: "#86bc25",
                  borderRadius: 12,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#0e1912",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                <BookOpen size={16} /> EkDiary
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                {diaryEntries.map((d) => (
                  <div
                    key={d.day}
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      padding: "10px 12px",
                      boxShadow: "0 6px 14px -6px rgba(0,0,0,0.15)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        background: "#eaf0e3",
                        color: "#4c7a17",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 6,
                        marginBottom: 6,
                      }}
                    >
                      {d.day}
                    </span>
                    <p style={{ fontSize: 12.5, color: "#16241a", margin: 0 }}>{d.text}</p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#86bc25",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0e1912",
                  marginTop: 16,
                  marginLeft: "auto",
                  boxShadow: "0 10px 20px -6px rgba(134,188,37,0.7)",
                }}
              >
                <Plus size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
