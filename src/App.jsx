import { Loader } from "@react-three/drei";
import Experience from "./three/Experience";
import Navbar from "./components/Navbar";
import ScrollDots from "./components/ScrollDots";
import Hero from "./components/sections/Hero";
import WhoWeAre from "./components/sections/WhoWeAre";
import Capabilities from "./components/sections/Capabilities";
import EkDiary from "./components/sections/EkDiary";
import Ecosystem from "./components/sections/Ecosystem";
import TechParks from "./components/sections/TechParks";
import Mission from "./components/sections/Mission";
import WhyUs from "./components/sections/WhyUs";
import Contact from "./components/sections/Contact";

export default function App() {
  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <Experience>
        <Hero />
        <WhoWeAre />
        <Capabilities />
        <EkDiary />
        <Ecosystem />
        <TechParks />
        <Mission />
        <WhyUs />
        <Contact />
      </Experience>

      <Navbar />
      <ScrollDots />
      <Loader
        containerStyles={{ background: "#f6f9f1" }}
        innerStyles={{ background: "rgba(20,40,20,0.08)", width: 200 }}
        barStyles={{ background: "#5b9c1f" }}
        dataStyles={{ color: "#4a5c4a", fontFamily: "Manrope, sans-serif", fontSize: 12 }}
        dataInterpolation={(p) => `Loading ${p.toFixed(0)}%`}
      />
    </div>
  );
}
