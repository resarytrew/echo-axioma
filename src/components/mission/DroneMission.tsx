import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { DRONE_FIELD, SimResult, Vec2, routeSmoothness, simulateRoute } from "../../game/drone";
import { Narrative } from "../scenes/Narrative";
import { Button } from "../ui/Button";

type Stage = "intro" | "lab" | "deploy";

export function DroneMission({
  onComplete,
  onExit,
  initialRoute,
  initialStage,
  revisit,
  onStage,
  onDraft,
  toolsReady,
}: {
  onComplete: (steps: Vec2[], length: number) => void;
  onExit: () => void;
  initialRoute?: Vec2[];
  initialStage?: string;
  revisit?: boolean;
  onStage?: (stage: string) => void;
  onDraft?: (steps: Vec2[]) => void;
  toolsReady?: boolean;
}) {
  const [stage, setStageState] = useState<Stage>(
    (initialStage as Stage) && initialStage !== "deploy"
      ? (initialStage as Stage)
      : revisit || (initialRoute && initialRoute.length > 0)
        ? "lab"
        : "intro",
  );

  function setStage(s: Stage) {
    setStageState(s);
    onStage?.(s);
  }
  const [steps, setStepsState] = useState<Vec2[]>(initialRoute ?? []);
  const [dx, setDx] = useState(1.2);
  const [dy, setDy] = useState(0.8);
  const [sim, setSim] = useState<SimResult | null>(null);
  const [animT, setAnimT] = useState<number | null>(null);
  const animRef = useRef<number | null>(null);

  const preview = useMemo(() => simulateRoute(steps), [steps]);
  const stepLen = Math.hypot(dx, dy);
  const stepTooLong = stepLen > DRONE_FIELD.maxStepLen + 1e-9;

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  function setSteps(next: Vec2[]) {
    setStepsState(next);
    onDraft?.(next);
  }

  function addStep() {
    if (steps.length >= DRONE_FIELD.maxSteps || stepTooLong) return;
    const s = { x: Number(dx.toFixed(2)), y: Number(dy.toFixed(2)) };
    setSteps([...steps, s]);
    setSim(null);
    setAnimT(null);
  }

  function runSimulation() {
    const result = simulateRoute(steps);
    setSim(result);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const start = performance.now();
    const durPerPoint = 260;
    const tick = (t: number) => {
      const i = Math.min(result.path.length - 1, Math.floor((t - start) / durPerPoint));
      setAnimT(i);
      if (i < result.path.length - 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }

  if (stage === "intro") {
    return (
      <Shell title="Глава I · «Геометрия пространства»" onExit={onExit}>
        <Narrative
          scene={{
            id: "drone-intro",
            type: "narrative",
            visual: {
              kind: "statusList",
              title: "НАВИГАЦИОННАЯ РУБКА",
              items: [
                { label: "STAR TRACKER", value: "DRIFT ±12°", state: "degraded" },
                { label: "ТРАЕКТОРИИ", value: "CORRUPTED", state: "warning" },
                { label: "РЕМОНТНЫЙ ДРОН", value: "DOCKED · ГОТОВ", state: "online" },
                { label: "ШТАБЕЛЬ ОБЛОМКОВ", value: "СЕКТОР Д", state: "warning" },
              ],
            },
            lines: [
              { speaker: "zara", text: "Навигационная рубка считает смещёнными координатами. Все опорные точки «поплыли» после аварии." },
              { speaker: "bit", text: "Мне нужно добраться до узла обслуживания на корме. Маршрут я проложить не могу — вокруг завалы." },
              { speaker: "zara", text: "Для ЭХО маршрут — это последовательность векторов. Собери её сам: реальная векторная математика, реальный обломок." },
              { speaker: "bit", text: "Если я врежусь, ты будешь меня чинить." },
              { speaker: "zara", text: "Поэтому сначала — симуляция. Станция не прощает надежд, она прощает только расчёты." },
            ],
          }}
          onDone={() => setStage("lab")}
        />
      </Shell>
    );
  }

  if (stage === "lab") {
    return (
      <Shell title={revisit ? "Перепрокладка маршрута" : "Конструктор маршрута · векторные шаги"} onExit={onExit}>
        {revisit && (
          <div className="mx-auto mb-4 max-w-6xl px-4">
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 font-mono text-xs text-sky-800">
              Маршрут уже сохранён в навигации. Его можно улучшить: короче путь — меньше расход энергии.
            </div>
          </div>
        )}
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 lg:grid-cols-5">
          <div className="panel-glass rounded-2xl p-6 lg:col-span-2">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-sky-600">Инженерный терминал</div>
            <h3 className="mb-3 font-head text-lg font-bold text-slate-800">План ЭХО: последовательность векторов</h3>

            <div className="grid grid-cols-2 gap-3">
              <AxisSlider label="Δx (восток)" value={dx} min={-2} max={2} onChange={setDx} />
              <AxisSlider label="Δy (юг)" value={dy} min={-2} max={2} onChange={setDy} />
            </div>
            <div
              className={`mt-2 font-mono text-xs ${stepTooLong ? "text-rose-600" : "text-slate-500"}`}
            >
              |шаг| = {stepLen.toFixed(2)} / макс {DRONE_FIELD.maxStepLen}
              {stepTooLong && " — манёвр отклонён: превышена тяга дрона"}
            </div>
            {toolsReady === false && (
              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-mono text-[11px] text-amber-800">
                Векторные инструменты ЭХО не изучены — конструктор маршрута заблокирован. Осмотр задачи доступен.
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={addStep}
                disabled={steps.length >= DRONE_FIELD.maxSteps || stepTooLong || toolsReady === false}
              >
                + Добавить шаг
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSteps(steps.slice(0, -1));
                  setSim(null);
                }}
                disabled={steps.length === 0}
              >
                Отменить
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setSteps([]); setSim(null); setAnimT(null); }}>
                Сброс
              </Button>
            </div>

            <div className="mt-4 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3">
              {steps.length === 0 ? (
                <div className="font-mono text-xs text-slate-400">Пока ни одного шага. Собери маршрут векторами.</div>
              ) : (
                <ol className="space-y-1 font-mono text-xs text-slate-600">
                  {steps.map((s, i) => (
                    <li key={i}>
                      [{i}] ⟨{s.x.toFixed(1)}, {s.y.toFixed(1)}⟩
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Суммарная длина</span>
                <span className={preview.length <= DRONE_FIELD.energyBudget ? "text-emerald-600" : "text-rose-600"}>
                  {preview.length.toFixed(1)} / {DRONE_FIELD.energyBudget}
                </span>
              </div>
              <div className="mt-1 flex justify-between text-slate-500">
                <span>Повороты</span>
                <span>{routeSmoothness(preview.path).toFixed(2)} рад</span>
              </div>
              <div className="mt-1 flex justify-between text-slate-500">
                <span>Шагов</span>
                <span>
                  {steps.length} / {DRONE_FIELD.maxSteps}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={runSimulation} disabled={steps.length === 0}>
                Запустить симуляцию дрона
              </Button>
            </div>
          </div>

          <div className="panel-glass rounded-2xl p-6 lg:col-span-3">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-teal-600">Испытательный стенд · карта сектора D</div>
            <FieldView preview={sim ?? preview} animT={animT} />

            <SimVerdict sim={sim} />
            {sim?.passed && (
              <div className="mt-4 flex justify-end">
                <Button size="lg" onClick={() => setStage("deploy")}>
                  Внедрить маршрут в навигацию
                </Button>
              </div>
            )}
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Навигация восстановлена" onExit={onExit}>
      <Narrative
        scene={{
          id: "drone-deploy",
          type: "narrative",
          visual: {
            kind: "statusList",
            title: "НАВИГАЦИОННАЯ РУБКА",
            items: [
              { label: "VECTOR MONITOR", value: "ONLINE", state: "online" },
              { label: "ОБХОДНОЙ МАРШРУТ", value: "DEPLOYED", state: "online" },
              { label: "РЕМОНТНЫЙ ДРОН", value: "УЗЕЛ ДОСТИГНУТ", state: "online" },
              { label: "STAR TRACKER", value: "RECALIBRATED", state: "online" },
            ],
          },
          lines: [
            { speaker: "bit", text: "Докладываю: ни одного приятного контакта с обломками. Узел обслуживания обслужен." },
            { speaker: "zara", text: "Внешние антенны снова вращаются. ЭХО теперь держит пространственную модель и может прокладывать маршруты." },
            { speaker: "shumma", text: "Один маршрут — одна истина. А вы уверены, что это был единственно возможный?" },
            { speaker: "zara", text: "Не единственный. Испытательный стенд принимает любой безопасный. Это и есть инженерия." },
            { speaker: "system", text: "STAR MAP SYNC… координаты восстановлены, гл. VI: архивные массивы содержат фрагменты неизвестного журнала.", mono: true },
          ],
        }}
        onDone={() => onComplete(steps, preview.length)}
      />
    </Shell>
  );
}

function FieldView({ preview, animT }: { preview: SimResult; animT: number | null }) {
  const S = DRONE_FIELD.size;
  const toPx = (v: number) => (v / S) * 600;
  const pt = (i: number) => preview.path[Math.min(i, preview.path.length - 1)];
  const dronePos = animT !== null ? pt(animT) : preview.path[preview.path.length - 1];
  const isOk = preview.passed;

  return (
    <svg viewBox="0 0 600 600" className="block w-full rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-sky-50">
      {/* сетка */}
      {Array.from({ length: S + 1 }).map((_, i) => (
        <g key={i} stroke="rgba(148,163,184,0.25)">
          <line x1={0} x2={600} y1={toPx(i)} y2={toPx(i)} />
          <line x1={toPx(i)} x2={toPx(i)} y1={0} y2={600} />
        </g>
      ))}

      {/* препятствия */}
      {DRONE_FIELD.obstacles.map((o) => (
        <g key={o.label}>
          <circle cx={toPx(o.x)} cy={toPx(o.y)} r={toPx(o.r)} fill="rgba(244,63,94,0.10)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="6 4" />
          <circle cx={toPx(o.x)} cy={toPx(o.y)} r={toPx(o.r) * 0.55} fill="rgba(244,63,94,0.18)" />
          <text x={toPx(o.x)} y={toPx(o.y) - toPx(o.r) - 6} textAnchor="middle" fontSize={11} fill="#e11d48" fontFamily="'JetBrains Mono', monospace">
            {o.label}
          </text>
        </g>
      ))}

      {/* старт/цель */}
      <circle cx={toPx(DRONE_FIELD.start.x)} cy={toPx(DRONE_FIELD.start.y)} r={12} fill="#10b981" />
      <text x={toPx(DRONE_FIELD.start.x)} y={toPx(DRONE_FIELD.start.y) - 20} textAnchor="middle" fontSize={12} fill="#047857" fontFamily="'JetBrains Mono', monospace">
        START
      </text>
      <circle cx={toPx(DRONE_FIELD.target.x)} cy={toPx(DRONE_FIELD.target.y)} r={toPx(DRONE_FIELD.tolerance)} fill="rgba(16,185,129,0.08)" stroke="#10b981" strokeDasharray="4 4" />
      <circle cx={toPx(DRONE_FIELD.target.x)} cy={toPx(DRONE_FIELD.target.y)} r={10} fill="#0ea5e9" />
      <text x={toPx(DRONE_FIELD.target.x)} y={toPx(DRONE_FIELD.target.y) - 20} textAnchor="middle" fontSize={12} fill="#0369a1" fontFamily="'JetBrains Mono', monospace">
        УЗЕЛ
      </text>

      {/* путь */}
      <polyline
        points={preview.path.map((p) => `${toPx(p.x)},${toPx(p.y)}`).join(" ")}
        fill="none"
        stroke={preview.collisionAt !== null ? "#f43f5e" : isOk ? "#10b981" : "#0284c7"}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {preview.path.map((p, i) => (
        <circle key={i} cx={toPx(p.x)} cy={toPx(p.y)} r={4} fill="#0c4a6e" opacity={0.7} />
      ))}

      {/* дрон */}
      <motion.g animate={false}>
        <circle cx={toPx(dronePos.x)} cy={toPx(dronePos.y)} r={9} fill={preview.collisionAt !== null ? "#ef4444" : "#f59e0b"} stroke="#fff" strokeWidth={2.5} />
      </motion.g>
    </svg>
  );
}

function SimVerdict({ sim }: { sim: SimResult | null }) {
  if (!sim) return null;
  let text: string;
  let ok = false;
  if (sim.collisionAt !== null) {
    text = `СТОЛКНОВЕНИЕ на точке пути №${sim.collisionAt}. Векторный шаг проходит через препятствие — измени маршрут.`;
  } else if (sim.outOfBounds !== null) {
    text = "ДРОН ВЫШЕЛ за границы палубы. Маршрут ведёт за пределы сектора.";
  } else if (!sim.reached) {
    text = "Дрон остановился в стороне от узла. Маршрут слишком короткий или ведёт не туда.";
  } else if (!sim.energyOk) {
    text = `Дрон достиг цели, но путь ${sim.length.toFixed(1)} превышает бюджет энергии ${DRONE_FIELD.energyBudget}. Уплотни маршрут.`;
  } else {
    ok = true;
    text = `МАРШРУТ УСПЕШЕН: длина ${sim.length.toFixed(1)}, повороты ${routeSmoothness(sim.path).toFixed(2)} рад, столкновений нет.`;
  }
  return (
    <div
      className={`mt-4 rounded-xl border px-4 py-3 font-mono text-sm ${
        ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {text}
    </div>
  );
}

function AxisSlider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="block rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <div className="mb-1.5 flex justify-between font-mono text-xs text-slate-500">
        <span>{label}</span>
        <span className="font-bold text-sky-700">{value.toFixed(1)}</span>
      </div>
      <input type="range" min={min} max={max} step={0.1} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-sky-500" />
    </label>
  );
}

function Shell({ title, children, onExit }: { title: string; children: React.ReactNode; onExit: () => void }) {
  return (
    <div className="relative z-10">
      <div className="mission-header panel-glass sticky top-0 z-20 border-b">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <button onClick={onExit} className="font-mono text-xs text-slate-400 transition hover:text-sky-600">
            ← станция
          </button>
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-head text-sm font-semibold text-slate-800">
            {title}
          </motion.div>
        </div>
      </div>
      {children}
    </div>
  );
}
