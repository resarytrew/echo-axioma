export type SectorState = "isolated" | "damaged" | "restored" | "upgraded";

export interface Sector {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  state: SectorState;
  alert?: string;
}

export interface Colony {
  energy: number;
  compute: number;
  tech: number;
}

export const INITIAL_RESOURCES: Colony = { energy: 64, compute: 38, tech: 41 };

export const INITIAL_SECTORS: Sector[] = [
  {
    id: "core",
    name: "Центральное ядро",
    role: "Ядро ЭХО · инженерный терминал",
    x: 320,
    y: 210,
    state: "restored",
  },
  {
    id: "sensor",
    name: "Сенсорный отсек",
    role: "Датчики работают несогласованно",
    x: 520,
    y: 110,
    state: "damaged",
    alert: "ТРЕВОГА: падение O₂",
  },
  {
    id: "nav",
    name: "Навигационная рубка",
    role: "Ошибочные координаты",
    x: 560,
    y: 300,
    state: "damaged",
  },
  {
    id: "life",
    name: "Жизнеобеспечение",
    role: "Нестабильное регулирование",
    x: 420,
    y: 430,
    state: "damaged",
  },
  {
    id: "lab",
    name: "Вычислительная лаборатория",
    role: "Повреждены учебные модели",
    x: 200,
    y: 420,
    state: "damaged",
  },
  {
    id: "comms",
    name: "Коммуникационный узел",
    role: "Каналы перегружены",
    x: 90,
    y: 280,
    state: "isolated",
  },
  {
    id: "archive",
    name: "Архив памяти",
    role: "Нарушены связи между событиями",
    x: 180,
    y: 90,
    state: "isolated",
  },
];

export const SECTOR_STATE_LABEL: Record<SectorState, string> = {
  isolated: "ИЗОЛИРОВАН",
  damaged: "ПОВРЕЖДЁН",
  restored: "ВОССТАНОВЛЕН",
  upgraded: "МОДЕРНИЗИРОВАН",
};
