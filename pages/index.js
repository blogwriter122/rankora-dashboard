import useSWR from 'swr';
import Link from 'next/link';
import { fetchers } from '../lib/api';

export default function Overview() {
  const { data: sites = [] } = useSWR('sites', fetchers.sites, { refreshInterval: 10000 });
  const { data: jobs = [] } = useSWR('jobs', fetchers.jobs, { refreshInterval: 5000 });
  const { data: published = [] } = useSWR('published', fetchers.published, { refreshInterval: 10000 });
  const { data: trends = [] } = useSWR('trends', fetchers.trends, { refreshInterval: 30000 });

  const running = jobs.filter((j) => j.status === 'running').length;
  const done = jobs.filter((j) => j.status === 'done').length;
  const failed = jobs.filter((j) => j.status === 'failed').length;
  const unlocked = sites.filter((s) => s.offpage_unlocked).length;
  const totalClicks = sites.reduce((s, x) => s + (x.daily_clicks || 0), 0);

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Overview</div>
          <div className="page-sub">Live status across both engines</div>
        </div>
        <Link href="/research" className="btn">+ New Battle Plan</Link>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <Stat label="Active Sites" value={sites.length} meta={`${unlocked} offpage unlocked`} />
        <Stat label="Published" value={published.length} meta="total articles live" cls="info" />
        <Stat label="Jobs Running" value={running} meta={`${done} done · ${failed} failed`} cls="amber" />
        <Stat label="Daily Clicks" value={totalClicks} meta="across all sites" />
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">◆ Recent Jobs</div>
          {jobs.length === 0 ? <div className="empty">No jobs yet. Start from Research.</div> : (
            <table>
              <thead><tr><th>Keyword</th><th>Type</th><th>Status</th></tr></thead>
              <tbody>
                {jobs.slice(0, 8).map((j) => (
                  <tr key={j.id}>
                    <td className="mono" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.keyword || '—'}</td>
                    <td><span className="tag">{j.job_type}</span></td>
                    <td><span className={`badge ${j.status}`}>{j.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-title">⚡ Hot Trends</div>
          {trends.length === 0 ? <div className="empty">No trend signals yet.</div> : (
            <table>
              <thead><tr><th>Signal</th><th>Source</th><th>Score</th></tr></thead>
              <tbody>
                {trends.slice(0, 8).map((t) => (
                  <tr key={t.id}>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.keyword}</td>
                    <td><span className="tag">{t.source}</span></td>
                    <td><span className={`badge ${t.priority}`}>{t.score}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-title">⬡ Sites</div>
        {sites.length === 0 ? <div className="empty">No sites yet. Add one from the Sites page.</div> : (
          <table>
            <thead><tr><th>Name</th><th>Niche</th><th>Country</th><th>Verdict</th><th>Clicks/day</th><th>Offpage</th></tr></thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td className="mono">{s.niche || '—'}</td>
                  <td><span className="tag">{s.country}</span></td>
                  <td>{s.battle_plan?.verdict ? <span className={`badge ${s.battle_plan.verdict === 'GO' ? 'go' : 'skip'}`}>{s.battle_plan.verdict}</span> : <span className="tag">pending</span>}</td>
                  <td className="mono">{s.daily_clicks || 0}</td>
                  <td>{s.offpage_unlocked ? <span className="badge go">unlocked</span> : <span className="badge low">locked</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, meta, cls = '' }) {
  return (
    <div className={`stat ${cls}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-meta">{meta}</div>
    </div>
  );
}
