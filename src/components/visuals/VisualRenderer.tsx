import { motion } from "framer-motion";
import { Visual } from "../../types/scenario";

const stateColor: Record<string, string> = {
  online: "text-emerald-600",
  offline: "text-slate-400",
  unknown: "text-amber-500",
  warning: "text-amber-500",
  degraded: "text-orange-500",
};

const stateDot: Record<string, string> = {
  online: "bg-emerald-400",
  offline: "bg-slate-300",
  unknown: "bg-amber-400 animate-blink-soft",
  warning: "bg-amber-400 animate-blink-soft",
  degraded: "bg-orange-400 animate-blink-soft",
};

export function VisualRenderer({ visual }: { visual: Visual }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {visual.title && (
        <div className="mb-3 text-center font-mono text-xs tracking-[0.3em] text-slate-400">
          {visual.title}
        </div>
      )}
      {visual.kind === "pixel" && (
        <div role="img" aria-label={visual.title ?? "Пиксельное представление данных"}
          className="rounded-xl border border-slate-300 bg-slate-950 p-5 text-sky-200">
          <pre className="overflow-x-auto font-mono text-sm leading-relaxed whitespace-pre">{visual.ascii ?? visual.bigText ?? "Пиксельные данные"}</pre>
          <p className="mt-2 text-xs text-slate-300">{visual.bigTextSub ?? "Визуализация дискретных значений."}</p>
        </div>
      )}
      {visual.kind === "ascii" && (
        <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 px-5 py-4 font-mono text-[13px] leading-relaxed text-sky-300 shadow-inner">
          {visual.ascii}
        </pre>
      )}

      {visual.kind === "statusList" && (
        <div className="divide-y divide-slate-200/70 overflow-hidden rounded-xl border border-slate-200 bg-white/70">
          {visual.items?.map((it, i) => (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between px-5 py-2.5 font-mono text-sm"
            >
              <span className="tracking-wide text-slate-600">{it.label}</span>
              <span className={`flex items-center gap-2 font-semibold ${stateColor[it.state || "offline"]}`}>
                <i className={`h-1.5 w-1.5 rounded-full ${stateDot[it.state || "offline"]}`} />
                {it.value}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {visual.kind === "flow" && (
        <div
          className={`flex items-center justify-center gap-2 ${
            visual.flowDirection === "horizontal" ? "flex-row flex-wrap" : "flex-col"
          }`}
        >
          {visual.flow?.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: step.dim ? 0.35 : 1, scale: 1 }}
                transition={{ delay: i * 0.12 }}
                className={`rounded-lg border px-5 py-2.5 font-head text-sm font-semibold tracking-wide ${
                  step.dim
                    ? "border-slate-200 bg-slate-50 text-slate-400"
                    : "border-sky-300 bg-sky-50 text-sky-800 shadow shadow-sky-100"
                }`}
              >
                {step.label}
              </motion.div>
              {i < (visual.flow?.length || 0) - 1 && (
                <span className="text-slate-300">
                  {visual.flowDirection === "horizontal" ? "→" : "↓"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {visual.kind === "cards" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visual.cards?.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm"
            >
              <div className="font-mono text-sm font-semibold text-slate-800">{c.label}</div>
              {c.sub && <div className="mt-0.5 text-[11px] text-slate-400">{c.sub}</div>}
            </motion.div>
          ))}
        </div>
      )}

      {visual.kind === "table" && visual.table && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left font-mono text-[11px] uppercase tracking-wider text-slate-400">
                {visual.table.columns.map((c) => (
                  <th key={c} className="px-4 py-2.5">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visual.table.rows.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 font-mono">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {visual.kind === "compare" && visual.compareLeft && visual.compareRight && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 font-head text-xs font-bold uppercase tracking-widest text-slate-400">
              {visual.compareLeft.title}
            </div>
            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700">
              {visual.compareLeft.body}
            </pre>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 font-head text-xs font-bold uppercase tracking-widest text-slate-400">
              {visual.compareRight.title}
            </div>
            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700">
              {visual.compareRight.body}
            </pre>
          </div>
        </div>
      )}

      {visual.kind === "bigText" && (
        <div className="py-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-display text-6xl font-black tracking-tight text-slate-800 sm:text-7xl"
          >
            {visual.bigText}
          </motion.div>
          {visual.bigTextSub && (
            <div className="mt-2 font-mono text-sm text-slate-400">{visual.bigTextSub}</div>
          )}
        </div>
      )}

      {visual.kind === "graphDown" && visual.graphValues && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {visual.graphLabel && (
            <div className="mb-3 font-mono text-xs text-slate-400">{visual.graphLabel}</div>
          )}
          <svg viewBox="0 0 300 120" className="w-full">
            {(() => {
              const vals = visual.graphValues!;
              const max = Math.max(...vals);
              const min = Math.min(...vals);
              const range = max - min || 1;
              const pts = vals.map((v, i) => {
                const x = (i / (vals.length - 1)) * 280 + 10;
                const y = 100 - ((v - min) / range) * 80 - 10;
                return `${x},${y}`;
              });
              return (
                <>
                  <polyline
                    points={pts.join(" ")}
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {pts.map((p, i) => {
                    const [x, y] = p.split(",");
                    return <circle key={i} cx={x} cy={y} r={4} fill="#0369a1" />;
                  })}
                </>
              );
            })()}
          </svg>
          <div className="mt-2 flex justify-between font-mono text-xs text-slate-500">
            {visual.graphValues.map((v, i) => (
              <span key={i}>{v}</span>
            ))}
          </div>
        </div>
      )}

      {visual.kind === "frame" && visual.frame && (
        <div className="mx-auto max-w-sm rounded-xl border border-sky-200 bg-gradient-to-b from-sky-50 to-white shadow-sm">
          <div className="border-b border-sky-200 bg-sky-100/60 px-4 py-2 font-head text-sm font-bold tracking-wide text-sky-800">
            FRAME: {visual.frame.title}
          </div>
          <div className="divide-y divide-slate-100">
            {visual.frame.slots.map((s) => (
              <div key={s.key} className="flex justify-between px-4 py-2 font-mono text-sm">
                <span className="text-slate-400">{s.key}:</span>
                <span className="font-semibold text-slate-700">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {visual.kind === "network" && visual.network && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <svg viewBox="0 0 320 200" className="w-full">
            {visual.network.edges.map((e, i) => {
              const from = visual.network!.nodes.find((n) => n.id === e.from)!;
              const to = visual.network!.nodes.find((n) => n.id === e.to)!;
              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2;
              return (
                <g key={i}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#bae6fd"
                    strokeWidth={2}
                  />
                  {e.label && (
                    <text x={mx} y={my - 4} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="monospace">
                      {e.label}
                    </text>
                  )}
                </g>
              );
            })}
            {visual.network.nodes.map((n) => (
              <g key={n.id}>
                <rect
                  x={n.x - 34}
                  y={n.y - 12}
                  width={68}
                  height={24}
                  rx={6}
                  fill="#f0f9ff"
                  stroke="#0ea5e9"
                  strokeWidth={1.5}
                />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill="#0369a1"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  {n.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </motion.div>
  );
}
