import { makeScenarios, evaluateCircuit, Circuit, COMPUTE_BUDGET, circuitCost } from "../src/game/circuit";
const A = makeScenarios("A"), B = makeScenarios("B");
const baseAgg = ["mean","median","min","max"] as const;
const baseCons = ["none","spread"] as const;
const baseRule = ["low"] as const;
const advRule = ["low","and","or"] as const;
const advCons = ["none","spread","std"] as const;

function scan(aggs: readonly string[], cons: readonly string[], rules: readonly string[], label: string) {
  const sols: string[] = [];
  for (const agg of aggs) for (const c of cons) for (const r of rules)
    for (const sl of [1.2, 2.0, 3.0, 4.2, 5.0]) for (const th of [18.8, 19.2, 19.6]) {
      const cir = { agg, consistency: c, spreadLimit: sl, rule: r, threshold: th } as Circuit;
      if (circuitCost(cir) > COMPUTE_BUDGET) continue;
      const ra = evaluateCircuit(cir, A), rb = evaluateCircuit(cir, B);
      if (ra.passed && rb.passed) sols.push(`${agg}/${c}/${r} sl=${sl} th=${th} cost=${circuitCost(cir)}`);
    }
  console.log(`${label}: решений ${sols.length}`);
  sols.slice(0, 3).forEach(s => console.log("   ", s));
}
scan(baseAgg, baseCons, baseRule, "БЕЗ курса (базовые блоки)");
scan(baseAgg, advCons, advRule, "С полным курсом");
