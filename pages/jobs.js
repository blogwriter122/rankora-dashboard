import useSWR from 'swr';
import { fetchers } from '../lib/api';

const STAGES = ['keyword_research','serp_analysis','brief_built','writing','publishing','indexing','completed'];

export default function Jobs() {
  const { data: jobs = [] } = useSWR('jobs', fetchers.jobs, { refreshInterval: 4000 });

  const active = jobs.filter(j => !['completed','done','failed'].includes(j.status));
  const failed = jobs.filter(j => j.status === 'failed');

  return (
    <div className="fade-in">
      <div className="page-head"><div><div className="page-title">Job Queue</div><div className="page-sub">Live pipeline — every job and its stage</div></div></div>

      <div className="grid grid-4" style={{marginBottom:16}}>
        <div className="stat"><div className="stat-label">Total</div><div className="stat-value">{jobs.length}</div></div>
        <div className="stat reach"><div className="stat-label">Active</div><div className="stat-value">{active.length}</div></div>
        <div className="stat go"><div className="stat-label">Completed</div><div className="stat-value">{jobs.filter(j=>['completed','done'].includes(j.status)).length}</div></div>
        <div className="stat"><div className="stat-label">Failed</div><div className="stat-value">{failed.length}</div></div>
      </div>

      <div className="panel">
        <div className="panel-title">◆ All Jobs</div>
        {jobs.length === 0 ? <div className="empty">No jobs yet.</div> : (
          <table>
            <thead><tr><th>Keyword</th><th>Engine</th><th>Type</th><th>Stage</th><th>Progress</th></tr></thead>
            <tbody>{jobs.map(j => {
              const idx = STAGES.indexOf(j.status);
              const pct = j.status === 'completed' || j.status === 'done' ? 100 : idx >= 0 ? Math.round((idx / (STAGES.length-1)) * 100) : (j.status === 'failed' ? 100 : 10);
              return (
                <tr key={j.id}>
                  <td className="mono" style={{maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{j.keyword || '—'}</td>
                  <td><span className={`badge ${j.engine || 'forge'}`}>{j.engine || 'forge'}</span></td>
                  <td><span className="tag">{j.job_type}</span></td>
                  <td><span className={`badge ${j.status === 'failed' ? 'skip' : j.status === 'completed' || j.status === 'done' ? 'go' : 'running'}`}>{j.status}</span></td>
                  <td style={{minWidth:120}}>
                    <div className="score-bar"><div className="score-fill" style={{width:`${pct}%`, background: j.status==='failed'?'var(--skip)':pct===100?'var(--go)':'var(--reach)'}} /></div>
                    {j.error_log && <div style={{fontSize:10,color:'var(--skip)',marginTop:3}}>{j.error_log.slice(0,50)}</div>}
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
