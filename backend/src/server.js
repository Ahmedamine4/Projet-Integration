const app = require("./app");
const prisma = require("./config/db");

const PORT = process.env.PORT || 3000;

async function demarrerServeur() {
  try {
    
    await prisma.$connect();
    console.log("🗄️  Connexion à la base de données PostgreSQL réussie !");

    app.listen(PORT, () => {
      console.log(`🚀 Serveur en écoute sur le port : ${PORT}`);
      console.log("✅ SERVER STARTED ✔");
    });

  } catch (error) {
    console.error("❌ Erreur critique : Impossible de se connecter à la base de données !");
    console.error(error);
    process.exit(1);
  }
}

demarrerServeur();