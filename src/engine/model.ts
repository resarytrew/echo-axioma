import { mulberry32 } from "./prng";
import {
  T,
  Tape,
  addRow,
  addSame,
  addPos,
  causalAttention,
  crossEntropyLogits,
  embed,
  gelu,
  layerNorm,
  matmul,
  randT,
} from "./tensor";

export interface MiniConfig {
  vocab: number;
  ctx: number;
  dModel: number;
  layers: number;
  dMlp: number;
  seed: number;
}

export const ECHO_PROTOTYPE_CFG: MiniConfig = {
  vocab: 20,
  ctx: 12,
  dModel: 16,
  layers: 2,
  dMlp: 20,
  seed: 2049,
};

export class MiniGPT {
  public cfg: MiniConfig;
  public params: T[] = [];
  public named: { name: string; t: T }[] = [];

  constructor(cfg: MiniConfig) {
    this.cfg = cfg;
    const rng = mulberry32(cfg.seed);
    const { vocab, ctx, dModel, layers, dMlp } = cfg;
    const s = 1 / Math.sqrt(dModel);

    const add2 = (name: string, t: T) => {
      this.params.push(t);
      this.named.push({ name, t });
    };
    add2("tok_emb", randT(rng, [vocab, dModel], s));
    add2("pos_emb", randT(rng, [ctx, dModel], s * 0.5));
    for (let l = 0; l < layers; l++) {
      const g1 = new T([dModel]);
      g1.data.fill(1);
      add2(`l${l}.ln1_g`, g1);
      add2(`l${l}.ln1_b`, new T([dModel]));
      add2(`l${l}.wq`, randT(rng, [dModel, dModel], s));
      add2(`l${l}.wk`, randT(rng, [dModel, dModel], s));
      add2(`l${l}.wv`, randT(rng, [dModel, dModel], s));
      add2(`l${l}.wo`, randT(rng, [dModel, dModel], s));
      add2(`l${l}.bq`, new T([dModel]));
      add2(`l${l}.bk`, new T([dModel]));
      add2(`l${l}.bv`, new T([dModel]));
      add2(`l${l}.bo`, new T([dModel]));
      const g2 = new T([dModel]);
      g2.data.fill(1);
      add2(`l${l}.ln2_g`, g2);
      add2(`l${l}.ln2_b`, new T([dModel]));
      add2(`l${l}.fc1`, randT(rng, [dModel, dMlp], s));
      add2(`l${l}.bf1`, new T([dMlp]));
      add2(`l${l}.fc2`, randT(rng, [dMlp, dModel], s));
      add2(`l${l}.bf2`, new T([dModel]));
    }
    const gf = new T([dModel]);
    gf.data.fill(1);
    add2("lnf_g", gf);
    add2("lnf_b", new T([dModel]));
    add2("head", randT(rng, [dModel, vocab], s));
    add2("head_b", new T([vocab]));
  }

  private p(name: string): T {
    const rec = this.named.find((n) => n.name === name);
    if (!rec) throw new Error("no param " + name);
    return rec.t;
  }

  paramCount(): number {
    return this.params.reduce((sum, t) => sum + t.size, 0);
  }

  zeroGrad() {
    for (const t of this.params) t.zeroGrad();
  }

  /** Прямой проход: ids (len S ≤ ctx) → логиты [S, V] и лента операций */
  forward(ids: number[]): { logits: T; tape: Tape } {
    const { layers, dModel } = this.cfg;
    const tape: Tape = [];
    const eps = 1e-5;
    let x = embed(this.p("tok_emb"), ids, tape);
    x = addPos(x, this.p("pos_emb"), tape);
    const scale = 1 / Math.sqrt(dModel);
    for (let l = 0; l < layers; l++) {
      const h = layerNorm(x, this.p(`l${l}.ln1_g`), this.p(`l${l}.ln1_b`), eps, tape);
      const q = addRow(matmul(h, this.p(`l${l}.wq`), tape), this.p(`l${l}.bq`), tape);
      const k = addRow(matmul(h, this.p(`l${l}.wk`), tape), this.p(`l${l}.bk`), tape);
      const v = addRow(matmul(h, this.p(`l${l}.wv`), tape), this.p(`l${l}.bv`), tape);
      const att = causalAttention(q, k, v, scale, tape);
      const attOut = addRow(matmul(att, this.p(`l${l}.wo`), tape), this.p(`l${l}.bo`), tape);
      x = addSame(x, attOut, tape);
      const h2 = layerNorm(x, this.p(`l${l}.ln2_g`), this.p(`l${l}.ln2_b`), eps, tape);
      const m1 = gelu(addRow(matmul(h2, this.p(`l${l}.fc1`), tape), this.p(`l${l}.bf1`), tape), tape);
      const m2 = addRow(matmul(m1, this.p(`l${l}.fc2`), tape), this.p(`l${l}.bf2`), tape);
      x = addSame(x, m2, tape);
    }
    const xf = layerNorm(x, this.p("lnf_g"), this.p("lnf_b"), eps, tape);
    const logits = addRow(matmul(xf, this.p("head"), tape), this.p("head_b"), tape);
    return { logits, tape };
  }

  /** Loss для последовательности ids: предсказание следующего токена */
  lossFullSeq(ids: number[]): number {
    const { logits } = this.forward(ids.slice(0, ids.length - 1));
    return crossEntropyLogits(logits, ids.slice(1));
  }

  snapshot(): Float32Array[] {
    return this.params.map((p) => p.data.slice());
  }

  restore(snap: Float32Array[]) {
    this.params.forEach((p, i) => p.data.set(snap[i]));
  }

  /** Жадная генерация продолжения */
  greedy(prompt: number[], steps: number): number[] {
    const out = prompt.slice();
    for (let i = 0; i < steps; i++) {
      const window = out.slice(-this.cfg.ctx);
      const { logits } = this.forward(window);
      const last = logits.shape[0] - 1;
      const V = this.cfg.vocab;
      let best = 0;
      let bv = -Infinity;
      for (let c = 0; c < V; c++) {
        const val = logits.data[last * V + c];
        if (val > bv) {
          bv = val;
          best = c;
        }
      }
      out.push(best);
    }
    return out;
  }
}
