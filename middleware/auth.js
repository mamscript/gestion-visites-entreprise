const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// Middleware pour vérifier l'authentification
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Authentification requise' });
    }
};

// Middleware pour vérifier le rôle
const requireRole = (roles) => {
    return (req, res, next) => {
        if (req.session.user && roles.includes(req.session.user.role)) {
            next();
        } else {
            res.status(403).json({ message: 'Accès refusé - Rôle insuffisant' });
        }
    };
};

// Fonction pour hasher un mot de passe
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Fonction pour vérifier un mot de passe
const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// Fonction pour authentifier un utilisateur
const authenticateUser = async (username, password) => {
    try {
        // Utiliser la syntaxe PostgreSQL ($1, $2) au lieu de MySQL (?)
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 AND is_active = true',
            [username]
        );

        if (!result.rows || result.rows.length === 0) {
            return null;
        }

        const user = result.rows[0];
        const isValidPassword = await verifyPassword(password, user.password_hash);

        if (!isValidPassword) {
            return null;
        }

        // Retourner l'utilisateur sans le mot de passe
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        console.error('Erreur lors de l\'authentification:', error);
        return null;
    }
};

// Fonction pour créer un utilisateur
const createUser = async (userData) => {
    try {
        const hashedPassword = await hashPassword(userData.password);
        
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [
                userData.username,
                userData.email,
                hashedPassword,
                userData.firstName,
                userData.lastName,
                userData.role
            ]
        );

        return result.rows[0].id;
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        throw error;
    }
};

// Fonction pour obtenir les utilisateurs par rôle
const getUsersByRole = async (role) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, first_name, last_name, role, is_active, created_at FROM users WHERE role = $1 AND is_active = true',
            [role]
        );
        return result.rows;
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        throw error;
    }
};

module.exports = {
    requireAuth,
    requireRole,
    hashPassword,
    verifyPassword,
    authenticateUser,
    createUser,
    getUsersByRole
};
