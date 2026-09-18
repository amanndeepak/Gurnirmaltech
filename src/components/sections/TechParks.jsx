import Icon from "../Icon";
import { parkFeatures, parkImages } from "../../data/content";

export default function TechParks() {
  return (
    <section className="section">
      <div className="section-inner two-col" style={{ gridTemplateColumns: "0.85fr 1.15fr" }}>
        <div>
          <span className="eyebrow">Real developments</span>
          <h2
            style={{
              color: "var(--ink)",
              fontSize: "clamp(28px,3.8vw,46px)",
              fontWeight: 800,
              marginTop: 16,
              lineHeight: 1.1,
            }}
          >
            World-class technology parks
          </h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 15, lineHeight: 1.6, marginTop: 12, maxWidth: 420 }}>
            The ecosystem you just walked through — built, landscaped and
            operating today.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 26 }}>
            {parkFeatures.map((f) => (
              <div key={f.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span className="pill" style={{ width: 38, height: 38 }}>
                  <Icon name={f.icon} size={17} />
                </span>
                <div>
                  <div style={{ color: "var(--ink)", fontWeight: 700, fontSize: 15 }}>{f.title}</div>
                  <div style={{ color: "var(--ink-dim)", fontSize: 14 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          {parkImages.map((src, i) => (
            <div
              key={src}
              className="card"
              style={{
                borderRadius: 18,
                overflow: "hidden",
                aspectRatio: "1 / 1",
                transform: i % 2 === 0 ? "translateY(-6px)" : "translateY(6px)",
              }}
            >
              <img src={src} alt="GurNirmal technology park" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
