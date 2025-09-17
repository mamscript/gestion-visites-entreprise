const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireAuth, requireRole, getUsersByRole } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Middleware d'authentification et vérification du rôle manager
router.use(requireAuth);
router.use(requireRole(['manager']));

// Route pour obtenir tous les apprentis
router.get('/apprentis', async (req, res) => {
    try {
        const [apprentis] = await pool.execute(`
            SELECT 
                a.*,
                g.nom_groupe,
                e.nom_entreprise,
                e.enseigne,
                ma.nom as maitre_nom,
                ma.prenom as maitre_prenom,
                ma.telephone_portable as maitre_telephone,
                ma.email as maitre_email,
                ma.fonction as maitre_fonction
            FROM apprentis a
            JOIN groupes g ON a.groupe_id = g.id
            JOIN entreprises e ON a.entreprise_id = e.id
            JOIN maitres_apprentissage ma ON a.maitre_apprentissage_id = ma.id
            WHERE a.is_active = 1
            ORDER BY a.nom, a.prenom
        `);

        res.json(apprentis);
    } catch (error) {
        console.error('Erreur lors de la récupération des apprentis:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour obtenir tous les groupes
router.get('/groupes', async (req, res) => {
    try {
        const [groupes] = await pool.execute(
            'SELECT * FROM groupes ORDER BY nom_groupe'
        );

        res.json(groupes);
    } catch (error) {
        console.error('Erreur lors de la récupération des groupes:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour obtenir toutes les entreprises
router.get('/entreprises', async (req, res) => {
    try {
        const [entreprises] = await pool.execute(
            'SELECT * FROM entreprises ORDER BY nom_entreprise'
        );

        res.json(entreprises);
    } catch (error) {
        console.error('Erreur lors de la récupération des entreprises:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour obtenir tous les maîtres d'apprentissage
router.get('/maitres-apprentissage', async (req, res) => {
    try {
        const [maitres] = await pool.execute(`
            SELECT 
                ma.*,
                e.nom_entreprise,
                e.enseigne
            FROM maitres_apprentissage ma
            JOIN entreprises e ON ma.entreprise_id = e.id
            ORDER BY ma.nom, ma.prenom
        `);

        res.json(maitres);
    } catch (error) {
        console.error('Erreur lors de la récupération des maîtres d\'apprentissage:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour obtenir tous les chefs de projet
router.get('/chefs-projet', async (req, res) => {
    try {
        const chefsProjet = await getUsersByRole('chef_projet');
        res.json(chefsProjet);
    } catch (error) {
        console.error('Erreur lors de la récupération des chefs de projet:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour créer un apprenti
router.post('/apprentis', [
    body('groupe_id').isInt().withMessage('ID groupe invalide'),
    body('entreprise_id').isInt().withMessage('ID entreprise invalide'),
    body('maitre_apprentissage_id').isInt().withMessage('ID maître d\'apprentissage invalide'),
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('prenom').notEmpty().withMessage('Le prénom est requis'),
    body('email').optional().isEmail().withMessage('Email invalide'),
    body('telephone').optional().isString(),
    body('adresse').optional().isString(),
    body('date_debut_contrat').isISO8601().withMessage('Date de début invalide'),
    body('date_fin_contrat').isISO8601().withMessage('Date de fin invalide')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const {
            groupe_id,
            entreprise_id,
            maitre_apprentissage_id,
            nom,
            prenom,
            email,
            telephone,
            adresse,
            date_debut_contrat,
            date_fin_contrat
        } = req.body;

        const [result] = await pool.execute(
            'INSERT INTO apprentis (groupe_id, entreprise_id, maitre_apprentissage_id, nom, prenom, email, telephone, adresse, date_debut_contrat, date_fin_contrat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [groupe_id, entreprise_id, maitre_apprentissage_id, nom, prenom, email, telephone, adresse, date_debut_contrat, date_fin_contrat]
        );

        res.status(201).json({
            message: 'Apprenti créé avec succès',
            apprentiId: result.insertId
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'apprenti:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour créer une entreprise
router.post('/entreprises', [
    body('nom_entreprise').notEmpty().withMessage('Le nom de l\'entreprise est requis'),
    body('enseigne').optional().isString(),
    body('adresse_postale').notEmpty().withMessage('L\'adresse est requise'),
    body('telephone').optional().isString(),
    body('email').optional().isEmail().withMessage('Email invalide')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const { nom_entreprise, enseigne, adresse_postale, telephone, email } = req.body;

        const [result] = await pool.execute(
            'INSERT INTO entreprises (nom_entreprise, enseigne, adresse_postale, telephone, email) VALUES (?, ?, ?, ?, ?)',
            [nom_entreprise, enseigne, adresse_postale, telephone, email]
        );

        res.status(201).json({
            message: 'Entreprise créée avec succès',
            entrepriseId: result.insertId
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'entreprise:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour créer un maître d'apprentissage
router.post('/maitres-apprentissage', [
    body('entreprise_id').isInt().withMessage('ID entreprise invalide'),
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('prenom').notEmpty().withMessage('Le prénom est requis'),
    body('telephone_portable').optional().isString(),
    body('email').optional().isEmail().withMessage('Email invalide'),
    body('fonction').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const { entreprise_id, nom, prenom, telephone_portable, email, fonction } = req.body;

        const [result] = await pool.execute(
            'INSERT INTO maitres_apprentissage (entreprise_id, nom, prenom, telephone_portable, email, fonction) VALUES (?, ?, ?, ?, ?, ?)',
            [entreprise_id, nom, prenom, telephone_portable, email, fonction]
        );

        res.status(201).json({
            message: 'Maître d\'apprentissage créé avec succès',
            maitreId: result.insertId
        });
    } catch (error) {
        console.error('Erreur lors de la création du maître d\'apprentissage:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour créer un groupe
router.post('/groupes', [
    body('nom_groupe').notEmpty().withMessage('Le nom du groupe est requis'),
    body('annee_scolaire').notEmpty().withMessage('L\'année scolaire est requise')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const { nom_groupe, annee_scolaire } = req.body;

        const [result] = await pool.execute(
            'INSERT INTO groupes (nom_groupe, annee_scolaire) VALUES (?, ?)',
            [nom_groupe, annee_scolaire]
        );

        res.status(201).json({
            message: 'Groupe créé avec succès',
            groupeId: result.insertId
        });
    } catch (error) {
        console.error('Erreur lors de la création du groupe:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour affecter une visite à un chef de projet
router.post('/affecter-visite', [
    body('visite_id').isInt().withMessage('ID visite invalide'),
    body('chef_projet_id').isInt().withMessage('ID chef de projet invalide')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const { visite_id, chef_projet_id } = req.body;

        // Vérifier que la visite existe
        const [visites] = await pool.execute(
            'SELECT * FROM visites WHERE id = ?',
            [visite_id]
        );

        if (visites.length === 0) {
            return res.status(404).json({ message: 'Visite non trouvée' });
        }

        // Vérifier que le chef de projet existe
        const [chefs] = await pool.execute(
            'SELECT * FROM users WHERE id = ? AND role = "chef_projet"',
            [chef_projet_id]
        );

        if (chefs.length === 0) {
            return res.status(404).json({ message: 'Chef de projet non trouvé' });
        }

        // Créer l'affectation
        await pool.execute(
            'INSERT INTO affectations_visites (visite_id, manager_id, chef_projet_id) VALUES (?, ?, ?)',
            [visite_id, req.session.user.id, chef_projet_id]
        );

        res.status(201).json({ message: 'Visite affectée avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'affectation de la visite:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour obtenir le suivi des visites annuelles
router.get('/suivi-visites', async (req, res) => {
    try {
        const [suivi] = await pool.execute(`
            SELECT 
                sva.*,
                a.nom as apprenti_nom,
                a.prenom as apprenti_prenom,
                g.nom_groupe,
                e.nom_entreprise,
                v1.date_visite as visite_1_date,
                v2.date_visite as visite_2_date,
                v3.date_visite as visite_3_date,
                v4.date_visite as visite_4_date,
                v1.statut as visite_1_statut,
                v2.statut as visite_2_statut,
                v3.statut as visite_3_statut,
                v4.statut as visite_4_statut
            FROM suivi_visites_annuelles sva
            JOIN apprentis a ON sva.apprenti_id = a.id
            JOIN groupes g ON a.groupe_id = g.id
            JOIN entreprises e ON a.entreprise_id = e.id
            LEFT JOIN visites v1 ON sva.visite_1_id = v1.id
            LEFT JOIN visites v2 ON sva.visite_2_id = v2.id
            LEFT JOIN visites v3 ON sva.visite_3_id = v3.id
            LEFT JOIN visites v4 ON sva.visite_4_id = v4.id
            ORDER BY a.nom, a.prenom, sva.annee DESC
        `);

        res.json(suivi);
    } catch (error) {
        console.error('Erreur lors de la récupération du suivi des visites:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

module.exports = router;
