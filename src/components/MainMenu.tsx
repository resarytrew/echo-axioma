import { GameProgress, completedModuleIds } from "../game/progress";

export function MainMenu({ progress, hasSave, onCampaign, onAcademy, onLab, onContinue, onReset }: {
  progress: GameProgress; hasSave: boolean; onCampaign: () => void; onAcademy: () => void; onLab: () => void; onContinue: () => void; onReset: () => void;
}) {
  const restored = progress.sectors.filter(s => s.state === "restored" || s.state === "upgraded").length;
  return <main className="exo-menu exo-world">
    <div className="exo-menu-shade" />
    <header className="exo-menu-top"><span className="exo-wordmark">ЭХО</span><span className="exo-divider"/><span>СТАНЦИЯ «АКСИОМА»<small>ОРБИТАЛЬНЫЙ ИССЛЕДОВАТЕЛЬСКИЙ КОМПЛЕКС</small></span><span className="exo-online"><i/> СИСТЕМА В СЕТИ</span></header>
    <section className="exo-menu-content">
      <div className="exo-eyebrow"><span/> ОБРАЗОВАТЕЛЬНОЕ ПРИКЛЮЧЕНИЕ</div>
      <h1>ЭХО</h1><div className="exo-subtitle">ПРОТОКОЛ «АКСИОМА»</div>
      <p>Исследуйте станцию, восстанавливайте её системы и помогите бортовому интеллекту понять мир.</p>
      <div className="exo-menu-actions">
        {hasSave && <button className="exo-primary" onClick={onContinue}><span>▶</span> Продолжить игру <b>→</b></button>}
        <button className={hasSave ? "exo-menu-link" : "exo-primary"} onClick={onCampaign}><span>⌂</span> {hasSave ? "Станция" : "Начать кампанию"}<b>→</b></button>
        <button className="exo-menu-link" onClick={onAcademy}><span>▤</span> Академия ЭХО <b>→</b></button>
        <button className="exo-menu-link" onClick={onLab}><span>⚗</span> Лаборатория <b>→</b></button>
      </div>
      <div className="exo-menu-stats"><div><strong>{restored}<em> / 7</em></strong><span>СЕКТОРОВ<br/>ВОССТАНОВЛЕНО</span></div><div><strong>{completedModuleIds(progress).size}</strong><span>МОДУЛЕЙ<br/>ПРОЙДЕНО</span></div><div><strong>{progress.capabilities.length}</strong><span>НАВЫКОВ<br/>ЭХО</span></div></div>
      {hasSave && <button className="exo-reset" onClick={onReset}>Сбросить прогресс</button>}
    </section>
    <footer className="exo-menu-footer"><span>AXIOMA STATION / 2147</span><span>ИССЛЕДУЙ · ИЗУЧАЙ · СОЗДАВАЙ</span></footer>
  </main>;
}
