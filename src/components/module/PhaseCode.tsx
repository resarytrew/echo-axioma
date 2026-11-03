import { useState } from "react";
import { motion } from "framer-motion";
import { CodeTask } from "../../modules/types";
import { runStudentCode, RunResult } from "../../runner/vectorRunner";
import { Button } from "../ui/Button";

export function PhaseCode({ task, onDone }: { task: CodeTask; onDone: () => void }) {
  const [code, setCode] = useState(task.starter);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [showHint, setShowHint] = useState(false);

  async function run() {
    setRunning(true);
    setResult(null);
    const res = await runStudentCode(code, task.tests);
    setResult(res);
    setRunning(false);
  }

  const allPass = result?.tests?.every((t) => t.passed);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="panel-glass rounded-2xl px-6 py-8 sm:px-10">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-sky-600">
          Написать код · sandbox iframe/worker
        </div>
        <h3 className="mb-1 font-head text-xl font-semibold text-slate-800 sm:text-2xl">{task.title}</h3>
        <p className="mb-5 text-sm text-slate-500">{task.brief}</p>

        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-inner">
          <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-rose-400/70" />
            <span className="h-2 w-2 rounded-full bg-amber-300/70" />
            <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
            <span className="ml-2 font-mono text-[10px] tracking-widest text-slate-500">sandbox.js</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            rows={10}
            className="w-full resize-y bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed text-sky-200 outline-none"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={run} disabled={running}>
            {running ? "Выполняю…" : "Запустить в песочнице"}
          </Button>
          {task.hint && (
            <Button variant="ghost" size="sm" onClick={() => setShowHint((v) => !v)}>
              {showHint ? "Скрыть подсказку" : "Подсказка"}
            </Button>
          )}
          {showHint && <span className="font-mono text-xs text-amber-600">{task.hint}</span>}
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-3">
            {result.logs.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-slate-400">console</div>
                <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700">{result.logs.join("\n")}</pre>
              </div>
            )}
            {result.error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-mono text-sm text-rose-700">
                {result.error}
              </div>
            )}
            {result.tests && (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">автотесты</div>
                <div className="space-y-1.5">
                  {result.tests.map((t) => (
                    <div key={t.name} className="flex items-center gap-2 font-mono text-sm">
                      <span className={t.passed ? "text-emerald-600" : "text-rose-500"}>{t.passed ? "✓" : "✕"}</span>
                      <span className={t.passed ? "text-slate-700" : "text-slate-500"}>{t.name}</span>
                      {t.error && <span className="text-xs text-rose-400">{t.error}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {allPass && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-head text-emerald-800">
                Все тесты пройдены. ЭХО записывает новую способность.
              </div>
            )}
          </motion.div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onDone} disabled={!allPass}>
            Продолжить
          </Button>
        </div>
      </div>
    </div>
  );
}
