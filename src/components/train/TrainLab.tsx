import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MiniGPT, ECHO_PROTOTYPE_CFG } from "../../engine/model";
import { makeDataset, DATASET_CFG, SplitData, TaskId, bigramBaselineAccuracy } from "../../engine/dataset";
import { trainMini, TrainPoint, TrainReport } from "../../engine/trainer";
import { Button } from "../ui/Button";

export function TrainLab({ onDone }: { onDone: () => void }) {
  const [task, setTask] = useState<TaskId>("markov");
  const [modelKey, setModelKey] = useState(0);
  /** Каждая задача — независимый эксперимент: свежие веса, свой отчёт */
  const model = useMemo(
    () => new MiniGPT(ECHO_PROTOTYPE_CFG),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modelKey, task],
  );
  const [reports, setReports] = useState<Partial<Record<TaskId, TrainReport>>>({});
  const [data, setData] = useState<SplitData | null>(null);
  const [training, setTraining] = useState(false);
  const [points, setPoints] = useState<TrainPoint[]>([]);
  const [report, setReport] = useState<TrainReport | null>(null);
  const cancelRef = useRef({ cancel: false });
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const [genPrompt] = useState(() =>
    DATASET_CFG ? [3, 16] : [1, 2],
  );
  const [genOut, setGenOut] = useState<number[] | null>(null);

  const cfg = ECHO_PROTOTYPE_CFG;
  const paramCount = model.paramCount();

  useEffect(() => {
    setData(makeDataset(DATASET_CFG, task));
    setReport(null);
    setPoints([]);
    setGenOut(null);
    return () => {
      cancelRef.current.cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, modelKey]);

  const baseline = useMemo(
    () => (data ? bigramBaselineAccuracy(data, DATASET_CFG.vocab) : null),
    [data],
  );

  useEffect(() => {
    drawChart(chartRef.current, points);
  }, [points]);

  async function startTraining() {
    if (!data || training) return;
    setTraining(true);
    setReport(null);
    setPoints([]);
    cancelRef.current.cancel = false;
    const rep = await trainMini(model, data, {
      steps: 240,
      lr: 0.012,
      batch: 8,
      evalEvery: 20,
      weightDecay: 0.01,
      cancelRef: cancelRef.current,
      onProgress: (p) => {
        setPoints((prev) => [...prev.slice(-400), p]);
      },
    });
    setReport(rep);
    setReports((prev) => ({ ...prev, [task]: rep }));
    setTraining(false);
  }

  function generate() {
    const out = model.greedy(genPrompt, 10);
    setGenOut(out);
  }

  const MODES = [
    { a: 3, b: 7 },
    { a: 7, b: 1 },
    { a: 11, b: 13 },
  ];

  function expectedContinuation(prefix: number[], n: number): number[] {
    const out = prefix.slice();
    const m = task === "context" ? MODES[prefix[0] % MODES.length] : { a: DATASET_CFG.a, b: DATASET_CFG.b };
    for (let i = 0; i < n; i++) {
      out.push((m.a * out[out.length - 1] + m.b) % DATASET_CFG.vocab);
    }
    return out;
  }

  const lastVal = points.filter((p) => p.valLoss !== null).slice(-1)[0]?.valLoss;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8">
      <div className="mb-8 text-center">
        <div className="font-mono text-xs uppercase tracking-[0.5em] text-emerald-600">
          FINAL TRAINING · ECHO MINI-TRANSFORMER
        </div>
        <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-slate-800">
          {paramCount.toLocaleString("ru-RU")} параметров
        </h2>
        <p className="mx-auto mt-3 max-w-2xl font-head text-slate-600">
          Настоящий вычислительный движок на Float32Array: autograd, LayerNorm, GELU, причинное внимание,
          AdamW. Модель выучивает закон телеметрии «Аксиомы»:{" "}
          <span className="font-mono text-sm text-sky-700">{data?.ruleDescription}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <div className="panel-glass rounded-2xl p-6">
            <h3 className="mb-4 font-head font-bold text-slate-800">Архитектура</h3>
            <div className="space-y-2 font-mono text-[13px] text-slate-600">
              <Row l="vocab / ctx" r={`${cfg.vocab} / ${cfg.ctx}`} />
              <Row l="d_model / слоёв" r={`${cfg.dModel} / ${cfg.layers}`} />
              <Row l="MLP hidden" r={String(cfg.dMlp)} />
              <Row l="attention" r="causal, 1 head / слой" />
              <Row l="norm" r="LayerNorm (pre)" />
              <Row l="activation" r="GELU" />
              <Row l="optimizer" r="AdamW + grad clip" />
              <div className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-sky-800">
                Σ параметров: <b>{paramCount.toLocaleString("ru-RU")}</b>
              </div>
            </div>
          </div>

          <div className="panel-glass rounded-2xl p-6">
            <h3 className="mb-4 font-head font-bold text-slate-800">Данные · хронологический сплит</h3>
            {data && (
              <div className="space-y-2 font-mono text-[13px] text-slate-600">
                <Row l="train" r={`${data.train.length} последовательностей`} />
                <Row l="validation" r={`${data.val.length}`} />
                <Row l="test" r={`${data.test.length}`} />
                <div className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-sky-300">
                  {"[3, 16, 15, 12, 3, 16, 15, …]"}
                </div>
                <p className="text-xs text-slate-400">
                  Датасет генерируется детерминированно seed={DATASET_CFG.seed}; чекпоинт выбирается по validation.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <div className="panel-glass rounded-2xl p-6">
            <h3 className="mb-3 font-head font-bold text-slate-800">Задача обучения</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <TaskCard
                active={task === "markov"}
                disabled={training}
                title="A · Простая цепочка"
                desc="Следующее значение зависит только от предыдущего. Нужна, чтобы изучить сам процесс обучения."
                onClick={() => setTask("markov")}
              />
              <TaskCard
                active={task === "context"}
                disabled={training}
                title="B · Режим отсека (контекст)"
                desc="Закон перехода задан ПЕРВЫМ токеном. Чтобы предсказать, нужно помнить начало — работа для внимания."
                onClick={() => setTask("context")}
              />
            </div>
            {(reports.markov || reports.context) && (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                  Сравнение независимых экспериментов
                </div>
                <table className="w-full font-mono text-xs">
                  <tbody>
                    {(["markov", "context"] as TaskId[]).map((t) => {
                      const r = reports[t];
                      return (
                        <tr key={t} className="border-t border-slate-100">
                          <td className="px-4 py-2 text-slate-500">
                            {t === "markov" ? "A · цепочка" : "B · контекст"}
                          </td>
                          <td className="px-4 py-2 text-right text-slate-800">
                            {r ? `${(r.testAccuracy * 100).toFixed(1)}% на тесте` : "не обучалась"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {baseline !== null && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Базовая модель (таблица биграмм)</span>
                  <span className="font-bold text-slate-800">{(baseline * 100).toFixed(1)}% на тесте</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  Transformer обязан победить этот простой базовый алгоритм — иначе сложность не оправдана.
                </div>
              </div>
            )}
          </div>

          <div className="panel-glass rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-head font-bold text-slate-800">Кривые обучения</h3>
              <div className="font-mono text-xs text-slate-400">
                {points.length ? `шаг ${points[points.length - 1].step}` : "ожидание"}
              </div>
            </div>
            <canvas ref={chartRef} className="h-48 w-full rounded-xl border border-slate-200 bg-white" />
            <div className="mt-2 flex gap-4 font-mono text-[11px]">
              <span className="text-sky-600">— train loss</span>
              <span className="text-rose-500">• val loss (checkpoint на min)</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button onClick={startTraining} disabled={training || !data}>
                {training ? "Обучение…" : report ? "Переобучить" : "Запустить обучение (240 шагов)"}
              </Button>
              {training && (
                <Button variant="danger" size="sm" onClick={() => (cancelRef.current.cancel = true)}>
                  Остановить
                </Button>
              )}
              {lastVal !== undefined && lastVal !== null && (
                <span className="font-mono text-xs text-slate-500">last val: {lastVal.toFixed(4)}</span>
              )}
            </div>
          </div>

          {report && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="panel-glass rounded-2xl p-6"
            >
              <h3 className="mb-4 font-head font-bold text-slate-800">Отчёт обучения</h3>
              <div className="grid gap-3 font-mono text-[13px] text-slate-700 sm:grid-cols-2">
                <Metric label="best validation loss" value={report.bestVal.toFixed(4)} />
                <Metric label="test loss" value={report.testLoss.toFixed(4)} />
                <Metric
                  label="test accuracy"
                  value={`${(report.testAccuracy * 100).toFixed(1)}%`}
                  good={baseline !== null && report.testAccuracy > baseline + 0.02}
                />
                <Metric
                  label="grad check (mean rel err)"
                  value={report.gradCheck.mean.toExponential(1)}
                  good={report.gradCheck.mean < 0.05}
                />
              </div>
              <p className="mt-3 font-mono text-xs text-slate-400">
                {report.gradCheck.mean < 0.05
                  ? "✓ Численные градиенты согласованы с autograd."
                  : "⚠ Проверка градиентов показывает расхождение — проверь движок."}
                {report.aborted ? " Обучение остановлено пользователем." : ""}
              </p>

              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-400">
                  генерация (greedy)
                </div>
                <div className="space-y-2 font-mono text-sm">
                  <div>
                    <span className="text-slate-400">prompt: </span>
                    <span className="text-slate-800">[{genPrompt.join(", ")}]</span>
                  </div>
                  {genOut && (
                    <>
                      <div className="break-all text-sky-700">ЭХО: [{genOut.join(", ")}]</div>
                      <div className="break-all text-emerald-600">
                        ожидание: [{expectedContinuation(genPrompt, 10).join(", ")}]
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={generate}>
                    Сгенерировать продолжение
                  </Button>
                </div>
              </div>

              {baseline !== null && (
                <div
                  className={`mt-4 rounded-xl border px-4 py-3 font-head text-sm ${
                    report.testAccuracy > baseline + 0.02
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  {report.testAccuracy > baseline + 0.02 ? (
                    <>
                      Transformer обходит базовую модель: {(report.testAccuracy * 100).toFixed(1)}% против{" "}
                      {(baseline * 100).toFixed(1)}%. {task === "context" && "Контекст действительно нужен."}
                    </>
                  ) : (
                    <>
                      Простая таблица биграмм даёт {(baseline * 100).toFixed(1)}% — не хуже обученной модели.
                      На такой задаче сложная архитектура не оправдана. Попробуйте задачу B.
                    </>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button variant="outline" onClick={() => setModelKey((k) => k + 1)}>
                  Сбросить веса
                </Button>
                <Button size="lg" onClick={onDone} disabled={report.aborted || !isFinite(report.testLoss)}>
                  {report.aborted
                    ? "Эксперимент прерван — повторите обучение"
                    : "Фиксировать результат и завершить модуль"}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  active,
  title,
  desc,
  onClick,
  disabled,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-4 py-3 text-left transition disabled:opacity-50 ${
        active ? "border-sky-400 bg-sky-50 ring-2 ring-sky-200" : "border-slate-200 bg-white hover:border-sky-300"
      }`}
    >
      <div className="font-head text-sm font-bold text-slate-800">{title}</div>
      <div className="mt-1 text-[11px] leading-snug text-slate-500">{desc}</div>
    </button>
  );
}

function Row({ l, r }: { l: string; r: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-400">{l}</span>
      <span className="text-slate-800">{r}</span>
    </div>
  );
}

function Metric({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-[10px] uppercase tracking-widest text-slate-400">{label}</div>
      <div className={`mt-1 text-lg font-bold ${good === undefined ? "text-slate-800" : good ? "text-emerald-600" : "text-amber-600"}`}>
        {value}
      </div>
    </div>
  );
}

function drawChart(canvas: HTMLCanvasElement | null, points: TrainPoint[]) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (points.length < 2) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = `${12 * dpr}px "JetBrains Mono", monospace`;
    ctx.fillText("здесь появится кривая loss…", 16 * dpr, 30 * dpr);
    return;
  }
  const W = canvas.width;
  const H = canvas.height;
  const pad = 8 * dpr;
  const maxLoss = Math.max(...points.map((p) => p.trainLoss)) * 1.05;
  const maxStep = points[points.length - 1].step;
  const x = (s: number) => pad + (s / maxStep) * (W - pad * 2);
  const y = (l: number) => H - pad - (l / maxLoss) * (H - pad * 2);

  ctx.strokeStyle = "rgba(148,163,184,0.25)";
  ctx.lineWidth = 1 * dpr;
  for (let g = 0; g <= 4; g++) {
    const gy = pad + (g / 4) * (H - pad * 2);
    ctx.beginPath();
    ctx.moveTo(pad, gy);
    ctx.lineTo(W - pad, gy);
    ctx.stroke();
  }

  // train loss
  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  points.forEach((p, i) => {
    const X = x(p.step);
    const Y = y(p.trainLoss);
    if (i === 0) ctx.moveTo(X, Y);
    else ctx.lineTo(X, Y);
  });
  ctx.stroke();

  // val points
  ctx.fillStyle = "#f43f5e";
  points.forEach((p) => {
    if (p.valLoss === null) return;
    ctx.beginPath();
    ctx.arc(x(p.step), y(p.valLoss), 3.4 * dpr, 0, Math.PI * 2);
    ctx.fill();
  });
}
