import { ModuleSpec } from "./types";

export const act6Specs: ModuleSpec[] = [
  {
    id: "a6-m1",
    act: 6,
    index: 1,
    title: "Внимание",
    summary: "Как токен решает, на какие токены смотреть.",
    playable: true,
    understand: [
      {
        id: "a6m1-u1",
        type: "narrative",
        visual: { kind: "ascii", ascii: "attention(q, K, V) = softmax( q·kᵀ / √d ) · v" },
        lines: [
          { speaker: "zara", text: "Внимание — способ каждой позиции последовательности выбрать, с какими позициями ей общаться." },
          { speaker: "zara", text: "Query спрашивает «что мне нужно?», Key отвечает «что я могу дать?», Value несёт само содержание." },
          { speaker: "zara", text: "Causal attention дополнительно запрещает смотреть в будущее — модель видит только прошлое. Именно так читает будущий генератор." },
        ],
      },
      {
        id: "a6m1-u2",
        type: "conceptCard",
        term: "ATTENTION",
        termRu: "ВНИМАНИЕ",
        definition:
          "Механизм, строящий для каждой позиции взвешенную смесь значений других позиций, где веса — softmax скалярных произведений query·key.",
        conceptId: "attention",
      },
    ],
    hands: [
      {
        id: "h1",
        prompt: "Скалярные произведения текущего токена с ключами: [2, 0, -1]. Какой прошлый токен получит основной вес?",
        options: [
          { id: "a", label: "Первый" },
          { id: "b", label: "Второй" },
          { id: "c", label: "Третий" },
        ],
        correctId: "a",
      },
      {
        id: "h2",
        prompt: "Зачем делить q·k на √d?",
        options: [
          { id: "a", label: "Чтобы softmax не насыщался при больших d" },
          { id: "b", label: "Для красоты формулы" },
          { id: "c", label: "Чтобы замедлить вычисления" },
        ],
        correctId: "a",
      },
    ],
    result: {
      title: "Механизм внимания понят",
      body: ["ЭХО усвоил главный строительный блок Transformer."],
      capability: "ATTENTION CORE",
    },
  },
  {
    id: "a6-m6",
    act: 6,
    index: 6,
    title: "Обучение мини-Transformer",
    summary: "Финальный цикл: ЭХО обучает собственную модель на телеметрии.",
    playable: true,
    trainLab: true,
    understand: [
      {
        id: "a6m6-u1",
        type: "narrative",
        visual: { kind: "ascii", ascii: "ECHO MINI-TRANSFORMER\n\ntok_emb → +pos → [Attention + MLP] ×2 → LayerNorm → Head" },
        lines: [
          { speaker: "zara", text: "Всё сходится: внимание, MLP, LayerNorm, autograd, AdamW — мы соберём их в настоящий маленький Transformer." },
          { speaker: "zara", text: "Он обучится воспроизводить закон переходов телеметрии «Аксиомы». Не иллюзия — реальные градиенты, реальные обновления весов." },
          { speaker: "bit", text: "Четыре с половиной тысячи параметров. Компактно." },
          { speaker: "shumma", text: "Я проверю, не переобучите ли вы его на шум." },
          { speaker: "zara", text: "Для этого — хронологический train/val/test и чекпоинт по validation. Вперёд." },
        ],
      },
    ],
    result: {
      title: "ECHO MINI-TRANSFORMER ONLINE",
      body: ["Модель обучена и прошла оценку на тесте."],
      capability: "GENERATIVE MODEL",
    },
  },
];
