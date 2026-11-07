import * as react                from 'react';
import * as app_events           from '../../events.js';
import * as app_data             from '../../data/index.jsx';
import * as app_hooks            from '../../hooks.js';
import * as app_hud              from '../hud/index.jsx';
import * as app_sidebar          from '../sidebar/index.jsx';
import * as app_connectionbar    from '../connectionbar/index.jsx';
import * as app_views_play       from '../views/play/index.jsx';
import * as app_views_masterlist from '../views/masterlist/index.jsx';
import * as app_views_favs       from '../views/favs/index.jsx';
import * as app_views_settings   from '../views/settings/index.jsx';
import './index.css';

const favs_from = (settings) => new Set(Array.isArray(settings?.favorites) ? settings.favorites.filter(id => typeof id === 'string' || typeof id === 'number') : []);

export function MainMenu() {
  const [activeView, setActiveView] = react.useState('play');
  const [favs, setFavs]             = react.useState(() => favs_from(app_events.get_settings()));

  app_data.useMasterlistPolling();

  app_hooks.useEventHandler('mainmenu:settings_loaded', (e) => setFavs(favs_from(e.detail)));

  const toggleFav = id => {
    const next = new Set(favs);
    next.has(id) ? next.delete(id) : next.add(id);
    setFavs(next);
    app_events.settings_update({ favorites: [...next] });
  };

  const views = {
    play:       <app_views_play.ViewPlay visible={activeView === 'play'} favs={favs} onToggleFav={toggleFav}/>,
    masterlist: <app_views_masterlist.ViewMasterlist visible={activeView === 'masterlist'} favs={favs} onToggleFav={toggleFav}/>,
    favs:       <app_views_favs.ViewFavs favs={favs} onToggleFav={toggleFav}/>,
    settings:   <app_views_settings.ViewSettings/>,
  };

  return (
    <>
      <app_sidebar.Sidebar active={activeView} onChange={setActiveView}/>
      <app_hud.Hud/>
      <main className="center-panel">
        {Object.entries(views).map(([id, el]) => (
          <div key={id} className="view-slot" hidden={activeView !== id}>{el}</div>
        ))}
      </main>
      <app_connectionbar.ConnectionOverlay visible={activeView !== 'play'}/>
    </>
  );
}
