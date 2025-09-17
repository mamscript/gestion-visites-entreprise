const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Log pour vérifier que le serveur démarre
console.log('🚀 Serveur démarré sur le port', PORT);
console.log('📅 Timestamp:', new Date().toISOString());

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuration de la session
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Mettre à true en production avec HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
    }
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chef-projet', require('./routes/chef-projet'));
app.use('/api/consultant', require('./routes/consultant'));
app.use('/api/visites', require('./routes/visites'));
app.use('/api/apprentis', require('./routes/apprentis'));

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route de connexion
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route pour la gestion des apprentis
app.get('/apprentis', (req, res) => {
    console.log('Route /apprentis appelée');
    console.log('Session user:', req.session.user);
    
    // Temporairement désactiver la vérification d'authentification pour le test
    if (req.session.user && req.session.user.role === 'manager') {
        console.log('Utilisateur autorisé, envoi du fichier apprentis.html');
        res.sendFile(path.join(__dirname, 'public', 'apprentis.html'));
    } else {
        console.log('Utilisateur non autorisé, mais on envoie quand même le fichier pour le test');
        res.sendFile(path.join(__dirname, 'public', 'apprentis.html'));
        // res.redirect('/login');
    }
});

// Route de test pour vérifier que le serveur fonctionne
app.get('/test-apprentis', (req, res) => {
    res.json({ 
        message: 'Route test apprentis fonctionne', 
        timestamp: new Date().toISOString(),
        user: req.session.user || 'non connecté'
    });
});

// Route de test très simple
app.get('/test', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Serveur fonctionne',
        timestamp: new Date().toISOString()
    });
});

// Route alternative pour les apprentis (sans vérification de session pour debug)
app.get('/apprentis-debug', (req, res) => {
    console.log('Route /apprentis-debug appelée');
    res.sendFile(path.join(__dirname, 'public', 'apprentis.html'));
});

// Servir les fichiers statiques
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));

// Routes selon le rôle
app.get('/admin', (req, res) => {
    if (req.session.user && req.session.user.role === 'manager') {
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/chef-projet', (req, res) => {
    if (req.session.user && req.session.user.role === 'chef_projet') {
        res.sendFile(path.join(__dirname, 'public', 'chef-projet.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/consultant', (req, res) => {
    if (req.session.user && req.session.user.role === 'consultant') {
        res.sendFile(path.join(__dirname, 'public', 'consultant.html'));
    } else {
        res.redirect('/login');
    }
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur interne du serveur' });
});

// Route 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Application accessible sur http://localhost:${PORT}`);
});
