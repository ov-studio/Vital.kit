import * as react         from 'react';
import * as app_data      from '../../../data/index.jsx';
import * as app_serverview from '../../serverview/index.jsx';

export function ViewMasterlist({ visible, favs, onToggleFav }) {
  const { status, servers: listed } = app_data.useMasterlist();
  const local = app_data.useLocalServers(visible);
  const servers = react.useMemo(() => [...local, ...[...listed].sort((a, b) => a.name.localeCompare(b.name))], [local, listed]);

  return (
    <app_serverview.ServerView
      servers={servers}
      favs={favs}
      onToggleFav={onToggleFav}
      placeholder="Search servers…"
      empty={(filtered) => app_data.emptyText(status, filtered)}
    />
  );
}
