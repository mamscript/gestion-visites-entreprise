const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Middleware d'authentification et vérification du rôle consultant
router.use(requireAuth);
router.use(requireRole(['consultant']));

// Route pour obtenir toutes les visites (consultation seule)
router.get('/visites', async (req, res) => {
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
                ma.fonction as maitre_fonction,
                u.first_name as chef_projet_nom,
                u.last_name as chef_projet_prenom
            FROM visites v
            JOIN apprentis a ON v.apprenti_id = a.id
            JOIN groupes g ON a.groupe_id = g.id
            JOIN entreprises e ON a.entreprise_id = e.id
            JOIN maitres_apprentissage ma ON a.maitre_apprentissage_id = ma.id
            JOIN users u ON v.chef_projet_id = u.id
            ORDER BY v.date_visite DESC
        `);

        res.json(visites);
    } catch (error) {
        console.error('Erreur lors de la récupération des visites:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

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
                ma.fonction as maitre_fonction,
                COUNT(v.id) as nb_visites_total
            FROM apprentis a
            JOIN groupes g ON a.groupe_id = g.id
            JOIN entreprises e ON a.entreprise_id = e.id
            JOIN maitres_apprentissage ma ON a.maitre_apprentissage_id = ma.id
            LEFT JOIN visites v ON a.id = v.apprenti_id
            WHERE a.is_active = 1
            GROUP BY a.id
            ORDER BY a.nom, a.prenom
        `);

        res.json(apprentis);
    } catch (error) {
        console.error('Erreur lors de la récupération des apprentis:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour obtenir toutes les entreprises
router.get('/entreprises', async (req, res) => {
    try {
        const [entreprises] = await pool.execute(`
            SELECT 
                e.*,
                COUNT(DISTINCT a.id) as nb_apprentis,
                COUNT(DISTINCT ma.id) as nb_maitres_apprentissage,
                COUNT(DISTINCT v.id) as nb_visites_total
            FROM entreprises e
            LEFT JOIN apprentis a ON e.id = a.entreprise_id AND a.is_active = 1
            LEFT JOIN maitres_apprentissage ma ON e.id = ma.entreprise_id
            LEFT JOIN visites v ON a.id = v.apprenti_id
            GROUP BY e.id
            ORDER BY e.nom_entreprise
        `);

        res.json(entreprises);
    } catch (error) {
        console.error('Erreur lors de la récupération des entreprises:', error);
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
                v4.statut as visite_4_statut,
                v1.modalite as visite_1_modalite,
                v2.modalite as visite_2_modalite,
                v3.modalite as visite_3_modalite,
                v4.modalite as visite_4_modalite,
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

// Route pour obtenir les statistiques globales
router.get('/statistiques', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        // Statistiques générales
        const [totalApprentis] = await pool.execute(
            'SELECT COUNT(*) as total FROM apprentis WHERE is_active = 1'
        );

        const [totalEntreprises] = await pool.execute(
            'SELECT COUNT(*) as total FROM entreprises'
        );

        const [totalVisites] = await pool.execute(
            'SELECT COUNT(*) as total FROM visites WHERE YEAR(date_visite) = ?',
            [currentYear]
        );

        const [totalChefsProjet] = await pool.execute(
            'SELECT COUNT(*) as total FROM users WHERE role = "chef_projet" AND is_active = 1'
        );

        // Visites par modalité
        const [visitesModalite] = await pool.execute(
            'SELECT modalite, COUNT(*) as nombre FROM visites WHERE YEAR(date_visite) = ? GROUP BY modalite',
            [currentYear]
        );

        // Visites par mois
        const [visitesMois] = await pool.execute(
            'SELECT MONTH(date_visite) as mois, COUNT(*) as nombre FROM visites WHERE YEAR(date_visite) = ? GROUP BY MONTH(date_visite) ORDER BY mois',
            [currentYear]
        );

        // Répartition par groupe
        const [repartitionGroupes] = await pool.execute(
            'SELECT g.nom_groupe, COUNT(a.id) as nb_apprentis FROM groupes g LEFT JOIN apprentis a ON g.id = a.groupe_id AND a.is_active = 1 GROUP BY g.id ORDER BY g.nom_groupe'
        );

        // Top entreprises par nombre d'apprentis
        const [topEntreprises] = await pool.execute(
            'SELECT e.nom_entreprise, COUNT(a.id) as nb_apprentis FROM entreprises e LEFT JOIN apprentis a ON e.id = a.entreprise_id AND a.is_active = 1 GROUP BY e.id ORDER BY nb_apprentis DESC LIMIT 10'
        );

        res.json({
            generales: {
                totalApprentis: totalApprentis[0].total,
                totalEntreprises: totalEntreprises[0].total,
                totalVisites: totalVisites[0].total,
                totalChefsProjet: totalChefsProjet[0].total
            },
            visitesParModalite: visitesModalite,
            visitesParMois: visitesMois,
            repartitionGroupes: repartitionGroupes,
            topEntreprises: topEntreprises
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour obtenir les rapports de visites par période
router.get('/rapports/:periode', async (req, res) => {
    try {
        const { periode } = req.params;
        let whereClause = '';
        let params = [];

        switch (periode) {
            case 'mois':
                const currentMonth = new Date().getMonth() + 1;
                const currentYear = new Date().getFullYear();
                whereClause = 'WHERE MONTH(v.date_visite) = ? AND YEAR(v.date_visite) = ?';
                params = [currentMonth, currentYear];
                break;
            case 'annee':
                const year = new Date().getFullYear();
                whereClause = 'WHERE YEAR(v.date_visite) = ?';
                params = [year];
                break;
            case 'tout':
                whereClause = '';
                params = [];
                break;
            default:
                return res.status(400).json({ message: 'Période invalide' });
        }

        const [rapports] = await pool.execute(`
            SELECT 
                v.id,
                v.date_visite,
                v.modalite,
                v.statut,
                v.commentaire,
                v.apprecations,
                a.nom as apprenti_nom,
                a.prenom as apprenti_prenom,
                g.nom_groupe,
                e.nom_entreprise,
                ma.nom as maitre_nom,
                ma.prenom as maitre_prenom,
                u.first_name as chef_projet_nom,
                u.last_name as chef_projet_prenom
            FROM visites v
            JOIN apprentis a ON v.apprenti_id = a.id
            JOIN groupes g ON a.groupe_id = g.id
            JOIN entreprises e ON a.entreprise_id = e.id
            JOIN maitres_apprentissage ma ON a.maitre_apprentissage_id = ma.id
            JOIN users u ON v.chef_projet_id = u.id
            ${whereClause}
            ORDER BY v.date_visite DESC
        `, params);

        res.json(rapports);
    } catch (error) {
        console.error('Erreur lors de la récupération des rapports:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

module.exports = router;
