import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import { supabase } from './config/supabase.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API active' });
});

app.get('/test-supabase', (_req, res) => {
  if (!supabase) {
    return res.json({
      success: false,
      message: 'Supabase non configuré',
    });
  }

  return res.json({
    success: true,
    message: 'Supabase connecté',
  });
});

app.use('/api/auth', authRoutes);

// toujours à la fin
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route introuvable: ${req.method} ${req.originalUrl}`,
  });
});

export default app;