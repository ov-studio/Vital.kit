import { useState } from 'react';
import { useMasterlistPolling } from '../../data/index.jsx';
import { Hud }       from '../hud/index.jsx';
import { Sidebar }   from '../sidebar/index.jsx';
import { ViewPlay }       from '../views/play/index.jsx';
import { ViewMasterlist } from '../views/masterlist/index.jsx';
import { ViewFavs }       from '../views/favs/index.jsx';
import { ViewSettings }   from '../views/settings/index.jsx';
import './index.css';

export function MainMenu() {
  const [activeView, setActiveView] = useState('play');
  const [favs, setFavs]             = useState(new Set());

  useMasterlistPolling();

  const toggleFav = id => {
    setFavs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Every view stays mounted (so filters, favourites and settings survive switching); only one is shown.
  const views = {
    play:       <ViewPlay visible={activeView === 'play'} favs={favs} onToggleFav={toggleFav} />,
    masterlist: <ViewMasterlist favs={favs} onToggleFav={toggleFav} />,
    favs:       <ViewFavs favs={favs} onToggleFav={toggleFav} />,
    settings:   <ViewSettings />,
  };

  return (
    <>
      <Sidebar active={activeView} onChange={setActiveView} />
      <Hud />
      <main className="center-panel">
        {Object.entries(views).map(([id, el]) => (
          <div key={id} className="view-slot" hidden={activeView !== id}>{el}</div>
        ))}
      </main>
    </>
  );
}
