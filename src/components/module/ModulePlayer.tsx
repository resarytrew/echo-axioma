import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ModuleSpec } from "../../modules/types";
import { PhaseUnderstand } from "./PhaseUnderstand";
import { PhaseSee } from "./PhaseSee";
import { PhaseCode } from "./PhaseCode";
import { PhaseResult } from "./PhaseResult";
import { MiniLabScene } from "../scenes/MiniLabScene";
import { Button } from "../ui/Button";

interface Phase {
  key: string;
  label: string;
}

export function ModulePlayer({
  module,
  result,
  onComplete,
  onExit,
  initialPhase = 0,
  onPhaseChange,
  onPhaseDone,
}: {
  module: ModuleSpec;
  result?: (finish: () => void) => React.ReactNode;
  onComplete: () => void;
  onExit: () => void;
  initialPhase?: number;
  onPhaseChange?: (index: number) => void;
  onPhaseDone?: (phase: string, extra?: { codePassed?: boolean; seeGoalMet?: boolean; handsFirstTry?: number }) => void;
}) {
  const phases = useMemo<Phase[]>(() => {
    const list: Phase[] = [];
    if (module.understand?.length) list.push({ key: "understand", label: "Понять" });
    if (module.see) list.push({ key: "see", label: "Увидеть" });
    if (module.hands?.length) list.push({ key: "hands", label: "Посчитать руками" });
    if (module.code) list.push({ key: "code", label: "Написать код" });
    if (result || module.result) list.push({ key: "result", label: "Результат" });
    return list;
  }, [module, result]);

  const [phaseIdx, setPhaseIdx] = useState(() => Math.min(initialPhase, Math.max(0, phases.length - 1)));
  const phase = phases[phaseIdx];

  function nextPhase(extra?: { codePassed?: boolean; seeGoalMet?: boolean; handsFirstTry?: number }) {
    // фиксируем результат этапа сразу после успешного выполнения
    if (phase) onPhaseDone?.(phase.key, extra);
    if (phaseIdx + 1 < phases.length) {
      const i = phaseIdx + 1;
      setPhaseIdx(i);
      onPhaseChange?.(i);
    } else {
      onComplete();
    }
  }

  return (
    <div className="lesson-screen exo-interior relative z-10">
      <div className="lesson-header panel-glass sticky top-0 z-20 border-b">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3 sm:px-6">
          <button
            onClick={onExit}
            className="font-mono text-xs text-slate-400 transition hover:text-sky-600"
          >
            ← карта
          </button>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Акт {module.act} · Модуль {module.index}
            </div>
            <div className="truncate font-head text-sm font-semibold text-slate-800">{module.title}</div>
          </div>
          <div className="flex items-center gap-1.5">
            {phases.map((p, i) => (
              <button
                key={p.key}
                onClick={() => {
                  if (i < phaseIdx) {
                    setPhaseIdx(i);
                    onPhaseChange?.(i);
                  }
                }}
                className={`lesson-phase hidden rounded-full px-3 py-1 font-mono text-[10px] tracking-wide sm:block ${
                  i < phaseIdx
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : i === phaseIdx
                      ? "bg-sky-500 text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {p.label}
              </button>
            ))}
            <span className="font-mono text-[10px] text-slate-400 sm:hidden">
              {phaseIdx + 1}/{phases.length}
            </span>
          </div>
        </div>
      </div>

      <motion.div
        key={phase?.key}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {phase?.key === "understand" && module.understand && (
          <PhaseUnderstand scenes={module.understand} onDone={() => nextPhase()} />
        )}
        {phase?.key === "see" && module.see && (
          <PhaseSee spec={module.see} onDone={() => nextPhase({ seeGoalMet: true })} />
        )}
        {phase?.key === "hands" && module.hands && (
          <MiniLabScene
            scene={{
              id: module.id + "-hands",
              type: "miniLab",
              title: "ПОСЧИТАТЬ РУКАМИ",
              items: module.hands,
            }}
            onDone={(firstTry) => nextPhase({ handsFirstTry: firstTry })}
          />
        )}
        {phase?.key === "code" && module.code && (
          <PhaseCode task={module.code} onDone={() => nextPhase({ codePassed: true })} />
        )}
        {phase?.key === "result" &&
          (result ? (
            result(() => nextPhase())
          ) : module.result ? (
            <PhaseResult result={module.result} onDone={() => nextPhase()} />
          ) : null)}
      </motion.div>

      {!phase && (
        <div className="flex items-center justify-center py-20">
          <Button onClick={onComplete}>Завершить модуль</Button>
        </div>
      )}
    </div>
  );
}
