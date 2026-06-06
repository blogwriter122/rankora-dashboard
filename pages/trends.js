import useSWR from 'swr';
import { fetchers, api } from '../lib/api';

export default function Trends() {
  const { data: trends = [], mutate } = useSWR('trends', fetchers.trends, { refreshInterval: 20000 });
  const { data: sites = [] } = useSWR('sites', fetchers.sites);

  async function queueWrite(t) {
    const ownSite = sites[0]?.wp_url || '';
    try {
      await api.parasiteWrite({ keyword: t.keyword, niche: t.source, ownSiteUrl: ownSite, platforms: ['blogger', 'medium'] });
      alert(`Queued "${t.keyword}" for writing`);
    } catch (e) { alert('Failed: ' + e.message); }
  }

  const urgent = trends.filter((t) => t.priority === 'urgent').length;
  const high = trends.filter((t) => t.priority === 'high').length;

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Trend Intelligence</div>
          <div className="page-sub">Live signals from Product Hunt, Reddit, GitHub, HN, Google Trends</div>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 16 }}>
        <div className="stat"><div className="stat-label">Total Signals</div><div className="stat-value">{trends.length}</div></div>
        <div className="stat info"><div className="stat-label">Urgent</div><div className="stat-value">{urgent}</div></div>
        <div className="stat amber"><div className="stat-label">High Priority</div><div className="stat-value">{high}</div></div>
      </div>

      <div className="panel">
        <div className="panel-title">⚡ Signal Feed</div>
        {trends.length === 0 ? (
          <div className="empty">No trend signals yet.<br />The trend scheduler scans every 3 hours (run <span className="mono">node parasite/trend.js</span> to scan now).</div>
        ) : (
          <table>
            <thead><tr><th>Keyword</th><th>Source</th><th>Type</th><th>Score</th><th>Priority</th><th></th></tr></thead>
            <tbody>
              {trends.map((t) => (
                <tr key={t.id}>
                  <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.keyword}</td>
                  <td><span className="tag">{t.source}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--text-faint)' }}>{t.signal_type}</td>
                  <td className="mono">{t.score}</td>
                  <td><span className={`badge ${t.priority}`}>{t.priority}</span></td>
                  <td><button className="btn sm" onClick={() => queueWrite(t)}>Write</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
