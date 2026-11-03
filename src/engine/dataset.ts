import { mulberry32 } from "./prng";

export interface SplitData {
  train: number[][];
  val: number[][];
  test: number[][];
  ruleDescription: string;
}

export interface DatasetConfig {
  vocab: number;
  ctx: number;
  count: number;
  a: number;
  b: number;
  seed: number;
}

export const DATASET_CFG: DatasetConfig = {
  vocab: 20,
  ctx: 12,
  count: 240,
  a: 3,
  b: 7,
  seed: 9812,
};

/**
 * Детерминированный датасет: последовательности t_{n+1} = (a·t_n + b) mod vocab.
 * Модель должна научиться правилам перехода из контекста.
 * Разделение хронологическое: сначала сгенерированные — train,
 * затем validation, затем test.
 */
export type TaskId = "markov" | "context";

export function makeDataset(cfg: DatasetConfig = DATASET_CFG, task: TaskId = "markov"): SplitData {
  const rng = mulberry32(cfg.seed);
  const all: number[][] = [];

  if (task === "markov") {
    // Простая задача: следующий элемент зависит ТОЛЬКО от предыдущего.
    for (let s = 0; s < cfg.count; s++) {
      const seq = [Math.floor(rng() * cfg.vocab)];
      for (let t = 1; t <= cfg.ctx; t++) seq.push((cfg.a * seq[t - 1] + cfg.b) % cfg.vocab);
      all.push(seq);
    }
  } else {
    /**
     * Контекстная задача «режим работы отсека».
     * Первый токен — РЕЖИМ (маркер 0..2), он задаёт закон перехода
     * для всей последовательности. Чтобы предсказать t_{n+1}, модели
     * недостаточно смотреть на t_n: нужно помнить начало
     * последовательности. Именно это умеет внимание.
     */
    const modes = [
      { a: 3, b: 7 },
      { a: 7, b: 1 },
      { a: 11, b: 13 },
    ];
    for (let s = 0; s < cfg.count; s++) {
      const m = Math.floor(rng() * modes.length);
      const seq = [m]; // маркер режима: 0, 1 или 2
      let v = 3 + Math.floor(rng() * (cfg.vocab - 3));
      seq.push(v);
      for (let t = 2; t <= cfg.ctx; t++) {
        v = (modes[m].a * v + modes[m].b) % cfg.vocab;
        seq.push(v);
      }
      all.push(seq);
    }
  }

  const nTrain = Math.floor(cfg.count * 0.7);
  const nVal = Math.floor(cfg.count * 0.15);
  return {
    train: all.slice(0, nTrain),
    val: all.slice(nTrain, nTrain + nVal),
    test: all.slice(nTrain + nVal),
    ruleDescription:
      task === "markov"
        ? `t_{n+1} = (${cfg.a}·t_n + ${cfg.b}) mod ${cfg.vocab}`
        : `режим задаётся ПЕРВЫМ токеном: t_{n+1} = (a[mode]·t_n + b[mode]) mod ${cfg.vocab}`,
  };
}

/**
 * Базовая модель сравнения: таблица биграмм (t_n → наиболее частый t_{n+1}).
 * Для markov-задачи она почти идеальна, для контекстной — принципиально
 * ограничена, потому что не видит режим в начале последовательности.
 */
export function bigramBaselineAccuracy(data: SplitData, vocab: number): number {
  const counts: number[][] = Array.from({ length: vocab }, () => new Array(vocab).fill(0));
  for (const seq of data.train) {
    for (let i = 0; i + 1 < seq.length; i++) counts[seq[i]][seq[i + 1]]++;
  }
  const best = counts.map((row) => {
    let bi = 0;
    let bv = -1;
    row.forEach((v, i) => {
      if (v > bv) {
        bv = v;
        bi = i;
      }
    });
    return bi;
  });
  let correct = 0;
  let total = 0;
  for (const seq of data.test) {
    for (let i = 0; i + 1 < seq.length; i++) {
      if (best[seq[i]] === seq[i + 1]) correct++;
      total++;
    }
  }
  return total ? correct / total : 0;
}
