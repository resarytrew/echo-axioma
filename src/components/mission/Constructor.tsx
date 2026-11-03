import { CircuitDisplay } from "./CircuitDisplay";
import { Circuit, AggBlock, ConsistencyBlock, AlarmRule, BLOCK_INFO, circuitCost } from "../../game/circuit";

const AGG_OPTIONS: AggBlock[] = ["mean", "median", "min", "max"];
const CONS_OPTIONS: ConsistencyBlock[] = ["none", "spread", "std"];
const RULE_OPTIONS: AlarmRule[] = ["low", "and", "or"];

/** Какая учебная способность открывает блок конструктора */
const BLOCK_CAPABILITY: Record<string, { cap: string; module: string }> = {
  // Базовые блоки доступны всегда: решение миссии не должно упираться в курс.
  // Освоение тем открывает более точные и дешёвые инструменты.
  std: { cap: "LOSS METRIC", module: "II.3 · Функция потерь" },
  and: { cap: "FUNCTION ENGINE", module: "I.4 · Функции" },
  or: { cap: "FUNCTION ENGINE", module: "I.4 · Функции" },
};

export function Constructor({
  circuit,
  onChange,
  has,
}: {
  circuit: Circuit;
  onChange: (c: Circuit) => void;
  has?: (capId: string) => boolean;
}) {
  const cost = circuitCost(circuit);
  const locked = (id: string) => {
    const req = BLOCK_CAPABILITY[id];
    return !!req && !!has && !has(req.cap);
  };

  return (
    <div className="panel-glass rounded-2xl p-6">
      <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.3em] text-sky-600">
        Инженерный терминал · Конструктор
      </div>
      <h3 className="mb-4 font-head text-lg font-bold text-slate-800">Схема диагностики O₂</h3>
      <CircuitDisplay circuit={circuit} />

      <Stage title="1 · АГРЕГАЦИЯ ТРЁХ ДАТЧИКОВ">
        <div className="grid grid-cols-2 gap-2">
          {AGG_OPTIONS.map((o) => (
            <BlockChip
              key={o}
              active={circuit.agg === o}
              name={BLOCK_INFO[o].name}
              desc={BLOCK_INFO[o].desc}
              cost={BLOCK_INFO[o].cost}
              locked={locked(o)}
              lockNote={BLOCK_CAPABILITY[o]?.module}
              onClick={() => onChange({ ...circuit, agg: o })}
            />
          ))}
        </div>
      </Stage>

      <Stage title="2 · КОНТРОЛЬ СОГЛАСОВАННОСТИ">
        <div className="grid grid-cols-3 gap-2">
          {CONS_OPTIONS.map((o) => (
            <BlockChip
              key={o}
              active={circuit.consistency === o}
              name={BLOCK_INFO[o].name}
              desc={BLOCK_INFO[o].desc}
              cost={BLOCK_INFO[o].cost}
              locked={locked(o)}
              lockNote={BLOCK_CAPABILITY[o]?.module}
              onClick={() => onChange({ ...circuit, consistency: o })}
            />
          ))}
        </div>
        {circuit.consistency !== "none" && (
          <SliderRow
            label="допустимое расхождение"
            value={circuit.spreadLimit}
            min={0.5}
            max={6}
            step={0.1}
            onChange={(v) => onChange({ ...circuit, spreadLimit: v })}
          />
        )}
      </Stage>

      <Stage title="3 · ЛОГИКА ТРЕВОГИ">
        <div className="grid grid-cols-1 gap-2">
          {RULE_OPTIONS.map((o) => (
            <BlockChip
              key={o}
              active={circuit.rule === o}
              name={BLOCK_INFO[o].name}
              desc={BLOCK_INFO[o].desc}
              cost={BLOCK_INFO[o].cost}
              locked={locked(o)}
              lockNote={BLOCK_CAPABILITY[o]?.module}
              onClick={() => onChange({ ...circuit, rule: o })}
            />
          ))}
        </div>
        <SliderRow
          label="порог тревоги, % O₂"
          value={circuit.threshold}
          min={17}
          max={21}
          step={0.1}
          onChange={(v) => onChange({ ...circuit, threshold: v })}
        />
      </Stage>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
        <span className="font-mono text-xs text-slate-400">НАГРУЗКА НА ВЫЧИСЛИТЕЛЬ</span>
        <span
          className={`font-mono text-sm font-bold ${
            cost <= 6 ? "text-emerald-600" : cost <= 8 ? "text-amber-600" : "text-rose-600"
          }`}
        >
          {cost} усл. ед./цикл
        </span>
      </div>
    </div>
  );
}

function Stage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">{title}</div>
      {children}
    </div>
  );
}

function BlockChip({
  active,
  name,
  desc,
  cost,
  onClick,
  locked,
  lockNote,
}: {
  active: boolean;
  name: string;
  desc: string;
  cost: number;
  onClick: () => void;
  locked?: boolean;
  lockNote?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      disabled={locked}
      title={locked ? `Откроется после модуля ${lockNote}` : undefined}
      className={`circuit-block rounded-xl border px-3 py-2.5 text-left transition-all ${
        locked
          ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-70"
          : active
            ? "border-sky-400 bg-sky-50 ring-2 ring-sky-200 shadow-sm"
            : "border-slate-200 bg-white hover:border-sky-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-mono text-sm font-bold ${locked ? "text-slate-400" : "text-slate-800"}`}>
          {locked ? "🔒 " : ""}
          {name}
        </span>
        <span className="font-mono text-[10px] text-slate-400">+{cost}</span>
      </div>
      <div className="mt-0.5 text-[11px] leading-snug text-slate-500">
        {locked ? `Откроется после модуля ${lockNote}` : desc}
      </div>
    </button>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="mt-3 block rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <div className="mb-1.5 flex justify-between font-mono text-xs text-slate-500">
        <span>{label}</span>
        <span className="font-bold text-sky-700">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-sky-500"
      />
    </label>
  );
}
