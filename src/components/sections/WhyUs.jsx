import Icon from "../Icon";
import { whyUs, stats } from "../../data/content";

export default function WhyUs() {
  return (
    <section className="section">
      <div className="section-inner two-col" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <div>
          <span className="eyebrow">Why GurNirmal</span>
          <h2
            style={{
              color: "var(--ink)",
              fontSize: "clamp(28px,3.8vw,46px)",
              fontWeight: 800,
              marginTop: 16,
              marginBottom: 26,
            }}
          >
            Why partner with us
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {whyUs.map((w) => (
              <div key={w.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span className="pill" style={{ width: 38, height: 38 }}>
                  <Icon name={w.icon} size={17} />
                </span>
                <div>
                  <div style={{ color: "var(--ink)", fontWeight: 700, fontSize: 15 }}>{w.title}</div>
                  <div style={{ color: "var(--ink-dim)", fontSize: 14 }}>{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="card"
          style={{
            borderRadius: 22,
            padding: "10px 30px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: "22px 0",
                borderBottom: i < stats.length - 1 ? "1px solid rgba(20,40,20,0.1)" : "none",
              }}
            >
              <div style={{ color: "var(--green)", fontSize: 42, fontWeight: 800, fontFamily: "var(--font-display)" }}>
                {s.value}
              </div>
              <div style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
