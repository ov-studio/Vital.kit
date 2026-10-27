import { useState, useMemo } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Divider }    from '@ui/divider';
import { Empty }      from '../../empty/index.jsx';
import { Filter }     from '@ui/filter';
import { Search }     from '@ui/search';
import { useMasterlist, emptyText, filter_tags, matches_tag } from '../../../data/index.jsx';
import { CardGrid }   from '../../cardgrid/index.jsx';
import './index.css';

export function ViewMasterlist({ favs, onToggleFav }) {
  const [search, setSearch]       = useState('');
  const [chosen, setChosen]       = useState(null);
  const { status, servers } = useMasterlist();

  const tags = useMemo(() => filter_tags(servers), [servers]);
  const activeTag = tags.includes(chosen) ? chosen : null; // a chip can vanish between refreshes

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return servers
      .filter(s => matches_tag(s, activeTag))
      .filter(s => !q || s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [search, activeTag, servers]);

  return (
    <div className="view">
      <section className="app-section">
        <div className="mlist-filters">
          <Filter tags={tags} active={activeTag} onChange={setChosen} />
          <Search
            value={search}
            onChange={setSearch}
            placeholder="Search servers…"
            icon={<SearchIcon size={14} strokeWidth={2.5} />}
          />
        </div>
        <Divider />

        {results.length === 0 ? (
          <Empty icon={SearchIcon} className="app-empty--fill">
            {emptyText(status, search.trim() !== '' || activeTag !== null)}
          </Empty>
        ) : (
          <CardGrid servers={results} favs={favs} onToggleFav={onToggleFav} />
        )}
      </section>
    </div>
  );
}
