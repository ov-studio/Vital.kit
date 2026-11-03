import * as react          from 'react';
import * as lucide         from 'lucide-react';
import * as app_data       from '../../../data/index.jsx';
import * as app_serverview from '../../serverview/index.jsx';

export function ViewFavs({ favs, onToggleFav }) {
  const { servers } = app_data.useMasterlist();
  const saved = react.useMemo(() => servers.filter(s => favs.has(s.id)), [servers, favs]);

  return (
    <app_serverview.ServerView
      servers={saved}
      favs={favs}
      onToggleFav={onToggleFav}
      placeholder="Search favourites…"
      icon={lucide.Star}
      empty={(filtered) => filtered
        ? 'No favourites found. Try a different search term or clear the active filter.'
        : "No favourites yet. Click the star icon on any game card to save it here. Favourites that are offline won't show until they're back."}
    />
  );
}
