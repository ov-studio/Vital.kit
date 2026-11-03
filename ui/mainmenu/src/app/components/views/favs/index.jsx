import * as react            from 'react';
import * as lucide           from 'lucide-react';
import * as shared_ui_divider from '@ui/divider';
import * as shared_ui_filter from '@ui/filter';
import * as shared_ui_search from '@ui/search';
import * as app_empty        from '../../empty/index.jsx';
import * as app_data         from '../../../data/index.jsx';
import * as app_cardgrid     from '../../cardgrid/index.jsx';

export function ViewFavs({ favs, onToggleFav }) {
  const [search, setSearch] = react.useState('');
  const [chosen, setChosen] = react.useState(null);
  const { servers } = app_data.useMasterlist();
  const favServers = react.useMemo(() => servers.filter(s => favs.has(s.id)), [servers, favs]);

  const tags = react.useMemo(() => app_data.filter_tags(favServers), [favServers]);
  const activeTag = tags.includes(chosen) ? chosen : null;

  const results = react.useMemo(() => {
    const q = search.trim().toLowerCase();
    return favServers
      .filter(s => app_data.matches_tag(s, activeTag))
      .filter(s => !q || s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q));
  }, [favServers, search, activeTag]);

  const filtered = search.trim() !== '' || activeTag !== null;

  return (
    <div className="view">
      <section className="app-section">
        <div className="mlist-filters">
          <shared_ui_filter.Filter tags={tags} active={activeTag} onChange={setChosen}/>
          <shared_ui_search.Search
            value={search}
            onChange={setSearch}
            placeholder="Search favourites…"
            icon={<lucide.Search size={14} strokeWidth={2.5}/>}
          />
        </div>
        <shared_ui_divider.Divider/>

        {results.length === 0 ? (
          <app_empty.Empty icon={filtered ? lucide.Search : lucide.Star} className="app-empty--fill">
            {filtered
              ? 'No favourites found. Try a different search term or clear the active filter.'
              : "No favourites yet. Click the star icon on any game card to save it here. Favourites that are offline won't show until they're back."}
          </app_empty.Empty>
        ) : (
          <app_cardgrid.CardGrid servers={results} favs={favs} onToggleFav={onToggleFav}/>
        )}
      </section>
    </div>
  );
}
