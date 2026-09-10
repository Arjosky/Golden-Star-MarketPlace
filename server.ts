import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, getUserByUid, getAllUsers } from './src/db/users.ts';
import { createOrder, getOrdersByUser, getAllOrders, addProductToDb, getAllProductsFromDb, logWorkspaceActivity, getWorkspaceLogs } from './src/db/store.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'cloud_sql_postgresql', timestamp: new Date().toISOString() });
  });

  // Cloud SQL: User Sync API
  app.post('/api/users/sync', async (req, res) => {
    try {
      const { uid, email, name, role, bpId, phone, street, city, pin } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ error: 'Missing uid or email' });
      }
      const user = await getOrCreateUser({ uid, email, name, role, bpId, phone, street, city, pin });
      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Failed to sync user to Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Database error' });
    }
  });

  // Cloud SQL: Get Current User API
  app.get('/api/users/me/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      const user = await getUserByUid(uid);
      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Failed to get user from Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Database error' });
    }
  });

  // Cloud SQL: Orders API
  app.get('/api/orders/:userUid', async (req, res) => {
    try {
      const { userUid } = req.params;
      const orders = await getOrdersByUser(userUid);
      res.json({ success: true, orders });
    } catch (error: any) {
      console.error('Failed to fetch orders from Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Database error' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const order = await createOrder(req.body);
      res.json({ success: true, order });
    } catch (error: any) {
      console.error('Failed to save order to Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Database error' });
    }
  });

  // Cloud SQL: Products API
  app.get('/api/products', async (req, res) => {
    try {
      const products = await getAllProductsFromDb();
      res.json({ success: true, products });
    } catch (error: any) {
      console.error('Failed to fetch products from Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Database error' });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const product = await addProductToDb(req.body);
      res.json({ success: true, product });
    } catch (error: any) {
      console.error('Failed to add product to Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Database error' });
    }
  });

  // Cloud SQL: Workspace Logs (Gmail, Calendar, Drive tracking)
  app.post('/api/workspace/log', async (req, res) => {
    try {
      const { userUid, actionType, details } = req.body;
      const log = await logWorkspaceActivity(userUid, actionType, typeof details === 'string' ? details : JSON.stringify(details));
      res.json({ success: true, log });
    } catch (error: any) {
      console.error('Failed to log workspace activity:', error);
      res.status(500).json({ error: error.message || 'Database error' });
    }
  });

  app.get('/api/workspace/logs/:userUid', async (req, res) => {
    try {
      const { userUid } = req.params;
      const logs = await getWorkspaceLogs(userUid);
      res.json({ success: true, logs });
    } catch (error: any) {
      console.error('Failed to get workspace logs:', error);
      res.status(500).json({ error: error.message || 'Database error' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
