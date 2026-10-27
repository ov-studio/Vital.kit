import { Newspaper, ArrowUpRight } from 'lucide-react';
import { Empty } from '../empty/index.jsx';
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

export function News({ active }) {
  const { status, posts } = useNews(active);
  if (!posts.length) {
    return (
      <Empty icon={Newspaper} className="news app-empty--boxed">{newsEmptyText(status)}</Empty>
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
