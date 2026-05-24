// fs sert a verifier si le fichier .env.test existe vraiment.
import fs from 'node:fs';
// path sert a construire proprement les chemins.
import path from 'node:path';
// fileURLToPath permet de retrouver le chemin du fichier courant en ESM.
import { fileURLToPath } from 'node:url';
// dotenv charge les variables d'environnement du fichier .env.test.
import dotenv from 'dotenv';

// On recupere le dossier de ce fichier setup.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// On remonte jusqu'a la racine du backend.
const backendRoot = path.resolve(__dirname, '../..');
// On construit le chemin complet vers .env.test.
const testEnvPath = path.join(backendRoot, '.env.test');

// On force l'environnement test pour tous les fichiers qui importent ce setup.
process.env.NODE_ENV = 'test';

// Si .env.test existe, on charge ses variables.
if (fs.existsSync(testEnvPath)) {
  dotenv.config({
    path: testEnvPath,
    // On n'ecrase pas une variable deja definie ailleurs.
    override: false,
  });
}

// Certains fichiers utilisent JWT_SECRET, d'autres MY_EXPRESS_SECRET.
// On aligne les deux pour eviter des erreurs de configuration.
if (!process.env.MY_EXPRESS_SECRET && process.env.JWT_SECRET) {
  process.env.MY_EXPRESS_SECRET = process.env.JWT_SECRET;
}

if (!process.env.JWT_SECRET && process.env.MY_EXPRESS_SECRET) {
  process.env.JWT_SECRET = process.env.MY_EXPRESS_SECRET;
}

// Meme idee pour la duree d'expiration du token.
if (!process.env.JWT_EXPIRES && process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES = process.env.JWT_EXPIRES_IN;
}

if (!process.env.JWT_EXPIRES_IN && process.env.JWT_EXPIRES) {
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES;
}

// Le backend genere aussi des refresh tokens.
// Donc on met des valeurs de test si elles manquent.
if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = 'integration_refresh_secret';
}

if (!process.env.JWT_REFRESH_EXPIRES_IN) {
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
}

// L'app importe Supabase au demarrage.
// On donne des valeurs minimales pour ne pas casser les imports en test.
if (!process.env.SUPABASE_URL) {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
}

if (!process.env.SUPABASE_ANON_KEY) {
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
}

<<<<<<< HEAD
=======
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
}

>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
// Le middleware peut aussi verifier un token Google via ce secret.
if (!process.env.SUPABASE_JWT_SECRET) {
  process.env.SUPABASE_JWT_SECRET = 'integration_supabase_secret';
}
