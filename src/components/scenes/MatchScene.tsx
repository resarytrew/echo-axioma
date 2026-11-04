import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MatchScene as MatchType } from "../../types/scenario";
import { Button } from "../ui/Button";
import { Narrative } from "./Narrative";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchScene({ scene, onDone }: { scene: MatchType; onDone: () => void }) {
  const rightItems = useMemo(
    () => shuffle(scene.pairs.map((p) => ({ id: p.id, text: p.right }))),
    [scene],
  );
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [leftPick, setLeftPick] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [wrongText, setWrongText] = useState("");
  const [showAfter, setShowAfter] = useState(false);

  if (showAfter && scene.afterLines) {
    return (
      <Narrative
        scene={{ id: scene.id + "-after", type: "narrative", lines: scene.afterLines }}
        onDone={onDone}
      />
    );
  }

  const done = matched.size === scene.pairs.length;

  function pickRight(id: string) {
    if (!leftPick || matched.has(leftPick)) return;
    if (id === leftPick) {
      setMatched((prev) => new Set(prev).add(id));
      setLeftPick(null);
      setWrongText("");
    } else {
      setWrongFlash(id);
      const left = scene.pairs.find((p) => p.id === leftPick);
      const right = scene.pairs.find((p) => p.id === id);
      setWrongText("«" + (left?.left ?? "") + "» не соответствует «" + (right?.right ?? "") + "». Сравните смысл и назначение элементов.");
      setTimeout(() => setWrongFlash(null), 420);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="panel-glass rounded-2xl px-6 py-8 sm:px-10">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-sky-600">
          Сопоставление
        </div>
        <h3 className="mb-6 font-head text-xl font-semibold text-slate-800 sm:text-2xl">
          {scene.prompt}
        </h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2.5">
            {scene.pairs.map((p) => {
              const isMatched = matched.has(p.id);
              const isPicked = leftPick === p.id;
              return (
                <button
                  key={p.id}
                  disabled={isMatched}
                  onClick={() => setLeftPick(p.id)}
                  className={`w-full rounded-lg border px-4 py-3 text-left font-mono text-sm transition-all ${
                    isMatched
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : isPicked
                        ? "border-sky-400 bg-sky-50 text-sky-800 ring-2 ring-sky-200"
                        : "border-slate-200 bg-white hover:border-sky-300"
                  }`}
                >
                  {p.left}
                </button>
              );
            })}
          </div>
          <div className="space-y-2.5">
            {rightItems.map((r) => {
              const isMatched = matched.has(r.id);
              return (
                <motion.button
                  key={r.id}
                  disabled={isMatched}
                  onClick={() => pickRight(r.id)}
                  animate={wrongFlash === r.id ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                  className={`w-full rounded-lg border px-4 py-3 text-left font-mono text-sm transition-all ${
                    isMatched
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 opacity-60"
                      : "border-slate-200 bg-white hover:border-sky-300"
                  }`}
                >
                  {r.text}
                </motion.button>
              );
            })}
          </div>
        </div>

        {wrongText && <p role="status" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{wrongText}</p>}
        {done && (
          <div className="mt-6 flex justify-end">
            <Button onClick={() => (scene.afterLines ? setShowAfter(true) : onDone())}>
              Продолжить
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
