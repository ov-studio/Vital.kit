import { useState, useEffect } from 'react';
import * as events        from '../../events.js';
import { useMasterlistPolling } from '../../data/index.jsx';
import { Hud }            from '../hud/index.jsx';
import { Sidebar }        from '../sidebar/index.jsx';
import { ViewPlay }       from '../views/play/index.jsx';
import { ViewMasterlist } from '../views/masterlist/index.jsx';
import { ViewFavs }       from '../views/favs/index.jsx';
import { ViewSettings }   from '../views/settings/index.jsx';
import './index.css';

const favs_from = (settings) => new Set(Array.isArray(settings?.favorites) ? settings.favorites.filter(id => typeof id === 'string' || typeof id === 'number') : []);

export function MainMenu() {
  const [activeView, setActiveView] = useState('play');
  const [favs, setFavs]             = useState(() => favs_from(events.get_settings()));

  useMasterlistPolling();

  useEffect(() => {
    const on_loaded = (e) => setFavs(favs_from(e.detail));
    window.addEventListener('mainmenu:settings_loaded', on_loaded);
    return () => window.removeEventListener('mainmenu:settings_loaded', on_loaded);
  }, []);

  const toggleFav = id => {
    const next = new Set(favs);
    next.has(id) ? next.delete(id) : next.add(id);
    setFavs(next);
    events.settings_update({ favorites: [...next] });
  };

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
