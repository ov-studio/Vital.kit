import * as lucide     from 'lucide-react';
import * as app_empty  from '../empty/index.jsx';
import * as app_pic    from '../pic/index.jsx';
import * as app_data   from '../../data/index.jsx';
import * as app_events from '../../events.js';
import * as app_config from '../../config.js';
import * as app_util   from '../../util.js';
import './index.css';

function newsEmptyText(status) {
  if (status === 'loading') return 'Loading news…';
  if (status === 'error') return 'News is unavailable right now. It retries automatically.';
  return 'No news yet. Check back soon.';
}

export function News({ active }) {
  const { status, posts } = app_data.useNews(active);
  if (!posts.length) {
    return <app_empty.Empty icon={lucide.Newspaper} className="news app-empty--boxed">{newsEmptyText(status)}</app_empty.Empty>;
  }

  return (
    <div className="news">
      {posts.slice(0, app_config.NEWS_SLOTS).map((p) => (
        <button key={p.slug} className="news-item" onClick={() => app_events.open_url(p.url)}>
          <app_pic.Pic src={p.cover} className="news-cover"><lucide.Newspaper size={16}/></app_pic.Pic>
          <span className="news-info">
            <span className="news-title">{p.title}</span>
            <span className="news-meta">{[p.tags[0] && `#${p.tags[0]}`, p.date].filter(Boolean).join('  ·  ')}</span>
          </span>
          <lucide.ArrowUpRight className="news-go" size={14} strokeWidth={2.2}/>
        </button>
      ))}
      {app_util.slots(app_config.NEWS_SLOTS, posts.length).map((i) => (
        <div key={`open-${i}`} className="news-item news-item--open">
          <lucide.Newspaper size={16} strokeWidth={2}/>
          <span>No more news</span>
        </div>
      ))}
    </div>
  );
}
