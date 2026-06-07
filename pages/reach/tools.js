import { useState } from 'react';
import useSWR from 'swr';
import { fetchers, supabase } from '../../lib/api';
const LIBRARY = ['Word Counter','AI Text Humanizer','Case Converter','Hashtag Generator','BMI Calculator','Meta Description Generator','Blog Income Calculator','QR Code Generator','Loan EMI Calculator','Password Generator'];
export default function ReachTools() {
  const { data: tools = [] } = useSWR('tools', fetchers.tools, { refreshInterval: 10000 });
  const { data: sites = [] } = useSWR('sites', fetchers.sites);
  const [siteId, setSiteId] = useState('');
  const [msg, setMsg] = useState('');
  async function build(name) {
    if (!siteId) return alert('Pick a site');
    try {
      await supabase.from('tools').insert({ site_id: siteId, name, keyword: name.toLowerCase(), status: 'pending' });
      setMsg(`${name} queued`); setTimeout(() => setMsg(''), 3000);
    } catch(e) { alert(e.message); }
  }
  return (
    <div className="fade-in">
      <div className="page-head"><div><div className="flex" style={{gap:10}}><div className="page-title">Tools Empire</div><span className="engine-tag reach">Reach</span></div><div className="page-sub">Generate working tools → 4-6 pageviews per visitor → more ad revenue</div></div>{msg && <span className="badge go">{msg}</span>}</div>
      <div className="field" style={{maxWidth:360}}><label>Target Site</label><select value={siteId} onChange={e=>setSiteId(e.target.value)}><option value="">— select —</option>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
      <div className="grid grid-3" style={{marginTop:10}}>
        {LIBRARY.map(name => {
          const built = tools.find(t => t.name === name && t.site_id === siteId);
          return (
            <div key={name} className="panel" style={{padding:16}}>
              <div className="flex-between"><span style={{fontWeight:600}}>{name}</span>{built && <span className={`badge ${built.status==='published'?'done':'pending'}`}>{built.status}</span>}</div>
              <button className="btn sm ghost" style={{marginTop:10,width:'100%'}} onClick={()=>build(name)} disabled={!!built}>{built?'Queued':'Build & Publish'}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
