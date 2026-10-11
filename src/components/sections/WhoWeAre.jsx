import { motion } from "framer-motion";
import PeelCard from "../PeelCard";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function WhoWeAre() {
  return (
    <section id="about" className="section">
      <div className="section-inner two-col" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15%" }}
        >
          <motion.span className="eyebrow" variants={fadeUp} custom={0}>
            About
          </motion.span>
          <motion.h2
            variants={fadeUp}
            custom={1}
            style={{
              color: "var(--ink)",
              fontSize: "clamp(30px,4.2vw,52px)",
              marginTop: 16,
              lineHeight: 1.1,
            }}
          >
            AI-first. Built from the ground up.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            style={{ color: "var(--ink-soft)", fontSize: 17, lineHeight: 1.7, marginTop: 22, maxWidth: 520 }}
          >
            GurNirmal designs and ships AI systems — generative, RAG,
            production ML — for clients who live and breathe AI. We also
            build the technology parks that give that work somewhere real to
            happen.
          </motion.p>
          <motion.p
            variants={fadeUp}
            custom={3}
            style={{ color: "var(--ink-dim)", fontSize: 14, marginTop: 18, maxWidth: 480 }}
          >
            Solar, rainwater harvesting, EV charging, transit — built in, not
            bolted on.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", justifyContent: "center" }}
          className="hide-mobile"
        >
          <PeelCard
            style={{
              boxShadow: "0 40px 80px -20px rgba(20,50,20,0.25)",
              border: "1px solid var(--card-border)",
              maxWidth: 340,
            }}
          >
            <img src="/images/tower.webp" alt="GurNirmal tower" style={{ width: "100%", display: "block" }} />
          </PeelCard>
        </motion.div>
      </div>
    </section>
  );
}
