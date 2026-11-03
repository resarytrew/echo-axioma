/**
 * CircuitEngine + SimulationEngine.
 * Игрок собирает диагностический алгоритм из реальных вычислительных
 * блоков; движок исполняет схему на воспроизводимых сценариях станции
 * и считает ошибки классификации (ложные тревоги / пропущенная опасность).
 */
import { mulberry32 } from "../engine/prng";

export type AggBlock = "mean" | "median" | "min" | "max";
export type ConsistencyBlock = "none" | "spread" | "std";
export type AlarmRule = "low" | "and" | "or";

export interface Circuit {
  agg: AggBlock;
  consistency: ConsistencyBlock;
  spreadLimit: number;
  rule: AlarmRule;
  threshold: number;
}

export const BLOCK_INFO: Record<string, { name: string; desc: string; cost: number }> = {
  mean: { name: "MEAN", desc: "Среднее арифметическое показаний", cost: 1 },
  median: { name: "MEDIAN", desc: "Медиана — устойчива к одиночным выбросам", cost: 3 },
  min: { name: "MIN", desc: "Самое низкое показание", cost: 1 },
  max: { name: "MAX", desc: "Самое высокое показание", cost: 1 },
  none: { name: "—", desc: "Без проверки согласованности", cost: 0 },
  spread: { name: "SPREAD", desc: "Контроль max − min", cost: 2 },
  std: { name: "STD", desc: "Контроль стандартного отклонения", cost: 3 },
  low: { name: "LEVEL", desc: "Тревога, если уровень ниже порога", cost: 1 },
  and: { name: "LOW ∧ OK", desc: "Тревога, если уровень низкий И датчики согласованы", cost: 2 },
  or: { name: "LOW ∨ BAD", desc: "Тревога при низком уровне ИЛИ рассогласовании", cost: 2 },
};

export function circuitCost(c: Circuit): number {
  return BLOCK_INFO[c.agg].cost + BLOCK_INFO[c.consistency].cost + BLOCK_INFO[c.rule].cost;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  sensors: number[][]; // [tick][3]
  truth: number[]; // истинный O₂, известен только стенду
}

export const SAFE_THRESHOLD = 19.2;

export type SeriesId = "A" | "B";

/** Бюджет вычислителя станции: схема дороже — не принимается */
export const COMPUTE_BUDGET = 8;

export function makeScenarios(series: SeriesId = "A"): Scenario[] {
  const off = series === "A" ? 0 : 57;
  const r1 = mulberry32(101 + off);
  const r2 = mulberry32(202 + off);
  const r3 = mulberry32(303 + off);
  const r4 = mulberry32(404 + off);
  const j = (rng: () => number, amp: number) => (rng() - 0.5) * 2 * amp;

  const s1Sens: number[][] = [];
  const s1Truth: number[] = [];
  for (let t = 0; t < 40; t++) {
    const a = 20.8 + j(r1, 0.15);
    const b = 20.7 + j(r1, 0.15);
    const c = t < 12 ? 20.6 + j(r1, 0.4) : 4.1 + j(r1, 0.3);
    s1Sens.push([a, b, c]);
    s1Truth.push(20.8);
  }

  const s2Sens: number[][] = [];
  const s2Truth: number[] = [];
  for (let t = 0; t < 40; t++) {
    const drop = t < 14 ? 0 : Math.min(4.3, (t - 14) * 0.35);
    const base = 20.8 - drop;
    s2Sens.push([base + j(r2, 0.1), base - 0.1 + j(r2, 0.1), base + 0.05 + j(r2, 0.1)]);
    s2Truth.push(base);
  }

  const s3Sens: number[][] = [];
  const s3Truth: number[] = [];
  for (let t = 0; t < 40; t++) {
    const a = 20.6 + j(r3, 0.12);
    const b = 20.55 + j(r3, 0.12);
    // в контрольной серии дрожание сильнее и ближе к порогу
    const c = (series === "A" ? 19.6 : 19.35) + j(r3, series === "A" ? 0.9 : 1.15);
    s3Sens.push([a, b, c]);
    s3Truth.push(20.55);
  }

  const s4Sens: number[][] = [];
  const s4Truth: number[] = [];
  for (let t = 0; t < 40; t++) {
    // «Замёрзший» датчик: в серии A это B, в серии B — A (другое расположение отказа)
    const frozen = 21.0 + j(r4, 0.1);
    const start = series === "A" ? 18 : 12;
    const rate = series === "A" ? 0.55 : 0.42;
    const drop = t < start ? 0 : Math.min(3.8, (t - start) * rate);
    const d1 = 20.8 - drop + j(r4, 0.1);
    const d2 = 20.7 - drop * 0.96 + j(r4, 0.1);
    if (series === "A") s4Sens.push([d1, frozen, d2]);
    else s4Sens.push([frozen, d1, d2]);
    s4Truth.push(Math.min(d1, d2));
  }

  return [
    {
      id: "faulty-c",
      title: "С-3: отказ одного датчика",
      description: "Датчик C внезапно показывает 4.1 %. Остальные — в норме.",
      sensors: s1Sens,
      truth: s1Truth,
    },
    {
      id: "real-drop",
      title: "Реальное падение O₂",
      description: "Все датчики согласованно регистрируют снижение до 16,5 %.",
      sensors: s2Sens,
      truth: s2Truth,
    },
    {
      id: "jitter",
      title: "Нестабильный датчик (дрожание)",
      description: "Датчик C «дрожит» около порога, реальная опасность отсутствует.",
      sensors: s3Sens,
      truth: s3Truth,
    },
    {
      id: "frozen-b",
      title: "Гипоксия при «замершем» B",
      description: "B завис на 21 %, A и C сползают вниз. Игнорирующий низкие значения алгоритм пропустит угрозу.",
      sensors: s4Sens,
      truth: s4Truth,
    },
  ];
}

export interface EvalResult {
  scenario: Scenario;
  agg: number[];
  spread: number[];
  alarm: boolean[];
  falseTicks: number;
  missedTicks: number;
  latency: number | null;
}

export interface EvalReport {
  results: EvalResult[];
  totalFalse: number;
  totalMissed: number;
  worstLatency: number | null;
  computeCost: number;
  passed: boolean;
}

export function evaluateCircuit(c: Circuit, scenarios: Scenario[]): EvalReport {
  const results: EvalResult[] = [];
  let totalFalse = 0;
  let totalMissed = 0;
  let worstLatency: number | null = null;

  for (const sc of scenarios) {
    const agg: number[] = [];
    const spread: number[] = [];
    const alarm: boolean[] = [];
    let falseTicks = 0;
    let missedTicks = 0;
    let latency: number | null = null;
    let dangerSince: number | null = null;

    for (let t = 0; t < sc.sensors.length; t++) {
      const v = sc.sensors[t];
      const sorted = [...v].sort((x, y) => x - y);
      const mean = (v[0] + v[1] + v[2]) / 3;
      const aggVal =
        c.agg === "mean" ? mean : c.agg === "median" ? sorted[1] : c.agg === "min" ? sorted[0] : sorted[2];
      const spr = sorted[2] - sorted[0];
      const std = Math.sqrt(
        ((v[0] - mean) ** 2 + (v[1] - mean) ** 2 + (v[2] - mean) ** 2) / 3,
      );
      const consistencyVal = c.consistency === "spread" ? spr : std;
      const consistent = c.consistency === "none" ? true : consistencyVal <= c.spreadLimit;
      const low = aggVal < c.threshold;
      const alarmNow =
        c.rule === "low" ? low : c.rule === "and" ? low && consistent : low || !consistent;

      agg.push(aggVal);
      spread.push(spr);
      alarm.push(alarmNow);

      const danger = sc.truth[t] < SAFE_THRESHOLD;
      if (danger && dangerSince === null) dangerSince = t;
      if (!danger) dangerSince = null;

      if (alarmNow && !danger) falseTicks++;
      if (danger && !alarmNow) {
        const grace = dangerSince !== null ? t - dangerSince >= 3 : false;
        if (grace) missedTicks++;
      }
      if (danger && alarmNow && latency === null && dangerSince !== null) {
        latency = t - dangerSince;
      }
    }

    totalFalse += falseTicks;
    totalMissed += missedTicks;
    if (latency !== null && (worstLatency === null || latency > worstLatency)) worstLatency = latency;
    results.push({ scenario: sc, agg, spread, alarm, falseTicks, missedTicks, latency });
  }

  return {
    results,
    totalFalse,
    totalMissed,
    worstLatency,
    computeCost: circuitCost(c),
    passed: totalMissed === 0 && totalFalse <= 8,
  };
}

/** Журнал из миссии (первый сценарий) для диагностики */
export function journalScenario(): Scenario {
  return makeScenarios()[0];
}
