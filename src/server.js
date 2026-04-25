import 'dotenv/config';
import app from './app.js';

// Port du serveur (5000 par défaut)
const PORT = process.env.PORT || 3000;

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}/health`);
});