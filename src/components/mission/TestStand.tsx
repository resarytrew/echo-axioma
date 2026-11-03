import { useMemo, useState } from "react";
import {
  Circuit,
  COMPUTE_BUDGET,
  EvalReport,
  circuitCost,
  evaluateCircuit,
  makeScenarios,
  SAFE_THRESHOLD,
} from "../../game/circuit";
import { SensorChart } from "./SensorChart";
import { Button } from "../ui/Button";

export function TestStand({
  circuit,
  report,
  controlReport,
  onReport,
  onControlReport,
  onDeploy,
  deployed,
}: {
  circuit: Circuit;
  report: EvalReport | null;
  controlReport: EvalReport | null;
  onReport: (r: EvalReport | null) => void;
  onControlReport: (r: EvalReport | null) => void;
  onDeploy: () => void;
  deployed: boolean;
}) {
  const [activeScenario, setActiveScenario] = useState(0);
  const scenarios = useMemo(() => makeScenarios("A"), []);
  const control = useMemo(() => makeScenarios("B"), []);

  const cost = circuitCost(circuit);
  const overBudget = cost > COMPUTE_BUDGET;

  function run() {
    onReport(evaluateCircuit(circuit, scenarios));
    onControlReport(null);
  }
  function runControl() {
    onControlReport(evaluateCircuit(circuit, control));
  }

  const active = report?.results[activeScenario];
  const activeSc = scenarios[activeScenario];
  const canDeploy = !!report?.passed && !!controlReport?.passed && !overBudget && !deployed;

  return (
    <div className="panel-glass rounded-2xl p-6">
      <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.3em] text-teal-600">
        Испытательный стенд
      </div>
      <h3 className="mb-4 font-head text-lg font-bold text-slate-800">Протокол: отладочная + контрольная серия</h3>

      <div className="mb-4 flex flex-wrap gap-2">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveScenario(i)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs transition ${
              i === activeScenario ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <span className="ml-2 self-center font-head text-xs text-slate-500">{activeSc.title}</span>
      </div>
      <p className="-mt-2 mb-3 text-xs text-slate-400">{activeSc.description}</p>

      {/* Эталонная разметка опасности раскрывается только ПОСЛЕ испытания */}
      <SensorChart
        sensors={activeSc.sensors}
        truth={report ? activeSc.truth : undefined}
        safeLine={SAFE_THRESHOLD}
        agg={active?.agg}
        alarm={active?.alarm}
        threshold={circuit.threshold}
      />
      {!report && (
        <div className="mt-2 font-mono text-[11px] text-slate-400">
          Доступны только показания приборов. Эталонное состояние атмосферы раскроется после испытания.
        </div>
      )}

      {report && active && (
        <div className="mt-4 grid grid-cols-3 gap-3 font-mono text-xs">
          <StatCell label="Ложные тревоги (сц.)" value={String(active.falseTicks)} bad={active.falseTicks > 4} />
          <StatCell label="Пропущенная опасность" value={String(active.missedTicks)} bad={active.missedTicks > 0} />
          <StatCell label="Задержка тревоги" value={active.latency === null ? "—" : `${active.latency} ц.`} bad={false} />
        </div>
      )}

      <div className="mt-4 space-y-2">
        <SeriesRow
          label="Отладочная серия A"
          report={report}
          hint="Можно повторять сколько угодно: это ваша лаборатория."
        />
        <SeriesRow
          label="Контрольная серия B"
          report={controlReport}
          locked={!report?.passed}
          hint="Другие параметры отказов. Проверяет надёжность, а не подгонку под один случай."
        />
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-2.5 font-mono text-xs ${
            overBudget ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          <span>Бюджет вычислителя</span>
          <span className="font-bold">
            {cost} / {COMPUTE_BUDGET} {overBudget && "— превышен"}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
        <Button variant="outline" size="sm" onClick={run}>
          Испытать (серия A)
        </Button>
        <Button variant="outline" size="sm" onClick={runControl} disabled={!report?.passed}>
          Контрольная серия B
        </Button>
        <Button onClick={onDeploy} disabled={!canDeploy}>
          {deployed ? "Схема внедрена ✓" : "Внедрить в жизнеобеспечение"}
        </Button>
      </div>
    </div>
  );
}

function SeriesRow({
  label,
  report,
  locked,
  hint,
}: {
  label: string;
  report: EvalReport | null;
  locked?: boolean;
  hint: string;
}) {
  const state = locked ? "locked" : report ? (report.passed ? "pass" : "fail") : "idle";
  const styles = {
    locked: "border-slate-200 bg-slate-50 text-slate-400",
    idle: "border-slate-200 bg-white text-slate-500",
    pass: "border-emerald-200 bg-emerald-50 text-emerald-800",
    fail: "border-amber-200 bg-amber-50 text-amber-800",
  }[state];
  return (
    <div className={`rounded-xl border px-4 py-2.5 ${styles}`}>
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="font-bold">{label}</span>
        <span>
          {state === "locked" && "— доступна после серии A"}
          {state === "idle" && "не запускалась"}
          {report && `пропущено ${report.totalMissed} · ложных ${report.totalFalse}`}
        </span>
      </div>
      <div className="mt-0.5 text-[11px] opacity-80">{hint}</div>
    </div>
  );
}

function StatCell({ label, value, bad }: { label: string; value: string; bad: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">
      <div className="text-[9px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`mt-0.5 text-lg font-bold ${bad ? "text-rose-600" : "text-emerald-600"}`}>{value}</div>
    </div>
  );
}
