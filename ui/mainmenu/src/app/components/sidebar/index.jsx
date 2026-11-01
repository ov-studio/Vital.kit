import * as lucide               from 'lucide-react';
import * as shared_ui_iconbutton from '@ui/iconbutton';
import './index.css';

const NAV = [
  { id: 'play',       icon: lucide.LayoutGrid, title: 'Browse'     },
  { id: 'masterlist', icon: lucide.LayoutList, title: 'Masterlist' },
  { id: 'favs',       icon: lucide.Star,       title: 'Favourites' },
  { id: 'settings',   icon: lucide.Settings,   title: 'Settings'   },
];

export function Sidebar({ active, onChange }) {
  return (
    <nav className="sidebar">
      {NAV.map(item => (
        <shared_ui_iconbutton.IconButton
          key={item.id}
          className={`nav-btn${active === item.id ? ' on' : ''}`}
          icon={item.icon}
          iconProps={{ size: 19, strokeWidth: 2 }}
          title={item.title}
          onClick={() => onChange(item.id)}
        />
      ))}
    </nav>
  );
}
