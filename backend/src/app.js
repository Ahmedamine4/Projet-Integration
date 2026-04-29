import express from 'express';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Middlewares
app.use(express.json()); 

// Branchement des routes d'authentification
app.use('/api/auth', authRoutes);

// Route de test
app.get("/", (req, res) => {
    res.send('<h1> Hello, API is running maintenant ! </h1>');
});

// Exportation aux normes ES Modules
export default app;