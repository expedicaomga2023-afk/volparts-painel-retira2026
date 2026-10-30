import type { Config } from '@netlify/functions';
import { desc, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { orders, type OrderPartRow } from '../../db/schema.js';

const STATUSES = new Set(['pendente', 'pronto', 'entregue', 'cancelado']);
const MAX_BATCH = 200;

interface OrderPayload {
  id: string;
  orderNumber: string;
  customerName: string;
  cpf: string;
  phone: string;
  location: string;
  parts: OrderPartRow[];
  status: string;
  statusChangedAt: string;
  pickupPin?: string;
  pinSentAt?: string;
  updatedAt: string;
}

const isString = (value: unknown): value is string => typeof value === 'string';
const isDate = (value: unknown): value is string =>
  isString(value) && !Number.isNaN(Date.parse(value));

function isPart(value: unknown): value is OrderPartRow {
  if (!value || typeof value !== 'object') return false;
  const part = value as Record<string, unknown>;
  return isString(part.code) && isString(part.description) && typeof part.quantity === 'number';
}

function isOrderPayload(value: unknown): value is OrderPayload {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    isString(o.id) &&
    o.id.length > 0 &&
    isString(o.orderNumber) &&
    isString(o.customerName) &&
    isString(o.cpf) &&
    isString(o.phone) &&
    isString(o.location) &&
    Array.isArray(o.parts) &&
    o.parts.every(isPart) &&
    isString(o.status) &&
    STATUSES.has(o.status) &&
    isDate(o.statusChangedAt) &&
    isDate(o.updatedAt) &&
    (o.pickupPin === undefined || o.pickupPin === null || isString(o.pickupPin)) &&
    (o.pinSentAt === undefined || o.pinSentAt === null || isDate(o.pinSentAt))
  );
}

function toResponse(row: typeof orders.$inferSelect) {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    customerName: row.customerName,
    cpf: row.cpf,
    phone: row.phone,
    location: row.location,
    parts: row.parts,
    status: row.status,
    statusChangedAt: row.statusChangedAt.toISOString(),
    pickupPin: row.pickupPin ?? undefined,
    pinSentAt: row.pinSentAt?.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function listOrders() {
  const rows = await db.select().from(orders).orderBy(desc(orders.statusChangedAt));
  return Response.json(rows.map(toResponse), { headers: { 'Cache-Control': 'no-store' } });
}

async function upsertOrders(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const list = Array.isArray(body) ? body : [body];
  if (list.length === 0) return Response.json([]);
  if (list.length > MAX_BATCH || !list.every(isOrderPayload)) {
    return Response.json({ error: 'Pedido inválido' }, { status: 400 });
  }

  const values = list.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    cpf: o.cpf,
    phone: o.phone,
    location: o.location,
    parts: o.parts,
    status: o.status,
    statusChangedAt: new Date(o.statusChangedAt),
    pickupPin: o.pickupPin ?? null,
    pinSentAt: o.pinSentAt ? new Date(o.pinSentAt) : null,
    updatedAt: new Date(o.updatedAt),
  }));

  // Last write wins: an older edit arriving late (e.g. from an offline device) never overwrites a newer one.
  await db
    .insert(orders)
    .values(values)
    .onConflictDoUpdate({
      target: orders.id,
      set: {
        orderNumber: sql`excluded.order_number`,
        customerName: sql`excluded.customer_name`,
        cpf: sql`excluded.cpf`,
        phone: sql`excluded.phone`,
        location: sql`excluded.location`,
        parts: sql`excluded.parts`,
        status: sql`excluded.status`,
        statusChangedAt: sql`excluded.status_changed_at`,
        pickupPin: sql`excluded.pickup_pin`,
        pinSentAt: sql`excluded.pin_sent_at`,
        updatedAt: sql`excluded.updated_at`,
      },
      setWhere: sql`${orders.updatedAt} <= excluded.updated_at`,
    });

  return Response.json({ ok: true, count: values.length });
}

export default async (req: Request) => {
  if (req.method === 'GET') return listOrders();
  if (req.method === 'PUT') return upsertOrders(req);
  return new Response('Method not allowed', { status: 405 });
};

export const config: Config = {
  path: '/api/orders',
};
