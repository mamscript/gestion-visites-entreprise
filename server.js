const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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
    if (req.session.user && req.session.user.role === 'manager') {
        res.sendFile(path.join(__dirname, 'public', 'apprentis.html'));
    } else {
        res.redirect('/login');
    }
});

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
