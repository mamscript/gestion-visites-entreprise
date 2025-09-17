const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireAuth, requireRole } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(requireAuth);

// Route pour créer une visite
router.post('/', [
    body('apprenti_id').isInt().withMessage('ID apprenti invalide'),
    body('date_visite').isISO8601().withMessage('Date de visite invalide'),
    body('modalite').isIn(['telephone', 'deplacement']).withMessage('Modalité invalide'),
    body('commentaire').optional().isString(),
    body('apprecations').optional().isString(),
    body('date_retour_apprenti').optional().isISO8601().withMessage('Date de retour invalide')
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
            apprenti_id,
            date_visite,
            modalite,
            commentaire,
            apprecations,
            date_retour_apprenti
        } = req.body;

        // Vérifier que l'apprenti existe
        const [apprenti] = await pool.execute(
            'SELECT * FROM apprentis WHERE id = ? AND is_active = 1',
            [apprenti_id]
        );

        if (apprenti.length === 0) {
            return res.status(404).json({ message: 'Apprenti non trouvé' });
        }

        // Créer la visite
        const [result] = await pool.execute(
            'INSERT INTO visites (apprenti_id, chef_projet_id, date_visite, modalite, commentaire, apprecations, date_retour_apprenti, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                apprenti_id,
                req.session.user.id,
                date_visite,
                modalite,
                commentaire || null,
                apprecations || null,
                date_retour_apprenti || null,
                'effectuee'
            ]
        );

        const visiteId = result.insertId;

        // Mettre à jour le suivi des visites annuelles
        await updateSuiviVisitesAnnuelles(apprenti_id, visiteId);

        res.status(201).json({
            message: 'Visite créée avec succès',
            visiteId: visiteId
        });
    } catch (error) {
        console.error('Erreur lors de la création de la visite:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour obtenir les visites d'un chef de projet
router.get('/chef-projet/:chefProjetId', requireRole(['manager', 'chef_projet']), async (req, res) => {
    try {
        const { chefProjetId } = req.params;
        
        // Vérifier que l'utilisateur peut accéder à ces données
        if (req.session.user.role === 'chef_projet' && req.session.user.id != chefProjetId) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        const [visites] = await pool.execute(`
            SELECT 
                v.*,
                a.nom as apprenti_nom,
                a.prenom as apprenti_prenom,
                g.nom_groupe,
                e.nom_entreprise,
                e.enseigne,
                ma.nom as maitre_nom,
                ma.prenom as maitre_prenom,
                ma.telephone_portable as maitre_telephone,
                ma.email as maitre_email,
                u.first_name as chef_projet_nom,
                u.last_name as chef_projet_prenom
            FROM visites v
            JOIN apprentis a ON v.apprenti_id = a.id
            JOIN groupes g ON a.groupe_id = g.id
            JOIN entreprises e ON a.entreprise_id = e.id
            JOIN maitres_apprentissage ma ON a.maitre_apprentissage_id = ma.id
            JOIN users u ON v.chef_projet_id = u.id
            WHERE v.chef_projet_id = ?
            ORDER BY v.date_visite DESC
        `, [chefProjetId]);

        res.json(visites);
    } catch (error) {
        console.error('Erreur lors de la récupération des visites:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour obtenir toutes les visites (managers et consultants)
router.get('/', requireRole(['manager', 'consultant']), async (req, res) => {
    try {
        const [visites] = await pool.execute(`
            SELECT 
                v.*,
                a.nom as apprenti_nom,
                a.prenom as apprenti_prenom,
                g.nom_groupe,
                e.nom_entreprise,
                e.enseigne,
                ma.nom as maitre_nom,
                ma.prenom as maitre_prenom,
                ma.telephone_portable as maitre_telephone,
                ma.email as maitre_email,
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

// Route pour obtenir une visite spécifique
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

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
            WHERE v.id = ?
        `, [id]);

        if (visites.length === 0) {
            return res.status(404).json({ message: 'Visite non trouvée' });
        }

        res.json(visites[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération de la visite:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour mettre à jour une visite
router.put('/:id', [
    body('date_visite').optional().isISO8601().withMessage('Date de visite invalide'),
    body('modalite').optional().isIn(['telephone', 'deplacement']).withMessage('Modalité invalide'),
    body('commentaire').optional().isString(),
    body('apprecations').optional().isString(),
    body('date_retour_apprenti').optional().isISO8601().withMessage('Date de retour invalide'),
    body('statut').optional().isIn(['planifiee', 'effectuee', 'annulee']).withMessage('Statut invalide')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const updateData = req.body;

        // Vérifier que la visite existe et que l'utilisateur peut la modifier
        const [visites] = await pool.execute(
            'SELECT * FROM visites WHERE id = ?',
            [id]
        );

        if (visites.length === 0) {
            return res.status(404).json({ message: 'Visite non trouvée' });
        }

        // Seul le chef de projet qui a créé la visite ou un manager peut la modifier
        if (req.session.user.role === 'chef_projet' && visites[0].chef_projet_id !== req.session.user.id) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        // Construire la requête de mise à jour
        const fields = [];
        const values = [];

        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
        });

        if (fields.length === 0) {
            return res.status(400).json({ message: 'Aucune donnée à mettre à jour' });
        }

        values.push(id);

        await pool.execute(
            `UPDATE visites SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ message: 'Visite mise à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la visite:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Route pour supprimer une visite
router.delete('/:id', requireRole(['manager']), async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute(
            'DELETE FROM visites WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Visite non trouvée' });
        }

        res.json({ message: 'Visite supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la visite:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Fonction pour mettre à jour le suivi des visites annuelles
async function updateSuiviVisitesAnnuelles(apprentiId, visiteId) {
    try {
        const currentYear = new Date().getFullYear();
        
        // Vérifier si un suivi existe pour cette année
        const [suivi] = await pool.execute(
            'SELECT * FROM suivi_visites_annuelles WHERE apprenti_id = ? AND annee = ?',
            [apprentiId, currentYear]
        );

        if (suivi.length === 0) {
            // Créer un nouveau suivi
            await pool.execute(
                'INSERT INTO suivi_visites_annuelles (apprenti_id, annee, visite_1_id) VALUES (?, ?, ?)',
                [apprentiId, currentYear, visiteId]
            );
        } else {
            // Mettre à jour le suivi existant
            const suiviData = suivi[0];
            let updateField = null;

            if (!suiviData.visite_1_id) {
                updateField = 'visite_1_id';
            } else if (!suiviData.visite_2_id) {
                updateField = 'visite_2_id';
            } else if (!suiviData.visite_3_id) {
                updateField = 'visite_3_id';
            } else if (!suiviData.visite_4_id) {
                updateField = 'visite_4_id';
            }

            if (updateField) {
                await pool.execute(
                    `UPDATE suivi_visites_annuelles SET ${updateField} = ? WHERE id = ?`,
                    [visiteId, suiviData.id]
                );
            }
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du suivi des visites annuelles:', error);
    }
}

module.exports = router;
