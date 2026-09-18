import { Bot, Building2 } from "lucide-react";

export default function WhoWeAre() {
  return (
    <section className="section">
      <div
        className="section-inner two-col"
        style={{ gridTemplateColumns: "1.1fr 0.9fr" }}
      >
        <div>
          <span className="eyebrow">Who we are</span>
          <h2
            style={{
              color: "var(--ink)",
              fontSize: "clamp(30px,4.2vw,52px)",
              fontWeight: 800,
              marginTop: 16,
              lineHeight: 1.08,
            }}
          >
            An AI-first company, building for AI clients
          </h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 17, lineHeight: 1.7, marginTop: 20, maxWidth: 540 }}>
            <strong style={{ color: "var(--ink)" }}>GurNirmal Technology Private Limited</strong> is an
            artificial-intelligence company. We design, build and ship AI
            systems for AI-native clients — from generative AI and RAG
            platforms to production machine learning.
          </p>
          <p style={{ color: "var(--ink-dim)", fontSize: 16, lineHeight: 1.7, marginTop: 14, maxWidth: 540 }}>
            Alongside our software practice, we develop and operate
            next-generation technology parks — sustainable, mixed-use
            campuses that give innovation a place to grow.
          </p>

          <div style={{ display: "flex", gap: 14, marginTop: 30, flexWrap: "wrap" }}>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: 14 }}>
              <span className="pill" style={{ width: 36, height: 36 }}>
                <Bot size={16} />
              </span>
              <span style={{ color: "var(--ink)", fontWeight: 600, fontSize: 14 }}>AI software & products</span>
            </div>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: 14 }}>
              <span className="pill" style={{ width: 36, height: 36 }}>
                <Building2 size={16} />
              </span>
              <span style={{ color: "var(--ink)", fontWeight: 600, fontSize: 14 }}>Technology parks</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }} className="hide-mobile">
          <div
            style={{
              position: "relative",
              borderRadius: 28,
              overflow: "hidden",
              boxShadow: "0 40px 80px -20px rgba(20,50,20,0.35)",
              border: "1px solid rgba(20,40,20,0.1)",
              maxWidth: 340,
              transform: "rotate(2deg)",
            }}
          >
            <img src="/images/tower.webp" alt="GurNirmal tower" style={{ width: "100%", display: "block" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
