const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateUser, createUser } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Route de connexion
router.post('/login', [
    body('username').notEmpty().withMessage('Le nom d\'utilisateur est requis'),
    body('password').notEmpty().withMessage('Le mot de passe est requis')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;
        const user = await authenticateUser(username, password);

        if (!user) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        // Créer la session
        req.session.user = user;
        console.log('Session créée pour user:', user.username);
        console.log('Session ID:', req.sessionID);

        res.json({
            message: 'Connexion réussie',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route de déconnexion
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
        }
        res.json({ message: 'Déconnexion réussie' });
    });
});

// Route pour vérifier l'état de la session
router.get('/me', (req, res) => {
    if (req.session.user) {
        res.json({
            user: {
                id: req.session.user.id,
                username: req.session.user.username,
                email: req.session.user.email,
                firstName: req.session.user.first_name,
                lastName: req.session.user.last_name,
                role: req.session.user.role
            }
        });
    } else {
        res.status(401).json({ message: 'Non authentifié' });
    }
});

// Route pour créer un utilisateur (admin seulement)
router.post('/register', [
    body('username').notEmpty().withMessage('Le nom d\'utilisateur est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('firstName').notEmpty().withMessage('Le prénom est requis'),
    body('lastName').notEmpty().withMessage('Le nom est requis'),
    body('role').isIn(['manager', 'chef_projet', 'consultant']).withMessage('Rôle invalide')
], async (req, res) => {
    try {
        // Vérifier que l'utilisateur est un manager
        if (!req.session.user || req.session.user.role !== 'manager') {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const { username, email, password, firstName, lastName, role } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const [existingUser] = await pool.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Nom d\'utilisateur ou email déjà utilisé' });
        }

        const userId = await createUser({
            username,
            email,
            password,
            firstName,
            lastName,
            role
        });

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            userId: userId
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

module.exports = router;
