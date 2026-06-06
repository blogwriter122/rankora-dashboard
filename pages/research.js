import { useState } from 'react';
import useSWR from 'swr';
import { fetchers, api } from '../lib/api';

export default function Research() {
  const { data: sites = [], mutate } = useSWR('sites', fetchers.sites, { refreshInterval: 6000 });
  const [siteId, setSiteId] = useState('');
  const [competitor, setCompetitor] = useState('');
  const [keyword, setKeyword] = useState('');
  const [busy, setBusy] = useState(false);

  const site = sites.find((s) => s.id === siteId);
  const plan = site?.battle_plan;

  async function run() {
    if (!siteId) return alert('Pick a site first');
    setBusy(true);
    try {
      await api.battleplan({
        siteId, competitorUrl: competitor, mainKeyword: keyword || site?.main_keyword,
        country: site?.country, language: site?.language,
      });
      alert('Battle plan queued! Watch the verdict appear below (refreshes automatically).');
    } catch (e) { alert('Failed: ' + e.message); }
    setBusy(false);
  }

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Research</div>
          <div className="page-sub">Reverse engineer a competitor → gap analysis → SERP verdict → battle plan</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">⊕ Launch Battle Plan</div>
          <div className="field"><label>Site</label>
            <select value={siteId} onChange={(e) => setSiteId(e.target.value)}>
              <option value="">— select site —</option>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Competitor URL</label>
            <input value={competitor} onChange={(e) => setCompetitor(e.target.value)} placeholder="https://competitor.com (from Ahrefs)" />
          </div>
          <div className="field"><label>Main Keyword (optional — uses site default)</label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={site?.main_keyword || 'keto for beginners'} />
          </div>
          <button className="btn" onClick={run} disabled={busy || !competitor}>{busy ? 'Queuing…' : 'Run Reverse Engineer + SERP'}</button>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 12 }}>
            The local engine crawls the competitor, finds gaps, scrapes Google page 1, and returns a GO/SKIP verdict.
          </p>
        </div>

        <div className="panel">
          <div className="panel-title">⚖ Verdict</div>
          {!plan ? (
            <div className="empty">No battle plan yet for this site.<br />Run one on the left.</div>
          ) : (
            <div>
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <span className={`verdict-big`} style={{ color: plan.verdict === 'GO' ? 'var(--go)' : plan.verdict === 'SKIP' ? 'var(--skip)' : 'var(--text)' }}>{plan.verdict}</span>
                <span className={`badge ${plan.verdict === 'GO' ? 'go' : 'skip'}`}>{plan.confidence}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>{plan.summary}</p>

              {plan.serpWeaknesses?.length > 0 && (
                <>
                  <div className="panel-title" style={{ marginTop: 8 }}>SERP Weaknesses</div>
                  <ul style={{ listStyle: 'none', fontSize: 12, color: 'var(--text-dim)' }}>
                    {plan.serpWeaknesses.map((w, i) => <li key={i} style={{ padding: '3px 0' }}>→ {w}</li>)}
                  </ul>
                </>
              )}

              {plan.gapsToFill?.length > 0 && (
                <>
                  <div className="panel-title" style={{ marginTop: 14 }}>Gaps To Exploit</div>
                  {plan.gapsToFill.map((g, i) => (
                    <div key={i} style={{ fontSize: 12, padding: '4px 0', color: 'var(--text-dim)' }}>
                      <span className={`badge ${g.priority === 'high' ? 'high' : 'normal'}`}>{g.type}</span> {g.action}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {plan?.paaQuestions?.length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-title">❓ People Also Ask ({plan.paaQuestions.length})</div>
          <div className="flex" style={{ flexWrap: 'wrap' }}>
            {plan.paaQuestions.map((q, i) => <span key={i} className="tag" style={{ margin: 3 }}>{q}</span>)}
          </div>
        </div>
      )}

      {plan?.recommendedStructure && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-title">🏗 Recommended Build</div>
          <div className="grid grid-4">
            <Stat label="Pillars" value={plan.recommendedStructure.pillarCount} />
            <Stat label="Total Articles" value={plan.recommendedStructure.totalArticles} />
            <Stat label="Avg Words" value={plan.recommendedStructure.avgWordTarget} />
            <Stat label="Schema" value={(plan.recommendedStructure.mustHaveSchema || []).length} />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
