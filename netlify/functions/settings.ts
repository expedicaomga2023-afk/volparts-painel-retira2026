import type { Config } from '@netlify/functions';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { appSettings } from '../../db/schema.js';

const SETTINGS_ID = 'default';

async function getSettings() {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.id, SETTINGS_ID));
  const body = row ? { data: row.data, updatedAt: row.updatedAt.toISOString() } : null;
  return Response.json(body, { headers: { 'Cache-Control': 'no-store' } });
}

async function putSettings(req: Request) {
  let body: { data?: unknown; updatedAt?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { data, updatedAt } = body;
  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data) ||
    typeof updatedAt !== 'string' ||
    Number.isNaN(Date.parse(updatedAt))
  ) {
    return Response.json({ error: 'Configuração inválida' }, { status: 400 });
  }

  await db
    .insert(appSettings)
    .values({ id: SETTINGS_ID, data: data as Record<string, unknown>, updatedAt: new Date(updatedAt) })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: { data: sql`excluded.data`, updatedAt: sql`excluded.updated_at` },
      setWhere: sql`${appSettings.updatedAt} <= excluded.updated_at`,
    });

  return Response.json({ ok: true });
}

export default async (req: Request) => {
  if (req.method === 'GET') return getSettings();
  if (req.method === 'PUT') return putSettings(req);
  return new Response('Method not allowed', { status: 405 });
};

export const config: Config = {
  path: '/api/settings',
};
