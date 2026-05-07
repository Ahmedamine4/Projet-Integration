import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import LinkInstitutionsToEtudiantRoutes from './routes/link_institutions_etudiant.routes.js';
import getInstitutionRoutes from './routes/institution.routes.js';
import ValidationEtudiantRoutes from './routes/validation_etudiant.routes.js';
import cookieParser from 'cookie-parser';
import aiRoutes from './routes/ai.route.js';
import stageRoutes from './routes/stage.routes.js';

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

// Branchement des routes de gestion des stages
app.use('/api/stages', stageRoutes);

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