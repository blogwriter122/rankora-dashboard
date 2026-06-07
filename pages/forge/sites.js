import { useState } from 'react';
import useSWR from 'swr';
import { fetchers, api } from '../../lib/api';

export default function ForgeSites() {
  const { data: sites = [], mutate } = useSWR('sites', fetchers.sites, { refreshInterval: 10000 });
  const [open, setOpen] = useState(false);
  const forgeSites = sites.filter(s => !s.engine || s.engine === 'forge');

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="flex" style={{gap:10}}><div className="page-title">Sites</div><span className="engine-tag forge">Forge</span></div><div className="page-sub">Niche content sites — build new or connect existing WordPress</div></div>
        <button className="btn" onClick={() => setOpen(true)}>+ Add Site</button>
      </div>
      {forgeSites.length === 0 ? <div className="panel"><div className="empty">No Forge sites yet. Add your first site to begin.</div></div> : (
        <div className="grid grid-3">
          {forgeSites.map(s => (
            <div key={s.id} className="panel">
              <div className="flex-between" style={{marginBottom:10}}>
                <span style={{fontWeight:700,fontSize:15}}>{s.name}</span>
                <span className={`badge ${s.mode === 'existing' ? 'locale' : 'normal'}`}>{s.mode || 'build'}</span>
              </div>
              <div className="mono" style={{fontSize:11,color:'var(--text-faint)',marginBottom:8}}>{s.wp_url || s.domain || '—'}</div>
              <div className="flex" style={{flexWrap:'wrap',gap:4}}>
                <span className="tag">{s.niche || '—'}</span>
                <span className="tag">{s.country}</span>
                <span className="tag">{s.language}</span>
              </div>
              <div className="flex-between" style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--border)'}}>
                <span style={{fontSize:11,color:'var(--text-faint)'}}>{s.daily_clicks||0} clicks/day</span>
                {s.offpage_unlocked ? <span className="badge go">offpage on</span> : <span className="badge low">offpage off</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      {open && <AddSiteModal onClose={() => setOpen(false)} onDone={() => { setOpen(false); mutate(); }} engine="forge" />}
    </div>
  );
}

function AddSiteModal({ onClose, onDone, engine }) {
  const [f, setF] = useState({ name:'', niche:'', main_keyword:'', country:'US', language:'english', wp_url:'', wp_user:'', wp_app_pass:'', competitors:'', mode:'build' });
  const [saving, setSaving] = useState(false);
  const [verify, setVerify] = useState(null);
  const set = k => e => setF({...f, [k]: e.target.value});

  async function save() {
    setSaving(true);
    try {
      await api.addSite({ ...f, engine, competitors: f.competitors ? f.competitors.split(',').map(x => x.trim()) : [] });
      onDone();
    } catch(e) { alert(e.message); setSaving(false); }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Add Forge Site <span className="engine-tag forge">Forge</span></div>
        <div className="row" style={{marginBottom:16}}>
          <button className={`btn ${f.mode==='build'?'':'ghost'}`} onClick={() => setF({...f,mode:'build'})}>Build New</button>
          <button className={`btn ${f.mode==='existing'?'':'ghost'}`} onClick={() => setF({...f,mode:'existing'})}>Existing Site</button>
        </div>
        <div className="field"><label>Site Name</label><input value={f.name} onChange={set('name')} placeholder="Keto Authority" /></div>
        <div className="row">
          <div className="field"><label>Niche</label><input value={f.niche} onChange={set('niche')} placeholder="keto diet" /></div>
          <div className="field"><label>Main Keyword</label><input value={f.main_keyword} onChange={set('main_keyword')} placeholder="keto for beginners" /></div>
        </div>
        <div className="row">
          <div className="field"><label>Country</label><select value={f.country} onChange={set('country')}>{['US','UK','DE','FR','ES','PK','BR','SA'].map(c=><option key={c}>{c}</option>)}</select></div>
          <div className="field"><label>Language</label><select value={f.language} onChange={set('language')}>{['english','german','french','spanish','arabic','portuguese'].map(l=><option key={l}>{l}</option>)}</select></div>
        </div>
        <div className="field"><label>WordPress URL</label><input value={f.wp_url} onChange={set('wp_url')} placeholder="https://yoursite.com" /></div>
        <div className="row">
          <div className="field"><label>WP Username</label><input value={f.wp_user} onChange={set('wp_user')} /></div>
          <div className="field"><label>WP App Password</label><input value={f.wp_app_pass} onChange={set('wp_app_pass')} /></div>
        </div>
        {f.mode === 'build' && <div className="field"><label>Competitors (comma separated)</label><input value={f.competitors} onChange={set('competitors')} placeholder="https://comp1.com, https://comp2.com" /></div>}
        <div className="flex-between" style={{marginTop:8}}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={save} disabled={saving||!f.name}>{saving?'Saving…':'Save Site'}</button>
        </div>
      </div>
    </div>
  );
}
