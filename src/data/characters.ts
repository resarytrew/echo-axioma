import { CharacterId } from "../types/scenario";

export interface CharacterInfo {
  id: CharacterId;
  name: string;
  role: string;
  avatar?: string;
  color: string;
  accent: string;
}

export const CHARACTERS: Record<CharacterId, CharacterInfo> = {
  zara: {
    id: "zara",
    name: "Зара Кроу",
    role: "Главный инженер систем",
    avatar: import.meta.env.BASE_URL + "avatars/zara.png",
    color: "#0f766e",
    accent: "#ccfbf1",
  },
  bit: {
    id: "bit",
    name: "Бит",
    role: "Сервисный дрон",
    avatar: import.meta.env.BASE_URL + "avatars/bit.png",
    color: "#b45309",
    accent: "#fef3c7",
  },
  shumma: {
    id: "shumma",
    name: "Шумма",
    role: "Неопознанный процесс",
    avatar: import.meta.env.BASE_URL + "avatars/shumma.png",
    color: "#a21caf",
    accent: "#fae8ff",
  },
  ada: {
    id: "ada",
    name: "Ада",
    role: "Специалист по базам знаний",
    avatar: import.meta.env.BASE_URL + "avatars/ada.png",
    color: "#4d7c0f",
    accent: "#ecfccb",
  },
  echo: {
    id: "echo",
    name: "ЭХО",
    role: "Бортовой ИИ «Аксиомы»",
    avatar: import.meta.env.BASE_URL + "avatars/echo.png",
    color: "#0369a1",
    accent: "#e0f2fe",
  },
  system: {
    id: "system",
    name: "AXIOMA SYSTEM",
    role: "Системное сообщение",
    color: "#334155",
    accent: "#f1f5f9",
  },
};
