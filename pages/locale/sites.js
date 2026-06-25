import { useState } from 'react';
import useSWR from 'swr';
import { fetchers, api } from '../../lib/api';
export default function LocaleSites() {
  const { data: sites = [], mutate } = useSWR('sites', fetchers.sites, { refreshInterval: 10000 });
  const [open, setOpen] = useState(false);
  const localeSites = sites.filter(s => s.engine === 'locale');
  return (
    <div className="fade-in">
      <div className="page-head"><div><div className="flex" style={{gap:10}}><div className="page-title">Local Sites</div><span className="engine-tag locale">Locale</span></div><div className="page-sub">Rank & rent + client SEO sites</div></div><button className="btn locale" onClick={() => setOpen(true)}>+ Add Local Site</button></div>
      {localeSites.length === 0 ? <div className="panel"><div className="empty">No local sites yet. Score a niche first, then add a site.</div></div> : (
        <div className="grid grid-3">
          {localeSites.map(s => (
            <div key={s.id} className="panel">
              <div className="flex-between" style={{marginBottom:8}}><span style={{fontWeight:700}}>{s.name}</span><span className={`badge ${s.business_model==='rank_rent'?'locale':'go'}`}>{s.business_model||'rank_rent'}</span></div>
              <div style={{fontSize:12,color:'var(--text-faint)'}} className="mono">{s.city}, {s.state}</div>
              <div className="flex" style={{flexWrap:'wrap',gap:4,marginTop:8}}><span className="tag">{s.niche}</span><span className="tag">{s.country}</span></div>
              <div className="flex-between" style={{marginTop:12,paddingTop:10,borderTop:'1px solid var(--border)'}}>
                <span style={{fontSize:11,color:'var(--text-faint)'}}>{s.koneqti_score ? `Score: ${s.koneqti_score}/100` : 'not scored'}</span>
                <span className="mono" style={{fontSize:12}}>{s.daily_clicks||0} clicks</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {open && <AddLocalModal onClose={() => setOpen(false)} onDone={() => { setOpen(false); mutate(); }} />}
    </div>
  );
}
function AddLocalModal({ onClose, onDone }) {
  const [f, setF] = useState({ name:'', niche:'', city:'', state:'', country:'US', language:'english', business_model:'rank_rent', scale:'single', wp_url:'', wp_user:'', wp_app_pass:'', gbp_email:'', gbp_password:'' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setF({...f,[k]:e.target.value});
  async function save() {
    setSaving(true);
    try { await api.addSite({ ...f, engine: 'locale' }); onDone(); }
    catch(e) { alert(e.message); setSaving(false); }
  }
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">Add Local Site <span className="engine-tag locale">Locale</span></div>
        <div className="field"><label>Site Name</label><input value={f.name} onChange={set('name')} placeholder="Dallas Plumber" /></div>
        <div className="row">
          <div className="field"><label>Niche</label><input value={f.niche} onChange={set('niche')} placeholder="plumber" /></div>
          <div className="field"><label>Business Model</label><select value={f.business_model} onChange={set('business_model')}><option value="rank_rent">Rank & Rent</option><option value="client_seo">Client SEO</option></select></div>
        </div>
        <div className="field">
          <label>Location Scale</label>
          <div className="row" style={{gap:8}}>
            {[
              {k:'single',t:'Single City'},
              {k:'multi',t:'Multi-City'},
              {k:'nationwide',t:'Nationwide'},
            ].map(o => (
              <button key={o.k} type="button" className={`btn sm ${f.scale===o.k?'locale':'ghost'}`} onClick={()=>setF({...f,scale:o.k})} style={{flex:1}}>{o.t}</button>
            ))}
          </div>
          <div style={{fontSize:11,color:'var(--text-faint)',marginTop:6}}>
            {f.scale==='single' && 'One city — classic rank & rent (home + services + neighborhoods).'}
            {f.scale==='multi' && 'Several cities, one business — per-city landing pages.'}
            {f.scale==='nationwide' && 'State → city pyramid — national service coverage.'}
          </div>
        </div>
        <div className="row">
          <div className="field"><label>{f.scale==='nationwide'?'Primary City (HQ)':'City'}</label><input value={f.city} onChange={set('city')} placeholder="Dallas" /></div>
          <div className="field"><label>State</label><input value={f.state} onChange={set('state')} placeholder="TX" /></div>
        </div>
        <div className="field"><label>WordPress URL</label><input value={f.wp_url} onChange={set('wp_url')} placeholder="https://yoursite.com" /></div>
        <div className="row">
          <div className="field"><label>WP Username</label><input value={f.wp_user} onChange={set('wp_user')} /></div>
          <div className="field"><label>WP App Password</label><input value={f.wp_app_pass} onChange={set('wp_app_pass')} /></div>
        </div>
        <div className="field">
          <label>Google Business Profile login (optional — client-provided)</label>
          <div style={{fontSize:11,color:'var(--text-faint)',marginBottom:6}}>If the client gives you GBP access, the bot can audit/post/manage it the same way it manages WordPress. Log into this site's Chrome profile once manually if 2FA is enabled — the session persists after that.</div>
          <div className="row">
            <input value={f.gbp_email} onChange={set('gbp_email')} placeholder="client@business.com" />
            <input type="password" value={f.gbp_password} onChange={set('gbp_password')} placeholder="GBP password" />
          </div>
        </div>
        <div className="flex-between" style={{marginTop:8}}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn locale" onClick={save} disabled={saving||!f.name}>{saving?'Saving…':'Save Site'}</button>
        </div>
      </div>
    </div>
  );
}
