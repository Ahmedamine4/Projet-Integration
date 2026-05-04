import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import LinkInstitutionsToEtudiantRoutes from './routes/link_institutions_etudiant.routes.js';
import getInstitutionRoutes from './routes/institution.routes.js';
import ValidationEtudiantRoutes from './routes/validation_etudiant.routes.js';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // ton front
  credentials: true
}));
app.use(cors());

// Middlewares
app.use(express.json()); 

// Branchement des routes d'authentification
app.use('/api/auth', authRoutes);

//Getting institutions
app.use('/api/getInstitutions', getInstitutionRoutes);

//Linking institutions to students
app.use('/api/select-institutions', LinkInstitutionsToEtudiantRoutes);

//Validation Directeur - Etudiant
app.use('/api/validation', ValidationEtudiantRoutes);

// Route de test
app.get("/", (req, res) => {
    res.send('<h1> Hello, API is running maintenant ! </h1>');
});

// Exportation aux normes ES Modules
export default app;