import useSWR from 'swr';
import Link from 'next/link';
import { fetchers } from '../lib/api';

function Stat({ label, value, meta, cls = '' }) {
  return (
    <div className={`stat ${cls}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? '—'}</div>
      {meta && <div className="stat-meta">{meta}</div>}
    </div>
  );
}

export default function Overview() {
  const { data: sites = [] } = useSWR('sites', fetchers.sites, { refreshInterval: 10000 });
  const { data: jobs = [] } = useSWR('jobs', fetchers.jobs, { refreshInterval: 5000 });
  const { data: published = [] } = useSWR('published', fetchers.published, { refreshInterval: 10000 });
  const { data: trends = [] } = useSWR('trends', fetchers.trends, { refreshInterval: 30000 });

  const forgeSites  = sites.filter(s => s.engine === 'forge' || !s.engine);
  const reachSites  = sites.filter(s => s.engine === 'reach');
  const localeSites = sites.filter(s => s.engine === 'locale');
  const running = jobs.filter(j => j.status === 'running').length;
  const done = jobs.filter(j => j.status === 'done').length;

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Overview</div>
          <div className="page-sub">All three engines — live status</div>
        </div>
      </div>

      {/* Engine tiles */}
      <div className="grid grid-3" style={{ marginBottom: 16 }}>
        <div className="panel" style={{ borderTop: '3px solid var(--forge)' }}>
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>⚡ Forge</span>
            <span className="engine-tag forge">Niche Sites</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--mono)' }}>{forgeSites.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>active sites</div>
          <Link href="/forge/quickwrite" className="btn sm" style={{ marginTop: 12, display: 'inline-block' }}>Quick Write</Link>
        </div>
        <div className="panel" style={{ borderTop: '3px solid var(--reach)' }}>
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>📡 Reach</span>
            <span className="engine-tag reach">Platform Publisher</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--mono)' }}>{published.filter(p => p.engine === 'reach').length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>articles published</div>
          <Link href="/reach/campaigns" className="btn sm reach" style={{ marginTop: 12, display: 'inline-block' }}>New Campaign</Link>
        </div>
        <div className="panel" style={{ borderTop: '3px solid var(--locale)' }}>
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>📍 Locale</span>
            <span className="engine-tag locale">Local SEO</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--mono)' }}>{localeSites.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>local sites</div>
          <Link href="/locale/scorer" className="btn sm locale" style={{ marginTop: 12, display: 'inline-block' }}>Score Niche</Link>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <Stat label="Total Sites" value={sites.length} meta="all engines" />
        <Stat label="Published" value={published.length} meta="all platforms" cls="go" />
        <Stat label="Running" value={running} meta={`${done} done today`} cls="reach" />
        <Stat label="Trends" value={trends.filter(t => t.priority === 'urgent').length} meta="urgent signals" cls="locale" />
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">◆ Recent Jobs</div>
          {jobs.length === 0
            ? <div className="empty">No jobs yet.<br />Start from Quick Write or Research.</div>
            : <table>
                <thead><tr><th>Keyword</th><th>Engine</th><th>Type</th><th>Status</th></tr></thead>
                <tbody>
                  {jobs.slice(0, 8).map(j => (
                    <tr key={j.id}>
                      <td className="mono" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.keyword || '—'}</td>
                      <td><span className={`badge ${j.engine || 'forge'}`}>{j.engine || 'forge'}</span></td>
                      <td><span className="tag">{j.job_type}</span></td>
                      <td><span className={`badge ${j.status}`}>{j.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>}
        </div>
        <div className="panel">
          <div className="panel-title">⚡ Urgent Trends</div>
          {trends.filter(t => t.priority === 'urgent').length === 0
            ? <div className="empty">No urgent signals.<br />Trend scanner runs every 3 hours.</div>
            : <table>
                <thead><tr><th>Keyword</th><th>Source</th><th>Score</th></tr></thead>
                <tbody>
                  {trends.filter(t => t.priority === 'urgent').slice(0, 8).map(t => (
                    <tr key={t.id}>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.keyword}</td>
                      <td><span className="tag">{t.source}</span></td>
                      <td><span className="badge urgent">{t.score}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>}
        </div>
      </div>

      {sites.length > 0 && (
        <div className="panel" style={{ marginTop: 14 }}>
          <div className="panel-title">⬡ All Sites</div>
          <table>
            <thead><tr><th>Name</th><th>Engine</th><th>Niche</th><th>Country</th><th>Verdict</th><th>Clicks</th><th>Score</th></tr></thead>
            <tbody>
              {sites.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td><span className={`badge ${s.engine || 'forge'}`}>{s.engine || 'forge'}</span></td>
                  <td className="mono">{s.niche || s.city || '—'}</td>
                  <td><span className="tag">{s.country}</span></td>
                  <td>{s.battle_plan?.verdict ? <span className={`badge ${s.battle_plan.verdict === 'GO' ? 'go' : 'skip'}`}>{s.battle_plan.verdict}</span> : <span className="tag">—</span>}</td>
                  <td className="mono">{s.daily_clicks || 0}</td>
                  <td className="mono">{s.koneqti_score ? `${s.koneqti_score}/100` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
