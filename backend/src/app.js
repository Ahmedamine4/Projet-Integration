import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // ton front
  credentials: true
}));
app.use(cors());

// Middlewares
app.use(express.json()); 
app.use(cookieParser());

// Branchement des routes d'authentification
app.use('/api/auth', authRoutes);

// Route de test
app.get("/", (req, res) => {
    res.send('<h1> Hello, API is running maintenant ! </h1>');
});

// Exportation aux normes ES Modules
export default app;