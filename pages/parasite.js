import { useState } from 'react';
import useSWR from 'swr';
import { fetchers, api } from '../lib/api';

const PLATFORMS = ['blogger', 'medium', 'linkedin', 'hubpages', 'quora', 'substack', 'reddit', 'wordpress_com'];

export default function Parasite() {
  const { data: sites = [] } = useSWR('sites', fetchers.sites);
  const { data: published = [] } = useSWR('published', fetchers.published, { refreshInterval: 6000 });
  const [keywords, setKeywords] = useState('');
  const [niche, setNiche] = useState('');
  const [ownSite, setOwnSite] = useState('');
  const [selected, setSelected] = useState(['blogger', 'medium', 'linkedin']);
  const [msg, setMsg] = useState('');

  const toggle = (p) => setSelected((s) => s.includes(p) ? s.filter((x) => x !== p) : [...s, p]);

  async function launch() {
    const kws = keywords.split('\n').map((k) => k.trim()).filter(Boolean);
    if (!kws.length) return alert('Enter at least one keyword');
    try {
      await api.parasiteBulk({ keywords: kws, niche, ownSiteUrl: ownSite, platforms: selected });
      setMsg(`${kws.length} keywords × ${selected.length} platforms queued ✓`);
      setKeywords('');
      setTimeout(() => setMsg(''), 5000);
    } catch (e) { alert('Failed: ' + e.message); }
  }

  const byPlatform = published.reduce((acc, p) => { acc[p.platform] = (acc[p.platform] || 0) + 1; return acc; }, {});

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Traffic Engine</div>
          <div className="page-sub">Publish to high-DA platforms → funnel traffic to your money site</div>
        </div>
        {msg && <span className="badge go">{msg}</span>}
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">⇶ Launch Campaign</div>
          <div className="field"><label>Keywords (one per line)</label>
            <textarea rows={6} value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder={'best ai writing tools\nnotion vs obsidian\nhow to start a blog'} />
          </div>
          <div className="row">
            <div className="field"><label>Niche</label><input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="ai tools" /></div>
            <div className="field"><label>Funnel to (money site URL)</label><input value={ownSite} onChange={(e) => setOwnSite(e.target.value)} placeholder="https://mysite.com" /></div>
          </div>
          <label>Platforms</label>
          <div className="flex" style={{ flexWrap: 'wrap', marginBottom: 16 }}>
            {PLATFORMS.map((p) => (
              <button key={p} className={`btn sm ${selected.includes(p) ? '' : 'ghost'}`} onClick={() => toggle(p)} style={{ margin: 3 }}>{p}</button>
            ))}
          </div>
          <button className="btn amber" onClick={launch}>Launch to {selected.length} Platforms</button>
        </div>

        <div className="panel">
          <div className="panel-title">▤ Published by Platform</div>
          {Object.keys(byPlatform).length === 0 ? <div className="empty">Nothing published yet.</div> : (
            <table>
              <thead><tr><th>Platform</th><th>Articles</th></tr></thead>
              <tbody>
                {Object.entries(byPlatform).sort((a, b) => b[1] - a[1]).map(([p, c]) => (
                  <tr key={p}><td><span className="tag">{p}</span></td><td className="mono">{c}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-title">📤 Recent Publications</div>
        {published.length === 0 ? <div className="empty">No publications yet.</div> : (
          <table>
            <thead><tr><th>Keyword</th><th>Platform</th><th>URL</th><th>When</th></tr></thead>
            <tbody>
              {published.slice(0, 15).map((p) => (
                <tr key={p.id}>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.keyword}</td>
                  <td><span className="tag">{p.platform}</span></td>
                  <td>{p.url ? <a href={p.url} target="_blank" rel="noreferrer">view ↗</a> : '—'}</td>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>{new Date(p.published_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
