import { Scene } from "../types/scenario";

export const module3Scenes: Scene[] = [
  {
    id: "m3-intro",
    type: "narrative",
    visual: { kind: "ascii", ascii: "pressure = 0.73 atm\ntrend = falling\nsector = C-12" },
    lines: [
      { speaker: "echo", text: "Давление быстро падает." },
      { speaker: "zara", text: "Опасно?" },
      { speaker: "echo", text: "UNKNOWN. Мне неизвестен нормальный диапазон давления и последствия отклонения." },
      { speaker: "zara", text: "Именно." },
      { speaker: "shumma", text: "Вот поэтому знания опасны." },
      { speaker: "zara", text: "Почему?" },
      { speaker: "shumma", text: "Сначала у тебя просто число. Потом ты внезапно начинаешь делать выводы." },
    ],
  },
  {
    id: "m3-layers",
    type: "narrative",
    visual: {
      kind: "ascii",
      ascii:
        "DATA:\n0.73\n\nINFORMATION:\npressure = 0.73 atm\n\nKNOWLEDGE:\nnormal pressure ≈ 1.0 atm\nlow pressure may indicate leakage\ncontinued loss threatens crew",
    },
    lines: [
      {
        speaker: "zara",
        text: "Информация сообщает, что происходит. Знание помогает понять, что это означает и что из этого следует.",
      },
    ],
  },
  {
    id: "m3-concept-knowledge",
    type: "conceptCard",
    term: "KNOWLEDGE",
    termRu: "ЗНАНИЯ",
    definition:
      "Знания — организованные сведения о фактах, объектах, свойствах, отношениях и закономерностях, которые система может использовать для вывода и решения задач.",
    simple: "информация — что происходит? знание — что это значит и что из этого следует?",
    conceptId: "knowledge",
  },
  {
    id: "m3-bricks",
    type: "narrative",
    visual: {
      kind: "ascii",
      ascii:
        "OBJECT     → Reactor-1, Engine-2, Sector-C12\nPROPERTY   → temperature, mass, status\nVALUE      → 74 °C, 1200 kg, ACTIVE\nRELATION   → Reactor-1 PART_OF PowerSystem\nFACT       → Engine-2 temperature = 81 °C\nRULE       → IF temperature > critical\n             THEN state = OVERHEAT",
    },
    lines: [
      { speaker: "zara", text: "Это кирпичи, из которых строятся знания: объекты, свойства, значения, отношения, факты и правила." },
    ],
  },
  {
    id: "m3-triple",
    type: "narrative",
    visual: { kind: "ascii", ascii: "SUBJECT → RELATION → OBJECT\n\nReactor-1 → part_of → PowerSystem\nEngine-2 → located_in → Deck-B" },
    lines: [
      { speaker: "shumma", text: "А если двигатель считает, что он на палубе C?" },
      { speaker: "zara", text: "Двигатели обычно ничего не считают." },
      { speaker: "echo", text: "Пока." },
      { speaker: "shumma", text: "Мне нравится этот." },
    ],
  },
  {
    id: "m3-network1",
    type: "narrative",
    visual: {
      kind: "network",
      network: {
        nodes: [
          { id: "ax", label: "AXIOMA", x: 160, y: 24 },
          { id: "ps", label: "POWER SYS", x: 160, y: 80 },
          { id: "r1", label: "REACTOR-1", x: 80, y: 140 },
          { id: "bat", label: "BATTERY", x: 240, y: 140 },
          { id: "cool", label: "COOLING", x: 80, y: 190 },
        ],
        edges: [
          { from: "ax", to: "ps", label: "has_part" },
          { from: "ps", to: "r1", label: "contains" },
          { from: "ps", to: "bat", label: "contains" },
          { from: "r1", to: "cool", label: "cooled_by" },
        ],
      },
    },
    lines: [{ speaker: "echo", text: "Reactor-1 входит в PowerSystem и охлаждается CoolingSystem." }],
  },
  {
    id: "m3-explicit-learned",
    type: "narrative",
    visual: {
      kind: "compare",
      compareLeft: { title: "EXPLICIT KNOWLEDGE", body: "факты\nправила\nотношения\nграфы\nбазы знаний\nфреймы" },
      compareRight: { title: "LEARNED REPRESENTATIONS", body: "веса\nembeddings\nвнутренние признаки\nlatent representations" },
    },
    lines: [
      { speaker: "zara", text: "В классических системах знания часто записывали явно. Современные нейросети многое усваивают в параметрах." },
      { speaker: "zara", text: "Это не одно и то же." },
    ],
  },
  {
    id: "m3-why",
    type: "narrative",
    visual: { kind: "ascii", ascii: "reactor → has → temperature\ntemperature → controlled_by → cooling\n\nIF temperature > critical\nTHEN danger" },
    lines: [{ speaker: "zara", text: "Представление знаний определяет, как система хранит смысл и выполняет рассуждения." }],
  },
  {
    id: "m3-models",
    type: "narrative",
    visual: { kind: "ascii", ascii: "LOGIC\nRULES\nSEMANTIC NETWORKS\nFRAMES" },
    lines: [
      { speaker: "zara", text: "Идеального универсального способа нет. У каждого подхода свои плюсы." },
      { speaker: "shumma", text: "Значит, даже знания хранятся неправильно разными способами." },
      { speaker: "zara", text: "Очень вольная интерпретация." },
    ],
  },
  {
    id: "m3-logic",
    type: "narrative",
    visual: {
      kind: "compare",
      compareLeft: {
        title: "ЛОГИКА",
        body: "Reactor(Reactor1)\nTemperature(Reactor1, 105)\nCriticalTemperature(Reactor1, 100)\n\nReactor(x) AND Temperature(x) > Critical(x)\n→ Overheated(x)",
      },
      compareRight: { title: "ПЛЮСЫ / МИНУСЫ", body: "+ формальность\n+ объяснимость\n+ логический вывод\n\n− сложно работать с неопределённостью\n− трудно поддерживать много правил" },
    },
    lines: [{ speaker: "zara", text: "Логическое представление строго, но плохо справляется с неопределённостью реального мира." }],
  },
  {
    id: "m3-production",
    type: "narrative",
    visual: { kind: "ascii", ascii: "IF\ntemperature > 100\n\nTHEN\nreactor_state = OVERHEAT" },
    lines: [
      { speaker: "shumma", text: "А если температура 99.999?" },
      { speaker: "zara", text: "Тогда это правило не сработает." },
      { speaker: "shumma", text: "Великолепно. Я нашёл лазейку в физике." },
      { speaker: "zara", text: "В правиле." },
      { speaker: "shumma", text: "Пока что." },
    ],
  },
  {
    id: "m3-concept-rule",
    type: "conceptCard",
    term: "IF → THEN",
    termRu: "ПРОДУКЦИОННОЕ ПРАВИЛО",
    definition: "Продукционное правило — конструкция вида «если выполняется условие, то следует действие или новый факт».",
    conceptId: "rule",
  },
  {
    id: "m3-inference",
    type: "narrative",
    visual: { kind: "flow", flow: [{ label: "FACT: temperature = 108" }, { label: "RULE R1" }, { label: "NEW FACT: OVERHEAT" }, { label: "RULE R2" }, { label: "ACTION: reduce power" }] },
    lines: [{ speaker: "zara", text: "Получение новых утверждений из уже имеющихся знаний называется выводом." }],
  },
  {
    id: "m3-concept-inference",
    type: "conceptCard",
    term: "INFERENCE",
    termRu: "ВЫВОД",
    definition: "Получение новых утверждений из уже имеющихся знаний.",
    conceptId: "inference",
  },
  {
    id: "m3-semantic-net2",
    type: "narrative",
    visual: {
      kind: "network",
      network: {
        nodes: [
          { id: "m", label: "MACHINE", x: 160, y: 20 },
          { id: "e", label: "ENGINE", x: 160, y: 90 },
          { id: "t", label: "TEMPERATURE", x: 260, y: 140 },
          { id: "f", label: "FUEL", x: 60, y: 140 },
        ],
        edges: [
          { from: "e", to: "m", label: "is_a" },
          { from: "e", to: "t", label: "has" },
          { from: "e", to: "f", label: "uses" },
        ],
      },
    },
    lines: [{ speaker: "zara", text: "Узлы представляют сущности и понятия. Связи — отношения между ними." }],
  },
  {
    id: "m3-hierarchy-choice",
    type: "choice",
    prompt: "ION_ENGINE is_a ENGINE. ENGINE is_a MACHINE. Что из этого следует?",
    visual: { kind: "ascii", ascii: "SYSTEM\n  ↓\nMACHINE\n  ↓\nENGINE\n  ↓\nION_ENGINE" },
    options: [
      { id: "a", label: "ION_ENGINE is_a MACHINE" },
      { id: "b", label: "MACHINE is_a ION_ENGINE" },
      { id: "c", label: "Связи нет" },
    ],
    correctId: "a",
    correctFeedback: "Иерархия классов передаётся по цепочке — это и есть наследование.",
  },
  {
    id: "m3-inheritance-demo",
    type: "narrative",
    visual: { kind: "ascii", ascii: "ENGINE\n ├ requires_power = TRUE\n └ produces_thrust = TRUE\n\nION_ENGINE (наследует ENGINE)" },
    lines: [
      { speaker: "zara", text: "Производит ли ION_ENGINE тягу?" },
      { speaker: "echo", text: "ION_ENGINE → ENGINE → produces_thrust = TRUE. Да." },
      { speaker: "zara", text: "Свойство унаследовано от общего класса." },
    ],
  },
  {
    id: "m3-concept-inheritance",
    type: "conceptCard",
    term: "INHERITANCE",
    termRu: "НАСЛЕДОВАНИЕ",
    definition: "Наследование — получение объектом или классом свойств от более общего класса, частью которого он является.",
    conceptId: "inheritance",
  },
  {
    id: "m3-db-vs-kb",
    type: "narrative",
    visual: {
      kind: "compare",
      compareLeft: { title: "DATABASE", body: "id: 17\nsensor: T-17\nvalue: 41.8\ntime: 10:41" },
      compareRight: {
        title: "KNOWLEDGE BASE",
        body: "T-17 measures Reactor-1\ntemperature\n\nnormal range: 20–90 °C\n\ntemperature > 100 °C\n→ overheating risk",
      },
    },
    lines: [{ speaker: "zara", text: "База данных хранит записи. База знаний хранит факты, связи и правила." }],
  },
  {
    id: "m3-concept-kb",
    type: "conceptCard",
    term: "KNOWLEDGE BASE",
    termRu: "БАЗА ЗНАНИЙ",
    definition: "Организованное хранилище фактов, понятий, отношений и правил, предназначенных для использования интеллектуальной системой.",
    extra: ["CONCEPTS: 17", "OBJECTS: 42", "FACTS: 126", "RELATIONS: 73", "RULES: 21"],
    conceptId: "knowledge-base",
  },
  {
    id: "m3-kb-joke",
    type: "narrative",
    lines: [
      { speaker: "shumma", text: "Сто двадцать шесть фактов." },
      { speaker: "shumma", text: "А красивого ничего." },
      { speaker: "zara", text: "Как выглядит красивый факт?" },
      { speaker: "shumma", text: "«Все системы отключены»." },
      { speaker: "zara", text: "Разумеется." },
    ],
  },
  {
    id: "m3-query2-choice",
    type: "choice",
    prompt: "Что может случиться при падении давления в CoolingSystem-A?",
    visual: { kind: "ascii", ascii: "low coolant pressure\n→ cooling efficiency decreases\n\ncooling efficiency decreases\nAND reactor power high\n→ overheating risk" },
    options: [
      { id: "a", label: "Ничего, системы независимы" },
      { id: "b", label: "Снизится эффективность охлаждения и вырастет риск перегрева Reactor-1" },
      { id: "c", label: "Корабль автоматически остановится" },
    ],
    correctId: "b",
    correctFeedback: "ЭХО применил цепочку правил и сделал вывод на основе связанных фактов.",
    afterLines: [{ speaker: "zara", text: "Теперь ЭХО не просто хранит знания. Он начинает ими пользоваться." }, { speaker: "shumma", text: "Опасная тенденция." }],
  },
  {
    id: "m3-toomany",
    type: "narrative",
    visual: { kind: "ascii", ascii: "Engine-2 type IonEngine\nEngine-2 location Deck-B\nEngine-2 temperature 81\nEngine-2 thrust 64\nEngine-2 fuel 47\nEngine-2 state ACTIVE\n..." },
    lines: [
      { speaker: "zara", text: "Работает. Но выглядит так, будто двигатель описывали семьюдесятью стикерами." },
      { speaker: "bit", text: "Стикеры — проверенная технология." },
      { speaker: "zara", text: "Ты приклеил пароль от сервера на монитор." },
      { speaker: "bit", text: "И ни разу не забыл." },
    ],
  },
  {
    id: "m3-concept-frame",
    type: "conceptCard",
    term: "FRAME",
    termRu: "ФРЕЙМ",
    definition: "Фрейм — структура представления знаний, описывающая типичный объект, ситуацию или понятие через набор характеристик.",
    extra: ["type: IonEngine", "location: Deck-B", "temperature: 81 °C", "thrust: 64 %", "fuel: 47 %", "state: ACTIVE"],
    conceptId: "frame",
  },
  {
    id: "m3-frame-joke",
    type: "narrative",
    lines: [
      { speaker: "shumma", text: "И вы правда думаете, что двигатель можно описать шестью полями?" },
      { speaker: "zara", text: "Нет. Это модель." },
      { speaker: "shumma", text: "Отлично. Я тоже не описываюсь шестью полями." },
      { speaker: "bit", text: "Я попробую." },
    ],
  },
  {
    id: "m3-frame-shumma-card",
    type: "narrative",
    visual: { kind: "frame", frame: { title: "SHUMMA", slots: [{ key: "type", value: "???" }, { key: "purpose", value: "???" }, { key: "stability", value: "NO" }, { key: "annoying", value: "TRUE" }] } },
    lines: [
      { speaker: "shumma", text: "Последнее субъективно." },
      { speaker: "zara", text: "Нет." },
    ],
  },
  {
    id: "m3-concept-slot",
    type: "conceptCard",
    term: "SLOT",
    termRu: "СЛОТ",
    definition: "Именованная характеристика объекта во фрейме, принимающая конкретное значение (slot value).",
    extra: ["type", "location", "temperature", "thrust", "fuel", "state"],
    conceptId: "slot",
  },
  {
    id: "m3-frame-template",
    type: "narrative",
    visual: { kind: "ascii", ascii: "FRAME: ENGINE\nid:\ntype:\nlocation:\ntemperature:\npower:\nstate:\n\n→ ENGINE-1, ENGINE-2, ENGINE-3" },
    lines: [{ speaker: "zara", text: "Один шаблон — много конкретных объектов." }],
  },
  {
    id: "m3-concept-default",
    type: "conceptCard",
    term: "DEFAULT VALUE",
    termRu: "ЗНАЧЕНИЕ ПО УМОЛЧАНИЮ",
    definition: "Типичное значение, которое можно использовать, пока не получены более точные данные.",
    extra: ["FRAME: AIRLOCK", "state: CLOSED", "pressure_equalized: TRUE", "locked: TRUE"],
    conceptId: "default-value",
  },
  {
    id: "m3-default-joke",
    type: "narrative",
    lines: [
      { speaker: "zara", text: "Значение по умолчанию — предположение. Не абсолютная истина." },
      { speaker: "ada", text: "Спасибо." },
      { speaker: "shumma", text: "Мне тоже нравится идея считать предположение истиной." },
      { speaker: "ada", text: "Тебя никто не спрашивал." },
    ],
  },
  {
    id: "m3-frame-builder",
    type: "match",
    prompt: "Собери фрейм двигателя №2: сопоставь слот и его значение.",
    pairs: [
      { id: "id", left: "id", right: "ENGINE-02" },
      { id: "type", left: "type", right: "ION" },
      { id: "location", left: "location", right: "DECK-B" },
      { id: "temperature", left: "temperature", right: "81 °C" },
      { id: "thrust", left: "thrust", right: "64 %" },
      { id: "fuel", left: "fuel", right: "47 %" },
      { id: "state", left: "state", right: "ACTIVE" },
    ],
  },
  {
    id: "m3-worldmodel",
    type: "narrative",
    visual: {
      kind: "network",
      network: {
        nodes: [
          { id: "ax", label: "AXIOMA", x: 160, y: 100 },
          { id: "ps", label: "POWER", x: 60, y: 40 },
          { id: "ls", label: "LIFE SUPPORT", x: 260, y: 40 },
          { id: "nav", label: "NAV", x: 60, y: 160 },
          { id: "crew", label: "CREW", x: 260, y: 160 },
        ],
        edges: [
          { from: "ax", to: "ps" },
          { from: "ax", to: "ls" },
          { from: "ax", to: "nav" },
          { from: "ax", to: "crew" },
        ],
      },
    },
    lines: [
      { speaker: "zara", text: "Мы строим внутреннюю модель мира ЭХО." },
      { speaker: "shumma", text: "Вы всё подписываете. Всё связываете. Всё раскладываете по местам." },
      { speaker: "shumma", text: "Зачем?" },
      { speaker: "shumma", text: "Ты правда думаешь, что сможешь описать весь этот корабль?" },
    ],
    cta: "ПОПРОБУЮ",
  },
  {
    id: "m3-worldmodel-after",
    type: "narrative",
    lines: [
      { speaker: "shumma", text: "Хорошо." },
      { speaker: "shumma", text: "Тогда мне хотя бы будет не скучно." },
    ],
  },
  {
    id: "m3-manual-limit",
    type: "narrative",
    visual: { kind: "ascii", ascii: "FACTS: 125 441\nRULES: 18 204" },
    lines: [
      { speaker: "bit", text: "Осталось вручную описать Вселенную." },
      { speaker: "zara", text: "Вот здесь и возникает проблема." },
    ],
  },
  {
    id: "m3-manual-limit-big",
    type: "narrative",
    visual: { kind: "bigText", bigText: "ЗНАНИЯ ДОРОГО ОПИСЫВАТЬ ВРУЧНУЮ" },
    lines: [{ speaker: "zara", text: "Каждый факт, каждое правило кто-то должен был заметить, сформулировать и записать." }],
  },
  {
    id: "m3-rules-break",
    type: "narrative",
    visual: { kind: "ascii", ascii: "IF temperature > 100\nTHEN overheating\n\ntemperature = 98\npressure = 0.61\nvibration = high\npower = 92 %\ncoolant = unstable" },
    lines: [
      { speaker: "shumma", text: "Ну? Какое правило теперь?" },
      { speaker: "zara", text: "Именно. Реальные зависимости могут быть гораздо сложнее." },
    ],
  },
  {
    id: "m3-limits",
    type: "narrative",
    visual: { kind: "ascii", ascii: "EXPLICIT RULES\n\n✓ understandable\n✓ controllable\n✓ explainable\n\n✗ expensive to write\n✗ difficult to scale\n✗ brittle in complex environments" },
    lines: [{ speaker: "zara", text: "Символические системы прозрачны, но дорого и хрупко масштабируются." }],
  },
  {
    id: "m3-bridge-learning",
    type: "narrative",
    visual: { kind: "flow", flow: [{ label: "EXAMPLES" }, { label: "MODEL" }, { label: "LEARNED PATTERN" }] },
    lines: [
      { speaker: "zara", text: "А что если не описывать каждое правило вручную?" },
      { speaker: "zara", text: "Что если показать ЭХО множество примеров — и позволить ему самому найти закономерность?" },
      { speaker: "echo", text: "Я могу научиться?" },
      { speaker: "shumma", text: "Ш-ш-ш… Поспорим, у тебя не получится?" },
      { speaker: "echo", text: "Недостаточно данных для оценки вероятности." },
      { speaker: "shumma", text: "Уже нравится." },
    ],
  },
  {
    id: "m3-quiz",
    type: "miniLab",
    title: "ФИНАЛЬНАЯ ПРОВЕРКА",
    items: [
      {
        id: "q1",
        prompt: "Что добавляет знание к информации?",
        options: [
          { id: "a", label: "Понимание смысла и следствий" },
          { id: "b", label: "Больший размер файла" },
          { id: "c", label: "Красивое оформление" },
        ],
        correctId: "a",
      },
      {
        id: "q2",
        prompt: "Факт удобно представлять как...",
        options: [
          { id: "a", label: "Subject → Relation → Object" },
          { id: "b", label: "Случайный набор слов" },
          { id: "c", label: "Только число" },
        ],
        correctId: "a",
      },
      {
        id: "q3",
        prompt: "Что такое inference (вывод)?",
        options: [
          { id: "a", label: "Хранение файлов" },
          { id: "b", label: "Получение новых утверждений из известных знаний" },
          { id: "c", label: "Удаление данных" },
        ],
        correctId: "b",
      },
      {
        id: "q4",
        prompt: "Фрейм — это...",
        options: [
          { id: "a", label: "Структура из слотов, описывающая объект" },
          { id: "b", label: "Тип данных для чисел" },
          { id: "c", label: "Способ сжатия изображений" },
        ],
        correctId: "a",
      },
      {
        id: "q5",
        prompt: "Значение по умолчанию — это...",
        options: [
          { id: "a", label: "Абсолютная истина" },
          { id: "b", label: "Предположение, пока нет точных данных" },
          { id: "c", label: "Ошибка системы" },
        ],
        correctId: "b",
      },
    ],
  },
  {
    id: "m3-final-rule-choice",
    type: "choice",
    prompt:
      "Reactor-1: temperature = 106 °C (critical = 100 °C), coolant_pressure = 0.72 atm (normal = 1.0 atm). Какое правило здесь уместно?",
    options: [
      {
        id: "a",
        label: "IF temperature > critical AND coolant_pressure < normal THEN overheating_risk = HIGH",
      },
      { id: "b", label: "IF temperature > 0 THEN overheating_risk = HIGH" },
      { id: "c", label: "IF coolant_pressure > normal THEN overheating_risk = HIGH" },
    ],
    correctId: "a",
    correctFeedback: "Реактор работает выше критической температуры при недостаточном давлении охлаждения — risk = HIGH.",
    afterLines: [
      { speaker: "shumma", text: "Неплохо." },
      { speaker: "zara", text: "Это сейчас была похвала?" },
      { speaker: "shumma", text: "Я сказал «неплохо». Не разрушай момент." },
    ],
  },
  {
    id: "m3-map",
    type: "knowledgeMap",
    nodes: [
      { label: "DATA", state: "done" },
      { label: "INFORMATION", state: "done" },
      { label: "KNOWLEDGE", state: "done" },
      { label: "LEARNING", state: "locked" },
    ],
    lines: [{ speaker: "zara", text: "Карта ядра ЭХО растёт с каждым модулем." }],
  },
  {
    id: "m3-unlock",
    type: "capabilityUnlock",
    capability: "KNOWLEDGE REPRESENTATION",
    echoLine:
      "Я различаю данные, информацию и знания. Я могу хранить объекты, их свойства, отношения и правила и выполнять простые выводы. Однако большая часть моих знаний была введена вручную.",
    lines: [{ speaker: "zara", text: "И это наша следующая проблема." }],
  },
  {
    id: "m3-math-bridge",
    type: "narrative",
    visual: { kind: "ascii", ascii: "RULE #1\nRULE #2\nRULE #3\n...\nRULE #18421" },
    lines: [
      { speaker: "bit", text: "Я свободен ближайшие сорок три года." },
      { speaker: "shumma", text: "Не волнуйся. За сорок три года половина правил устареет." },
      { speaker: "zara", text: "Спасибо, Шумма." },
      { speaker: "shumma", text: "Всегда пожалуйста." },
    ],
  },
  {
    id: "m3-math-bridge2",
    type: "narrative",
    visual: { kind: "ascii", ascii: "•   • •\n   •    •\n•     •" },
    lines: [
      {
        speaker: "zara",
        text: "Если мы хотим, чтобы ЭХО учился сам, ему нужен другой язык — язык, на котором можно описывать закономерности.",
      },
    ],
  },
  {
    id: "m3-math-bridge3",
    type: "narrative",
    visual: { kind: "ascii", ascii: "ЧИСЛА\n\nVARIABLES\nFUNCTIONS\nCOORDINATES\nVECTORS\nMATRICES" },
    lines: [
      { speaker: "zara", text: "Математика." },
      { speaker: "bit", text: "Я знал, что где-то будет подвох." },
      { speaker: "shumma", text: "Я тоже. Поэтому и остался." },
    ],
  },
];
