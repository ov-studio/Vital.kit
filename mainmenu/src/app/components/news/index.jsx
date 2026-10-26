import { Newspaper, ArrowUpRight } from 'lucide-react';
import { Pic } from '../pic/index.jsx';
import { useNews } from '../../data/index.jsx';
import * as events from '../../events.js';
import { NEWS_MAX_POSTS } from '../../config.js';
import './index.css';

function newsEmptyText(status) {
  if (status === 'loading') return 'Loading news…';
  if (status === 'error') return 'News is unavailable right now. It retries automatically.';
  return 'No news yet. Check back soon.';
}

/* Compact news feed: newest posts first, each opens on the site in the default browser. */
export function News({ active }) {
  const { status, posts } = useNews(active);

  if (!posts.length) {
    return (
      <div className="news news--empty">
        <Newspaper size={18} strokeWidth={2} />
        <span>{newsEmptyText(status)}</span>
      </div>
    );
  }

  return (
    <div className="news">
      {posts.slice(0, NEWS_MAX_POSTS).map((p) => (
        <button key={p.slug} className="news-item" onClick={() => events.open_url(p.url)}>
          <Pic src={p.cover} className="news-cover"><Newspaper size={16} /></Pic>
          <span className="news-info">
            <span className="news-title">{p.title}</span>
            <span className="news-meta">{[p.tags[0] && `#${p.tags[0]}`, p.date].filter(Boolean).join('  ·  ')}</span>
          </span>
          <ArrowUpRight className="news-go" size={16} strokeWidth={2.2}/>
        </button>
      ))}
    </div>
  );
}
