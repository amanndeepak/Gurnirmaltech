import Icon from "../Icon";
import { sustainabilityFeatures } from "../../data/content";
import { SECTIONS } from "../../three/sections";

// Must match SECTIONS.ecopark.length (in page/viewport-height units) —
// this section's actual DOM height has to track the scroll distance the
// 3D layer allocates to it, or the two drift out of sync.
const ECOPARK_HEIGHT_VH = SECTIONS.ecopark.length * 100;

export default function Ecosystem() {
  return (
    <section
      style={{ position: "relative", width: "100%", height: `${ECOPARK_HEIGHT_VH}vh`, pointerEvents: "none" }}
    >
      <div
        style={{
          position: "absolute",
          top: "8vh",
          left: 0,
          right: 0,
          padding: "0 var(--section-pad)",
        }}
      >
        <div
          className="section-inner card"
          style={{ maxWidth: 640, pointerEvents: "auto", borderRadius: 22, padding: "26px 30px" }}
        >
          <span className="eyebrow">Building ecosystems</span>
          <h2
            style={{
              fontSize: "clamp(28px,4vw,48px)",
              fontWeight: 800,
              marginTop: 14,
              color: "var(--ink)",
              lineHeight: 1.1,
            }}
          >
            Walk through a GurNirmal ecopark
          </h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 16, lineHeight: 1.7, marginTop: 14 }}>
            Scroll to follow a resident through one connected campus. IT
            towers, hospitals, schools, homes, retail and sport rise up
            around them as they walk — every GurNirmal park is a complete,
            walkable ecosystem, not a single building.
          </p>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "7vh",
          left: 0,
          right: 0,
          padding: "0 var(--section-pad)",
        }}
      >
        <div
          className="section-inner card"
          style={{ maxWidth: 760, borderRadius: 22, padding: "26px 28px", pointerEvents: "auto" }}
        >
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", marginBottom: 16 }}>
            Engineered to be self-sustaining
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))",
              gap: 16,
            }}
          >
            {sustainabilityFeatures.map((f) => (
              <div key={f.title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span className="pill" style={{ width: 32, height: 32 }}>
                  <Icon name={f.icon} size={15} />
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}>{f.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-dim)" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
