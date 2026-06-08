import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'Express Notify API', version: '1.0.0' });
});

export default app;