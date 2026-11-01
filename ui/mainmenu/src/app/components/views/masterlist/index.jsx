import * as react             from 'react';
import * as lucide            from 'lucide-react';
import * as shared_ui_divider from '@ui/divider';
import * as app_empty         from '../../empty/index.jsx';
import * as shared_ui_filter  from '@ui/filter';
import * as shared_ui_search  from '@ui/search';
import * as app_data          from '../../../data/index.jsx';
import * as app_cardgrid      from '../../cardgrid/index.jsx';
import './index.css';

export function ViewMasterlist({ visible, favs, onToggleFav }) {
  const [search, setSearch]       = react.useState('');
  const [chosen, setChosen]       = react.useState(null);
  const { status, servers: listed } = app_data.useMasterlist();
  const local = app_data.useLocalServers(visible);
  const servers = react.useMemo(() => [...local, ...listed], [local, listed]);

  const tags = react.useMemo(() => app_data.filter_tags(servers), [servers]);
  const activeTag = tags.includes(chosen) ? chosen : null; // a chip can vanish between refreshes

  const results = react.useMemo(() => {
    const q = search.trim().toLowerCase();
    const by_name = [...listed].sort((a, b) => a.name.localeCompare(b.name));
    return [...local, ...by_name]
      .filter(s => app_data.matches_tag(s, activeTag))
      .filter(s => !q || s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q));
  }, [search, activeTag, local, listed]);

  return (
    <div className="view">
      <section className="app-section">
        <div className="mlist-filters">
          <shared_ui_filter.Filter tags={tags} active={activeTag} onChange={setChosen}/>
          <shared_ui_search.Search
            value={search}
            onChange={setSearch}
            placeholder="Search servers…"
            icon={<lucide.Search size={14} strokeWidth={2.5}/>}
          />
        </div>
        <shared_ui_divider.Divider/>

        {results.length === 0 ? (
          <app_empty.Empty icon={lucide.Search} className="app-empty--fill">
            {app_data.emptyText(status, search.trim() !== '' || activeTag !== null)}
          </app_empty.Empty>
        ) : (
          <app_cardgrid.CardGrid servers={results} favs={favs} onToggleFav={onToggleFav}/>
        )}
      </section>
    </div>
  );
}
