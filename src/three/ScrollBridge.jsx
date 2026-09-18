import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { scrollStore } from "./scrollStore";

export default function ScrollBridge() {
  const scroll = useScroll();

  useEffect(() => {
    scrollStore.setEl(scroll.el);
  }, [scroll.el]);

  useFrame(() => {
    scrollStore.setOffset(scroll.offset);
  });

  return null;
}
