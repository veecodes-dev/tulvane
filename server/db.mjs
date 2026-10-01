// Orders are stored with libSQL (SQLite-compatible).
// On your computer it uses a local file (server/data/tulvane.db).
// Online, set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to use a free cloud database, so orders survive restarts.
import { createClient } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomInt } from 'node:crypto';

let url = process.env.TURSO_DATABASE_URL;
if (!url) {
  const dir = fileURLToPath(new URL('./data/', import.meta.url));
  mkdirSync(dir, { recursive: true });
  url = pathToFileURL(dir + 'tulvane.db').href;
}
const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
export const dbMode = process.env.TURSO_DATABASE_URL ? 'cloud' : 'local file';

await db.execute(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    stripe_session_id TEXT UNIQUE,
    status TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    delivery_date TEXT,
    note TEXT,
    total_cents INTEGER NOT NULL,
    items_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    paid_at TEXT
  )
`);

export const STATUSES = ['Awaiting payment', 'Preparing', 'On the way', 'Delivered', 'Cancelled'];

// Random ids that are hard to guess, like TV-K7M2QX9D.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newId = () => 'TV-' + Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');

const toOrder = (r) => ({
  id: r.id,
  status: r.status,
  name: r.name,
  address: r.address,
  deliveryDate: r.delivery_date,
  note: r.note,
  total: Number(r.total_cents) / 100,
  items: JSON.parse(r.items_json),
  createdAt: r.created_at,
  paidAt: r.paid_at,
});

export async function createOrder({ name, address, deliveryDate, note, items, totalCents }) {
  const id = newId();
  await db.execute({
    sql: 'INSERT INTO orders (id, status, name, address, delivery_date, note, total_cents, items_json, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
    args: [id, 'Awaiting payment', name, address, deliveryDate || null, note || null, totalCents, JSON.stringify(items), new Date().toISOString()],
  });
  return id;
}

export const attachSession = (id, sessionId) => db.execute({ sql: 'UPDATE orders SET stripe_session_id = ? WHERE id = ?', args: [sessionId, id] });

// Safe to call many times (webhook and the app both call it). Only moves an unpaid order to "Preparing".
export async function markPaid({ id, sessionId }) {
  const now = new Date().toISOString();
  if (id) await db.execute({ sql: "UPDATE orders SET status='Preparing', paid_at=? WHERE id=? AND status='Awaiting payment'", args: [now, id] });
  if (sessionId) await db.execute({ sql: "UPDATE orders SET status='Preparing', paid_at=? WHERE stripe_session_id=? AND status='Awaiting payment'", args: [now, sessionId] });
}

export async function statusesFor(ids) {
  const out = {};
  for (const id of ids.slice(0, 50)) {
    const { rows } = await db.execute({ sql: 'SELECT status, total_cents FROM orders WHERE id = ?', args: [id] });
    if (rows[0]) out[id] = { status: rows[0].status, total: Number(rows[0].total_cents) / 100 };
  }
  return out;
}

export async function listOrders() {
  const { rows } = await db.execute('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200');
  return rows.map(toOrder);
}

export async function deleteOrder(id) {
  const r = await db.execute({ sql: 'DELETE FROM orders WHERE id = ?', args: [id] });
  return r.rowsAffected > 0;
}

export async function setStatus(id, status) {
  if (!STATUSES.includes(status)) return false;
  const r = await db.execute({ sql: 'UPDATE orders SET status = ? WHERE id = ?', args: [status, id] });
  return r.rowsAffected > 0;
}
