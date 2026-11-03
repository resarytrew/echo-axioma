import { useEffect, useRef } from "react";

export interface SensorChartOpts {
  sensors: number[][];
  agg?: number[];
  alarm?: boolean[];
  truth?: number[];
  threshold?: number;
  safeLine?: number;
  height?: number;
}

const SENSOR_COLORS = ["#64748b", "#6366f1", "#f59e0b"];

export function SensorChart({ sensors, agg, alarm, truth, threshold, safeLine, height = 220 }: SensorChartOpts) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = height * dpr;
    const W = canvas.width;
    const H = canvas.height;
    const padL = 34 * dpr;
    const padR = 10 * dpr;
    const padT = 12 * dpr;
    const padB = 18 * dpr;
    const T = sensors.length;
    const X = (t: number) => padL + (t / (T - 1)) * (W - padL - padR);
    const Y = (v: number) => padT + (1 - v / 23) * (H - padT - padB);

    ctx.clearRect(0, 0, W, H);

    // зоны опасности по истине
    if (truth) {
      ctx.fillStyle = "rgba(244,63,94,0.06)";
      let start: number | null = null;
      for (let t = 0; t <= T; t++) {
        const danger = t < T && truth[t] < (safeLine ?? 19.2);
        if (danger && start === null) start = t;
        if (!danger && start !== null) {
          ctx.fillRect(X(start), padT, X(t - 1) - X(start), H - padT - padB);
          start = null;
        }
      }
    }

    // сетка
    ctx.strokeStyle = "rgba(148,163,184,0.2)";
    ctx.lineWidth = dpr;
    for (let v = 0; v <= 22; v += 5.5) {
      ctx.beginPath();
      ctx.moveTo(padL, Y(v));
      ctx.lineTo(W - padR, Y(v));
      ctx.stroke();
      ctx.fillStyle = "#94a3b8";
      ctx.font = `${9 * dpr}px "JetBrains Mono", monospace`;
      ctx.fillText(v.toFixed(0), 8 * dpr, Y(v) + 3 * dpr);
    }

    // зоны тревоги алгоритма
    if (alarm) {
      ctx.fillStyle = "rgba(244,63,94,0.14)";
      let start: number | null = null;
      for (let t = 0; t <= T; t++) {
        const on = t < T && alarm[t];
        if (on && start === null) start = t;
        if (!on && start !== null) {
          ctx.fillRect(X(start), padT, X(t - 1) - X(start), H - padT - padB);
          start = null;
        }
      }
    }

    // порог
    if (threshold !== undefined) {
      ctx.setLineDash([6 * dpr, 5 * dpr]);
      ctx.strokeStyle = "#0ea5e9";
      ctx.lineWidth = 1.4 * dpr;
      ctx.beginPath();
      ctx.moveTo(padL, Y(threshold));
      ctx.lineTo(W - padR, Y(threshold));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#0ea5e9";
      ctx.font = `${9 * dpr}px "JetBrains Mono", monospace`;
      ctx.fillText(`порог ${threshold.toFixed(1)}`, padL + 6 * dpr, Y(threshold) - 4 * dpr);
    }

    // сенсоры
    for (let s = 0; s < 3; s++) {
      ctx.strokeStyle = SENSOR_COLORS[s];
      ctx.lineWidth = 1.6 * dpr;
      ctx.beginPath();
      sensors.forEach((row, t) => {
        const x = X(t);
        const y = Y(row[s]);
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // агрегат алгоритма
    if (agg) {
      ctx.strokeStyle = "#0f766e";
      ctx.lineWidth = 2.6 * dpr;
      ctx.beginPath();
      agg.forEach((v, t) => {
        const x = X(t);
        const y = Y(v);
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }, [sensors, agg, alarm, truth, threshold, safeLine, height]);

  return (
    <div>
      <canvas ref={ref} className="block w-full rounded-xl border border-slate-200 bg-white" style={{ height }} />
      <div className="mt-2 flex flex-wrap gap-3 font-mono text-[10px] text-slate-500">
        <span><i className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: SENSOR_COLORS[0] }} />A</span>
        <span><i className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: SENSOR_COLORS[1] }} />B</span>
        <span><i className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: SENSOR_COLORS[2] }} />C</span>
        {agg && <span className="text-teal-700">— выход алгоритма</span>}
        {alarm && <span className="text-rose-500">▨ тревога алгоритма</span>}
        {truth && <span className="text-rose-300">▨ реальная опасность</span>}
      </div>
    </div>
  );
}
