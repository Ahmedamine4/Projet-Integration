import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import projetRoutes from './routes/projet.routes.js';
import LinkInstitutionsToEtudiantRoutes from './routes/link_institutions_etudiant.routes.js';
import getInstitutionRoutes from './routes/institution.routes.js';
import cookieParser from 'cookie-parser';
import aiRoutes from './routes/ai.route.js';
import stageRoutes from './routes/stage.routes.js';
import activiteRoutes from './routes/activite.routes.js';
import portfolioRoutes from './routes/portfolio.routes.js';
import photoRoutes from './routes/photo.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import updateUtilisateurRoutes from './routes/update_utilisateur.routes.js';
import githubRoutes from './routes/github.route.js';
import lettreRecommandationRoutes from './routes/lettre_recommandation.routes.js';
import socialMediaRoutes from './routes/social_media.routes.js';
import certificationRoutes from './routes/certification.route.js';
import followRoutes from './routes/follow.routes.js';
import professeurRoutes from './routes/professeur.routes.js'
import etudiantRoutes from './routes/etudiant.routes.js'
import adminRoutes from './routes/admin.routes.js';
import interactionRoutes from './routes/interaction.routes.js';
import directeurRoutes from './routes/directeur.routes.js';
import feedRoutes from './routes/feed.routes.js';

const app = express();
app.use(cors({
  origin: true, // Autorise les requêtes
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use('/api/directeur', directeurRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/professeur', professeurRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', portfolioRoutes);
app.use('/api/users', photoRoutes);
app.use('/api/lettre-recommandation', lettreRecommandationRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/follow', followRoutes);
// Branchement des routes de gestion des stages
app.use('/api/stages', stageRoutes);
// Branchement des routes de gestion des activites
app.use('/api/activites', activiteRoutes);
app.use('/api', feedRoutes);

//Getting institutions
app.use('/api/getInstitutions', getInstitutionRoutes);

//Linking institutions to students
app.use('/api/select-institutions', LinkInstitutionsToEtudiantRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/github', githubRoutes);
//Modifications des infromations
app.use('/api/users', updateUtilisateurRoutes);


app.use('/api/users', socialMediaRoutes);

app.use('/api/etudiant', etudiantRoutes);

app.use('/api/admin', adminRoutes);
// Branchement des routes d'ajout du projet
app.use('/api', projetRoutes);

// Route de test
app.get("/", (req, res) => {
  res.send('<h1> Hello, API is running maintenant ! </h1>');
});

app.set('trust proxy', true);



// Exportation aux normes ES Modules
export default app;
