import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Building2,
  CheckCircle2,
  Cloud,
  Database,
  Eye,
  Globe,
  Handshake,
  Layers,
  Leaf,
  Mail,
  MapPin,
  MessagesSquare,
  Paperclip,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Users,
  X,
  Zap,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
const MAX_FILES = 5;
const MAX_TOTAL = 4 * 1024 * 1024;
const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.webp";

/* ---------- shared popup shell ---------- */
export function Modal({ open, onClose, title, eyebrow, wide = false, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className={`modal ${wide ? "modal-wide" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.35, ease }}
          >
            <header className="modal-head">
              <div>
                {eyebrow && <span className="eyebrow-sm">{eyebrow}</span>}
                <h2>{title}</h2>
              </div>
              <button className="modal-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="modal-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- connect with us ---------- */
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const formatSize = (b) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`);

export function ConnectModal({ open, onClose }) {
  const empty = { name: "", email: "", phone: "", proposal: "" };
  const [form, setForm] = useState(empty);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [serverError, setServerError] = useState("");
  const fileInput = useRef(null);

  const close = () => {
    onClose();
    if (status === "sent") {
      setForm(empty);
      setFiles([]);
      setStatus("idle");
    }
  };

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const addFiles = (list) => {
    const next = [...files, ...Array.from(list)].slice(0, MAX_FILES);
    const total = next.reduce((s, f) => s + f.size, 0);
    if (total > MAX_TOTAL) {
      setErrors((er) => ({ ...er, files: "Attachments must be 4 MB or less in total." }));
      return;
    }
    setErrors((er) => ({ ...er, files: undefined }));
    setFiles(next);
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = "Please enter your name.";
    if (!EMAIL_RE.test(form.email.trim())) er.email = "Please enter a valid email address.";
    if (!PHONE_RE.test(form.phone.trim())) er.phone = "Please enter a valid contact number.";
    if (form.proposal.trim().length < 10) er.proposal = "Tell us a little more about your proposal.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    setServerError("");
    try {
      const attachments = await Promise.all(
        files.map(async (f) => ({ filename: f.name, content: await toBase64(f) }))
      );
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          proposal: form.proposal.trim(),
          attachments,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("sent");
    } catch (err) {
      setServerError(err.message);
      setStatus("error");
    }
  };

  return (
    <Modal open={open} onClose={close} title="Connect with us" eyebrow="Let's build together">
      {status === "sent" ? (
        <div className="sent">
          <CheckCircle2 size={44} />
          <h3>Thank you, {form.name.split(" ")[0]}!</h3>
          <p>Your proposal has reached our team. We'll get back to you at {form.email} shortly.</p>
          <button className="btn-solid" onClick={close}>
            Done
          </button>
        </div>
      ) : (
        <form className="form" onSubmit={submit} noValidate>
          <p className="form-intro">
            Share your idea, requirement or proposal — for AI software or space in our technology parks.
          </p>
          <div className="form-row">
            <label className="field">
              <span>Full name *</span>
              <input value={form.name} onChange={set("name")} placeholder="Your name" autoComplete="name" />
              {errors.name && <em>{errors.name}</em>}
            </label>
            <label className="field">
              <span>Contact number *</span>
              <input
                value={form.phone}
                onChange={set("phone")}
                placeholder="+91 98765 43210"
                inputMode="tel"
                autoComplete="tel"
              />
              {errors.phone && <em>{errors.phone}</em>}
            </label>
          </div>
          <label className="field">
            <span>Email address *</span>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@company.com"
              autoComplete="email"
            />
            {errors.email && <em>{errors.email}</em>}
          </label>
          <label className="field">
            <span>Your proposal *</span>
            <textarea
              rows={4}
              value={form.proposal}
              onChange={set("proposal")}
              placeholder="What would you like to build, lease or discuss with us?"
            />
            {errors.proposal && <em>{errors.proposal}</em>}
          </label>

          <div
            className="drop"
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
          >
            <Paperclip size={18} />
            <div>
              <strong>Attach quotation, document or company profile</strong>
              <span>PDF, Word, Excel, PowerPoint or images · up to 5 files, 4 MB total</span>
            </div>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept={ACCEPT}
              hidden
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          {errors.files && <em className="field-error">{errors.files}</em>}
          {files.length > 0 && (
            <ul className="files">
              {files.map((f, i) => (
                <li key={`${f.name}${i}`}>
                  <Paperclip size={14} />
                  <span>{f.name}</span>
                  <small>{formatSize(f.size)}</small>
                  <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {status === "error" && <p className="server-error">{serverError}</p>}

          <button className="btn-solid btn-send" type="submit" disabled={status === "sending"}>
            {status === "sending" ? (
              "Sending…"
            ) : (
              <>
                <Send size={16} /> Send
              </>
            )}
          </button>
        </form>
      )}
    </Modal>
  );
}

/* ---------- our projects ---------- */
const PROJECTS = [
  {
    img: "/images/tower.webp",
    title: "GurNirmal Corporate Tower",
    tag: "Commercial · Office",
    text: "A glass-and-stone office tower with stepped green balconies, a landscaped podium and EV-ready forecourt — Grade-A workspace for growing technology teams.",
  },
  {
    img: "/images/building-4.webp",
    title: "Sky Bridge Innovation Campus",
    tag: "Tech Park · Mixed-use",
    text: "Twin campus wings linked by a sky bridge with a large digital media façade, rooftop forests and a pedestrian-first central plaza.",
  },
  {
    img: "/images/building-2.webp",
    title: "Twin Blocks Tech Park",
    tag: "Tech Park · Sustainable",
    text: "Two connected office blocks with rooftop solar, terraced planting, timber-toned façades and a tree-lined entrance court with EV charging.",
  },
  {
    img: "/images/building-3.webp",
    title: "The Curve Studio Building",
    tag: "Commercial · Retail & Office",
    text: "A flowing curved façade with vertical fins, a glowing LED media wall at the entrance and a planted roof garden overlooking the boulevard.",
  },
  {
    img: "/images/building-1.webp",
    title: "Operational IT Office Block",
    tag: "Delivered · IT / ITES",
    text: "A completed multi-storey IT office block with structured parking — plug-and-play floors in active use today.",
  },
  {
    img: "/images/hero-bg.jpg",
    title: "GurNirmal Integrated Township",
    tag: "Masterplan · Ecosystem",
    text: "A planned ecosystem of offices, hospital, bank, residences, sports fields, children's play areas and green open spaces inside one gated campus.",
  },
];

export function ProjectsModal({ open, onClose }) {
  const [zoom, setZoom] = useState(null);
  return (
    <Modal open={open} onClose={onClose} title="Our projects" eyebrow="Built by GurNirmal" wide>
      <h3 className="section-title">
        <Building2 size={18} /> Technology parks & buildings
      </h3>
      <div className="projects">
        {PROJECTS.map((p) => (
          <article key={p.title} className="project">
            <button className="project-img" onClick={() => setZoom(p)} aria-label={`View ${p.title}`}>
              <img src={p.img} alt={p.title} loading="lazy" />
            </button>
            <div className="project-body">
              <span className="chip">{p.tag}</span>
              <h4>{p.title}</h4>
              <p>{p.text}</p>
            </div>
          </article>
        ))}
      </div>

      <h3 className="section-title">
        <Sparkles size={18} /> AI products
      </h3>
      <article className="ek-card">
        <div className="ek-copy">
          <span className="chip chip-dark">Flagship AI product</span>
          <h4>EK Diary</h4>
          <p>
            An AI-powered journaling and productivity companion. EK Diary helps people capture their days, reflect with
            intelligent prompts, and turn scattered notes into clarity — privately and effortlessly.
          </p>
          <ul>
            <li>
              <Zap size={15} /> <b>AI reflections</b> — smart prompts and summaries that surface what matters.
            </li>
            <li>
              <ShieldCheck size={15} /> <b>Privacy-first</b> — your entries stay yours, designed around trust.
            </li>
            <li>
              <Sparkles size={15} /> <b>Insight over time</b> — track moods, habits and progress as they build.
            </li>
          </ul>
          <a className="btn-solid" href="https://ekdiary.com" target="_blank" rel="noopener noreferrer">
            Visit ekdiary.com <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="ek-phone" aria-hidden="true">
          <div className="ek-phone-head">
            <BookOpen size={16} /> EkDiary
          </div>
          {[
            ["Mon", "A calm, focused morning."],
            ["Tue", "Shipped the new feature 🚀"],
            ["Wed", "Ideas for the roadmap."],
          ].map(([d, t]) => (
            <div key={d} className="ek-entry">
              <span>{d}</span>
              {t}
            </div>
          ))}
          <div className="ek-fab">+</div>
        </div>
      </article>

      <AnimatePresence>
        {zoom && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(null)}
          >
            <motion.img
              src={zoom.img}
              alt={zoom.title}
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.3, ease }}
            />
            <p>{zoom.title}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

/* ---------- about us ---------- */
const CAPABILITIES = [
  [Brain, "Applied AI & ML", "Custom models and ML pipelines built for real production workloads."],
  [MessagesSquare, "Generative AI & RAG", "LLM assistants and retrieval-augmented systems grounded in your data."],
  [Layers, "AI Product Engineering", "Full-stack delivery of AI-native products, from prototype to scale."],
  [Database, "Data & MLOps", "Data platforms, evaluation and monitoring that keep AI reliable."],
  [Cloud, "Cloud & Platforms", "Scalable, secure cloud architecture for AI at any volume."],
  [Building2, "Tech Park Development", "Sustainable, mixed-use technology campuses designed and operated end to end."],
];

const ECO = [
  [Leaf, "Green buildings & eco-spaces", "Rooftop gardens, terraced planting, tree-lined plazas and solar-ready roofs that keep campuses cool, calm and low-energy."],
  [Users, "Mixed-use ecosystems", "Work, retail, healthcare, banking, education, sport and living — everything a thriving community needs, within walking distance."],
  [Sparkles, "Smart infrastructure", "Connected, future-ready buildings with EV charging, digital façades, high-speed connectivity and plug-and-play office floors."],
  [Globe, "Built for people", "Pedestrian-first plazas, open lawns, water features and play areas that make every campus a place people want to be."],
];

const WHY = [
  [ShieldCheck, "Security you can trust", "We take security seriously across every application we ship."],
  [Eye, "Obsessed with experience", "We research users deeply so the product truly fits them."],
  [Timer, "We respect deadlines", "Whatever it takes to complete your project, on time."],
  [Handshake, "A real partnership", "Open communication and support long after go-live."],
];

export function AboutModal({ open, onClose, onConnect }) {
  return (
    <Modal open={open} onClose={onClose} title="About GurNirmal" eyebrow="Technology Private Limited" wide>
      <section className="about-hero">
        <div>
          <h3>Intelligent AI solutions and landmark technology parks</h3>
          <p>
            <b>GurNirmal Technology Private Limited</b> is an AI-first company. We design, build and ship AI systems for
            AI-native clients — from generative AI and RAG platforms to production machine learning.
          </p>
          <p>
            Alongside our software practice, we develop and operate <b>next-generation technology parks</b> —
            sustainable, mixed-use campuses and green eco-spaces that give innovation a place to grow. We build
            technology, and the places where technology thrives.
          </p>
          <div className="stats">
            <div>
              <strong>7+</strong>
              <span>Years of software engineering expertise</span>
            </div>
            <div>
              <strong>AI</strong>
              <span>A dedicated, AI-first delivery model</span>
            </div>
            <div>
              <strong>2</strong>
              <span>Business lines: AI products & tech parks</span>
            </div>
          </div>
        </div>
        <img src="/images/tower.webp" alt="GurNirmal corporate tower" />
      </section>

      <h3 className="section-title">
        <Leaf size={18} /> Building ecosystems & eco-spaces
      </h3>
      <div className="tiles">
        {ECO.map(([Icon, t, d]) => (
          <div key={t} className="tile">
            <span className="tile-icon">
              <Icon size={18} />
            </span>
            <h4>{t}</h4>
            <p>{d}</p>
          </div>
        ))}
      </div>

      <h3 className="section-title">
        <Brain size={18} /> What we do
      </h3>
      <div className="tiles tiles-3">
        {CAPABILITIES.map(([Icon, t, d]) => (
          <div key={t} className="tile">
            <span className="tile-icon">
              <Icon size={18} />
            </span>
            <h4>{t}</h4>
            <p>{d}</p>
          </div>
        ))}
      </div>

      <div className="mv">
        <div className="mv-card mv-dark">
          <h4>
            <Target size={18} /> Our mission
          </h4>
          <p>
            To make artificial intelligence practical, reliable and genuinely useful for our clients — delivering
            products, platforms and spaces that move their business to a new level.
          </p>
          <em>We build technology, and the places where technology thrives.</em>
        </div>
        <div className="mv-card">
          <h4>
            <Eye size={18} /> Our vision
          </h4>
          <ul>
            <li>
              <b>Reliability</b> — relationships built on professionalism and trust.
            </li>
            <li>
              <b>Efficiency</b> — a driven team that improves everything it touches.
            </li>
            <li>
              <b>Sustainability</b> — growth that respects people and the planet.
            </li>
          </ul>
        </div>
      </div>

      <h3 className="section-title">
        <Handshake size={18} /> Why partner with us
      </h3>
      <div className="tiles">
        {WHY.map(([Icon, t, d]) => (
          <div key={t} className="tile">
            <span className="tile-icon">
              <Icon size={18} />
            </span>
            <h4>{t}</h4>
            <p>{d}</p>
          </div>
        ))}
      </div>

      <section className="about-cta">
        <div>
          <h4>Let's build together</h4>
          <p>Partner with GurNirmal to turn ambitious AI ideas — and the spaces that house them — into reality.</p>
          <ul>
            <li>
              <Mail size={15} /> <a href="mailto:hello@gurnirmal.com">hello@gurnirmal.com</a>
            </li>
            <li>
              <Globe size={15} /> <a href="https://www.gurnirmal.com" target="_blank" rel="noopener noreferrer">www.gurnirmal.com</a>
            </li>
            <li>
              <MapPin size={15} /> Bengaluru, India
            </li>
            <li>
              <Phone size={15} /> <a href="tel:+919958699095">9958699095</a> / <a href="tel:+917909010776">7909010776</a>
            </li>
          </ul>
        </div>
        <button className="btn-solid" onClick={onConnect}>
          <Send size={16} /> Connect with us
        </button>
      </section>
    </Modal>
  );
}
