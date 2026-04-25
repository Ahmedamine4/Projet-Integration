const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5433,
    database: process.env.DB_NAME || 'appdb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
// Startup Connection Test
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Erreur connexion PostgreSQL :', err.stack);
    }
    console.log('✅ PostgreSQL connecté');
    release(); //
})
//Export the pool for use in other services

module.exports = {
    query: (text, params) => pool.query(text, params),
};