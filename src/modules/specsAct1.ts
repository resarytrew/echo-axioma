import { ModuleSpec } from "./types";

export const act1Specs: ModuleSpec[] = [
  {
    id: "a1-m1",
    act: 1,
    index: 1,
    title: "Числа и операции",
    summary: "От школьной арифметики к входам нейронов.",
    playable: true,
    understand: [
      {
        id: "a1m1-u1",
        type: "narrative",
        visual: { kind: "ascii", ascii: "VARIABLES\nFUNCTIONS\nCOORDINATES\nVECTORS\nMATRICES" },
        lines: [
          { speaker: "zara", text: "Если ЭХО должен учиться сам, все наши «понимания» нужно перевести в числа и операции." },
          { speaker: "bit", text: "Числа я люблю. Особенно круглые." },
          { speaker: "zara", text: "Число в компьютере — это просто ячейка памяти. Вся магия — в том, как мы эти ячейки складываем и умножаем." },
        ],
      },
    ],
    hands: [
      {
        id: "h1",
        prompt: "Температура реактора растёт на 3.5 °C каждый цикл. За 4 цикла прирост равен…",
        options: [
          { id: "a", label: "7 °C" },
          { id: "b", label: "14 °C" },
          { id: "c", label: "10.5 °C" },
        ],
        correctId: "b",
      },
      {
        id: "h2",
        prompt: "ЭХО видит 3 датчика по 128 значений. Сколько всего значений?",
        options: [
          { id: "a", label: "131" },
          { id: "b", label: "384" },
          { id: "c", label: "256" },
        ],
        correctId: "b",
      },
    ],
    code: {
      title: "Функция масштабирования",
      brief: "Напиши функцию scale(value, k), которая умножает значение датчика на коэффициент калибровки.",
      starter: "function scale(value, k) {\n  // верни value * k\n}\n",
      tests: [
        { name: "scale(2, 3) === 6", code: "scale(2,3) === 6" },
        { name: "scale(0.5, 100) === 50", code: "scale(0.5,100) === 50" },
        { name: "scale(-4, 0.25) === -1", code: "scale(-4,0.25) === -1" },
      ],
      hint: "Нужен return и оператор умножения.",
    },
    result: {
      title: "Числа освоены",
      body: [
        "ЭХО теперь имеет примитивные арифметические операции.",
        "Следующий шаг — превратить операции в функции, описывающие зависимости.",
      ],
      capability: "SCALAR OPS",
    },
  },
  {
    id: "a1-m4",
    act: 1,
    index: 4,
    title: "Функции",
    summary: "y = f(x): как описать правила корабля математически.",
    playable: true,
    understand: [
      {
        id: "a1m4-u1",
        type: "narrative",
        lines: [
          { speaker: "zara", text: "Функция — это правило: на вход число или набор чисел, на выходе — результат." },
          { speaker: "zara", text: "Дорогие правила «если…то…» из базы знаний мы заменяем вычислимыми функциями." },
        ],
      },
      {
        id: "a1m4-u2",
        type: "conceptCard",
        term: "FUNCTION",
        termRu: "ФУНКЦИЯ",
        definition: "Правило, сопоставляющее каждому входу x ровно один выход: y = f(x).",
        simple: "двигатель принимает топливо и отдаёт тягу — это функция.",
        conceptId: "function",
      },
    ],
    hands: [
      {
        id: "h1",
        prompt: "f(x) = 2x² + 1. Чему равно f(3)?",
        options: [
          { id: "a", label: "13" },
          { id: "b", label: "19" },
          { id: "c", label: "37" },
        ],
        correctId: "b",
      },
      {
        id: "h2",
        prompt: "f(x) = max(0, x). f(-0.7) = ?",
        options: [
          { id: "a", label: "-0.7" },
          { id: "b", label: "0" },
          { id: "c", label: "0.7" },
        ],
        correctId: "b",
      },
    ],
    code: {
      title: "Сигмоида",
      brief: "Напиши функцию sigmoid(x) = 1 / (1 + e^-x). Она сжимает любое число в диапазон (0; 1).",
      starter: "function sigmoid(x) {\n  // используй Math.exp\n}\n",
      tests: [
        { name: "sigmoid(0) ≈ 0.5", code: "Math.abs(sigmoid(0)-0.5) < 1e-9" },
        { name: "sigmoid(10) > 0.999", code: "sigmoid(10) > 0.999" },
        { name: "sigmoid(-10) < 0.001", code: "sigmoid(-10) < 0.001" },
      ],
      hint: "return 1 / (1 + Math.exp(-x))",
    },
    result: {
      title: "Функции встроены в ядро",
      body: ["ЭХО умеет вычислять правила зависимостей."],
      capability: "FUNCTION ENGINE",
    },
  },
  {
    id: "a1-m6",
    act: 1,
    index: 6,
    title: "Векторы",
    summary: "Состояние системы как набор координат.",
    playable: true,
    understand: [
      {
        id: "a1m6-u1",
        type: "narrative",
        lines: [
          { speaker: "zara", text: "Один датчик — число. Много датчиков — вектор: упорядоченный набор чисел." },
          { speaker: "zara", text: "Температура, давление и тяга двигателя вместе образуют вектор состояния [T, p, F]." },
        ],
      },
    ],
    see: {
      title: "Вектор в пространстве",
      description: "Состояние двигателя = точка в 3D. Измени показания — вектор изменится.",
      sliders: [
        { id: "x", label: "T температуры", min: -2, max: 2, step: 0.1, value: 1.2 },
        { id: "y", label: "p давления", min: -2, max: 2, step: 0.1, value: 1.6 },
        { id: "z", label: "F тяги", min: -2, max: 2, step: 0.1, value: 0.8 },
      ],
      build: (p) => ({
        vectors: [{ to: [p.x, p.y, p.z], color: "#0284c7", label: "состояние" }],
        points: [{ p: [p.x, p.y, p.z], color: "#f59e0b", label: `[${p.x}, ${p.y}, ${p.z}]` }],
      }),
      note: (p) =>
        `длина вектора = √(${p.x}² + ${p.y}² + ${p.z}²) ≈ ${Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z).toFixed(2)}`,
      goal: {
        task: "Приведите вектор состояния в точку [1.0, −1.0, 0.0]: двигатель охлаждён, давление ниже нормы, тяга нулевая.",
        check: (p) => Math.abs(p.x - 1) < 0.06 && Math.abs(p.y + 1) < 0.06 && Math.abs(p.z) < 0.06,
        progress: (p) =>
          `расстояние до цели = ${Math.hypot(p.x - 1, p.y + 1, p.z).toFixed(2)} (нужно < 0.06)`,
        done: "Вектор состояния установлен. Три числа полностью задают положение системы в пространстве.",
      },
    },
    hands: [
      {
        id: "h1",
        prompt: "Дано: a = [1, 2, 3], b = [4, 0, -1]. Вычисли a + b.",
        options: [
          { id: "a", label: "[5, 2, 2]" },
          { id: "b", label: "[4, 2, 3]" },
          { id: "c", label: "[1, 2, -4]" },
        ],
        correctId: "a",
      },
      {
        id: "h2",
        prompt: "Скалярное произведение a·b для тех же векторов:",
        options: [
          { id: "a", label: "7" },
          { id: "b", label: "1" },
          { id: "c", label: "-1" },
        ],
        correctId: "b",
      },
    ],
    code: {
      title: "Сложение векторов",
      brief: "Напиши addVec(a, b), возвращающую покомпонентную сумму двух массивов одинаковой длины.",
      starter: "function addVec(a, b) {\n  // верни новый массив [a0+b0, a1+b1, ...]\n}\n",
      tests: [
        { name: "[1,2]+[3,4] = [4,6]", code: "JSON.stringify(addVec([1,2],[3,4])) === '[4,6]'" },
        { name: "[0,-5]+[1,5] = [1,0]", code: "JSON.stringify(addVec([0,-5],[1,5])) === '[1,0]'" },
      ],
      hint: "Пройдись циклом по индексам.",
    },
    result: {
      title: "Векторное представление включено",
      body: ["ЭХО видит системы корабля векторами и умеет работать с ними как с единым объектом."],
      capability: "VECTOR STATE",
    },
  },
  {
    id: "a1-m7",
    act: 1,
    index: 7,
    title: "Операции с векторами",
    summary: "Сложение, масштабирование, скалярное произведение — язык состояния станции.",
    playable: true,
    understand: [
      {
        id: "a1m7-u1",
        type: "narrative",
        lines: [
          { speaker: "zara", text: "Складывать векторы — значит соединять шаги движения. Именно так ЭХО прокладывает маршрут дрона." },
          { speaker: "bit", text: "А умножать на число — растягивать и сжимать. Мой маршрут не сжимайте." },
          { speaker: "zara", text: "Скалярное произведение измеряет, насколько два направления согласованы: a·b = Σ aᵢbᵢ." },
        ],
      },
    ],
    see: {
      title: "Сумма векторов",
      description: "Два маневра дрон составляет покомпонентно: c = a + b.",
      sliders: [
        { id: "ax", label: "a.x", min: -2, max: 2, step: 0.1, value: 1.5 },
        { id: "ay", label: "a.y", min: -2, max: 2, step: 0.1, value: 0.4 },
        { id: "bx", label: "b.x", min: -2, max: 2, step: 0.1, value: 0.4 },
        { id: "by", label: "b.y", min: -2, max: 2, step: 0.1, value: 1.1 },
      ],
      build: (p) => ({
        vectors: [
          { to: [p.ax, p.ay, 0], color: "#94a3b8", label: "a" },
          { from: [p.ax, p.ay, 0], to: [p.ax + p.bx, p.ay + p.by, 0], color: "#b45309", label: "b" },
          { to: [p.ax + p.bx, p.ay + p.by, 0], color: "#0284c7", label: "a+b" },
        ],
      }),
      note: (p) => `a·b = ${(p.ax * p.bx + p.ay * p.by).toFixed(2)}`,
      goal: {
        task: "Подберите манёвры a и b так, чтобы дрон попал в точку (2.0, 1.5): сумма a + b должна достичь цели.",
        check: (p) => Math.hypot(p.ax + p.bx - 2, p.ay + p.by - 1.5) < 0.12,
        progress: (p) =>
          `a+b = (${(p.ax + p.bx).toFixed(1)}, ${(p.ay + p.by).toFixed(1)}), промах ${Math.hypot(p.ax + p.bx - 2, p.ay + p.by - 1.5).toFixed(2)}`,
        done: "Цель достигнута сложением векторов — ровно так дрон строит маршрут из отдельных шагов.",
      },
    },
    code: {
      title: "Длина вектора",
      brief: "Реализуй norm(v) = √(Σ vᵢ²) — длину маневра.",
      starter: "function norm(v) {\n  // сумма квадратов, корень\n}\n",
      tests: [
        { name: "norm([3,4]) === 5", code: "Math.abs(norm([3,4]) - 5) < 1e-9" },
        { name: "norm([1,2,2]) === 3", code: "Math.abs(norm([1,2,2]) - 3) < 1e-9" },
      ],
      hint: "Math.sqrt(sum).",
    },
    result: {
      title: "Векторная алгебра принята",
      body: ["ЭХО складывает манёвры, измеряет их длину и согласованность направлений."],
      capability: "VECTOR OPS",
    },
  },
  {
    id: "a1-m9",
    act: 1,
    index: 9,
    title: "Матрицы",
    summary: "Таблицы чисел — преобразования целых векторов состояния.",
    playable: true,
    understand: [
      {
        id: "a1m9-u1",
        type: "narrative",
        lines: [
          { speaker: "zara", text: "Матрица — это таблица чисел. Но важнее думать о ней как о машине, превращающей один вектор в другой: y = W·x." },
          { speaker: "bit", text: "Машина, которая жуёт векторы. Я такую уже видел в ангаре." },
          { speaker: "zara", text: "Именно эта машина будет скелетом нейрона." },
        ],
      },
      {
        id: "a1m9-u2",
        type: "conceptCard",
        term: "MATRIX",
        termRu: "МАТРИЦА",
        definition: "Прямоугольная таблица чисел, задающая линейное преобразование векторов: y = W·x.",
        simple: "каждая строка матрицы — свой взгляд на входной вектор.",
        conceptId: "matrix",
      },
    ],
    see: {
      title: "Матрица преобразует вектор",
      description: "Двигай входной вектор — синий отклик W·x поворачивает и масштабирует его.",
      sliders: [
        { id: "x", label: "x", min: -2, max: 2, step: 0.1, value: 1 },
        { id: "y", label: "y", min: -2, max: 2, step: 0.1, value: 1 },
      ],
      build: (p) => {
        const X = [p.x, p.y, 0] as [number, number, number];
        const Wx: [number, number, number] = [
          0.7 * p.x - 0.7 * p.y,
          0.7 * p.x + 0.7 * p.y,
          0.35 * p.y,
        ];
        return {
          vectors: [
            { to: X, color: "#94a3b8", label: "x" },
            { to: Wx, color: "#0284c7", label: "W·x" },
          ],
        };
      },
      note: (p) =>
        `W·x = [${(0.7 * p.x - 0.7 * p.y).toFixed(2)}, ${(0.7 * p.x + 0.7 * p.y).toFixed(2)}, ${(0.35 * p.y).toFixed(2)}]`,
      goal: {
        task: "Найдите вход x, при котором первая компонента отклика W·x обращается в ноль. Что это говорит о строке матрицы?",
        check: (p) => Math.abs(0.7 * p.x - 0.7 * p.y) < 0.05 && Math.hypot(p.x, p.y) > 0.4,
        progress: (p) => `(W·x)₁ = ${(0.7 * p.x - 0.7 * p.y).toFixed(2)} — добейтесь значения около нуля при ненулевом x`,
        done: "Первая строка матрицы «не видит» направление x = y: любое такое состояние даёт нулевой отклик.",
      },
    },
    hands: [
      {
        id: "h1",
        prompt: "W = [[2, 0], [0, 3]], x = [1, 1]. Чему равен W·x?",
        options: [
          { id: "a", label: "[2, 3]" },
          { id: "b", label: "[3, 2]" },
          { id: "c", label: "[1, 1]" },
        ],
        correctId: "a",
      },
    ],
    code: {
      title: "Скалярное произведение",
      brief: "Напиши dot(a, b) — сумму попарных произведений компонент. Это сердце каждого нейрона.",
      starter: "function dot(a, b) {\n  // a[0]*b[0] + a[1]*b[1] + ...\n}\n",
      tests: [
        { name: "dot([1,2],[3,4]) === 11", code: "dot([1,2],[3,4]) === 11" },
        { name: "dot([2,0],[-1,5]) === -2", code: "dot([2,0],[-1,5]) === -2" },
      ],
      hint: "Накапливай сумму в цикле.",
    },
    result: {
      title: "Линейные преобразования освоены",
      body: ["ЭХО может преобразовывать векторы состояния матрицами — фундамент нейрона."],
      capability: "LINEAR TRANSFORM",
    },
  },
];
