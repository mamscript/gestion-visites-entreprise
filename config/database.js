const mysql = require('mysql2');
require('dotenv').config();

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
    ssl: false // Désactiver SSL pour la connexion distante
};

// Créer le pool de connexions
const pool = mysql.createPool(dbConfig);

// Créer une connexion pour les requêtes synchrones
const connection = mysql.createConnection(dbConfig);

// Test de connexion
connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log('Connexion à la base de données MySQL réussie');
});

module.exports = {
    pool,
    connection
};
