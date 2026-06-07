import useSWR from 'swr';
import { fetchers } from '../../lib/api';

export default function ForgeMonitor() {
  const { data: sites = [] } = useSWR('sites', fetchers.sites, { refreshInterval: 30000 });
  const forgeSites = sites.filter(s => !s.engine || s.engine === 'forge');
  return (
    <div className="fade-in">
      <div className="page-head"><div><div className="flex" style={{gap:10}}><div className="page-title">Technical Monitor</div><span className="engine-tag forge">Forge</span></div><div className="page-sub">GSC daily check · crawl errors · sitemap · Core Web Vitals</div></div></div>
      <div className="grid grid-4" style={{marginBottom:14}}>
        <div className="stat"><div className="stat-label">Sites Monitored</div><div className="stat-value">{forgeSites.length}</div></div>
        <div className="stat go"><div className="stat-label">Offpage Unlocked</div><div className="stat-value">{forgeSites.filter(s=>s.offpage_unlocked).length}</div></div>
        <div className="stat reach"><div className="stat-label">Total Clicks</div><div className="stat-value">{forgeSites.reduce((a,s)=>a+(s.daily_clicks||0),0)}</div></div>
        <div className="stat locale"><div className="stat-label">Needing Refresh</div><div className="stat-value">—</div></div>
      </div>
      <div className="panel">
        <div className="panel-title">⚙ Site Health</div>
        {forgeSites.length === 0 ? <div className="empty">No Forge sites yet.</div> : (
          <table><thead><tr><th>Site</th><th>Clicks/day</th><th>Offpage</th><th>Score</th><th>Action</th></tr></thead>
          <tbody>{forgeSites.map(s=>(
            <tr key={s.id}>
              <td style={{fontWeight:600}}>{s.name}</td>
              <td className="mono">{s.daily_clicks||0}</td>
              <td>{s.offpage_unlocked ? <span className="badge go">unlocked</span> : <span className="badge low">locked</span>}</td>
              <td className="mono">{s.koneqti_score ? `${s.koneqti_score}/100` : '—'}</td>
              <td><button className="btn ghost sm">Check GSC</button></td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}
