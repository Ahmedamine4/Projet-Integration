// Charger les variables d'environnement (.env)
import 'dotenv/config';

import jwt from 'jsonwebtoken';

// Vérification du secret
if (!process.env.SUPABASE_JWT_SECRET) {
    console.error('❌ ERREUR: SUPABASE_JWT_SECRET manquant dans .env');
    process.exit(1);
}

// Données simulées d'un utilisateur Supabase
const payload = {
    sub: 'user-test-id',        // ID utilisateur (comme Supabase)
    email: 'test@test.com',    // email
    role: 'authenticated',     // optionnel
};

// Génération du token
const token = jwt.sign(
    payload,
    process.env.SUPABASE_JWT_SECRET,
    {
        expiresIn: '1h',
    }
);

// Affichage
console.log('\n✅ TOKEN GENERÉ:\n');
console.log(token);
console.log('\n📌 Utilise ce token dans Postman:\n');
console.log(`Authorization: Bearer ${token}\n`);