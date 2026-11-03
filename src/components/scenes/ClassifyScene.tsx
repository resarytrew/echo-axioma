import { useState } from "react";
import { motion } from "framer-motion";
import { ClassifyScene as ClassifyType } from "../../types/scenario";
import { Button } from "../ui/Button";
import { Narrative } from "./Narrative";

export function ClassifyScene({ scene, onDone }: { scene: ClassifyType; onDone: () => void }) {
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

  const needsFlag = scene.rows.filter((r) => r.flag !== "none");
  const success =
    needsFlag.every((r) => selected.has(r.id)) &&
    scene.rows.filter((r) => r.flag === "none").every((r) => !selected.has(r.id));

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
          Проверка данных
        </div>
        <h3 className="mb-6 font-head text-xl font-semibold text-slate-800 sm:text-2xl">
          {scene.prompt}
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left font-mono text-[11px] uppercase tracking-wider text-slate-400">
                {scene.columns.map((c) => (
                  <th key={c} className="px-4 py-2.5">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scene.rows.map((row) => {
                const isSel = selected.has(row.id);
                let cls = "bg-white hover:bg-sky-50/60";
                if (checked) {
                  if (row.flag === "danger" && isSel) cls = "bg-rose-50";
                  else if (row.flag === "warning" && isSel) cls = "bg-amber-50";
                  else if (row.flag !== "none" && !isSel) cls = "bg-amber-50/40 ring-1 ring-inset ring-amber-300";
                  else if (row.flag === "none" && isSel) cls = "bg-rose-50/60";
                  else cls = "bg-white";
                } else if (isSel) {
                  cls = "bg-sky-50";
                }
                return (
                  <tr
                    key={row.id}
                    onClick={() => toggle(row.id)}
                    className={`cursor-pointer border-t border-slate-100 font-mono transition-colors ${cls}`}
                  >
                    {row.cells.map((cell, j) => (
                      <td key={j} className="px-4 py-2.5 text-slate-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
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
            {success
              ? "Верно отмечено."
              : "Отмечены не все подозрительные значения — проверь строки с пропуском и явным выбросом."}
          </motion.div>
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
