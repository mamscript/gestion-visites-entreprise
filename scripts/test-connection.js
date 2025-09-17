const mysql = require('mysql2');
require('dotenv').config();

// Configuration de la base de données distante
const dbConfig = {
    host: process.env.DB_HOST || 'db5018638455.hosting-data.io',
    user: process.env.DB_USER || 'dbu586833',
    password: process.env.DB_PASSWORD || 'St3ph3n$on75018!',
    port: process.env.DB_PORT || 3306,
    ssl: false
};

console.log('🔍 Test de connexion à la base de données distante...');
console.log(`Host: ${dbConfig.host}`);
console.log(`User: ${dbConfig.user}`);
console.log(`Port: ${dbConfig.port}`);

// Créer une connexion
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('❌ Erreur de connexion:', err.message);
        process.exit(1);
    }
    
    console.log('✅ Connexion réussie à la base de données distante!');
    
    // Tester la création de la base de données
    connection.query('CREATE DATABASE IF NOT EXISTS gestion_visites_entreprise', (err, result) => {
        if (err) {
            console.error('❌ Erreur lors de la création de la base:', err.message);
        } else {
            console.log('✅ Base de données "gestion_visites_entreprise" créée ou existe déjà');
        }
        
        // Fermer la connexion
        connection.end();
        console.log('🔚 Connexion fermée');
    });
});
