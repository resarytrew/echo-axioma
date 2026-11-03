import { useEffect, useMemo, useRef, useState } from "react";
import { SeeSpec } from "../../modules/types";
import { AxiomView } from "../../axiom/AxiomView";
import { LessonAnimation } from "./LessonAnimation";
import { Button } from "../ui/Button";

export function PhaseSee({ spec, onDone }: { spec: SeeSpec; onDone: () => void }) {
  const initial = useMemo(() => {
    const p: Record<string, number> = {};
    spec.sliders?.forEach((s) => (p[s.id] = s.value));
    return p;
  }, [spec]);
  const [params, setParams] = useState<Record<string, number>>(initial);
  const [solved, setSolved] = useState(false);
  /** история исследования: все посещённые состояния параметров */
  const historyRef = useRef<Record<string, number>[]>([initial]);
  const [historyLen, setHistoryLen] = useState(1);
  const [tab, setTab] = useState<"animation" | "experiment">(spec.animation ? "animation" : "experiment");
  /** просмотр анимации сам по себе не засчитывает этап */
  const [explored, setExplored] = useState(false);

  const scene = spec.build(params);
  const note = spec.note?.(params);

  const goalMet = spec.goal
    ? spec.goal.checkHistory
      ? spec.goal.checkHistory(historyRef.current)
      : spec.goal.check(params)
    : true;

  useEffect(() => {
    if (goalMet && !solved) setSolved(true);
  }, [goalMet, solved]);
  void historyLen;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="panel-glass rounded-2xl px-6 py-8 sm:px-10">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-sky-600">Увидеть</div>
        <h3 className="mb-1 font-head text-xl font-semibold text-slate-800 sm:text-2xl">{spec.title}</h3>
        <p className="mb-4 text-sm text-slate-500">{spec.description}</p>

        {spec.animation && (
          <div className="mb-4 flex gap-2">
            <TabButton active={tab === "animation"} onClick={() => setTab("animation")}>
              ▶ Анимация
            </TabButton>
            <TabButton active={tab === "experiment"} onClick={() => setTab("experiment")}>
              ⚙ Эксперимент
            </TabButton>
          </div>
        )}

        {spec.animation && tab === "animation" ? (
          <>
            <LessonAnimation lesson={spec.animation} />
            <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 font-head text-sm text-sky-800">
              Анимация объясняет идею. Чтобы продолжить, перейдите во вкладку «Эксперимент» и выполните
              исследовательское задание — понимание проверяется действием, а не просмотром.
            </div>
          </>
        ) : (
          <AxiomView scene={scene} height={320} />
        )}

        {spec.sliders && (!spec.animation || tab === "experiment") && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {spec.sliders.map((s) => (
              <label key={s.id} className="block rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="mb-2 flex justify-between font-mono text-xs text-slate-500">
                  <span>{s.label}</span>
                  <span className="font-bold text-sky-700">{params[s.id].toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={params[s.id]}
                  onChange={(e) => {
                    const next = { ...params, [s.id]: parseFloat(e.target.value) };
                    historyRef.current = [...historyRef.current, next].slice(-400);
                    setHistoryLen(historyRef.current.length);
                    setExplored(true);
                    setParams(next);
                  }}
                  className="w-full accent-sky-500"
                />
              </label>
            ))}
          </div>
        )}

        {note && (!spec.animation || tab === "experiment") && (
          <div className="mt-5 rounded-xl bg-sky-50 px-4 py-3 font-mono text-sm text-sky-800">
            {note}
          </div>
        )}

        {spec.goal && (!spec.animation || tab === "experiment") && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 ${
              goalMet
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-70">
              {goalMet ? "Исследование выполнено" : "Задание исследования"}
            </div>
            <div className="mt-1 font-head text-sm">{goalMet ? spec.goal.done : spec.goal.task}</div>
            {!goalMet && spec.goal.progress && (
              <div className="mt-1 font-mono text-xs opacity-80">
                {spec.goal.progress(params, historyRef.current)}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            onClick={onDone}
            disabled={(!!spec.goal && !solved) || (!spec.goal && !!spec.animation && !explored)}
          >
            {spec.goal && !solved
              ? "Выполните задание"
              : !spec.goal && spec.animation && !explored
                ? "Исследуйте модель"
                : "Продолжить"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-1.5 font-mono text-xs transition ${
        active ? "bg-sky-500 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
