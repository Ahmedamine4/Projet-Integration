import express from 'express';
import institutionRoutes from './routes/institution.routes.js';
// import linkEtudiantToInstitutionRoutes from './routes/link_etudiant_institutions.routes.js';

const app = express();

app.use(express.json());

app.use('/api/institutions', institutionRoutes);
// app.use('/api/link-etudiant-institutions', linkEtudiantToInstitutionRoutes);

export default app;