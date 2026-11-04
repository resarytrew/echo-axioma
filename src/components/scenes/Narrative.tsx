import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NarrativeScene } from "../../types/scenario";
import { CHARACTERS } from "../../data/characters";
import { CharacterPortrait } from "../ui/CharacterPortrait";
import { VisualRenderer } from "../visuals/VisualRenderer";
import { Button } from "../ui/Button";
import { Typewriter } from "../ui/Typewriter";

export function Narrative({ scene, onDone }: { scene: NarrativeScene; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setIndex(0);
    setTyped(false);
    setShowAll(false);
  }, [scene]);

  const line = scene.lines[index];
  const isLast = index === scene.lines.length - 1;
  const character = CHARACTERS[line.speaker];

  function next() {
    if (!typed) { setShowAll(true); return; }
    if (isLast) {
      onDone();
    } else {
      setIndex((i) => i + 1);
      setTyped(false);
      setShowAll(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      {scene.visual && scene.visualPosition !== "bottom" && (
        <VisualRenderer visual={scene.visual} />
      )}

      <div
        className="narrative-panel panel-glass relative min-h-[220px] overflow-hidden rounded-2xl px-6 py-8 sm:px-10"
      >
        <div
          className="narrative-glow pointer-events-none absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(circle at 10% 0%, ${character.accent}, transparent 60%)`,
          }}
        />
        <div className="relative flex items-start gap-5">
          <CharacterPortrait id={line.speaker} size="lg" glitch={line.speaker === "shumma"} />
          <div className="flex-1 pt-1">
            <div
              className="narrative-speaker font-head text-sm font-bold uppercase tracking-[0.2em]"
              style={{ color: character.color }}
            >
              {character.name}
              {line.speaker !== "system" && (
                <span className="ml-2 font-mono text-[10px] font-normal uppercase tracking-widest text-slate-400">
                  {character.role}
                </span>
              )}
            </div>
            <div className="mt-3 min-h-[64px] font-head text-xl leading-relaxed text-slate-800 sm:text-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Typewriter text={line.text} instant={showAll} onDone={() => setTyped(true)} speed={14} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex items-center justify-between">
          <div className="flex gap-1.5">
            {scene.lines.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === index ? "w-6 bg-sky-500" : i < index ? "w-2.5 bg-sky-300" : "w-2.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
          <Button
            size="sm"
            variant={isLast ? "primary" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            {!typed ? "Показать весь текст" : isLast ? scene.cta || "Продолжить" : "Далее ›"}
          </Button>
        </div>
      </div>

      {scene.visual && scene.visualPosition === "bottom" && (
        <VisualRenderer visual={scene.visual} />
      )}
    </div>
  );
}
