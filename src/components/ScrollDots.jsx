import { useSyncExternalStore } from "react";
import { scrollStore } from "../three/scrollStore";
import { DOT_ITEMS, activeKey } from "../three/sections";

export default function ScrollDots() {
  const offset = useSyncExternalStore(scrollStore.subscribe, scrollStore.getOffset);
  const active = activeKey(offset);

  return (
    <div className="scroll-progress">
      {DOT_ITEMS.map((d) => (
        <button
          key={d.key}
          title={d.label}
          aria-label={d.label}
          className={d.key === active ? "active" : ""}
          onClick={() => scrollStore.goToSection(d.key)}
        />
      ))}
    </div>
  );
}
