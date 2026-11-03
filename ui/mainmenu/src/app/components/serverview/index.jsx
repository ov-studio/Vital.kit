import * as react             from 'react';
import * as lucide            from 'lucide-react';
import * as shared_ui_divider from '@ui/divider';
import * as shared_ui_filter  from '@ui/filter';
import * as shared_ui_search  from '@ui/search';
import * as app_empty         from '../empty/index.jsx';
import * as app_data          from '../../data/index.jsx';
import * as app_cardgrid      from '../cardgrid/index.jsx';
import './index.css';

export function ServerView({ servers, favs, onToggleFav, placeholder, icon = lucide.Search, empty }) {
  const [search, setSearch] = react.useState('');
  const [chosen, setChosen] = react.useState(null);

  const tags = react.useMemo(() => app_data.filter_tags(servers), [servers]);
  const activeTag = tags.includes(chosen) ? chosen : null; // a chip can vanish between refreshes
  const query = search.trim().toLowerCase();
  const filtered = query !== '' || activeTag !== null;

  const results = react.useMemo(() => servers.filter(s => app_data.matches_tag(s, activeTag)
    && (!query || s.name.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query))
  ), [servers, activeTag, query]);

  return (
    <div className="view">
      <section className="app-section">
        <div className="slist-filters">
          <shared_ui_filter.Filter tags={tags} active={activeTag} onChange={setChosen}/>
          <shared_ui_search.Search
            value={search}
            onChange={setSearch}
            placeholder={placeholder}
            icon={<lucide.Search size={14} strokeWidth={2.5}/>}
          />
        </div>
        <shared_ui_divider.Divider/>

        {results.length === 0 ? (
          <app_empty.Empty icon={filtered ? lucide.Search : icon} className="app-empty--fill">{empty(filtered)}</app_empty.Empty>
        ) : (
          <app_cardgrid.CardGrid servers={results} favs={favs} onToggleFav={onToggleFav}/>
        )}
      </section>
    </div>
  );
}
