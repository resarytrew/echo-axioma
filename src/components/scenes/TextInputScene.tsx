import { useState } from "react";
import { motion } from "framer-motion";
import { TextInputScene as TextInputType } from "../../types/scenario";
import { Button } from "../ui/Button";

export function TextInputScene({
  scene,
  onDone,
}: {
  scene: TextInputType;
  onDone: (answer: string) => void;
}) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const [checked, setChecked] = useState([false, false]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="panel-glass rounded-2xl px-6 py-8 sm:px-10">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-sky-600">
          ECHO CONCEPT TRAINING · TERM: {scene.term.toUpperCase()}
        </div>
        <h3 className="mb-6 font-head text-xl font-semibold text-slate-800 sm:text-2xl">
          {scene.prompt}
        </h3>

        {!saved ? (
          <>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={scene.placeholder}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-head text-base text-slate-800 shadow-inner outline-none ring-sky-300 transition focus:ring-2"
            />
            <div className="mt-5 flex justify-end">
              <Button onClick={() => setSaved(true)} disabled={value.trim().length < 3}>
                Сохранить определение
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-sky-200 bg-sky-50 px-5 py-4"
            >
              <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-sky-500">
                USER DEFINITION SAVED
              </div>
              <div className="font-head text-slate-800">{value}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4"
            >
              <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-emerald-600">
                ОПРЕДЕЛЕНИЕ КУРСА
              </div>
              <div className="font-head text-emerald-900">{scene.officialDefinition}</div>
            </motion.div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
              <p className="mb-3 text-sm font-semibold text-slate-800">Самопроверка определения</p>
              <p className="mb-3 text-sm text-slate-600">Свободный текст не оценивается автоматически. Сравните его с определением курса и при необходимости исправьте.</p>
              {["Я назвал ключевое свойство понятия.", "Я пояснил, как понятие используется или с чем связано."].map((label, i) => (
                <label key={i} className="mb-2 flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={checked[i]} onChange={(e) => setChecked((p) => p.map((v,j) => i === j ? e.target.checked : v))} />
                  {label}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setSaved(false); setChecked([false,false]); }}>Исправить определение</Button>
              <Button onClick={() => onDone(value)} disabled={!checked.every(Boolean)}>Продолжить</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
