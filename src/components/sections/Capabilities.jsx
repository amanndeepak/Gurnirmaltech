import Icon from "../Icon";
import { capabilities } from "../../data/content";

export default function Capabilities() {
  return (
    <section className="section">
      <div className="section-inner">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span className="eyebrow" style={{ justifyContent: "center" }}>
            What we do
          </span>
          <h2
            style={{
              color: "var(--ink)",
              fontSize: "clamp(28px,3.6vw,46px)",
              fontWeight: 800,
              marginTop: 14,
            }}
          >
            Our capabilities
          </h2>
        </div>

        <div className="cap-grid">
          {capabilities.map((c) => (
            <div
              key={c.title}
              className="card"
              style={{
                borderRadius: 18,
                padding: "22px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <span className="pill">
                <Icon name={c.icon} />
              </span>
              <h3 style={{ color: "var(--ink)", fontSize: 16, fontWeight: 700 }}>{c.title}</h3>
              <p style={{ color: "var(--ink-dim)", fontSize: 13.5, lineHeight: 1.55 }}>
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
