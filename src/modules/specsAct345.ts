import { ModuleSpec } from "./types";

export const act3Specs: ModuleSpec[] = [
  {
    id: "a3-m2",
    act: 3,
    index: 2,
    title: "Переобучение",
    summary: "Модель, выучившая шум наизусть, бесполезна в полёте.",
    playable: true,
    understand: [
      {
        id: "a3m2-u1",
        type: "narrative",
        visual: {
          kind: "compare",
          compareLeft: { title: "UNDERFIT", body: "loss(train) = 2.4\nloss(val)   = 2.5\nНедоучила" },
          compareRight: {
            title: "OVERFIT",
            body: "loss(train) = 0.01\nloss(val)   = 3.8\nВыучила шум",
          },
        },
        lines: [
          { speaker: "zara", text: "Переобучение: модель идеально запоминает примеры тренировки, но ломается на новых данных." },
          { speaker: "zara", text: "Поэтому мы выбираем чекпоинт не по train, а по validation — данным, которых модель не видела при обучении." },
          { speaker: "shumma", text: "Скучные результаты — залог честности." },
        ],
      },
    ],
    hands: [
      {
        id: "h1",
        prompt: "loss(train) = 0.02, loss(val) = 3.1. Что происходит?",
        options: [
          { id: "a", label: "Переобучение" },
          { id: "b", label: "Идеальная модель" },
          { id: "c", label: "Недостаток данных невозможно определить" },
        ],
        correctId: "a",
      },
      {
        id: "h2",
        prompt: "Какую модель выбрать для продакшена?",
        options: [
          { id: "a", label: "С наименьшим train loss" },
          { id: "b", label: "С наименьшим validation loss" },
          { id: "c", label: "Последнюю эпоху всегда" },
        ],
        correctId: "b",
      },
    ],
    result: {
      title: "Протокол честной оценки",
      body: ["Train → val → test: хронологический сплит и выбор чекпоинта по validation работают в тренажёре ЭХО."],
      capability: "HONEST EVALUATION",
    },
  },
];

export const act4Specs: ModuleSpec[] = [
  {
    id: "a4-m1",
    act: 4,
    index: 1,
    title: "Тензоры",
    summary: "Скаляры, векторы, матрицы — частные случаи тензора.",
    playable: true,
    understand: [
      {
        id: "a4m1-u1",
        type: "narrative",
        visual: { kind: "ascii", ascii: "0D scalar\n1D vector\n2D matrix\n3D tensor\n…\nbatch of images" },
        lines: [
          { speaker: "zara", text: "Тензор — обобщение: массив чисел произвольной размерности. В PyTorch и в нашем движке всё построено на тензорах." },
          { speaker: "zara", text: "Каждая операция запоминает, как распространить градиент назад. Это и есть autograd." },
        ],
      },
    ],
    code: {
      title: "Придумай матрицу 2×2",
      brief: "Напиши identity(n), возвращающую единичную матрицу n×n как массив массивов.",
      starter: "function identity(n) {\n  // [[1,0,...],[0,1,...],...]\n}\n",
      tests: [
        { name: "identity(2) верна", code: "JSON.stringify(identity(2)) === '[[1,0],[0,1]]'" },
        { name: "identity(3)[1][1] === 1", code: "identity(3)[1][1] === 1" },
        { name: "identity(4)[0][3] === 0", code: "identity(4)[0][3] === 0" },
      ],
      hint: "Два вложенных цикла, i === j ? 1 : 0.",
    },
    result: {
      title: "Тензорный мозг запущен",
      body: ["ЭХО понимает формы данных и умеет проверять размеры перед операцией."],
      capability: "TENSOR LOGIC",
    },
  },
];

export const act5Specs: ModuleSpec[] = [
  {
    id: "a5-m2",
    act: 5,
    index: 2,
    title: "Эмбеддинги",
    summary: "Каждому объекту — свой вектор смысла.",
    playable: true,
    understand: [
      {
        id: "a5m2-u1",
        type: "narrative",
        lines: [
          { speaker: "zara", text: "Чтобы рекомендовать экипажу задачи, системам — сервисные работы, мы помещаем все сущности в одно векторное пространство." },
          { speaker: "zara", text: "Похожие объекты должны оказаться рядом. Вектор объекта и называют эмбеддингом." },
          { speaker: "shumma", text: "Так вы сажаете весь корабль в одну комнату. Я доволен." },
        ],
      },
      {
        id: "a5m2-u2",
        type: "conceptCard",
        term: "EMBEDDING",
        termRu: "ЭМБЕДДИНГ",
        definition: "Отображение объекта (слова, датчика, члена экипажа) в вектор, где близкие по смыслу объекты оказываются близкими векторами.",
        conceptId: "embedding",
      },
    ],
    see: {
      title: "Пространство смыслов",
      description: "Эмбеддинги систем корабля: близкие по функции узлы кластеризуются вместе.",
      build: () => ({
        points: [
          { p: [1.8, 1.4, 0.5], color: "#0284c7", label: "REACTOR-1" },
          { p: [1.6, 1.8, 0.8], color: "#0284c7", label: "REACTOR-2" },
          { p: [-1.7, 1.5, 0.4], color: "#10b981", label: "OXYGEN" },
          { p: [-1.8, 1.1, 0.7], color: "#10b981", label: "CO₂ SCRUBBER" },
          { p: [0.2, -1.7, 1.6], color: "#f59e0b", label: "NAV GYRO" },
          { p: [0.5, -1.6, -1.4], color: "#f59e0b", label: "STAR TRACKER" },
        ],
      }),
      note: () => "кластеры = скрытые закономерности данных",
    },
    hands: [
      {
        id: "h1",
        prompt: "Косинусная близость a и b, где a·b = 3, |a| = 3, |b| = 2:",
        options: [
          { id: "a", label: "0.5" },
          { id: "b", label: "1.5" },
          { id: "c", label: "0.25" },
        ],
        correctId: "a",
      },
    ],
    code: {
      title: "Cosine similarity",
      brief: "Реализуй cosine(a, b) = dot(a,b) / (|a|·|b|).",
      starter: "function cosine(a, b) {\n  // скалярное произведение / произведение норм\n}\n",
      tests: [
        { name: "cosine([1,0],[1,0]) === 1", code: "Math.abs(cosine([1,0],[1,0]) - 1) < 1e-9" },
        { name: "cosine([1,0],[0,1]) === 0", code: "Math.abs(cosine([1,0],[0,1])) < 1e-9" },
        { name: "cosine([2,2],[1,1]) === 1", code: "Math.abs(cosine([2,2],[1,1]) - 1) < 1e-9" },
      ],
    },
    result: {
      title: "Семантическое пространство построено",
      body: ["ЭХО кластеризует объекты корабля по смыслу и может рекомендовать похожие системы и действия."],
      capability: "EMBEDDING MAP",
    },
  },
];
