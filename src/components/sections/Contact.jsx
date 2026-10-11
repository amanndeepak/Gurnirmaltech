import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Globe, MapPin, Loader2, CheckCircle2 } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: 15,
  fontFamily: "inherit",
  outline: "none",
};

function ConnectForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong.");
    }
  };

  if (status === "success") {
    return (
      <div
        className="glass-dark"
        style={{
          marginTop: 36,
          maxWidth: 560,
          borderRadius: 20,
          padding: "28px 30px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <CheckCircle2 size={22} color="#a4d94a" />
        <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>
          Thanks — your message is on its way. We'll get back to you soon.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 36, maxWidth: 560, display: "flex", flexDirection: "column", gap: 14 }}>
      <input
        style={inputStyle}
        type="text"
        placeholder="Your name"
        value={form.name}
        onChange={update("name")}
        required
      />
      <input
        style={inputStyle}
        type="email"
        placeholder="Your email"
        value={form.email}
        onChange={update("email")}
        required
      />
      <textarea
        style={{ ...inputStyle, resize: "vertical", minHeight: 110, fontFamily: "inherit" }}
        placeholder="What would you like to build?"
        value={form.message}
        onChange={update("message")}
        required
      />
      <button type="submit" className="btn btn-primary" disabled={status === "sending"} style={{ alignSelf: "flex-start" }}>
        {status === "sending" ? <Loader2 size={16} className="spin" /> : null}
        {status === "sending" ? "Sending…" : "Connect with me"}
      </button>
      {status === "error" && (
        <span style={{ color: "#ff8a8a", fontSize: 13.5 }}>{errorMsg}</span>
      )}
      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}

export default function Contact() {
  return (
    <section className="section" id="contact" style={{ overflow: "hidden", background: "#0e1611" }}>
      <motion.div
        className="section-inner"
        style={{ position: "relative" }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-15%" }}
      >
        <motion.img
          variants={fadeUp}
          custom={0}
          src="/images/logo-white.png"
          alt="GurNirmal"
          style={{ height: 46, marginBottom: 30 }}
        />
        <motion.h2
          variants={fadeUp}
          custom={1}
          style={{
            color: "#fff",
            fontSize: "clamp(32px,5vw,64px)",
            maxWidth: 720,
            lineHeight: 1.1,
          }}
        >
          Let's build together
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={2}
          style={{ color: "rgba(255,255,255,0.6)", fontSize: 17, maxWidth: 560, marginTop: 18, lineHeight: 1.6 }}
        >
          Partner with GurNirmal to turn ambitious AI ideas — and the spaces
          that house them — into reality.
        </motion.p>

        <motion.div
          variants={fadeUp}
          custom={3}
          style={{ display: "flex", gap: 28, flexWrap: "wrap", marginTop: 36 }}
        >
          <a href="mailto:hello@gurnirmal.com" style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
            <span className="pill" style={{ width: 38, height: 38 }}>
              <Mail size={17} />
            </span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>hello@gurnirmal.com</span>
          </a>
          <a href="https://www.gurnirmal.com" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
            <span className="pill" style={{ width: 38, height: 38 }}>
              <Globe size={17} />
            </span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>www.gurnirmal.com</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
            <span className="pill" style={{ width: 38, height: 38 }}>
              <MapPin size={17} />
            </span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Bengaluru, India</span>
          </div>
        </motion.div>

        <ConnectForm />

        <div
          style={{
            marginTop: 70,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            © {new Date().getFullYear()} GurNirmal Technology Private Limited
          </span>
          <span style={{ color: "#a4d94a", fontFamily: "var(--font-display)", fontWeight: 700 }}>Thank you</span>
        </div>
      </motion.div>
    </section>
  );
}
