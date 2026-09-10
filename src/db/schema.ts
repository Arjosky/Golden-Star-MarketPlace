import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Users table (linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('CUSTOMER'),
  bpId: text('bp_id'),
  phone: text('phone'),
  street: text('street'),
  city: text('city'),
  pin: text('pin'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderId: text('order_id').notNull().unique(),
  userUid: text('user_uid').notNull(),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  deliveryAddress: text('delivery_address'),
  totalAmount: integer('total_amount').notNull(),
  status: text('status').notNull().default('CONFIRMED'),
  items: text('items').notNull(), // JSON stringified array of items
  claimFiled: text('claim_filed').default('false'),
  claimReason: text('claim_reason'),
  claimDescription: text('claim_description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  productId: text('product_id').notNull().unique(),
  sku: text('sku').notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  category: text('category').notNull(),
  mrp: integer('mrp').notNull(),
  clearancePrice: integer('clearance_price').notNull(),
  stock: integer('stock').notNull().default(5),
  imageUrl: text('image_url').notNull(),
  volume: text('volume'),
  description: text('description'),
  sellerConsultantId: text('seller_consultant_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Google Workspace activity logs table (Gmail, Calendar, Drive)
export const workspaceLogs = pgTable('workspace_logs', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  actionType: text('action_type').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});
