import { useState } from "react";
import { motion } from "framer-motion";
import { MiniLabScene as MiniLabType } from "../../types/scenario";
import { Button } from "../ui/Button";
import { Narrative } from "./Narrative";

export function MiniLabScene({
  scene,
  onDone,
}: {
  scene: MiniLabType;
  onDone: (firstTryRatio?: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [firstTry, setFirstTry] = useState<Record<string, boolean>>({});
  const [showAfter, setShowAfter] = useState(false);

  if (showAfter && scene.afterLines) {
    return (
      <Narrative
        scene={{ id: scene.id + "-after", type: "narrative", lines: scene.afterLines }}
        onDone={() => onDone(scene.items.filter((i) => firstTry[i.id]).length / Math.max(1, scene.items.length))}
      />
    );
  }

  const allAnswered = scene.items.every((it) => answers[it.id]);
  const allCorrect = scene.items.every((it) => answers[it.id] === it.correctId);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="panel-glass rounded-2xl px-6 py-8 sm:px-10">
        <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-sky-600">
          {scene.title}
        </div>

        <div className="space-y-5">
          {scene.items.map((item) => {
            const picked = answers[item.id];
            return (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 font-head text-sm font-semibold text-slate-700">
                  {item.prompt}
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.options.map((opt) => {
                    const isPicked = picked === opt.id;
                    const reveal = !!picked;
                    const isCorrect = opt.id === item.correctId;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setFirstTry((f) =>
                            item.id in f ? f : { ...f, [item.id]: opt.id === item.correctId },
                          );
                          setAnswers((a) => ({ ...a, [item.id]: opt.id }));
                        }}
                        className={`rounded-lg border px-3.5 py-2 font-mono text-sm transition-all ${
                          reveal && isCorrect
                            ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                            : reveal && isPicked && !isCorrect
                              ? "border-rose-300 bg-rose-50 text-rose-600"
                              : "border-slate-200 bg-slate-50 hover:border-sky-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {allAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 rounded-xl border px-5 py-4 font-head text-sm ${
              allCorrect
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {allCorrect ? "Все расчёты верны." : "Есть неточности — сверь степени двойки."}
          </motion.div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          {allAnswered && !allCorrect && (
            <Button variant="outline" onClick={() => setAnswers({})}>
              Заново
            </Button>
          )}
          {allAnswered && allCorrect && (
            <Button
              onClick={() => {
                const ratio =
                  scene.items.filter((i) => firstTry[i.id]).length / Math.max(1, scene.items.length);
                return scene.afterLines ? setShowAfter(true) : onDone(ratio);
              }}
            >
              Продолжить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
