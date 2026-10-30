import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export interface OrderPartRow {
  address?: string;
  brand?: string;
  code: string;
  description: string;
  quantity: number;
}

export const orders = pgTable('orders', {
  id: text().primaryKey(),
  orderNumber: text('order_number').notNull(),
  customerName: text('customer_name').notNull(),
  cpf: text().notNull(),
  phone: text().notNull(),
  location: text().notNull(),
  parts: jsonb().$type<OrderPartRow[]>().notNull(),
  status: text().notNull(),
  statusChangedAt: timestamp('status_changed_at', { withTimezone: true, mode: 'date' }).notNull(),
  pickupPin: text('pickup_pin'),
  pinSentAt: timestamp('pin_sent_at', { withTimezone: true, mode: 'date' }),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
});

export const appSettings = pgTable('app_settings', {
  id: text().primaryKey(),
  data: jsonb().$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
});
