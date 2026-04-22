import './styles/layout.css';
import { StickyStage } from './components/StickyStage.jsx';
import { useRaceStart } from './hooks/useRaceStart.js';

export default function App() {
  const raceStarted = useRaceStart();

  return (
    <div className="app">
      <header className="site-header">
        <p className="site-header__brand">Monza</p>
        <p className="site-header__tag">Scroll lap prototype</p>
      </header>

      <StickyStage raceStarted={raceStarted} />

      <footer className="site-footer">
        <p>Autodromo Nazionale Monza — interactive scroll study</p>
        <p className="site-footer__credit">Created by Alex Shlykov for Evgeniy Safronov</p>
      </footer>
    </div>
  );
}
