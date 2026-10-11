import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import BuildingAnimation from "../BuildingAnimation";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Hero() {
  return (
    <section
      id="hero"
      className="section"
      style={{ minHeight: "92vh", display: "flex", alignItems: "center" }}
    >
      <div
        className="section-inner two-col"
        style={{ gridTemplateColumns: "1.15fr 0.85fr", alignItems: "center" }}
      >
        <div>
          <motion.span className="eyebrow" variants={fadeUp} custom={0} initial="hidden" animate="show">
            GurNirmal Technology
          </motion.span>
          <motion.h1
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="show"
            style={{
              fontSize: "clamp(40px, 7vw, 92px)",
              fontWeight: 400,
              lineHeight: 1.03,
              marginTop: 22,
              maxWidth: 900,
              color: "var(--ink)",
            }}
          >
            AI software.
            <br />
            Real places to grow.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="show"
            style={{
              fontSize: "clamp(16px, 1.6vw, 19px)",
              color: "var(--ink-soft)",
              maxWidth: 560,
              marginTop: 26,
              lineHeight: 1.6,
            }}
          >
            We build AI systems for AI-native clients, and the technology
            parks that give innovation somewhere to live.
          </motion.p>
          <motion.div
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate="show"
            style={{ display: "flex", gap: 14, marginTop: 40, flexWrap: "wrap" }}
          >
            <a href="#about" className="btn btn-primary">
              See what we do <ArrowRight size={16} />
            </a>
            <a href="#contact" className="btn btn-ghost-dark">
              Get in touch
            </a>
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate="show"
          className="hide-mobile"
        >
          <BuildingAnimation />
        </motion.div>
      </div>
    </section>
  );
}
