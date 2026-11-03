import { Scene } from "../types/scenario";
import { Boot } from "./scenes/Boot";
import { Narrative } from "./scenes/Narrative";
import { ChoiceScene } from "./scenes/ChoiceScene";
import { MultiSelectScene } from "./scenes/MultiSelectScene";
import { ClassifyScene } from "./scenes/ClassifyScene";
import { TextInputScene } from "./scenes/TextInputScene";
import { MatchScene } from "./scenes/MatchScene";
import { MiniLabScene } from "./scenes/MiniLabScene";
import { ConceptCardScene } from "./scenes/ConceptCardScene";
import { CapabilityUnlockScene } from "./scenes/CapabilityUnlockScene";
import { KnowledgeMapScene } from "./scenes/KnowledgeMapScene";

export function SceneEngine({
  scene,
  onAdvance,
}: {
  scene: Scene;
  onAdvance: (payload?: { conceptId?: string; capability?: string; answer?: string }) => void;
}) {
  switch (scene.type) {
    case "boot":
      return <Boot scene={scene} onDone={() => onAdvance()} />;
    case "narrative":
      return <Narrative key={scene.id} scene={scene} onDone={() => onAdvance()} />;
    case "choice":
      return <ChoiceScene key={scene.id} scene={scene} onDone={() => onAdvance()} />;
    case "multiSelect":
      return <MultiSelectScene key={scene.id} scene={scene} onDone={() => onAdvance()} />;
    case "classify":
      return <ClassifyScene key={scene.id} scene={scene} onDone={() => onAdvance()} />;
    case "textInput":
      return (
        <TextInputScene
          key={scene.id}
          scene={scene}
          onDone={(answer) => onAdvance({ answer })}
        />
      );
    case "match":
      return <MatchScene key={scene.id} scene={scene} onDone={() => onAdvance()} />;
    case "miniLab":
      return <MiniLabScene key={scene.id} scene={scene} onDone={() => onAdvance()} />;
    case "conceptCard":
      return (
        <ConceptCardScene
          key={scene.id}
          scene={scene}
          onDone={() => onAdvance({ conceptId: scene.conceptId })}
        />
      );
    case "capabilityUnlock":
      return (
        <CapabilityUnlockScene
          key={scene.id}
          scene={scene}
          onDone={() => onAdvance({ capability: scene.capability })}
        />
      );
    case "knowledgeMap":
      return <KnowledgeMapScene key={scene.id} scene={scene} onDone={() => onAdvance()} />;
    default:
      return null;
  }
}
