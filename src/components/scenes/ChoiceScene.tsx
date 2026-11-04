import { useState } from "react";
import { motion } from "framer-motion";
import { ChoiceScene as ChoiceSceneType } from "../../types/scenario";
import { VisualRenderer } from "../visuals/VisualRenderer";
import { Button } from "../ui/Button";
import { Narrative } from "./Narrative";

export function ChoiceScene({
  scene,
  onDone,
}: {
  scene: ChoiceSceneType;
  onDone: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [showAfter, setShowAfter] = useState(false);

  if (showAfter && scene.afterLines) {
    return (
      <Narrative
        scene={{
          id: scene.id + "-after",
          type: "narrative",
          lines: scene.afterLines,
        }}
        onDone={onDone}
      />
    );
  }

  const correct = picked === scene.correctId;
  const gate = scene.requireCorrect ?? true;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="panel-glass rounded-2xl px-6 py-8 sm:px-10">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-sky-600">
          Вопрос
        </div>
        <h3 className="mb-6 font-head text-xl font-semibold text-slate-800 sm:text-2xl">
          {scene.prompt}
        </h3>

        {scene.visual && (
          <div className="mb-6">
            <VisualRenderer visual={scene.visual} />
          </div>
        )}

        <div className="grid gap-3">
          {scene.options.map((opt) => {
            const isPicked = picked === opt.id;
            const reveal = picked !== null && (!gate || correct);
            const isCorrectOpt = opt.id === scene.correctId;
            return (
              <button
                key={opt.id}
                disabled={picked !== null}
                onClick={() => setPicked(opt.id)}
                className={`group flex items-center justify-between rounded-xl border px-5 py-3.5 text-left font-head text-sm transition-all sm:text-base ${
                  reveal && isCorrectOpt
                    ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                    : reveal && isPicked && !isCorrectOpt
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/60"
                } disabled:cursor-default`}
              >
                <span>{opt.label}</span>
                {reveal && isCorrectOpt && <span>✓</span>}
                {reveal && isPicked && !isCorrectOpt && <span>✕</span>}
              </button>
            );
          })}
        </div>

        {picked && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 rounded-xl border px-5 py-4 font-head text-sm leading-relaxed ${
              correct
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {correct
              ? scene.correctFeedback
              : scene.options.find((o) => o.id === picked)?.feedback ||
                scene.incorrectFeedback || "Проверьте смысл вопроса и попробуйте снова."}
          </motion.div>
        )}

        {picked && (
          <div className="mt-6 flex justify-end">
            {gate && !correct ? (
              <Button onClick={() => setPicked(null)}>Попробовать снова</Button>
            ) : (
              <Button onClick={() => (scene.afterLines ? setShowAfter(true) : onDone())}>
                Продолжить
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
