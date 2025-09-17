require('dotenv').config();

let pool, connection;

// Configuration de la base de données selon l'environnement
if (process.env.DATABASE_URL) {
    // Configuration PostgreSQL pour Vercel (production)
    const { Pool } = require('pg');
    
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    console.log('Configuration PostgreSQL activée avec DATABASE_URL:', process.env.DATABASE_URL.substring(0, 50) + '...');
} else {
    // Configuration MySQL pour le développement local
    const mysql = require('mysql2');
    
    const dbConfig = {
        host: process.env.DB_HOST || 'db5018638455.hosting-data.io',
        user: process.env.DB_USER || 'dbu586833',
        password: process.env.DB_PASSWORD || 'St3ph3n$on75018!',
        database: process.env.DB_NAME || 'gestion_visites_entreprise',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
        ssl: false
    };

    pool = mysql.createPool(dbConfig);
    connection = mysql.createConnection(dbConfig);

    // Test de connexion MySQL
    connection.connect((err) => {
        if (err) {
            console.error('Erreur de connexion à la base de données MySQL:', err);
            return;
        }
        console.log('Connexion à la base de données MySQL établie avec succès');
    });
}

module.exports = { pool, connection };
