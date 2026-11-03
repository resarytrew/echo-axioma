import { useState } from "react";
import { motion } from "framer-motion";
import { CapabilityUnlockScene as CapType } from "../../types/scenario";
import { Button } from "../ui/Button";
import { CharacterPortrait } from "../ui/CharacterPortrait";
import { Narrative } from "./Narrative";

export function CapabilityUnlockScene({
  scene,
  onDone,
}: {
  scene: CapType;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"unlock" | "lines">("unlock");

  if (phase === "lines" && scene.lines) {
    return (
      <Narrative
        scene={{ id: scene.id + "-lines", type: "narrative", lines: scene.lines }}
        onDone={onDone}
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-2xl flex-col items-center justify-center gap-8 px-4 py-14 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="relative"
      >
        <div className="absolute inset-0 animate-pulse rounded-full bg-sky-300/40 blur-2xl" />
        <div className="animate-float-slow">
          <CharacterPortrait id="echo" size="lg" />
        </div>
      </motion.div>

      <div className="space-y-2">
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-sky-500">
          Capability unlocked
        </div>
        <div className="font-display text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
          {scene.capability}
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-lg font-head text-lg text-slate-600"
      >
        «{scene.echoLine}»
      </motion.p>

      <Button size="lg" onClick={() => (scene.lines ? setPhase("lines") : onDone())}>
        Продолжить
      </Button>
    </div>
  );
}
