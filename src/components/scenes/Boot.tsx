import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BootScene } from "../../types/scenario";
import { Button } from "../ui/Button";

export function Boot({ scene, onDone }: { scene: BootScene; onDone: () => void }) {
  const [visible, setVisible] = useState(0);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    setVisible(0);
    setShowCta(false);
    const timers: number[] = [];
    scene.lines.forEach((_, i) => {
      timers.push(window.setTimeout(() => setVisible(i + 1), 550 * i + 300));
    });
    timers.push(
      window.setTimeout(
        () => setShowCta(true),
        550 * scene.lines.length + 600,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [scene]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 px-8 py-10 shadow-2xl shadow-sky-900/20">
        <div className="mb-6 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-3 font-mono text-[11px] tracking-[0.3em] text-slate-500">
            AXIOMA TERMINAL
          </span>
        </div>
        <div className="space-y-1.5 font-mono text-[13px] leading-relaxed text-sky-300 sm:text-sm">
          {scene.lines.slice(0, visible).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={i === 0 ? "font-semibold tracking-widest text-sky-200" : ""}
            >
              {line}
            </motion.div>
          ))}
          {visible < scene.lines.length && <span className="caret" />}
        </div>
      </div>
      {showCta && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10"
        >
          <Button size="lg" onClick={onDone}>
            {scene.cta}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
