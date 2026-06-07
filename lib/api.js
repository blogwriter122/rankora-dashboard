import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const ENGINE = process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:3100';

async function call(path, method = 'GET', body) {
  const res = await fetch(`${ENGINE}${path}`, {
    method, headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  health: () => call('/api/health'),
  sites: () => call('/api/sites'),
  addSite: (s) => call('/api/sites', 'POST', s),
  updateSite: (id, f) => call(`/api/sites/${id}`, 'PATCH', f),
  verifySite: (s) => call('/api/sites/verify', 'POST', s),
  // Forge
  nicheAuto: (niche, country) => call('/api/forge/niche/auto', 'POST', { niche, country }),
  nicheManual: (url) => call('/api/forge/niche/manual', 'POST', { url }),
  nicheResults: () => call('/api/forge/niche/results'),
  battleplan: (d) => call('/api/run/battleplan', 'POST', d),
  keywords: (d) => call('/api/run/keywords', 'POST', d),
  silo: (d) => call('/api/run/silo', 'POST', d),
  trust: (d) => call('/api/run/trust', 'POST', d),
  write: (d) => call('/api/run/write', 'POST', d),
  writeSilo: (d) => call('/api/run/write-silo', 'POST', d),
  forgeMonitor: (d) => call('/api/forge/monitor', 'POST', d),
  forgeOffpage: (d) => call('/api/forge/offpage', 'POST', d),
  // Reach
  parasiteWrite: (d) => call('/api/parasite/write', 'POST', d),
  parasiteBulk: (d) => call('/api/parasite/bulk', 'POST', d),
  reachDesign: (d) => call('/api/reach/design', 'POST', d),
  reachWp: (d) => call('/api/reach/wp', 'POST', d),
  reachRevenue: () => call('/api/reach/revenue'),
  reachKeywords: () => call('/api/reach/keywords'),
  reachDiscover: (niche) => call('/api/reach/keywords/discover', 'POST', { niche }),
  reachRevenueRefresh: () => call('/api/reach/revenue/refresh', 'POST', {}),
  // Locale
  localeScore: (d) => call('/api/locale/score', 'POST', d),
  localeRun: (d) => call('/api/locale/run', 'POST', d),
  localePortfolio: () => call('/api/locale/portfolio'),
  // Config + bots + products
  getConfig: () => call('/api/config'),
  saveConfig: (d) => call('/api/config', 'POST', d),
  botStatus: () => call('/api/bots/status'),
  reachProduct: (d) => call('/api/reach/product', 'POST', d),
};

export const fetchers = {
  sites: async () => { const { data } = await supabase.from('sites').select('*').order('created_at', { ascending: false }); return data || []; },
  jobs: async () => { const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(50); return data || []; },
  published: async () => { const { data } = await supabase.from('published').select('*').order('published_at', { ascending: false }).limit(100); return data || []; },
  accounts: async () => { const { data } = await supabase.from('accounts').select('*').order('platform'); return data || []; },
  trends: async () => { const { data } = await supabase.from('trend_signals').select('*').eq('processed', false).order('score', { ascending: false }).limit(50); return data || []; },
  tools: async () => { const { data } = await supabase.from('tools').select('*').order('created_at', { ascending: false }); return data || []; },
};
