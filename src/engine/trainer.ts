import { MiniGPT } from "./model";
import { SplitData } from "./dataset";
import { mulberry32 } from "./prng";
import { crossEntropyLogits, runBackward } from "./tensor";

export interface TrainPoint {
  step: number;
  trainLoss: number;
  valLoss: number | null;
}

export interface GradCheckResult {
  mean: number;
  max: number;
}

export interface TrainReport {
  logs: TrainPoint[];
  bestVal: number;
  testLoss: number;
  testAccuracy: number;
  gradCheck: GradCheckResult;
  aborted: boolean;
}

export interface TrainOptions {
  steps: number;
  lr: number;
  batch: number;
  evalEvery: number;
  weightDecay: number;
  onProgress?: (p: TrainPoint, done: boolean) => void;
  cancelRef?: { cancel: boolean };
}

/** Полный проход: forward + CE + backward, градиенты накапливаются в params.grad. Возвращает loss. */
function stepOnce(model: MiniGPT, seq: number[]): number {
  const { logits, tape } = model.forward(seq.slice(0, seq.length - 1));
  const loss = crossEntropyLogits(logits, seq.slice(1));
  runBackward(tape);
  return loss;
}

export function evalLoss(model: MiniGPT, seqs: number[][]): number {
  if (!seqs.length) return 0;
  let sum = 0;
  for (const seq of seqs) {
    const { logits } = model.forward(seq.slice(0, seq.length - 1));
    sum += crossEntropyLogits(logits, seq.slice(1));
  }
  return sum / seqs.length;
}

export function evalAccuracy(model: MiniGPT, seqs: number[][]): number {
  let correct = 0;
  let total = 0;
  for (const seq of seqs) {
    const { logits } = model.forward(seq.slice(0, seq.length - 1));
    const [S, V] = logits.shape;
    for (let i = 0; i < S; i++) {
      let best = 0;
      let bv = -Infinity;
      for (let c = 0; c < V; c++) {
        const val = logits.data[i * V + c];
        if (val > bv) {
          bv = val;
          best = c;
        }
      }
      if (best === seq[i + 1]) correct++;
      total++;
    }
  }
  return total ? correct / total : 0;
}

/** Численная проверка градиентов: выборочные конечные разности */
export function gradCheck(model: MiniGPT, sample: number[]): GradCheckResult {
  model.zeroGrad();
  stepOnce(model, sample);

  const eps = 1e-2;
  const rng = mulberry32(7);
  const params = model.params;
  let sum = 0;
  let max = 0;
  let n = 0;
  for (let k = 0; k < 24; k++) {
    const t = params[Math.floor(rng() * params.length)];
    const idx = Math.floor(rng() * t.size);
    const orig = t.data[idx];
    const ana = t.grad[idx];

    t.data[idx] = orig + eps;
    let lp = 0;
    {
      const { logits } = model.forward(sample.slice(0, sample.length - 1));
      lp = crossEntropyLogits(logits, sample.slice(1));
    }
    t.data[idx] = orig - eps;
    let lm = 0;
    {
      const { logits } = model.forward(sample.slice(0, sample.length - 1));
      lm = crossEntropyLogits(logits, sample.slice(1));
    }
    t.data[idx] = orig;
    const num = (lp - lm) / (2 * eps);
    const rel = Math.abs(num - ana) / Math.max(1e-6, Math.abs(num) + Math.abs(ana));
    sum += rel;
    if (rel > max) max = rel;
    n++;
  }
  model.zeroGrad();
  return { mean: sum / n, max };
}

/** Обучение AdamW с клиппингом градиентов и выбором чекпоинта по validation */
export async function trainMini(model: MiniGPT, data: SplitData, opts: TrainOptions): Promise<TrainReport> {
  const rng = mulberry32(11);
  const logs: TrainPoint[] = [];
  const m = model.params.map((p) => new Float32Array(p.size));
  const v = model.params.map((p) => new Float32Array(p.size));
  const beta1 = 0.9;
  const beta2 = 0.999;
  const eps = 1e-8;
  let bestVal = Infinity;
  let bestSnap = model.snapshot();
  let aborted = false;
  let lastTrain = 0;

  for (let step = 1; step <= opts.steps; step++) {
    if (opts.cancelRef?.cancel) {
      aborted = true;
      break;
    }
    model.zeroGrad();
    let batchLoss = 0;
    for (let b = 0; b < opts.batch; b++) {
      const seq = data.train[Math.floor(rng() * data.train.length)];
      batchLoss += stepOnce(model, seq);
    }
    batchLoss /= opts.batch;
    lastTrain = batchLoss;

    // клиппинг нормы градиента
    let norm = 0;
    for (const p of model.params) for (let i = 0; i < p.size; i++) norm += p.grad[i] * p.grad[i];
    norm = Math.sqrt(norm);
    const clip = 5;
    if (norm > clip && norm > 0) {
      const scale = clip / norm;
      for (const p of model.params) for (let i = 0; i < p.size; i++) p.grad[i] *= scale;
    }

    // AdamW
    model.params.forEach((p, pi) => {
      const corr1 = 1 - Math.pow(beta1, step);
      const corr2 = 1 - Math.pow(beta2, step);
      for (let i = 0; i < p.size; i++) {
        p.data[i] *= 1 - opts.lr * opts.weightDecay;
        m[pi][i] = beta1 * m[pi][i] + (1 - beta1) * p.grad[i];
        v[pi][i] = beta2 * v[pi][i] + (1 - beta2) * p.grad[i] * p.grad[i];
        const mh = m[pi][i] / corr1;
        const vh = v[pi][i] / corr2;
        p.data[i] -= (opts.lr * mh) / (Math.sqrt(vh) + eps);
      }
    });

    if (!isFinite(batchLoss)) {
      aborted = true;
      break;
    }

    let valLoss: number | null = null;
    if (step % opts.evalEvery === 0 || step === opts.steps) {
      valLoss = evalLoss(model, data.val.slice(0, 24));
      if (valLoss < bestVal) {
        bestVal = valLoss;
        bestSnap = model.snapshot();
      }
    }
    const point: TrainPoint = { step, trainLoss: batchLoss, valLoss };
    logs.push(point);
    opts.onProgress?.(point, false);
    if (step % 4 === 0) await new Promise((r) => setTimeout(r, 0));
  }

  model.restore(bestSnap);
  const testLoss = evalLoss(model, data.test);
  const testAccuracy = evalAccuracy(model, data.test);
  const gc = gradCheck(model, data.test[0]);
  opts.onProgress?.({ step: opts.steps, trainLoss: lastTrain, valLoss: bestVal }, true);
  return { logs, bestVal, testLoss, testAccuracy, gradCheck: gc, aborted };
}
