import { Newspaper, ArrowUpRight } from 'lucide-react';
import { Empty } from '../empty/index.jsx';
import { Pic } from '../pic/index.jsx';
import { useNews } from '../../data/index.jsx';
import * as events from '../../events.js';
import { NEWS_SLOTS } from '../../config.js';
import './index.css';

function newsEmptyText(status) {
  if (status === 'loading') return 'Loading news…';
  if (status === 'error') return 'News is unavailable right now. It retries automatically.';
  return 'No news yet. Check back soon.';
}

export function News({ active }) {
  const { status, posts } = useNews(active);
  if (!posts.length) {
    return (
      <Empty icon={Newspaper} className="news app-empty--boxed">{newsEmptyText(status)}</Empty>
    );
  }

  return (
    <div className="news">
      {posts.slice(0, NEWS_SLOTS).map((p) => (
        <button key={p.slug} className="news-item" onClick={() => events.open_url(p.url)}>
          <Pic src={p.cover} className="news-cover"><Newspaper size={16} /></Pic>
          <span className="news-info">
            <span className="news-title">{p.title}</span>
            <span className="news-meta">{[p.tags[0] && `#${p.tags[0]}`, p.date].filter(Boolean).join('  ·  ')}</span>
          </span>
          <ArrowUpRight className="news-go" size={14} strokeWidth={2.2}/>
        </button>
      ))}
      {Array.from({ length: Math.max(0, NEWS_SLOTS - posts.length) }, (_, i) => (
        <div key={`open-${i}`} className="news-item news-item--open">
          <Newspaper size={16} strokeWidth={2} />
          <span>No more news</span>
        </div>
      ))}
    </div>
  );
}
