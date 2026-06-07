import { useState } from 'react';
import useSWR from 'swr';
import { fetchers, api } from '../../lib/api';

export default function ForgeResearch() {
  const { data: sites = [], mutate } = useSWR('sites', fetchers.sites, { refreshInterval: 8000 });
  const [siteId, setSiteId] = useState('');
  const [competitor, setCompetitor] = useState('');
  const [keyword, setKeyword] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');

  const forgeSites = sites.filter(s => !s.engine || s.engine === 'forge');
  const site = forgeSites.find(s => s.id === siteId);
  const plan = site?.battle_plan;

  const act = async (fn, label) => {
    if (!siteId) return alert('Select a site');
    setBusy(label);
    try { await fn(); setMsg(`${label} queued ✓`); mutate(); setTimeout(() => setMsg(''), 4000); }
    catch (e) { alert('Failed: ' + e.message); }
    setBusy('');
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="flex" style={{ gap: 10 }}>
            <div className="page-title">Research</div>
            <span className="engine-tag forge">Forge</span>
          </div>
          <div className="page-sub">Reverse engineer competitor → gap analysis → SERP verdict → battle plan</div>
        </div>
        {msg && <span className="badge go">{msg}</span>}
      </div>

      <div className="field" style={{ maxWidth: 380 }}>
        <label>Site</label>
        <select value={siteId} onChange={e => setSiteId(e.target.value)}>
          <option value="">— select site —</option>
          {forgeSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="grid grid-2" style={{ marginTop: 8 }}>
        <div className="panel">
          <div className="panel-title">⊕ Battle Plan</div>
          <div className="field"><label>Competitor URL (from Ahrefs)</label>
            <input value={competitor} onChange={e => setCompetitor(e.target.value)} placeholder="https://competitor.com" /></div>
          <div className="field"><label>Main Keyword</label>
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder={site?.main_keyword || 'keto for beginners'} /></div>
          <button className="btn" disabled={!!busy || !competitor}
            onClick={() => act(() => api.battleplan({ siteId, competitorUrl: competitor, mainKeyword: keyword || site?.main_keyword, country: site?.country, language: site?.language }), 'Battle plan')}>
            {busy === 'Battle plan' ? <><span className="spin">◌</span> Running…</> : '⊕ Run Reverse Engineer + SERP'}
          </button>
          <div className="divider" />
          <div className="panel-title" style={{ marginBottom: 8 }}>⚙ Pipeline Actions</div>
          <div className="grid grid-2" style={{ gap: 8 }}>
            <button className="btn ghost sm" disabled={!!busy} onClick={() => act(() => api.keywords({ siteId }), 'Keywords')}>Expand Keywords</button>
            <button className="btn ghost sm" disabled={!!busy} onClick={() => act(() => api.silo({ siteId }), 'Silo')}>Build Silo</button>
            <button className="btn ghost sm" disabled={!!busy} onClick={() => act(() => api.trust({ siteId }), 'Trust pages')}>Trust Pages</button>
            <button className="btn ghost sm" disabled={!!busy} onClick={() => act(() => api.writeSilo({ siteId, status: 'draft', limit: 10 }), 'Write silo')}>Write Silo</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">⚖ Verdict</div>
          {!plan ? <div className="empty">No battle plan yet.<br />Run one on the left.</div> : (
            <div>
              <div className="flex-between" style={{ marginBottom: 14 }}>
                <span className="verdict" style={{ color: plan.verdict === 'GO' ? 'var(--go)' : 'var(--skip)' }}>{plan.verdict}</span>
                <span className={`badge ${plan.verdict === 'GO' ? 'go' : 'skip'}`}>{plan.confidence}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>{plan.summary}</p>
              {plan.serpWeaknesses?.length > 0 && <>
                <div className="panel-title" style={{ marginTop: 8 }}>SERP Weaknesses</div>
                {plan.serpWeaknesses.map((w, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text-dim)', padding: '2px 0' }}>→ {w}</div>)}
              </>}
              {plan.gapsToFill?.length > 0 && <>
                <div className="panel-title" style={{ marginTop: 12 }}>Gaps to Fill</div>
                {plan.gapsToFill.map((g, i) => (
                  <div key={i} style={{ fontSize: 12, padding: '3px 0', color: 'var(--text-dim)' }}>
                    <span className={`badge ${g.priority}`}>{g.type}</span> {g.action}
                  </div>
                ))}
              </>}
            </div>
          )}
        </div>
      </div>

      {plan?.paaQuestions?.length > 0 && (
        <div className="panel" style={{ marginTop: 14 }}>
          <div className="panel-title">❓ PAA Questions ({plan.paaQuestions.length})</div>
          <div className="flex" style={{ flexWrap: 'wrap' }}>
            {plan.paaQuestions.map((q, i) => <span key={i} className="tag" style={{ margin: 3 }}>{q}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
