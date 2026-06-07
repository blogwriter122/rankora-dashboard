import useSWR from 'swr';
import { fetchers, api } from '../../lib/api';
export default function ReachTrends() {
  const { data: trends = [], mutate } = useSWR('trends', fetchers.trends, { refreshInterval: 20000 });
  const { data: sites = [] } = useSWR('sites', fetchers.sites);
  async function queueWrite(t) {
    const ownSite = sites[0]?.wp_url || '';
    try { await api.parasiteWrite({ keyword: t.keyword, ownSiteUrl: ownSite, platforms: ['blogger','medium'] }); alert(`Queued "${t.keyword}"`); }
    catch(e) { alert(e.message); }
  }
  return (
    <div className="fade-in">
      <div className="page-head"><div><div className="flex" style={{gap:10}}><div className="page-title">Trends</div><span className="engine-tag reach">Reach</span></div><div className="page-sub">Live signals from Product Hunt, Reddit, GitHub, HN, Google Trends</div></div></div>
      <div className="grid grid-3" style={{marginBottom:14}}>
        <div className="stat"><div className="stat-label">Total</div><div className="stat-value">{trends.length}</div></div>
        <div className="stat"><div className="stat-label">Urgent</div><div className="stat-value">{trends.filter(t=>t.priority==='urgent').length}</div></div>
        <div className="stat reach"><div className="stat-label">High</div><div className="stat-value">{trends.filter(t=>t.priority==='high').length}</div></div>
      </div>
      <div className="panel">
        <div className="panel-title">⚡ Signal Feed</div>
        {trends.length === 0 ? <div className="empty">No trends yet.<br />Runs every 3 hours via trend scheduler.</div> : (
          <table><thead><tr><th>Keyword</th><th>Source</th><th>Score</th><th>Priority</th><th></th></tr></thead>
          <tbody>{trends.map(t=>(
            <tr key={t.id}>
              <td style={{maxWidth:280,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.keyword}</td>
              <td><span className="tag">{t.source}</span></td>
              <td className="mono">{t.score}</td>
              <td><span className={`badge ${t.priority}`}>{t.priority}</span></td>
              <td><button className="btn sm reach" onClick={()=>queueWrite(t)}>Write</button></td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}
