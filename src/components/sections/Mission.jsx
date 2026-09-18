import { Target, Eye, Check } from "lucide-react";
import { visionPoints } from "../../data/content";

export default function Mission() {
  return (
    <section className="section">
      <div className="section-inner">
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <span className="eyebrow" style={{ justifyContent: "center" }}>
            What drives us
          </span>
          <h2 style={{ color: "var(--ink)", fontSize: "clamp(28px,3.6vw,46px)", fontWeight: 800, marginTop: 14 }}>
            Mission &amp; Vision
          </h2>
        </div>

        <div className="two-col" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div
            className="card"
            style={{ borderRadius: 22, padding: "32px 30px", display: "flex", flexDirection: "column", gap: 16 }}
          >
            <span className="pill">
              <Target size={20} />
            </span>
            <h3 style={{ color: "var(--ink)", fontSize: 19, fontWeight: 700 }}>Our Mission</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: 15, lineHeight: 1.7 }}>
              To make artificial intelligence practical, reliable and
              genuinely useful for our clients — delivering products and
              platforms that move their business to a new level.
            </p>
            <p style={{ color: "var(--green)", fontStyle: "italic", fontSize: 14.5, marginTop: 4 }}>
              "We build technology, and the places where technology thrives."
            </p>
          </div>

          <div
            className="card"
            style={{ borderRadius: 22, padding: "32px 30px", display: "flex", flexDirection: "column", gap: 18 }}
          >
            <span className="pill">
              <Eye size={20} />
            </span>
            <h3 style={{ color: "var(--ink)", fontSize: 19, fontWeight: 700 }}>Our Vision</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {visionPoints.map((v) => (
                <div key={v.title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Check size={17} color="#5b9c1f" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ color: "var(--ink-soft)", fontSize: 14.5, lineHeight: 1.5 }}>
                    <strong style={{ color: "var(--ink)" }}>{v.title}</strong> {v.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
