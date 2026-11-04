import { Scene } from "../types/scenario";

export const module2Scenes: Scene[] = [
  {
    id: "m2-intro",
    type: "narrative",
    visual: { kind: "graphDown", graphLabel: "sensor: pressure · sector: C-12 · unit: atm", graphValues: [1.0, 0.94, 0.86, 0.79, 0.73] },
    lines: [
      { speaker: "echo", text: "Давление в секторе C-12 снижается." },
      { speaker: "zara", text: "Вот теперь произошло что-то важное." },
    ],
  },
  {
    id: "m2-concept-info",
    type: "conceptCard",
    term: "INFORMATION",
    termRu: "ИНФОРМАЦИЯ",
    definition:
      "Информация — данные, интерпретированные в контексте так, что они сообщают что-либо об объекте, событии или состоянии системы.",
    simple: "данные — что получено. информация — что это означает.",
    conceptId: "information",
  },
  {
    id: "m2-s3",
    type: "narrative",
    visual: {
      kind: "table",
      table: { columns: ["значение = 72"], rows: [["heart_rate = 72 bpm"], ["battery = 72 %"], ["speed = 72 km/s"]] },
    },
    lines: [
      { speaker: "zara", text: "Значение одно. Информация — разная." },
      { speaker: "shumma", text: "То есть вы берёте красивые числа… и портите их смыслом." },
      { speaker: "zara", text: "Именно наоборот." },
    ],
  },
  {
    id: "m2-doors",
    type: "choice",
    prompt: "За одной из четырёх дверей находится резервный генератор. Сообщение: «Генератор за дверью C». Что произошло с неопределённостью?",
    visual: { kind: "cards", cards: [{ label: "A" }, { label: "B" }, { label: "C" }, { label: "D" }] },
    options: [
      { id: "down", label: "Неопределённость уменьшилась" },
      { id: "same", label: "Ничего не изменилось" },
      { id: "up", label: "Неопределённость выросла" },
    ],
    correctId: "down",
    correctFeedback: "Было четыре варианта — стал один. Это и называется получением информации.",
    incorrectFeedback: "Сообщение указало конкретную дверь, поэтому число возможных вариантов уменьшилось.",
    afterLines: [
      { speaker: "shumma", text: "Было четыре варианта. Стал один." },
      { speaker: "shumma", text: "Скучно." },
      { speaker: "zara", text: "Это называется получением информации." },
      { speaker: "shumma", text: "Я называю это уничтожением возможностей." },
    ],
  },
  {
    id: "m2-measure",
    type: "narrative",
    lines: [
      { speaker: "zara", text: "Температуру измеряют в градусах. Расстояние — в метрах. Массу — в килограммах. А информацию?" },
      { speaker: "bit", text: "В полезности?" },
      { speaker: "zara", text: "Нет." },
      { speaker: "shumma", text: "В количестве хаоса." },
      { speaker: "zara", text: "Тоже нет." },
      { speaker: "shumma", text: "Пока." },
    ],
  },
  {
    id: "m2-bit-choice",
    type: "choice",
    prompt: "Лампа может быть OFF или ON. Сколько у неё состояний?",
    visual: { kind: "ascii", ascii: "OFF\nON" },
    options: [
      { id: "1", label: "1" },
      { id: "2", label: "2" },
      { id: "4", label: "4" },
    ],
    correctId: "2",
    correctFeedback: "OFF → 0, ON → 1. Это и есть один бит.",
    incorrectFeedback: "Один бит различает ровно два состояния, которые можно записать как 0 и 1.",
  },
  {
    id: "m2-concept-bit",
    type: "conceptCard",
    term: "BIT",
    termRu: "БИТ",
    definition: "Бит — минимальная единица количества информации в двоичном представлении.",
    extra: ["binary digit → bit"],
    conceptId: "bit",
  },
  {
    id: "m2-bit-joke",
    type: "narrative",
    visual: { kind: "ascii", ascii: "0\n1\n▓" },
    lines: [
      { speaker: "zara", text: "Название происходит от выражения binary digit — двоичная цифра." },
      { speaker: "bit", text: "А я всегда говорил, что назван в честь фундаментальной единицы информации." },
      { speaker: "shumma", text: "Я думал, из-за размера." },
      { speaker: "bit", text: "Я передумал дружить с тобой." },
    ],
  },
  {
    id: "m2-states",
    type: "narrative",
    visual: { kind: "ascii", ascii: "1 bit  → 2 states\n2 bits → 4 states\n3 bits → 8 states\n4 bits → 16 states" },
    lines: [
      { speaker: "zara", text: "OFF · IDLE · CRUISE · BOOST — четыре режима двигателя кодируются уже двумя битами: 00, 01, 10, 11." },
    ],
  },
  {
    id: "m2-formula",
    type: "narrative",
    visual: { kind: "ascii", ascii: "2^I = N\n\nI = log₂N\n\nN = 2   → I = 1\nN = 8   → I = 3\nN = 256 → I = 8" },
    lines: [
      {
        speaker: "zara",
        text: "Логарифм здесь задаёт простой вопрос: в какую степень нужно возвести два, чтобы получить число возможных состояний?",
      },
      { speaker: "shumma", text: "А если состояний бесконечно много?" },
      { speaker: "zara", text: "Тогда у нас будет тема для другой главы." },
      { speaker: "shumma", text: "Люблю бесконечные проекты." },
    ],
  },
  {
    id: "m2-lab",
    type: "miniLab",
    title: "ЛАБОРАТОРИЯ «СКОЛЬКО БИТ?»",
    items: [
      {
        id: "l1",
        prompt: "Шлюз: OPEN / CLOSED — сколько бит нужно?",
        options: [
          { id: "1", label: "1 бит" },
          { id: "2", label: "2 бита" },
        ],
        correctId: "1",
      },
      {
        id: "l2",
        prompt: "4 режима двигателя — сколько бит?",
        options: [
          { id: "1", label: "1 бит" },
          { id: "2", label: "2 бита" },
          { id: "3", label: "3 бита" },
        ],
        correctId: "2",
      },
      {
        id: "l3",
        prompt: "16 уровней мощности — сколько бит?",
        options: [
          { id: "2", label: "2 бита" },
          { id: "4", label: "4 бита" },
          { id: "8", label: "8 бит" },
        ],
        correctId: "4",
      },
      {
        id: "l4",
        prompt: "256 кодов — сколько бит?",
        options: [
          { id: "4", label: "4 бита" },
          { id: "8", label: "8 бит" },
          { id: "16", label: "16 бит" },
        ],
        correctId: "8",
      },
    ],
  },
  {
    id: "m2-unequal",
    type: "narrative",
    visual: { kind: "ascii", ascii: "I = -log₂p" },
    lines: [
      { speaker: "zara", text: "До этого мы считали состояния равновероятными." },
      { speaker: "zara", text: "Чем событие менее вероятно, тем больше нового сообщает его наступление." },
      { speaker: "shumma", text: "Значит, если я вдруг начну помогать… это будет очень информативно." },
      { speaker: "zara", text: "Исключительно." },
    ],
  },
  {
    id: "m2-rare-choice",
    type: "choice",
    prompt: "Какое сообщение сильнее уменьшает неопределённость?",
    visual: {
      kind: "compare",
      compareLeft: { title: "A · p = 0.99", body: "Реактор работает нормально." },
      compareRight: { title: "B · p = 0.000001", body: "Все резервные реакторы\nодновременно отключились." },
    },
    options: [
      { id: "a", label: "Сообщение A" },
      { id: "b", label: "Сообщение B" },
    ],
    correctId: "b",
    correctFeedback: "Редкое событие обычно сильнее уменьшает неопределённость.",
    incorrectFeedback: "Сравните вероятности событий: неожиданное сообщение обычно несёт больше информации.",
  },
  {
    id: "m2-size-choice",
    type: "choice",
    prompt: "Какое сообщение важнее экипажу?",
    visual: {
      kind: "compare",
      compareLeft: { title: "8 GB", body: "RANDOM DATA" },
      compareRight: { title: "16 bytes", body: "REACTOR FAIL" },
    },
    options: [
      { id: "big", label: "8 GB RANDOM DATA" },
      { id: "small", label: "REACTOR FAIL" },
    ],
    correctId: "small",
    correctFeedback: "Размер данных не равен смысловой ценности сообщения.",
    incorrectFeedback: "Объём байтов и полезность сообщения экипажу — разные характеристики.",
    afterLines: [{ speaker: "shumma", text: "Восемь гигабайт. Очевидно важнее." }, { speaker: "zara", text: "Именно поэтому — нет." }],
  },
  {
    id: "m2-byte",
    type: "conceptCard",
    term: "BYTE",
    termRu: "БАЙТ",
    definition: "Байт — группа из 8 бит.",
    extra: ["01101001 → 8 bit = 1 byte", "2^8 = 256 комбинаций"],
    conceptId: "byte",
  },
  {
    id: "m2-units-match",
    type: "match",
    prompt: "Сопоставь единицы измерения информации с их значением.",
    pairs: [
      { id: "p1", left: "8 бит", right: "1 байт" },
      { id: "p2", left: "1 kB", right: "1000 байт" },
      { id: "p3", left: "1 MB", right: "1000 kB" },
      { id: "p4", left: "1 KiB", right: "1024 байта" },
      { id: "p5", left: "1 GB", right: "1000 MB" },
    ],
    afterLines: [
      { speaker: "bit", text: "Значит, когда диск на терабайт показывает меньше…" },
      { speaker: "zara", text: "Это разница единиц: 1000 против 1024." },
      { speaker: "shumma", text: "А я уже хотел обвинить производителя." },
      { speaker: "bit", text: "Я всё равно не исключаю." },
    ],
  },
  {
    id: "m2-camera",
    type: "narrative",
    visual: { kind: "ascii", ascii: "1920 × 1080 · RGB · 8 bit/channel\n\n1920 × 1080 = 2 073 600 pixels\n2 073 600 × 3 ≈ 6.2 MB\n\n60 frames/s" },
    lines: [
      { speaker: "zara", text: "Каждый пиксель — это 24 бита: по 8 бит на R, G и B. И это один несжатый кадр." },
      { speaker: "shumma", text: "Можно выключить камеру. Ноль мегабайт." },
      { speaker: "zara", text: "И ноль информации о том, что происходит снаружи." },
      { speaker: "shumma", text: "Экономия очевидна." },
    ],
  },
  {
    id: "m2-compress",
    type: "narrative",
    visual: { kind: "compare", compareLeft: { title: "RAW IMAGE", body: "6.2 MB" }, compareRight: { title: "COMPRESSED", body: "0.8 MB" } },
    lines: [
      { speaker: "shumma", text: "Вы выбросили пять мегабайт." },
      { speaker: "zara", text: "Нет." },
      { speaker: "shumma", text: "Они были. Теперь их нет. Я просто фиксирую факты." },
    ],
  },
  {
    id: "m2-extract",
    type: "narrative",
    visual: { kind: "statusList", items: [
      { label: "TREND", value: "DOWN", state: "warning" },
      { label: "RATE", value: "FAST", state: "warning" },
      { label: "STATUS", value: "BELOW NORMAL", state: "degraded" },
    ] },
    lines: [
      { speaker: "echo", text: "Давление в секторе C-12 быстро падает и находится ниже нормального диапазона." },
      { speaker: "zara", text: "Теперь он не просто принимает данные. Он извлекает информацию." },
      { speaker: "shumma", text: "Плохо. Он становится наблюдательным." },
    ],
  },
  {
    id: "m2-quiz",
    type: "miniLab",
    title: "ПРОВЕРКА ПОНИМАНИЯ",
    items: [
      {
        id: "q1",
        prompt: "Что отличает информацию от данных?",
        options: [
          { id: "a", label: "Размер файла" },
          { id: "b", label: "Наличие смысла в контексте" },
          { id: "c", label: "Способ хранения" },
        ],
        correctId: "b",
      },
      {
        id: "q2",
        prompt: "Сколько состояний различает один бит?",
        options: [
          { id: "1", label: "1" },
          { id: "2", label: "2" },
          { id: "4", label: "4" },
        ],
        correctId: "2",
      },
      {
        id: "q3",
        prompt: "Сколько комбинаций дают 8 бит?",
        options: [
          { id: "a", label: "64" },
          { id: "b", label: "128" },
          { id: "c", label: "256" },
        ],
        correctId: "c",
      },
      {
        id: "q4",
        prompt: "Больший файл всегда важнее по смыслу?",
        options: [
          { id: "yes", label: "Да" },
          { id: "no", label: "Нет" },
        ],
        correctId: "no",
      },
    ],
  },
  {
    id: "m2-textinput",
    type: "textInput",
    term: "information",
    prompt: "Информация — это...",
    placeholder: "Сформулируй определение своими словами",
    officialDefinition:
      "Информация — данные, интерпретированные в контексте так, что они сообщают что-либо об объекте, событии или состоянии системы.",
  },
  {
    id: "m2-unlock",
    type: "capabilityUnlock",
    capability: "INFORMATION EXTRACTION",
    echoLine: "Я могу получать данные и извлекать из них сведения о состоянии корабля.",
    lines: [
      { speaker: "zara", text: "Отлично. Опасно ли давление 0.73?" },
      { speaker: "echo", text: "UNKNOWN." },
      { speaker: "shumma", text: "Я бы сказал: зависит от настроения давления." },
      { speaker: "zara", text: "Вот поэтому нам нужны знания." },
    ],
  },
];
