import { useState, useMemo } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Divider }    from '@ui/divider';
import { EmptyState } from '@ui/empty';
import { Filter }     from '@ui/filter';
import { PageHead }   from '@ui/pagehead';
import { Search }     from '@ui/search';
import { SERVERS, GENRES } from '../../../data/index.jsx';
import { CardGrid }   from '../../cardgrid/index.jsx';
import './index.css';

export function ViewMasterlist({ favs, onToggleFav }) {
  const [search, setSearch]       = useState('');
  const [activeTag, setActiveTag] = useState(null);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SERVERS
      .filter(s => activeTag === null || s.genre === activeTag)
      .filter(s => !q || s.name.toLowerCase().includes(q) || s.genre.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [search, activeTag]);

  return (
    <div className="view">
      <PageHead label="Masterlist" title="All Servers" />

      <div className="mlist-filters">
        <Filter tags={GENRES} active={activeTag} onChange={setActiveTag} />
        <Search
          value={search}
          onChange={setSearch}
          placeholder="Search servers…"
          icon={<SearchIcon size={14} strokeWidth={2.5} />}
        />
      </div>
      <Divider />

      {results.length === 0 ? (
        <EmptyState icon={<SearchIcon size={40} strokeWidth={1.4} />}>
          No servers found. Try a different search term or clear the active filter.
        </EmptyState>
      ) : (
        <CardGrid servers={results} favs={favs} onToggleFav={onToggleFav} showTag />
      )}
    </div>
  );
}
