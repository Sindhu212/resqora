/* ============================================================
   RESQORA – LifeLine AI
   supabase.js – Backend Adapter
   
   This module provides a unified data access layer that:
   - Uses Supabase (PostgreSQL + Realtime) when credentials
     are configured via window.RESQORA_CONFIG
   - Falls back transparently to LocalStorage when Supabase
     is not configured (demo / offline mode)
   
   SECURITY NOTICE:
   - Never place your service_role key here or in any frontend file.
   - Only the anon (public) key is safe to use in frontend code,
     combined with properly configured Row Level Security (RLS).
   - The service_role key belongs only on a secure backend server.
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════════════════════
   CONFIGURATION
   
   To enable Supabase, add this BEFORE loading supabase.js:

   <script>
     window.RESQORA_CONFIG = {
       supabaseUrl:  'https://YOUR_PROJECT_ID.supabase.co',
       supabaseKey:  'YOUR_ANON_PUBLIC_KEY'    // anon key only — NEVER service_role
     };
   </script>
   
   Without this config block, the app uses LocalStorage only.
══════════════════════════════════════════════════════════ */
const _cfg = (typeof window !== 'undefined' && window.RESQORA_CONFIG) || {};
const SUPABASE_ENABLED = !!(
  _cfg.supabaseUrl &&
  _cfg.supabaseKey &&
  _cfg.supabaseUrl.startsWith('https://') &&
  _cfg.supabaseKey.length > 20
);

/* ══════════════════════════════════════════════════════════
   MODE INDICATOR
   Surfaces the backend mode to the UI
══════════════════════════════════════════════════════════ */
const DB_MODE = SUPABASE_ENABLED ? 'supabase' : 'localstorage';

console.info(
  `[RESQORA Backend] Mode: ${DB_MODE === 'supabase' ? 'Supabase (PostgreSQL + Realtime)' : 'LocalStorage (demo/offline)'}`
);

/* ══════════════════════════════════════════════════════════
   LOCAL STORAGE LAYER (always available as fallback)
══════════════════════════════════════════════════════════ */
const _LS = {
  get(k)  { try { return JSON.parse(localStorage.getItem(k)); } catch(e) { return null; } },
  set(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) { console.warn('[RESQORA LS] set error', k, e); } },
  del(k)  { localStorage.removeItem(k); }
};

const _TABLE_KEY_MAP = {
  emergency_requests: 'rsq_requests',
  ambulances:         'rsq_ambulances',
  hospitals:          'rsq_hospitals',
  patients:           'rsq_patients',
  assignments:        'rsq_assignments',
  emergency_history:  'rsq_history',
  notifications:      'rsq_notifications',
  corporate:          'rsq_corporate',
  activity_log:       'rsq_activity',
  gps_updates:        'rsq_gps_updates'
};

/* ──────────────────────────────────────────────
   LocalStorage CRUD helpers
────────────────────────────────────────────── */
function _lsGetAll(table) {
  return _LS.get(_TABLE_KEY_MAP[table] || table) || [];
}

function _lsInsert(table, record) {
  const rows = _lsGetAll(table);
  rows.unshift(record);
  _LS.set(_TABLE_KEY_MAP[table] || table, rows);
  return { data: record, error: null };
}

function _lsUpdate(table, id, updates) {
  const rows = _lsGetAll(table);
  const idx  = rows.findIndex(r => r.id === id);
  if (idx < 0) return { data: null, error: { message: `Record ${id} not found in ${table}` } };
  rows[idx] = { ...rows[idx], ...updates, updated_at: new Date().toISOString() };
  _LS.set(_TABLE_KEY_MAP[table] || table, rows);
  return { data: rows[idx], error: null };
}

function _lsDelete(table, id) {
  const rows = _lsGetAll(table).filter(r => r.id !== id);
  _LS.set(_TABLE_KEY_MAP[table] || table, rows);
  return { data: null, error: null };
}

function _lsSelect(table, filters = {}) {
  let rows = _lsGetAll(table);
  Object.entries(filters).forEach(([k, v]) => {
    rows = rows.filter(r => r[k] === v);
  });
  return { data: rows, error: null };
}

/* ══════════════════════════════════════════════════════════
   SUPABASE LAYER (only if configured)
══════════════════════════════════════════════════════════ */
let _supabaseClient = null;

async function _initSupabase() {
  if (!SUPABASE_ENABLED) return false;
  if (_supabaseClient) return true;

  // Supabase JS v2 must be loaded via CDN before this script
  if (typeof window.supabase === 'undefined') {
    console.warn('[RESQORA] Supabase JS library not loaded. Add the CDN script before supabase.js.');
    return false;
  }

  try {
    _supabaseClient = window.supabase.createClient(_cfg.supabaseUrl, _cfg.supabaseKey);
    console.info('[RESQORA] Supabase client initialized.');
    return true;
  } catch(e) {
    console.error('[RESQORA] Supabase init error:', e);
    return false;
  }
}

/* ══════════════════════════════════════════════════════════
   UNIFIED DB API
   All functions return { data, error } — same shape as Supabase client
══════════════════════════════════════════════════════════ */
const DB = {

  /* ── SELECT ── */
  async select(table, filters = {}) {
    if (SUPABASE_ENABLED && await _initSupabase()) {
      try {
        let q = _supabaseClient.from(table).select('*');
        Object.entries(filters).forEach(([k, v]) => { q = q.eq(k, v); });
        const { data, error } = await q;
        return { data: data || [], error };
      } catch(e) {
        console.warn('[RESQORA] Supabase select failed, falling back to LS:', e);
      }
    }
    return _lsSelect(table, filters);
  },

  /* ── INSERT ── */
  async insert(table, record) {
    const withTs = { ...record, created_at: record.created_at || new Date().toISOString() };
    if (SUPABASE_ENABLED && await _initSupabase()) {
      try {
        const { data, error } = await _supabaseClient.from(table).insert(withTs).select().single();
        if (!error) {
          // Mirror to LS for offline resilience
          _lsInsert(table, data);
          return { data, error: null };
        }
        console.warn('[RESQORA] Supabase insert failed, falling back to LS:', error);
      } catch(e) {
        console.warn('[RESQORA] Supabase insert exception, falling back to LS:', e);
      }
    }
    return _lsInsert(table, withTs);
  },

  /* ── UPDATE ── */
  async update(table, id, updates) {
    const withTs = { ...updates, updated_at: new Date().toISOString() };
    if (SUPABASE_ENABLED && await _initSupabase()) {
      try {
        const { data, error } = await _supabaseClient.from(table).update(withTs).eq('id', id).select().single();
        if (!error) {
          _lsUpdate(table, id, withTs);
          return { data, error: null };
        }
        console.warn('[RESQORA] Supabase update failed, falling back to LS:', error);
      } catch(e) {
        console.warn('[RESQORA] Supabase update exception, falling back to LS:', e);
      }
    }
    return _lsUpdate(table, id, withTs);
  },

  /* ── DELETE ── */
  async delete(table, id) {
    if (SUPABASE_ENABLED && await _initSupabase()) {
      try {
        const { error } = await _supabaseClient.from(table).delete().eq('id', id);
        if (!error) {
          _lsDelete(table, id);
          return { data: null, error: null };
        }
        console.warn('[RESQORA] Supabase delete failed, falling back to LS:', error);
      } catch(e) {
        console.warn('[RESQORA] Supabase delete exception, falling back to LS:', e);
      }
    }
    return _lsDelete(table, id);
  },

  /* ── GPS UPDATE ── */
  async upsertGPS(ambulanceId, lat, lng, accuracy) {
    const record = {
      ambulance_id: ambulanceId,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      accuracy: accuracy || null,
      recorded_at: new Date().toISOString()
    };
    if (SUPABASE_ENABLED && await _initSupabase()) {
      try {
        await _supabaseClient.from('gps_updates').upsert(record, { onConflict: 'ambulance_id' });
      } catch(e) {
        console.warn('[RESQORA] GPS upsert failed:', e);
      }
    }
    // Always mirror GPS to LS ambulance record
    const ambs = _lsGetAll('ambulances');
    const idx  = ambs.findIndex(a => a.id === ambulanceId);
    if (idx > -1) {
      ambs[idx].lat = record.lat;
      ambs[idx].lng = record.lng;
      ambs[idx].lastGpsUpdate = record.recorded_at;
      ambs[idx].gpsAccuracy   = record.accuracy;
      _LS.set('rsq_ambulances', ambs);
    }
    return record;
  },

  /* ── REALTIME SUBSCRIBE ── */
  subscribe(table, event = '*', callback) {
    if (!SUPABASE_ENABLED || !_supabaseClient) {
      console.info(`[RESQORA] Realtime not available (LocalStorage mode). Table: ${table}`);
      return null;
    }
    const channel = _supabaseClient
      .channel(`realtime-${table}`)
      .on('postgres_changes', { event, schema: 'public', table }, payload => {
        callback(payload);
      })
      .subscribe();
    return channel;
  },

  /* ── AUTH ── */
  auth: {
    async signIn(email, password) {
      if (!SUPABASE_ENABLED || !await _initSupabase()) {
        // Demo mode: accept any credentials as the demo role
        return { data: { user: { email, role: 'demo' } }, error: null };
      }
      return _supabaseClient.auth.signInWithPassword({ email, password });
    },

    async signOut() {
      if (SUPABASE_ENABLED && _supabaseClient) {
        return _supabaseClient.auth.signOut();
      }
      return { error: null };
    },

    async getSession() {
      if (SUPABASE_ENABLED && _supabaseClient) {
        return _supabaseClient.auth.getSession();
      }
      return { data: { session: null }, error: null };
    }
  },

  /* ── UTILITIES ── */
  isSupabaseEnabled() { return SUPABASE_ENABLED; },
  getMode()           { return DB_MODE; }
};

/* ══════════════════════════════════════════════════════════
   SURFACE DB GLOBALLY
   Available as window.ResqoraDB for any portal page
══════════════════════════════════════════════════════════ */
if (typeof window !== 'undefined') {
  window.ResqoraDB = DB;
}
