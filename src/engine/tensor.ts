/**
 * Минимальный тензорный движок на Float32Array с автоматическим
 * дифференцированием через ленту операций (tape-based autograd).
 * Модель действительно считает градиенты и обновляет параметры.
 */
import { randn } from "./prng";

export class T {
  public data: Float32Array;
  public grad: Float32Array;
  public readonly shape: number[];

  constructor(shape: number[], data?: Float32Array) {
    this.shape = shape;
    const n = shape.reduce((a, b) => a * b, 1);
    this.data = data ?? new Float32Array(n);
    this.grad = new Float32Array(n);
  }

  get size(): number {
    return this.data.length;
  }

  zeroGrad() {
    this.grad.fill(0);
  }
}

export type Tape = Array<() => void>;

export function runBackward(tape: Tape) {
  for (let i = tape.length - 1; i >= 0; i--) tape[i]();
}

export function randT(rng: () => number, shape: number[], scale: number): T {
  const t = new T(shape);
  for (let i = 0; i < t.data.length; i++) t.data[i] = randn(rng) * scale;
  return t;
}

/** Сложение тензоров одинаковой формы: out = a + b */
export function addSame(a: T, b: T, tape: Tape): T {
  const out = new T(a.shape);
  for (let i = 0; i < out.size; i++) out.data[i] = a.data[i] + b.data[i];
  tape.push(() => {
    for (let i = 0; i < out.size; i++) {
      a.grad[i] += out.grad[i];
      b.grad[i] += out.grad[i];
    }
  });
  return out;
}

/** Сложение [R, C] + [C] (смещение по строкам) */
export function addRow(a: T, b: T, tape: Tape): T {
  const [R, C] = a.shape;
  const out = new T([R, C]);
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) out.data[r * C + c] = a.data[r * C + c] + b.data[c];
  }
  tape.push(() => {
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        const g = out.grad[r * C + c];
        a.grad[r * C + c] += g;
        b.grad[c] += g;
      }
    }
  });
  return out;
}

/** Умножение матриц [M, K] × [K, N] */
export function matmul(a: T, b: T, tape: Tape): T {
  const [M, K] = a.shape;
  const N = b.shape[1];
  const out = new T([M, N]);
  for (let i = 0; i < M; i++) {
    for (let j = 0; j < N; j++) {
      let sum = 0;
      for (let k = 0; k < K; k++) sum += a.data[i * K + k] * b.data[k * N + j];
      out.data[i * N + j] = sum;
    }
  }
  tape.push(() => {
    for (let i = 0; i < M; i++) {
      for (let j = 0; j < N; j++) {
        const g = out.grad[i * N + j];
        for (let k = 0; k < K; k++) {
          a.grad[i * K + k] += g * b.data[k * N + j];
          b.grad[k * N + j] += a.data[i * K + k] * g;
        }
      }
    }
  });
  return out;
}

/** GELU (tanh-аппроксимация), поэлементно */
export function gelu(x: T, tape: Tape): T {
  const k = Math.sqrt(2 / Math.PI);
  const out = new T(x.shape);
  const tanhs = new Float32Array(x.size);
  for (let i = 0; i < x.size; i++) {
    const v = x.data[i];
    const u = k * (v + 0.044715 * v * v * v);
    const th = Math.tanh(u);
    tanhs[i] = th;
    out.data[i] = 0.5 * v * (1 + th);
  }
  tape.push(() => {
    for (let i = 0; i < x.size; i++) {
      const v = x.data[i];
      const th = tanhs[i];
      const dy =
        0.5 * (1 + th) +
        0.5 * v * (1 - th * th) * k * (1 + 3 * 0.044715 * v * v);
      x.grad[i] += out.grad[i] * dy;
    }
  });
  return out;
}

/** LayerNorm по последнему измерению [R, C] с обучаемыми gamma/beta [C] */
export function layerNorm(x: T, gamma: T, beta: T, eps: number, tape: Tape): T {
  const [R, C] = x.shape;
  const out = new T([R, C]);
  const xhat = new Float32Array(R * C);
  const xc = new Float32Array(R * C);
  const istdArr = new Float32Array(R);
  for (let r = 0; r < R; r++) {
    const o = r * C;
    let mu = 0;
    for (let c = 0; c < C; c++) mu += x.data[o + c];
    mu /= C;
    let varr = 0;
    for (let c = 0; c < C; c++) {
      xc[o + c] = x.data[o + c] - mu;
      varr += xc[o + c] * xc[o + c];
    }
    varr /= C;
    const inv = 1 / Math.sqrt(varr + eps);
    istdArr[r] = inv;
    for (let c = 0; c < C; c++) {
      xhat[o + c] = xc[o + c] * inv;
      out.data[o + c] = xhat[o + c] * gamma.data[c] + beta.data[c];
    }
  }
  tape.push(() => {
    const dg = gamma.grad;
    const db = beta.grad;
    for (let c = 0; c < C; c++) {
      let sg = 0;
      let sb = 0;
      for (let r = 0; r < R; r++) {
        sb += out.grad[r * C + c];
        sg += out.grad[r * C + c] * xhat[r * C + c];
      }
      dg[c] += sg;
      db[c] += sb;
    }
    for (let r = 0; r < R; r++) {
      const o = r * C;
      const inv = istdArr[r];
      let dvar = 0;
      let dmu1 = 0;
      for (let c = 0; c < C; c++) {
        const dxhat = out.grad[o + c] * gamma.data[c];
        dvar += dxhat * xc[o + c] * -0.5 * inv * inv * inv;
        dmu1 += dxhat * -inv;
      }
      let dmu2 = 0;
      for (let c = 0; c < C; c++) dmu2 += -2 * xc[o + c];
      const dmu = dmu1 + (dvar * dmu2) / C;
      for (let c = 0; c < C; c++) {
        const dxhat = out.grad[o + c] * gamma.data[c];
        x.grad[o + c] += dxhat * inv + (dvar * 2 * xc[o + c]) / C + dmu / C;
      }
    }
  });
  return out;
}

/** Embedding lookup: table [V, D], ids (len S) → [S, D] */
export function embed(table: T, ids: number[], tape: Tape): T {
  const D = table.shape[1];
  const out = new T([ids.length, D]);
  for (let s = 0; s < ids.length; s++) {
    const row = ids[s] * D;
    for (let d = 0; d < D; d++) out.data[s * D + d] = table.data[row + d];
  }
  tape.push(() => {
    for (let s = 0; s < ids.length; s++) {
      const row = ids[s] * D;
      for (let d = 0; d < D; d++) table.grad[row + d] += out.grad[s * D + d];
    }
  });
  return out;
}

/** Добавить строки pos-эмбеддинга [C, D] к первым S строкам x [S, D] */
export function addPos(x: T, pos: T, tape: Tape): T {
  const [S, D] = x.shape;
  const out = new T([S, D]);
  for (let s = 0; s < S; s++) {
    for (let d = 0; d < D; d++) out.data[s * D + d] = x.data[s * D + d] + pos.data[s * D + d];
  }
  tape.push(() => {
    for (let s = 0; s < S; s++) {
      for (let d = 0; d < D; d++) {
        const g = out.grad[s * D + d];
        x.grad[s * D + d] += g;
        pos.grad[s * D + d] += g;
      }
    }
  });
  return out;
}

/**
 * Причинное (causal) внимание, одна голова.
 * q, k, v: [S, D]. Возвращает out [S, D].
 */
export function causalAttention(q: T, k: T, v: T, scale: number, tape: Tape): T {
  const [S, D] = q.shape;
  const p = new Float32Array(S * S);
  const out = new T([S, D]);
  for (let i = 0; i < S; i++) {
    let max = -Infinity;
    const scores = new Float32Array(i + 1);
    for (let j = 0; j <= i; j++) {
      let s = 0;
      for (let d = 0; d < D; d++) s += q.data[i * D + d] * k.data[j * D + d];
      s *= scale;
      scores[j] = s;
      if (s > max) max = s;
    }
    let sum = 0;
    for (let j = 0; j <= i; j++) {
      const e = Math.exp(scores[j] - max);
      p[i * S + j] = e;
      sum += e;
    }
    for (let j = 0; j <= i; j++) p[i * S + j] /= sum;
    for (let d = 0; d < D; d++) {
      let o = 0;
      for (let j = 0; j <= i; j++) o += p[i * S + j] * v.data[j * D + d];
      out.data[i * D + d] = o;
    }
  }
  tape.push(() => {
    const dp = new Float32Array(S * S);
    for (let i = 0; i < S; i++) {
      for (let j = 0; j <= i; j++) {
        let acc = 0;
        for (let d = 0; d < D; d++) acc += out.grad[i * D + d] * v.data[j * D + d];
        dp[i * S + j] = acc;
      }
      for (let d = 0; d < D; d++) {
        // dV = P^T · dout
        for (let j = 0; j <= i; j++) v.grad[j * D + d] += p[i * S + j] * out.grad[i * D + d];
      }
    }
    for (let i = 0; i < S; i++) {
      let dot = 0;
      for (let j = 0; j <= i; j++) dot += p[i * S + j] * dp[i * S + j];
      for (let j = 0; j <= i; j++) {
        const ds = p[i * S + j] * (dp[i * S + j] - dot) * scale;
        for (let d = 0; d < D; d++) {
          q.grad[i * D + d] += ds * k.data[j * D + d];
          k.grad[j * D + d] += ds * q.data[i * D + d];
        }
      }
    }
  });
  return out;
}

/**
 * Кросс-энтропия из логитов [S, V] и целевых id (len S).
 * Возвращает скалярный loss; градиент складывается в logits.grad.
 */
export function crossEntropyLogits(logits: T, targets: number[]): number {
  const [S, V] = logits.shape;
  const probs = new Float32Array(S * V);
  let loss = 0;
  for (let i = 0; i < S; i++) {
    const o = i * V;
    let max = -Infinity;
    for (let c = 0; c < V; c++) if (logits.data[o + c] > max) max = logits.data[o + c];
    let sum = 0;
    for (let c = 0; c < V; c++) {
      const e = Math.exp(logits.data[o + c] - max);
      probs[o + c] = e;
      sum += e;
    }
    for (let c = 0; c < V; c++) probs[o + c] /= sum;
    const py = probs[o + targets[i]];
    loss -= Math.log(py + 1e-12);
  }
  loss /= S;
  runSoftmaxBackward(logits, probs, targets, S, V);
  return loss;
}

function runSoftmaxBackward(logits: T, probs: Float32Array, targets: number[], S: number, V: number) {
  for (let i = 0; i < S; i++) {
    const o = i * V;
    for (let c = 0; c < V; c++) {
      logits.grad[o + c] += (probs[o + c] - (c === targets[i] ? 1 : 0)) / S;
    }
  }
}
