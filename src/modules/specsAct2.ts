import { ModuleSpec } from "./types";

export const act2Specs: ModuleSpec[] = [
  {
    id: "a2-m1",
    act: 2,
    index: 1,
    title: "Нейрон",
    summary: "Клетка интеллекта: взвешенная сумма + нелинейность.",
    playable: true,
    understand: [
      {
        id: "a2m1-u1",
        type: "narrative",
        visual: { kind: "ascii", ascii: "y = f( w₁x₁ + w₂x₂ + w₃x₃ + b )" },
        lines: [
          { speaker: "zara", text: "Нейрон — это скалярное произведение вектора входа на вектор весов, смещение и нелинейная функция." },
          { speaker: "shumma", text: "Взвесил, сложил, сжал. Готово искусство." },
          { speaker: "zara", text: "Почти. Веса мы ещё не выбрали. Их будет находить обучение." },
        ],
      },
      {
        id: "a2m1-u2",
        type: "conceptCard",
        term: "NEURON",
        termRu: "НЕЙРОН",
        definition: "y = f(w·x + b): взвешенная сумма входов с обучаемыми весами w, смещением b и функцией активации f.",
        conceptId: "neuron",
      },
    ],
    hands: [
      {
        id: "h1",
        prompt: "w = [2, -1], x = [3, 4], b = 0.5. Сумма w·x + b = ?",
        options: [
          { id: "a", label: "2.5" },
          { id: "b", label: "2.5" },
          { id: "c", label: "10.5" },
        ],
        correctId: "b",
      },
      {
        id: "h2",
        prompt: "Пропустим 2.5 через f = max(0,·) (ReLU). Результат:",
        options: [
          { id: "a", label: "0" },
          { id: "b", label: "2.5" },
          { id: "c", label: "-6.5" },
        ],
        correctId: "b",
      },
    ],
    code: {
      title: "Нейрон на JS",
      brief: "Реализуй neuron(w, x, b) = relu(dot(w, x) + b). dot уже известна.",
      starter:
        "function dot(a, b) {\n  let s = 0;\n  for (let i = 0; i < a.length; i++) s += a[i] * b[i];\n  return s;\n}\n\nfunction neuron(w, x, b) {\n  // relu(dot(w, x) + b)\n}\n",
      tests: [
        { name: "neuron([2,-1],[3,4],0.5) === 2.5", code: "neuron([2,-1],[3,4],0.5) === 2.5" },
        { name: "neuron([0,0],[9,9],-1) === 0", code: "neuron([0,0],[9,9],-1) === 0" },
      ],
      hint: "Math.max(0, s).",
    },
    result: {
      title: "Первый нейрон ЭХО активен",
      body: ["Ядро умеет вычислять элементарные нейроны. Скоро их будут тысячи."],
      capability: "NEURON CELL",
    },
  },
  {
    id: "a2-m3",
    act: 2,
    index: 3,
    title: "Функция потерь",
    summary: "Как измерить, насколько модель неправа.",
    playable: true,
    understand: [
      {
        id: "a2m3-u1",
        type: "narrative",
        lines: [
          { speaker: "zara", text: "Чтобы учиться, модели нужен счётчик ошибок: loss — число, которое тем больше, чем сильнее она ошибается." },
          { speaker: "zara", text: "Средняя квадратичная ошибка: MSE = среднее (предсказание − цель)²." },
          { speaker: "shumma", text: "Квадрат — чтобы ошибки дрались между собой." },
        ],
      },
    ],
    hands: [
      {
        id: "h1",
        prompt: "Предсказания [2, 4], цели [1, 5]. MSE = ?",
        options: [
          { id: "a", label: "1" },
          { id: "b", label: "2" },
          { id: "c", label: "0.5" },
        ],
        correctId: "a",
      },
    ],
    code: {
      title: "MSE",
      brief: "Реализуй mse(pred, target) — среднее квадратов разностей.",
      starter: "function mse(pred, target) {\n  // mean((p - t)^2)\n}\n",
      tests: [
        { name: "mse([2,4],[1,5]) === 1", code: "mse([2,4],[1,5]) === 1" },
        { name: "mse([0],[3]) === 9", code: "mse([0],[3]) === 9" },
      ],
      hint: "Цикл, сумма квадратов, деление на длину.",
    },
    result: {
      title: "Штрафы подключены",
      body: ["ЭХО умеет оценивать качество собственных предсказаний."],
      capability: "LOSS METRIC",
    },
  },
  {
    id: "a2-m4",
    act: 2,
    index: 4,
    title: "Градиент",
    summary: "Направление, в котором ошибка растёт быстрее всего.",
    playable: true,
    understand: [
      {
        id: "a2m4-u1",
        type: "narrative",
        lines: [
          { speaker: "zara", text: "Градиент показывает, как изменение каждого веса повлияет на ошибку." },
          { speaker: "zara", text: "Двигаясь АНТИградиенту, мы ошибку уменьшаем. Это и есть градиентный спуск: w = w − lr·∇w." },
        ],
      },
    ],
    see: {
      title: "Поверхность ошибки",
      description: "Синяя точка — вектор весов w. Красная стрелка — шаг антиградиента к минимуму.",
      sliders: [
        { id: "x", label: "w₁", min: -2.4, max: 2.4, step: 0.1, value: 1.8 },
        { id: "y", label: "w₂", min: -2.4, max: 2.4, step: 0.1, value: 1.6 },
      ],
      build: (p) => {
        const lr = 0.9;
        const gx = 2 * p.x;
        const gy = 2 * p.y;
        const nx = p.x - lr * gx * 0.25;
        const ny = p.y - lr * gy * 0.25;
        return {
          points: [
            { p: [0, 0, 0], color: "#10b981", label: "минимум" },
            { p: [p.x, p.y, 0], color: "#0284c7", label: "w" },
          ],
          vectors: [{ from: [p.x, p.y, 0], to: [nx, ny, 0], color: "#ef4444", label: "шаг −∇" }],
        };
      },
      note: (p) => `loss(w) = w₁² + w₂² = ${(p.x * p.x + p.y * p.y).toFixed(2)}`,
      goal: {
        task: "Найдите веса, при которых ошибка минимальна. Следите за длиной красной стрелки: у минимума градиент обращается в ноль.",
        check: (p) => p.x * p.x + p.y * p.y < 0.05,
        progress: (p) => `loss = ${(p.x * p.x + p.y * p.y).toFixed(2)} — нужно < 0.05`,
        done: "Минимум найден: градиент ≈ 0, шаг спуска сходится к нулю. Именно это ищет обучение.",
      },
    },
    hands: [
      {
        id: "h1",
        prompt: "w = 3, dL/dw = 4 (градиент), lr = 0.1. Новый вес?",
        options: [
          { id: "a", label: "3.4" },
          { id: "b", label: "2.6" },
          { id: "c", label: "7" },
        ],
        correctId: "b",
      },
    ],
    result: {
      title: "Спуск освоен",
      body: ["ЭХО знает, в какую сторону крутить веса."],
      capability: "GRADIENT DESCENT",
    },
  },
  {
    id: "a2-m5",
    act: 2,
    index: 5,
    title: "Градиентный спуск",
    summary: "Итерации: w ← w − lr·∇w. Слишком малый шаг тормозит, слишком большой — разносит систему.",
    playable: true,
    understand: [
      {
        id: "a2m5-u1",
        type: "narrative",
        lines: [
          { speaker: "zara", text: "Градиентный спуск повторяется в цикле: вычисли градиент, сделай шаг против него, повтори." },
          { speaker: "zara", text: "Скорость обучения lr — как чувствительность руля станции: слишком малая — никуда не придёшь, слишком большая — перелетишь минимум и начнёшь колебаться." },
          { speaker: "shumma", text: "Я бы выбрал lr = 42. Только чтобы посмотреть, как оно взрывается." },
          { speaker: "zara", text: "Именно поэтому бюджет экспериментов у стенда, а не у тебя." },
        ],
      },
    ],
    hands: [
      {
        id: "h1",
        prompt: "loss = w², w = 4, lr = 0.25. После одного шага w = ?",
        options: [
          { id: "a", label: "w = 2" },
          { id: "b", label: "w = 3" },
          { id: "c", label: "w = 6" },
        ],
        correctId: "a",
      },
      {
        id: "h2",
        prompt: "Шаг обучения lr слишком большой. Что обычно происходит со значением loss?",
        options: [
          { id: "a", label: "Медленно, но верно уменьшится" },
          { id: "b", label: "Начнёт колебаться или улетит" },
          { id: "c", label: "Замрёт навсегда" },
        ],
        correctId: "b",
      },
    ],
    code: {
      title: "Цикл спуска",
      brief: "Реализуй descent(w, lr, steps): loss = w², градиент dL/dw = 2w. Верни итоговое w.",
      starter:
        "function descent(w, lr, steps) {\n  for (let i = 0; i < steps; i++) {\n    // w = w - lr * 2 * w\n  }\n  return w;\n}\n",
      tests: [
        { name: "спуск сходится: |descent(3, 0.1, 50)| < 0.01", code: "Math.abs(descent(3,0.1,50)) < 0.01" },
        { name: "descent(-2, 0.2, 60) сходится", code: "Math.abs(descent(-2,0.2,60)) < 0.001" },
        { name: "дивергенция при огромном lr: |descent(2, 1.5, 20)| > 100", code: "Math.abs(descent(2,1.5,20)) > 100" },
      ],
      hint: "Одна строка внутри цикла.",
    },
    result: {
      title: "Спуск встроен в цикл ЭХО",
      body: ["ЭХО умеет итеративно снижать ошибку. Дальше — применить это к сети из множества нейронов."],
      capability: "DESCENT LOOP",
    },
  },
  {
    id: "a2-m6",
    act: 2,
    index: 6,
    title: "Backpropagation",
    summary: "Цепное правило: ошибка расходится назад по слоям.",
    playable: true,
    understand: [
      {
        id: "a2m6-u1",
        type: "narrative",
        visual: { kind: "flow", flowDirection: "horizontal", flow: [{ label: "INPUT" }, { label: "NEURON" }, { label: "OUTPUT" }, { label: "LOSS" }] },
        lines: [
          { speaker: "zara", text: "Backprop — это цепное правило производных, прошитое назад: от ошибки к каждому весу." },
          { speaker: "zara", text: "Каждый вес получает градиент: «если тебя подкрутить так, ошибка изменится настолько»." },
          { speaker: "shumma", text: "Переложить вину на невинные веса — классика." },
        ],
      },
      {
        id: "a2m6-u2",
        type: "narrative",
        visual: { kind: "flow", flowDirection: "horizontal", flow: [{ label: "LOSS" }, { label: "∂OUT" }, { label: "∂NEURON" }, { label: "∂W" }] },
        lines: [
          { speaker: "zara", text: "Градиент идёт справа налево: так каждый слой узнаёт свою долю ответственности." },
        ],
      },
    ],
    hands: [
      {
        id: "h1",
        prompt: "y = w·x. dL/dy = 2, x = 3. Чему равен dL/dw?",
        options: [
          { id: "a", label: "5" },
          { id: "b", label: "6" },
          { id: "c", label: "1.5" },
        ],
        correctId: "b",
      },
      {
        id: "h2",
        prompt: "z = x², x = 4, dL/dz = 1. Then dL/dx = ?",
        options: [
          { id: "a", label: "4" },
          { id: "b", label: "8" },
          { id: "c", label: "2" },
        ],
        correctId: "b",
      },
    ],
    result: {
      title: "Обратное распространение встроено",
      body: [
        "Двигатель autograd ЭХО повторяет эту математику для каждого параметра трансформера.",
        "Численная проверка градиентов будет показана на финальном тренировочном цикле.",
      ],
      capability: "AUTODIFF CORE",
    },
  },
];
