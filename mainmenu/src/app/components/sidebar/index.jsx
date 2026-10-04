import { LayoutGrid, LayoutList, Star, Settings } from 'lucide-react';
import { IconButton } from '@ui/iconbutton';
import './index.css';

export const NAV = [
  { id: 'play',       icon: LayoutGrid, title: 'Browse'     },
  { id: 'masterlist', icon: LayoutList, title: 'Masterlist' },
  { id: 'favs',       icon: Star,       title: 'Favourites' },
  { id: 'settings',   icon: Settings,   title: 'Settings'   },
];

/* Side rail: one icon button per view. */
export function Sidebar({ active, onChange }) {
  return (
    <nav className="sidebar">
      {NAV.map(item => (
        <IconButton
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
