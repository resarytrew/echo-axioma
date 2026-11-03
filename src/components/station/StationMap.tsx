import { useState } from "react";
import { Station3D } from "./Station3D";
import { Colony, Sector } from "../../game/station";
import { CapabilityRecord, InstalledAlgorithm } from "../../game/progress";

export function StationMap({ sectors, resources, onSector, onBack, onAcademy }: {
  sectors: Sector[]; resources: Colony; capabilities: CapabilityRecord[]; installed: InstalledAlgorithm[]; onSector: (s: Sector) => void; onBack: () => void; onAcademy: () => void;
}) {
  const [selectedId, setSelectedId] = useState("sensor");
  const selected = sectors.find(s => s.id === selectedId) ?? sectors[0];
  const completed = selected.state === "restored" || selected.state === "upgraded";
  return <main className="exo-station exo-world">
    <header className="exo-bar"><button className="exo-wordmark" onClick={onBack} aria-label="Главное меню">ЭХО</button><div className="exo-brand">Станция «Аксиома»<small>Орбитальный исследовательский комплекс</small></div><nav><button className="active">⌂ <span>Станция</span></button><button onClick={onAcademy}>▤ <span>Академия</span></button><button onClick={onBack}>☰ <span>Меню</span></button></nav><div className="exo-resources"><Resource label="Энергия" value={resources.energy}/><Resource label="Вычисления" value={resources.compute}/><Resource label="Тех. состояние" value={resources.tech}/></div></header>
    <div className="exo-station-body">
      <aside className="exo-sidebar"><section className="exo-panel exo-task"><div className="exo-panel-title"><span>◈</span> Текущая задача</div><div className="exo-panel-inner"><h1>{completed ? "Сектор восстановлен" : selected.id === "sensor" ? "Ложная тревога" : selected.name}</h1><p>{selected.id === "sensor" ? "Диагностировать причину нестабильных показаний кислорода и восстановить работу системы наблюдения." : selected.role}</p>{selected.id === "sensor" && <ul><li className={completed ? "done" : "current"}>Изучить данные датчиков</li><li className={completed ? "done" : ""}>Построить алгоритм диагностики</li><li className={completed ? "done" : ""}>Протестировать решение</li><li className={completed ? "done" : ""}>Внедрить алгоритм</li></ul>}</div></section>
      {selected.id === "nav" && <button className="exo-primary station-sector-action" onClick={() => onSector(selected)}>Открыть задание навигации <b>→</b></button>}
      <section className="exo-panel exo-sectors"><div className="exo-panel-title"><span>⌘</span> Станция <small>{sectors.length} ОТСЕКОВ</small></div><div className="exo-sector-list">{sectors.map(s => <button key={s.id} onClick={() => setSelectedId(s.id)} className={s.id === selectedId ? "selected" : ""}><span className={s.state === "damaged" ? "sector-alert" : ""}>{s.state === "isolated" ? "⊘" : s.state === "damaged" ? "◈" : "◇"}</span><span>{s.name}</span>{s.alert && <i/>}</button>)}</div></section></aside>
      <section className="exo-scene exo-scene-3d" aria-label="Исследование станции">
        <Station3D restored={["restored", "upgraded"].includes(sectors.find(s => s.id === "sensor")?.state ?? "")} onInteract={(id) => {
          if (id === "academy") { onAcademy(); return; }
          if (id === "core") { setSelectedId("core"); return; }
          const sector = sectors.find(s => s.id === id);
          if (sector) { setSelectedId(id); if (sector.state !== "isolated") onSector(sector); }
        }} />
      </section>
    </div>
  </main>;
}
function Resource({label, value}: {label:string; value:number}) { return <div className="exo-resource"><span>{label}</span><strong>{value}%</strong><div><i style={{width: `${value}%`}} /></div></div>; }

