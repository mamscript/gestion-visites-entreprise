const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Middleware d'authentification et vérification du rôle chef de projet
router.use(requireAuth);
router.use(requireRole(['chef_projet']));

// Route pour obtenir les visites assignées au chef de projet
router.get('/mes-visites', async (req, res) => {
    try {
        const [visites] = await pool.execute(`
            SELECT 
                v.*,
                a.nom as apprenti_nom,
                a.prenom as apprenti_prenom,
                a.email as apprenti_email,
                a.telephone as apprenti_telephone,
                a.adresse as apprenti_adresse,
                g.nom_groupe,
                e.nom_entreprise,
                e.enseigne,
                e.adresse_postale as entreprise_adresse,
                e.telephone as entreprise_telephone,
                e.email as entreprise_email,
                ma.nom as maitre_nom,
                ma.prenom as maitre_prenom,
                ma.telephone_portable as maitre_telephone,
                ma.email as maitre_email,
                ma.fonction as maitre_fonction
            FROM visites v
            JOIN apprentis a ON v.apprenti_id = a.id
            JOIN groupes g ON a.groupe_id = g.id
            JOIN entreprises e ON a.entreprise_id = e.id
            JOIN maitres_apprentissage ma ON a.maitre_apprentissage_id = ma.id
            WHERE v.chef_projet_id = ?
            ORDER BY v.date_visite DESC
        `, [req.session.user.id]);

        res.json(visites);
    } catch (error) {
        console.error('Erreur lors de la récupération des visites:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour obtenir les visites planifiées (non effectuées)
router.get('/visites-planifiees', async (req, res) => {
    try {
        const [visites] = await pool.execute(`
            SELECT 
                v.*,
                a.nom as apprenti_nom,
                a.prenom as apprenti_prenom,
                a.email as apprenti_email,
                a.telephone as apprenti_telephone,
                a.adresse as apprenti_adresse,
                g.nom_groupe,
                e.nom_entreprise,
                e.enseigne,
                e.adresse_postale as entreprise_adresse,
                e.telephone as entreprise_telephone,
                e.email as entreprise_email,
                ma.nom as maitre_nom,
                ma.prenom as maitre_prenom,
                ma.telephone_portable as maitre_telephone,
                ma.email as maitre_email,
                ma.fonction as maitre_fonction
            FROM visites v
            JOIN apprentis a ON v.apprenti_id = a.id
            JOIN groupes g ON a.groupe_id = g.id
            JOIN entreprises e ON a.entreprise_id = e.id
            JOIN maitres_apprentissage ma ON a.maitre_apprentissage_id = ma.id
            WHERE v.chef_projet_id = ? AND v.statut = 'planifiee'
            ORDER BY v.date_visite ASC
        `, [req.session.user.id]);

        res.json(visites);
    } catch (error) {
        console.error('Erreur lors de la récupération des visites planifiées:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour obtenir les visites effectuées
router.get('/visites-effectuees', async (req, res) => {
    try {
        const [visites] = await pool.execute(`
            SELECT 
                v.*,
                a.nom as apprenti_nom,
                a.prenom as apprenti_prenom,
                a.email as apprenti_email,
                a.telephone as apprenti_telephone,
                a.adresse as apprenti_adresse,
                g.nom_groupe,
                e.nom_entreprise,
                e.enseigne,
                e.adresse_postale as entreprise_adresse,
                e.telephone as entreprise_telephone,
                e.email as entreprise_email,
                ma.nom as maitre_nom,
                ma.prenom as maitre_prenom,
                ma.telephone_portable as maitre_telephone,
                ma.email as maitre_email,
                ma.fonction as maitre_fonction
            FROM visites v
            JOIN apprentis a ON v.apprenti_id = a.id
            JOIN groupes g ON a.groupe_id = g.id
            JOIN entreprises e ON a.entreprise_id = e.id
            JOIN maitres_apprentissage ma ON a.maitre_apprentissage_id = ma.id
            WHERE v.chef_projet_id = ? AND v.statut = 'effectuee'
            ORDER BY v.date_visite DESC
        `, [req.session.user.id]);

        res.json(visites);
    } catch (error) {
        console.error('Erreur lors de la récupération des visites effectuées:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour obtenir les apprentis assignés au chef de projet
router.get('/mes-apprentis', async (req, res) => {
    try {
        const [apprentis] = await pool.execute(`
            SELECT DISTINCT
                a.*,
                g.nom_groupe,
                e.nom_entreprise,
                e.enseigne,
                ma.nom as maitre_nom,
                ma.prenom as maitre_prenom,
                ma.telephone_portable as maitre_telephone,
                ma.email as maitre_email,
                ma.fonction as maitre_fonction,
                COUNT(v.id) as nb_visites_effectuees
            FROM apprentis a
            JOIN groupes g ON a.groupe_id = g.id
            JOIN entreprises e ON a.entreprise_id = e.id
            JOIN maitres_apprentissage ma ON a.maitre_apprentissage_id = ma.id
            LEFT JOIN visites v ON a.id = v.apprenti_id AND v.chef_projet_id = ? AND v.statut = 'effectuee'
            WHERE a.is_active = 1
            GROUP BY a.id
            ORDER BY a.nom, a.prenom
        `, [req.session.user.id]);

        res.json(apprentis);
    } catch (error) {
        console.error('Erreur lors de la récupération des apprentis:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour obtenir le suivi des visites annuelles pour les apprentis du chef de projet
router.get('/suivi-mes-apprentis', async (req, res) => {
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
                v4.statut as visite_4_statut,
                CASE 
                    WHEN v1.id IS NOT NULL AND v2.id IS NOT NULL AND v3.id IS NOT NULL AND v4.id IS NOT NULL THEN 'Complet'
                    WHEN v1.id IS NOT NULL AND v2.id IS NOT NULL AND v3.id IS NOT NULL THEN '3/4'
                    WHEN v1.id IS NOT NULL AND v2.id IS NOT NULL THEN '2/4'
                    WHEN v1.id IS NOT NULL THEN '1/4'
                    ELSE 'Aucune'
                END as progression
            FROM suivi_visites_annuelles sva
            JOIN apprentis a ON sva.apprenti_id = a.id
            JOIN groupes g ON a.groupe_id = g.id
            JOIN entreprises e ON a.entreprise_id = e.id
            LEFT JOIN visites v1 ON sva.visite_1_id = v1.id AND v1.chef_projet_id = ?
            LEFT JOIN visites v2 ON sva.visite_2_id = v2.id AND v2.chef_projet_id = ?
            LEFT JOIN visites v3 ON sva.visite_3_id = v3.id AND v3.chef_projet_id = ?
            LEFT JOIN visites v4 ON sva.visite_4_id = v4.id AND v4.chef_projet_id = ?
            WHERE EXISTS (
                SELECT 1 FROM visites v 
                WHERE v.apprenti_id = a.id AND v.chef_projet_id = ?
            )
            ORDER BY a.nom, a.prenom, sva.annee DESC
        `, [req.session.user.id, req.session.user.id, req.session.user.id, req.session.user.id, req.session.user.id]);

        res.json(suivi);
    } catch (error) {
        console.error('Erreur lors de la récupération du suivi:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour obtenir les statistiques du chef de projet
router.get('/statistiques', async (req, res) => {
    try {
        const chefProjetId = req.session.user.id;
        const currentYear = new Date().getFullYear();

        // Nombre total de visites effectuées cette année
        const [totalVisites] = await pool.execute(
            'SELECT COUNT(*) as total FROM visites WHERE chef_projet_id = ? AND YEAR(date_visite) = ? AND statut = "effectuee"',
            [chefProjetId, currentYear]
        );

        // Nombre d'apprentis suivis
        const [apprentisSuivis] = await pool.execute(
            'SELECT COUNT(DISTINCT apprenti_id) as total FROM visites WHERE chef_projet_id = ? AND YEAR(date_visite) = ?',
            [chefProjetId, currentYear]
        );

        // Visites par modalité
        const [visitesModalite] = await pool.execute(
            'SELECT modalite, COUNT(*) as nombre FROM visites WHERE chef_projet_id = ? AND YEAR(date_visite) = ? AND statut = "effectuee" GROUP BY modalite',
            [chefProjetId, currentYear]
        );

        // Visites par mois
        const [visitesMois] = await pool.execute(
            'SELECT MONTH(date_visite) as mois, COUNT(*) as nombre FROM visites WHERE chef_projet_id = ? AND YEAR(date_visite) = ? AND statut = "effectuee" GROUP BY MONTH(date_visite) ORDER BY mois',
            [chefProjetId, currentYear]
        );

        res.json({
            totalVisites: totalVisites[0].total,
            apprentisSuivis: apprentisSuivis[0].total,
            visitesParModalite: visitesModalite,
            visitesParMois: visitesMois
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

module.exports = router;
