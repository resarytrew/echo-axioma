import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Circuit, EvalReport, journalScenario } from "../../game/circuit";
import { Narrative } from "../scenes/Narrative";
import { SensorChart } from "./SensorChart";
import { Constructor } from "./Constructor";
import { TestStand } from "./TestStand";

type Stage = "intro" | "journal" | "lab" | "deploy";

export function FalseAlarmMission({
  onComplete,
  onExit,
  wastedOxygen,
  onWasteOxygen,
  initialCircuit,
  initialStage,
  revisit,
  onStage,
  onDraft,
  has,
}: {
  onComplete: (circuit: Circuit) => void;
  onExit: () => void;
  wastedOxygen: boolean;
  onWasteOxygen: () => void;
  initialCircuit?: Circuit;
  initialStage?: string;
  revisit?: boolean;
  onStage?: (stage: string) => void;
  onDraft?: (c: Circuit) => void;
  has?: (capId: string) => boolean;
}) {
  const [stage, setStageState] = useState<Stage>(
    (initialStage as Stage) && initialStage !== "deploy"
      ? (initialStage as Stage)
      : revisit
        ? "lab"
        : "intro",
  );

  function setStage(s: Stage) {
    setStageState(s);
    onStage?.(s);
  }
  const [circuit, setCircuitState] = useState<Circuit>(
    initialCircuit ?? {
      agg: "mean",
      consistency: "none",
      spreadLimit: 1.2,
      rule: "low",
      threshold: 19.2,
    },
  );
  const [report, setReport] = useState<EvalReport | null>(null);
  const [controlReport, setControlReport] = useState<EvalReport | null>(null);
  const [deployed, setDeployed] = useState(false);
  const journal = useMemo(() => journalScenario(), []);

  function setCircuit(c: Circuit) {
    setCircuitState(c);
    onDraft?.(c);
  }

  if (stage === "intro") {
    return (
      <MissionShell title="Миссия: «Ложная тревога»" onExit={onExit}>
        <Narrative
          scene={{
            id: "fa-intro",
            type: "narrative",
            visual: {
              kind: "statusList",
              title: "СИСТЕМА ЖИЗНЕОБЕСПЕЧЕНИЯ · O₂",
              items: [
                { label: "ДАТЧИК A", value: "20.8 %", state: "online" },
                { label: "ДАТЧИК B", value: "20.7 %", state: "online" },
                { label: "ДАТЧИК C", value: "4.1 %", state: "degraded" },
                { label: "СРЕДНЕЕ (ЭХО)", value: "15.2 %", state: "warning" },
                { label: "РЕЗЕРВНЫЙ O₂", value: "ARMED", state: "warning" },
              ],
            },
            lines: [
              { speaker: "system", text: "ALERT: резкое падение концентрации кислорода.", mono: true },
              { speaker: "echo", text: "Среднее по трём датчикам: 15.2 %. Аварийная автоматика готовится использовать резервный кислород." },
              { speaker: "zara", text: "Стоп. Прежде чем жечь резерв — посмотри на показания. Один датчик не похож на остальные." },
              { speaker: "bit", text: "Я могу долететь до датчика C и постучать. Терапевтически." },
              { speaker: "zara", text: "Данные лечатся не молотком, а диагностикой." },
            ],
          }}
          onDone={() => setStage("journal")}
        />
      </MissionShell>
    );
  }

  if (stage === "journal") {
    return (
      <MissionShell title="Диагностика · журнал датчиков" onExit={onExit}>
        <div className="mx-auto w-full max-w-3xl px-4 pb-10">
          <div className="panel-glass rounded-2xl p-6">
            <p className="mb-4 font-head text-sm text-slate-600">
              История показаний за последние 40 циклов. Взгляни, когда именно датчик C «сорвался» — и как вели
              себя два других.
            </p>
            {/* Только показания приборов: эталон атмосферы игрок не видит */}
            <SensorChart sensors={journal.sensors} threshold={19.2} />
            <div className="mt-5 space-y-2 rounded-xl bg-slate-50 px-4 py-3 font-mono text-xs">
              <div className="text-slate-600">
                <span className="text-slate-400">НАБЛЮДЕНИЕ: </span>
                до цикла 12 все датчики согласованы; далее C показывает 4.1 % скачком, A и B не меняются.
              </div>
              <div className="text-amber-700">
                <span className="text-amber-500">ГИПОТЕЗА: </span>
                скачок одного канала при стабильности остальных чаще указывает на отказ прибора, чем на
                физическое падение O₂. Это предположение, а не доказанный факт.
              </div>
              <div className="text-sky-700">
                <span className="text-sky-500">ПРОВЕРКА: </span>
                нужен алгоритм, устойчивый к одиночному выбросу, но реагирующий на согласованное снижение.
                Решает испытательный стенд, а не наша уверенность.
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => {
                  onWasteOxygen();
                  setStage("lab");
                }}
                className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-left transition hover:bg-rose-100"
              >
                <div className="font-head text-sm font-bold text-rose-700">Запустить резервный кислород</div>
                <div className="mt-1 text-xs text-rose-500">
                  «На всякий случай». Автоматика ЭХО: −20 % энергии. Алгоритм исправлять всё равно придётся.
                </div>
              </button>
              <button
                onClick={() => setStage("lab")}
                className="rounded-xl border border-sky-200 bg-sky-50 px-5 py-4 text-left transition hover:bg-sky-100"
              >
                <div className="font-head text-sm font-bold text-sky-700">Изучить и исправить алгоритм</div>
                <div className="mt-1 text-xs text-sky-600">
                  Причина похожа на отказ датчика, а не на утечку. Переходим к конструктору.
                </div>
              </button>
            </div>
          </div>
        </div>
      </MissionShell>
    );
  }

  if (stage === "lab") {
    return (
      <MissionShell title={revisit ? "Модернизация контура O₂" : "Конструктор × Испытания"} onExit={onExit}>
        {revisit && (
          <div className="mx-auto mb-4 max-w-6xl px-4">
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 font-mono text-xs text-sky-800">
              Алгоритм уже внедрён и работает. Можно пересобрать схему, повторно испытать её и установить
              новую версию — станция сохранит историю версий.
            </div>
          </div>
        )}
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 lg:grid-cols-2">
          <Constructor
            has={has}
            circuit={circuit}
            onChange={(c) => {
              setCircuit(c);
              setReport(null);
              setControlReport(null);
            }}
          />
          <TestStand
            circuit={circuit}
            report={report}
            controlReport={controlReport}
            onReport={setReport}
            onControlReport={setControlReport}
            deployed={deployed}
            onDeploy={() => {
              setDeployed(true);
              setStage("deploy");
            }}
          />
        </div>
      </MissionShell>
    );
  }

  return (
    <MissionShell title="Внедрение завершено" onExit={onExit}>
      <Narrative
        scene={{
          id: "fa-deploy",
          type: "narrative",
          visual: {
            kind: "statusList",
            title: "СИСТЕМА ЖИЗНЕОБЕСПЕЧЕНИЯ · O₂",
            items: [
              { label: "ДАТЧИК A", value: "20.8 %", state: "online" },
              { label: "ДАТЧИК B", value: "20.7 %", state: "online" },
              { label: "ДАТЧИК C", value: "FAULT → ISOLATED", state: "offline" },
              { label: "АЛГОРИТМ", value: `agg=${circuit.agg} · rule=${circuit.rule}`, state: "online" },
              { label: "РЕЗЕРВНЫЙ O₂", value: wastedOxygen ? "SPENT (−20% энергии)" : "СОХРАНЁН", state: wastedOxygen ? "warning" : "online" },
              { label: "СЕКТОР", value: "СЕНСОРНЫЙ ОТСЕК ВОССТАНОВЛЕН", state: "online" },
            ],
          },
          lines: [
            { speaker: "echo", text: "Схема принята в штатный контур. Контроль кислорода переведён на новый алгоритм." },
            {
              speaker: "zara",
              text: wastedOxygen
                ? "Тревога отменена. Жаль резерв — но главное, что твой алгоритм отличает отказ датчика от реальной утечки."
                : "Резервный кислород удалось сохранить. Твой алгоритм отличает отказ датчика от реальной утечки.",
            },
            { speaker: "bit", text: "Датчик C признан виновным и отстранён от должности." },
            { speaker: "shumma", text: "Красивая работа. Особенно мне понравилось, как исправный прибор записали в неисправные." },
            { speaker: "zara", text: "Он и есть неисправен — 4.1 % при нормальной атмосфере." },
            { speaker: "shumma", text: "Всё, что противоречит среднему, вы называете неисправным. Интересная философия." },
            { speaker: "system", text: "LOG ENTRY #4471: во время ошибочного сигнала зафиксировано неизвестное обращение к центральному архиву…", mono: true },
          ],
        }}
        onDone={() => onComplete(circuit)}
      />
    </MissionShell>
  );
}

function MissionShell({
  title,
  children,
  onExit,
}: {
  title: string;
  children: React.ReactNode;
  onExit: () => void;
}) {
  return (
    <div className="relative z-10">
      <div className="mission-header panel-glass sticky top-0 z-20 border-b">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <button onClick={onExit} className="font-mono text-xs text-slate-400 transition hover:text-sky-600">
            ← станция
          </button>
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-head text-sm font-semibold text-slate-800">
            {title}
          </motion.div>
        </div>
      </div>
      {children}
    </div>
  );
}
