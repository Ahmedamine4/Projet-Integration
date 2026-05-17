import 'dotenv/config';
import app from './app.js'; 
import prisma from './config/prisma.js';

const PORT = process.env.PORT || 3000; // J'ai remis le port 3000

async function demarrerServeur() {
  try {
    await prisma.$connect();
    console.log("🗄️ Connexion PostgreSQL réussie !");

    app.listen(PORT, () => {
      console.log(`🚀 Serveur en écoute sur le port : ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Erreur DB !");
    console.error(error);
    process.exit(1);
  }
}

demarrerServeur();