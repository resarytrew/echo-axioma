export type CharacterId = "zara" | "bit" | "shumma" | "ada" | "echo" | "system";

export interface Line {
  speaker: CharacterId;
  text: string;
  /** Optional emphasis style for terminal-like echo lines */
  mono?: boolean;
}

export type VisualKind =
  | "ascii"
  | "statusList"
  | "flow"
  | "cards"
  | "table"
  | "compare"
  | "bigText"
  | "graphDown"
  | "frame"
  | "network"
  | "pixel";

export interface StatusItem {
  label: string;
  value: string;
  state?: "online" | "offline" | "unknown" | "warning" | "degraded";
}

export interface FlowStep {
  label: string;
  dim?: boolean;
}

export interface CardItem {
  label: string;
  sub?: string;
}

export interface TableData {
  columns: string[];
  rows: string[][];
}

export interface FrameData {
  title: string;
  slots: { key: string; value: string }[];
}

export interface NetworkNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface NetworkEdge {
  from: string;
  to: string;
  label?: string;
}

export interface Visual {
  kind: VisualKind;
  ascii?: string;
  title?: string;
  items?: StatusItem[];
  flow?: FlowStep[];
  flowDirection?: "vertical" | "horizontal";
  cards?: CardItem[];
  table?: TableData;
  compareLeft?: { title: string; body: string };
  compareRight?: { title: string; body: string };
  bigText?: string;
  bigTextSub?: string;
  graphValues?: number[];
  graphLabel?: string;
  frame?: FrameData;
  network?: { nodes: NetworkNode[]; edges: NetworkEdge[] };
}

interface SceneBase {
  id: string;
  type: string;
  sessionLabel?: string;
}

export interface BootScene extends SceneBase {
  type: "boot";
  lines: string[];
  cta: string;
}

export interface NarrativeScene extends SceneBase {
  type: "narrative";
  visual?: Visual;
  visualPosition?: "top" | "bottom";
  lines: Line[];
  cta?: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  feedback?: string;
}

export interface ChoiceScene extends SceneBase {
  type: "choice";
  prompt: string;
  visual?: Visual;
  options: ChoiceOption[];
  correctId: string;
  correctFeedback: string;
  incorrectFeedback?: string;
  /** Для контрольных вопросов: переход только после верного ответа. */
  requireCorrect?: boolean;
  afterLines?: Line[];
}

export interface MultiSelectScene extends SceneBase {
  type: "multiSelect";
  prompt: string;
  helper?: string;
  options: { id: string; label: string; correct: boolean }[];
  successVisual?: Visual;
  afterLines?: Line[];
}

export interface ClassifyRow {
  id: string;
  cells: string[];
  flag: "none" | "warning" | "danger";
}

export interface ClassifyScene extends SceneBase {
  type: "classify";
  prompt: string;
  columns: string[];
  rows: ClassifyRow[];
  afterLines?: Line[];
}

export interface TextInputScene extends SceneBase {
  type: "textInput";
  term: string;
  prompt: string;
  placeholder: string;
  officialDefinition: string;
}

export interface MatchItem {
  id: string;
  left: string;
  right: string;
}

export interface MatchScene extends SceneBase {
  type: "match";
  prompt: string;
  pairs: MatchItem[];
  afterLines?: Line[];
}

export interface MiniLabItem {
  id: string;
  prompt: string;
  options: ChoiceOption[];
  correctId: string;
  feedback?: string;
  incorrectFeedback?: string;
}

export interface MiniLabScene extends SceneBase {
  type: "miniLab";
  title: string;
  items: MiniLabItem[];
  afterLines?: Line[];
}

export interface ConceptCardScene extends SceneBase {
  type: "conceptCard";
  term: string;
  termRu: string;
  definition: string;
  simple?: string;
  extra?: string[];
  conceptId: string;
}

export interface CapabilityUnlockScene extends SceneBase {
  type: "capabilityUnlock";
  capability: string;
  echoLine: string;
  lines?: Line[];
}

export interface KnowledgeMapScene extends SceneBase {
  type: "knowledgeMap";
  nodes: { label: string; state: "done" | "active" | "locked" }[];
  lines?: Line[];
}

export type Scene =
  | BootScene
  | NarrativeScene
  | ChoiceScene
  | MultiSelectScene
  | ClassifyScene
  | TextInputScene
  | MatchScene
  | MiniLabScene
  | ConceptCardScene
  | CapabilityUnlockScene
  | KnowledgeMapScene;

export interface Module {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  question: string;
  capability: string;
  scenes: Scene[];
}
