import { useState } from "react";
import { motion } from "framer-motion";
import { KnowledgeMapScene as MapType } from "../../types/scenario";
import { Button } from "../ui/Button";
import { Narrative } from "./Narrative";

export function KnowledgeMapScene({ scene, onDone }: { scene: MapType; onDone: () => void }) {
  const [phase, setPhase] = useState<"map" | "lines">("map");

  if (phase === "lines" && scene.lines) {
    return (
      <Narrative
        scene={{ id: scene.id + "-lines", type: "narrative", lines: scene.lines }}
        onDone={onDone}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8 px-4 py-16">
      <div className="font-mono text-xs uppercase tracking-[0.4em] text-sky-500">
        ECHO KNOWLEDGE CORE
      </div>
      <div className="flex flex-col items-center gap-2">
        {scene.nodes.map((n, i) => (
          <div key={n.label} className="flex flex-col items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className={`flex items-center gap-3 rounded-xl border px-6 py-3 font-head font-semibold tracking-wide ${
                n.state === "done"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : n.state === "active"
                    ? "border-sky-400 bg-sky-50 text-sky-800 shadow shadow-sky-100"
                    : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  n.state === "done"
                    ? "bg-emerald-400"
                    : n.state === "active"
                      ? "bg-sky-400 animate-blink-soft"
                      : "bg-slate-300"
                }`}
              />
              {n.label}
            </motion.div>
            {i < scene.nodes.length - 1 && <span className="text-slate-300">↓</span>}
          </div>
        ))}
      </div>
      <Button size="lg" onClick={() => (scene.lines ? setPhase("lines") : onDone())}>
        Продолжить
      </Button>
    </div>
  );
}
