import { useState } from "react";
import { motion } from "framer-motion";
import { MultiSelectScene as MultiSelectType } from "../../types/scenario";
import { VisualRenderer } from "../visuals/VisualRenderer";
import { Button } from "../ui/Button";
import { Narrative } from "./Narrative";

export function MultiSelectScene({
  scene,
  onDone,
}: {
  scene: MultiSelectType;
  onDone: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  const [showAfter, setShowAfter] = useState(false);

  if (showAfter && scene.afterLines) {
    return (
      <Narrative
        scene={{ id: scene.id + "-after", type: "narrative", lines: scene.afterLines }}
        onDone={onDone}
      />
    );
  }

  const allCorrectChosen = scene.options
    .filter((o) => o.correct)
    .every((o) => selected.has(o.id));
  const noWrongChosen = scene.options.filter((o) => !o.correct).every((o) => !selected.has(o.id));
  const success = allCorrectChosen && noWrongChosen;

  function toggle(id: string) {
    if (checked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="panel-glass rounded-2xl px-6 py-8 sm:px-10">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-sky-600">
          Задание
        </div>
        <h3 className="mb-2 font-head text-xl font-semibold text-slate-800 sm:text-2xl">
          {scene.prompt}
        </h3>
        {scene.helper && <p className="mb-6 text-sm text-slate-500">{scene.helper}</p>}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {scene.options.map((opt) => {
            const isSel = selected.has(opt.id);
            const showResult = checked;
            const wrongPick = showResult && isSel && !opt.correct;
            const missed = showResult && !isSel && opt.correct;
            return (
              <button
                key={opt.id}
                onClick={() => toggle(opt.id)}
                className={`rounded-xl border px-4 py-3 text-center font-mono text-sm font-medium transition-all ${
                  wrongPick
                    ? "border-rose-300 bg-rose-50 text-rose-600"
                    : missed
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : isSel
                        ? "border-sky-400 bg-sky-50 text-sky-800 shadow-sm shadow-sky-100"
                        : "border-slate-200 bg-white text-slate-600 hover:border-sky-300"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {checked && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 rounded-xl border px-5 py-4 font-head text-sm ${
              success
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {success ? "Верно." : "Проверь ещё раз — отмечено лишнее или не выбрано нужное."}
          </motion.div>
        )}

        {checked && success && scene.successVisual && (
          <div className="mt-6">
            <VisualRenderer visual={scene.successVisual} />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          {!checked && (
            <Button onClick={() => setChecked(true)} disabled={selected.size === 0}>
              Проверить
            </Button>
          )}
          {checked && !success && (
            <Button variant="outline" onClick={() => setChecked(false)}>
              Исправить
            </Button>
          )}
          {checked && success && (
            <Button onClick={() => (scene.afterLines ? setShowAfter(true) : onDone())}>
              Продолжить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
