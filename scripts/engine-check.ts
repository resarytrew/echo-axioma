/**
 * Численная проверка движка: обучение мини-Transformer, сходимость,
 * проверка градиентов. Запуск: `npx tsx scripts/engine-check.ts`
 */
import { MiniGPT, ECHO_PROTOTYPE_CFG } from "../src/engine/model";
import { makeDataset, DATASET_CFG } from "../src/engine/dataset";
import { trainMini } from "../src/engine/trainer";

async function main() {
  const model = new MiniGPT(ECHO_PROTOTYPE_CFG);
  const data = makeDataset(DATASET_CFG);
  console.log("params:", model.paramCount());
  console.log("dataset rule:", data.ruleDescription);
  console.log("seq example:", data.train[0].join(","));

  const rep = await trainMini(model, data, {
    steps: 240,
    lr: 0.012,
    batch: 8,
    evalEvery: 60,
    weightDecay: 0.01,
  });
  console.log("bestVal:", rep.bestVal.toFixed(4));
  console.log("testLoss:", rep.testLoss.toFixed(4));
  console.log("testAcc:", (rep.testAccuracy * 100).toFixed(1) + "%");
  console.log("gradCheck mean/max:", rep.gradCheck.mean.toExponential(2), rep.gradCheck.max.toExponential(2));
  console.log("aborted:", rep.aborted);

  const gen = model.greedy([3, 16], 10);
  console.log("greedy:", gen.join(","));

  const ok =
    !rep.aborted &&
    rep.testAccuracy > 0.6 &&
    rep.gradCheck.mean < 0.05;
  console.log(ok ? "ENGINE CHECK: PASS" : "ENGINE CHECK: FAIL");
  process.exit(ok ? 0 : 1);
}

main();
