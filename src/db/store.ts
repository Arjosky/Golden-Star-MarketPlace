import { db } from './index.ts';
import { orders, products, workspaceLogs } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export interface CreateOrderData {
  orderId: string;
  userUid: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  totalAmount: number;
  status?: string;
  items: string;
}

export async function createOrder(data: CreateOrderData) {
  try {
    const result = await db.insert(orders)
      .values({
        orderId: data.orderId,
        userUid: data.userUid,
        customerName: data.customerName,
        phone: data.phone,
        deliveryAddress: data.deliveryAddress,
        totalAmount: data.totalAmount,
        status: data.status || 'CONFIRMED',
        items: data.items,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database create order failed:", error);
    throw new Error("Failed to save order to Cloud SQL.", { cause: error });
  }
}

export async function getOrdersByUser(userUid: string) {
  try {
    return await db.select().from(orders).where(eq(orders.userUid, userUid)).orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error("Database fetch user orders failed:", error);
    throw new Error("Failed to fetch orders from Cloud SQL.", { cause: error });
  }
}

export async function getAllOrders() {
  try {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error("Database fetch all orders failed:", error);
    throw new Error("Failed to fetch all orders from Cloud SQL.", { cause: error });
  }
}

export interface CreateProductData {
  productId: string;
  sku: string;
  title: string;
  subtitle?: string;
  category: string;
  mrp: number;
  clearancePrice: number;
  stock?: number;
  imageUrl: string;
  volume?: string;
  description?: string;
  sellerConsultantId?: string;
}

export async function addProductToDb(data: CreateProductData) {
  try {
    const result = await db.insert(products)
      .values({
        productId: data.productId,
        sku: data.sku,
        title: data.title,
        subtitle: data.subtitle || 'Clearance Liquidation Stock',
        category: data.category,
        mrp: data.mrp,
        clearancePrice: data.clearancePrice,
        stock: data.stock ?? 5,
        imageUrl: data.imageUrl,
        volume: data.volume || '50 ml',
        description: data.description || 'Verified Swedish formulation in custody.',
        sellerConsultantId: data.sellerConsultantId || null,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database add product failed:", error);
    throw new Error("Failed to add product to Cloud SQL.", { cause: error });
  }
}

export async function getAllProductsFromDb() {
  try {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  } catch (error) {
    console.error("Database fetch products failed:", error);
    throw new Error("Failed to fetch products from Cloud SQL.", { cause: error });
  }
}

export async function logWorkspaceActivity(userUid: string, actionType: string, details: string) {
  try {
    return await db.insert(workspaceLogs)
      .values({
        userUid,
        actionType,
        details,
      })
      .returning();
  } catch (error) {
    console.error("Failed to log workspace activity:", error);
    // Silent fail for logging to not break user flow
    return null;
  }
}

export async function getWorkspaceLogs(userUid: string) {
  try {
    return await db.select().from(workspaceLogs).where(eq(workspaceLogs.userUid, userUid)).orderBy(desc(workspaceLogs.createdAt));
  } catch (error) {
    console.error("Failed to get workspace logs:", error);
    return [];
  }
}
