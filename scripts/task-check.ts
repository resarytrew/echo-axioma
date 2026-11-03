import { makeDataset, DATASET_CFG, bigramBaselineAccuracy } from "../src/engine/dataset";
import { MiniGPT, ECHO_PROTOTYPE_CFG } from "../src/engine/model";
import { trainMini } from "../src/engine/trainer";

async function run(task: "markov" | "context") {
  const data = makeDataset(DATASET_CFG, task);
  const base = bigramBaselineAccuracy(data, DATASET_CFG.vocab);
  const model = new MiniGPT(ECHO_PROTOTYPE_CFG);
  const rep = await trainMini(model, data, { steps: 300, lr: 0.012, batch: 8, evalEvery: 60, weightDecay: 0.01 });
  console.log(task.padEnd(8), "bigram:", (base*100).toFixed(1)+"%", "| transformer:", (rep.testAccuracy*100).toFixed(1)+"%");
}
(async () => { await run("markov"); await run("context"); })();
