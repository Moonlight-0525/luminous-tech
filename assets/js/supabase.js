// ── LUMINOUS TECH — SUPABASE CLIENT ──
// One place for all database config. Never repeat these values.

const SUPABASE_URL = 'https://mmdtxhletzdmuwtiqppz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZHR4aGxldHpkbXV3dGlxcHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDg5MzgsImV4cCI6MjA4ODYyNDkzOH0.aMFeVOjU-osWmLjeDFD5QdAzqy7AJJPSn4-qnGUcZ8o';

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

// ── CORE DB FUNCTION ──
async function dbQuery(table, options = {}) {
  const {
    method = 'GET',
    filters = '',
    body = null,
    select = '*',
    order = 'created_at.desc'
  } = options;

  let url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}&order=${order}${filters}`;

  const config = { method, headers: HEADERS };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(url, config);
  if (method === 'GET') return await res.json();
  return res;
}