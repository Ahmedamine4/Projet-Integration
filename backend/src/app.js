import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import projetRoutes from './routes/projet.routes.js';
import LinkInstitutionsToEtudiantRoutes from './routes/link_institutions_etudiant.routes.js';
import getInstitutionRoutes from './routes/institution.routes.js';
import ValidationEtudiantRoutes from './routes/validation_etudiant.routes.js';
import cookieParser from 'cookie-parser';
import aiRoutes from './routes/ai.route.js';
import stageRoutes from './routes/stage.routes.js';
import activiteRoutes from './routes/activite.routes.js';
import portfolioRoutes from './routes/portfolio.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import updateUtilisateurRoutes from './routes/update_utilisateur.routes.js';
import ValidationProjetRoutes from './routes/ValidationProjet.routes.js';
import githubRoutes from './routes/github.route.js';



const app = express();
app.use(cors({
  origin: true, // Autorise les requêtes
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', portfolioRoutes);

// Branchement des routes de gestion des stages
app.use('/api/stages', stageRoutes);
// Branchement des routes de gestion des activites
app.use('/api/activites', activiteRoutes);

//Getting institutions
app.use('/api/getInstitutions', getInstitutionRoutes);

//Linking institutions to students
app.use('/api/select-institutions', LinkInstitutionsToEtudiantRoutes);

//Validation Directeur - Etudiant
app.use('/api/validation', ValidationEtudiantRoutes);

// Branchement des routes d'ajout du projet
app.use('/api', projetRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/github', githubRoutes);
//Modifications des infromations
app.use('/api/users', updateUtilisateurRoutes);

app.use('/api', ValidationProjetRoutes);


// Route de test
app.get("/", (req, res) => {
  res.send('<h1> Hello, API is running maintenant ! </h1>');
});

// Exportation aux normes ES Modules
export default app;