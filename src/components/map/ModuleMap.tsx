import { motion } from "framer-motion";
import { ACTS, modulesOfAct } from "../../modules/registry";
import { ModuleSpec } from "../../modules/types";

export function ModuleMap({
  completed,
  onOpen,
  onStation,
  onMenu,
}: {
  completed: Set<string>;
  onOpen: (m: ModuleSpec) => void;
  onStation?: () => void;
  onMenu?: () => void;
}) {
  const completedCount = completed.size;

  return (
    <div className="academy-map mx-auto w-full max-w-5xl px-4 py-10 sm:px-8">
      <div className="academy-heading mb-10">
        <div className="font-mono text-xs uppercase tracking-[0.5em] text-sky-600">AXIOMA · ECHO CURRICULUM</div>
        <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-slate-800 sm:text-5xl">
          6 актов · 50 модулей
        </h2>
        <p className="mt-4 max-w-xl font-head text-slate-600">
          От элементарной арифметики — к собственной обученной Transformer-модели ЭХО. Каждый модуль:
          понять → увидеть → посчитать руками → написать код → результат.
        </p>
        <div className="mt-4 inline-flex items-center gap-3">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 font-mono text-xs text-emerald-700">
            ПРОЙДЕНО МОДУЛЕЙ: {completedCount}
          </span>
          {onMenu && (
            <button
              onClick={onMenu}
              className="rounded-full border border-slate-300 bg-white px-4 py-1.5 font-mono text-xs text-slate-500 transition hover:border-sky-300 hover:text-sky-600"
            >
              ← МЕНЮ
            </button>
          )}
          {onStation && (
            <button
              onClick={onStation}
              className="rounded-full border border-sky-300 bg-sky-500 px-4 py-1.5 font-mono text-xs text-white shadow shadow-sky-200 transition hover:bg-sky-400"
            >
              ▣ КАРТА СТАНЦИИ
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {ACTS.map((act, ai) => {
          const mods = modulesOfAct(act.id);
          return (
            <motion.section
              key={act.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ai * 0.06 }}
              className="academy-act panel-glass overflow-hidden rounded-2xl"
            >
              <header
                className="academy-act-header flex items-center gap-4 border-b px-6 py-4"
                style={{ background: `linear-gradient(120deg, ${act.color}14, transparent 60%)` }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl font-display text-lg font-bold text-white shadow"
                  style={{ background: act.color }}
                >
                  {act.roman}
                </div>
                <div>
                  <div className="font-display text-lg font-bold tracking-wide text-slate-800">
                    {act.title}
                  </div>
                  <div className="font-head text-sm text-slate-500">{act.subtitle}</div>
                </div>
                <div className="ml-auto font-mono text-xs text-slate-400">{act.modules} модулей</div>
              </header>
              <div className="divide-y divide-slate-100">
                {mods.map((m) => {
                  const done = completed.has(m.id);
                  return (
                    <div key={m.id} className="academy-module flex items-center gap-4 px-6 py-3.5">
                      <span
                        className={`flex h-6 w-10 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-bold ${
                          done
                            ? "bg-emerald-100 text-emerald-700"
                            : m.playable
                              ? "bg-sky-100 text-sky-700"
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {act.roman}.{m.index}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`font-head text-sm font-semibold ${
                            done ? "text-emerald-700" : m.playable ? "text-slate-800" : "text-slate-400"
                          }`}
                        >
                          {m.title}
                          {done && <span className="ml-2 text-[10px]">✓</span>}
                        </div>
                        <div className="truncate text-xs text-slate-400">{m.summary}</div>
                      </div>
                      {m.playable ? (
                        <button
                          onClick={() => onOpen(m)}
                          className={`rounded-lg px-4 py-1.5 font-mono text-xs font-bold tracking-wide transition ${
                            done
                              ? "border border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                              : "bg-sky-500 text-white shadow-sm hover:bg-sky-400"
                          }`}
                        >
                          {done ? "ПОВТОРИТЬ" : m.trainLab ? "ОБУЧИТЬ" : "ОТКРЫТЬ"}
                        </button>
                      ) : (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-300">
              скоро
            </span>
          )}
                    </div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
