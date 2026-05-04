import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import aiRoutes from './routes/ai.route.js';

const app = express();
app.use(cors({
  origin: true, // Autorise les requêtes
  credentials: true
}));
// app.use(cors());

// Middlewares
app.use(express.json()); 
app.use(cookieParser());

// Branchement des routes d'authentification
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Route de test
app.get("/", (req, res) => {
    res.send('<h1> Hello, API is running maintenant ! </h1>');
});

// Exportation aux normes ES Modules
export default app;