import { makeScenarios, evaluateCircuit, Circuit } from "../src/game/circuit";
const scenarios = makeScenarios();
const tryc = (name: string, c: Circuit) => {
  const r = evaluateCircuit(c, scenarios);
  console.log(`${name.padEnd(34)} missed=${r.totalMissed} false=${r.totalFalse} pass=${r.passed}`);
};
tryc("mean+low            (наивное ЭХО)", { agg: "mean", consistency: "none", spreadLimit: 1.2, rule: "low", threshold: 19.2 });
tryc("max+low             (игнорирует низ)", { agg: "max", consistency: "none", spreadLimit: 1.2, rule: "low", threshold: 19.2 });
tryc("min+low             (параноидальное)", { agg: "min", consistency: "none", spreadLimit: 1.2, rule: "low", threshold: 19.2 });
tryc("median+low", { agg: "median", consistency: "none", spreadLimit: 1.2, rule: "low", threshold: 19.2 });
tryc("median+and spread1.2", { agg: "median", consistency: "spread", spreadLimit: 1.2, rule: "and", threshold: 19.2 });
tryc("median+and spread4.2", { agg: "median", consistency: "spread", spreadLimit: 4.2, rule: "and", threshold: 19.2 });
tryc("mean+and spread4.2", { agg: "mean", consistency: "spread", spreadLimit: 4.2, rule: "and", threshold: 19.2 });
tryc("median+or spread1.2 (лишние тревоги)", { agg: "median", consistency: "spread", spreadLimit: 1.2, rule: "or", threshold: 19.2 });
