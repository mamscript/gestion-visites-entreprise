const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { pool } = require('../config/database');

// Middleware pour vérifier l'authentification (temporairement désactivé pour le test)
// router.use(requireAuth);

// Route pour obtenir tous les apprentis
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, c.name as entreprise_nom 
            FROM apprentis a 
            LEFT JOIN companies c ON a.entreprise_id = c.id 
            WHERE a.is_active = true 
            ORDER BY a.nom, a.prenom
        `);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des apprentis:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des apprentis'
        });
    }
});

// Route pour obtenir un apprenti par ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
            SELECT a.*, c.name as entreprise_nom, c.address as entreprise_adresse,
                   c.contact_person as entreprise_contact, c.contact_email as entreprise_email,
                   c.contact_phone as entreprise_telephone
            FROM apprentis a 
            LEFT JOIN companies c ON a.entreprise_id = c.id 
            WHERE a.id = $1 AND a.is_active = true
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Apprenti non trouvé'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'apprenti:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'apprenti'
        });
    }
});

// Route pour créer un nouvel apprenti (Manager seulement) - temporairement sans auth
router.post('/', async (req, res) => {
    try {
        const {
            nom, prenom, email, telephone, groupe_classe, formation, annee_formation,
            entreprise_id, maitre_apprentissage_nom, maitre_apprentissage_email,
            maitre_apprentissage_telephone, date_debut_contrat, date_fin_contrat, notes
        } = req.body;
        
        // Validation des champs obligatoires
        if (!nom || !prenom || !groupe_classe || !formation || !annee_formation) {
            return res.status(400).json({
                success: false,
                message: 'Les champs nom, prénom, groupe/classe, formation et année sont obligatoires'
            });
        }
        
        const result = await pool.query(`
            INSERT INTO apprentis (
                nom, prenom, email, telephone, groupe_classe, formation, annee_formation,
                entreprise_id, maitre_apprentissage_nom, maitre_apprentissage_email,
                maitre_apprentissage_telephone, date_debut_contrat, date_fin_contrat, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `, [
            nom, prenom, email, telephone, groupe_classe, formation, annee_formation,
            entreprise_id, maitre_apprentissage_nom, maitre_apprentissage_email,
            maitre_apprentissage_telephone, date_debut_contrat, date_fin_contrat, notes
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Apprenti créé avec succès',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'apprenti:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'apprenti'
        });
    }
});

// Route pour mettre à jour un apprenti (Manager seulement) - temporairement sans auth
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nom, prenom, email, telephone, groupe_classe, formation, annee_formation,
            entreprise_id, maitre_apprentissage_nom, maitre_apprentissage_email,
            maitre_apprentissage_telephone, date_debut_contrat, date_fin_contrat, 
            statut, notes
        } = req.body;
        
        const result = await pool.query(`
            UPDATE apprentis SET
                nom = $1, prenom = $2, email = $3, telephone = $4, groupe_classe = $5,
                formation = $6, annee_formation = $7, entreprise_id = $8,
                maitre_apprentissage_nom = $9, maitre_apprentissage_email = $10,
                maitre_apprentissage_telephone = $11, date_debut_contrat = $12,
                date_fin_contrat = $13, statut = $14, notes = $15,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $16 AND is_active = true
            RETURNING *
        `, [
            nom, prenom, email, telephone, groupe_classe, formation, annee_formation,
            entreprise_id, maitre_apprentissage_nom, maitre_apprentissage_email,
            maitre_apprentissage_telephone, date_debut_contrat, date_fin_contrat,
            statut, notes, id
        ]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Apprenti non trouvé'
            });
        }
        
        res.json({
            success: true,
            message: 'Apprenti mis à jour avec succès',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'apprenti:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'apprenti'
        });
    }
});

// Route pour supprimer un apprenti (Manager seulement) - temporairement sans auth
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
            UPDATE apprentis SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND is_active = true
            RETURNING id
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Apprenti non trouvé'
            });
        }
        
        res.json({
            success: true,
            message: 'Apprenti supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'apprenti:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'apprenti'
        });
    }
});

// Route pour obtenir les statistiques des apprentis
router.get('/stats/overview', async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_apprentis,
                COUNT(CASE WHEN statut = 'actif' THEN 1 END) as apprentis_actifs,
                COUNT(CASE WHEN statut = 'termine' THEN 1 END) as apprentis_termines,
                COUNT(CASE WHEN statut = 'suspendu' THEN 1 END) as apprentis_suspendus,
                COUNT(CASE WHEN statut = 'abandon' THEN 1 END) as apprentis_abandons,
                COUNT(DISTINCT groupe_classe) as nombre_groupes,
                COUNT(DISTINCT entreprise_id) as nombre_entreprises
            FROM apprentis 
            WHERE is_active = true
        `);
        
        res.json({
            success: true,
            data: stats.rows[0]
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
});

module.exports = router;
