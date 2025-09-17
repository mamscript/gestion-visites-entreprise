const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration de la base de données distante
const dbConfig = {
    host: process.env.DB_HOST || 'db5018638455.hosting-data.io',
    user: process.env.DB_USER || 'dbu586833',
    password: process.env.DB_PASSWORD || 'St3ph3n$on75018!',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
    ssl: false
};

// Créer une connexion
const connection = mysql.createConnection(dbConfig);

// Fonction pour exécuter les requêtes SQL
function executeSQL(sql) {
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Fonction principale d'initialisation
async function initDatabase() {
    try {
        console.log('🚀 Initialisation de la base de données distante...');
        console.log(`📡 Connexion à: ${dbConfig.host}:${dbConfig.port}`);
        
        // Créer la base de données si elle n'existe pas
        console.log('📊 Création de la base de données...');
        await executeSQL('CREATE DATABASE IF NOT EXISTS gestion_visites_entreprise');
        await executeSQL('USE gestion_visites_entreprise');
        
        // Lire le fichier schema.sql
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // Lire le fichier seed_data.sql
        const seedPath = path.join(__dirname, '..', 'database', 'seed_data.sql');
        const seedSQL = fs.readFileSync(seedPath, 'utf8');
        
        console.log('📊 Création des tables...');
        await executeSQL(schemaSQL);
        
        console.log('🌱 Insertion des données de test...');
        await executeSQL(seedSQL);
        
        console.log('✅ Base de données distante initialisée avec succès!');
        console.log('\n📋 Comptes de test créés:');
        console.log('   Manager: manager1 / password');
        console.log('   Chef Projet: chef1 / password');
        console.log('   Consultant: consultant1 / password');
        console.log('\n🌐 Vous pouvez maintenant démarrer l\'application avec: npm start');
        console.log('\n⚠️  IMPORTANT: Assurez-vous que votre hébergeur permet les connexions Node.js');
        console.log('   ou utilisez un service comme Heroku, Vercel, ou Railway pour héberger Node.js');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error.message);
        console.log('\n💡 Solutions possibles:');
        console.log('   1. Vérifiez que les paramètres de connexion sont corrects');
        console.log('   2. Assurez-vous que votre hébergeur autorise les connexions externes');
        console.log('   3. Vérifiez que le port 3306 est ouvert');
        process.exit(1);
    } finally {
        connection.end();
    }
}

// Exécuter l'initialisation
initDatabase();
