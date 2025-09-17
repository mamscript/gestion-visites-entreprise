-- Données de test pour l'application de gestion des visites

-- Insertion des utilisateurs
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('manager1', 'manager1@ecole.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jean', 'Dupont', 'manager'),
('chef1', 'chef1@ecole.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marie', 'Martin', 'chef_projet'),
('chef2', 'chef2@ecole.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pierre', 'Durand', 'chef_projet'),
('consultant1', 'consultant1@ecole.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sophie', 'Leroy', 'consultant');

-- Insertion des entreprises
INSERT INTO entreprises (nom_entreprise, enseigne, adresse_postale, telephone, email) VALUES
('TechCorp Solutions', 'TechCorp', '123 Avenue des Technologies, 75001 Paris', '01 23 45 67 89', 'contact@techcorp.fr'),
('Digital Innovations', 'DigitalInno', '456 Rue du Digital, 69000 Lyon', '04 78 90 12 34', 'info@digitalinno.fr'),
('WebMaster Pro', 'WebMaster', '789 Boulevard du Web, 13000 Marseille', '04 91 23 45 67', 'contact@webmaster.fr'),
('DataSoft Enterprise', 'DataSoft', '321 Place des Données, 31000 Toulouse', '05 61 23 45 67', 'info@datasoft.fr');

-- Insertion des maîtres d'apprentissage
INSERT INTO maitres_apprentissage (entreprise_id, nom, prenom, telephone_portable, email, fonction) VALUES
(1, 'Bernard', 'Alain', '06 12 34 56 78', 'alain.bernard@techcorp.fr', 'Chef de projet'),
(1, 'Moreau', 'Claire', '06 23 45 67 89', 'claire.moreau@techcorp.fr', 'Développeuse senior'),
(2, 'Petit', 'Marc', '06 34 56 78 90', 'marc.petit@digitalinno.fr', 'Directeur technique'),
(2, 'Roux', 'Julie', '06 45 67 89 01', 'julie.roux@digitalinno.fr', 'Chef d\'équipe'),
(3, 'Simon', 'Thomas', '06 56 78 90 12', 'thomas.simon@webmaster.fr', 'Lead développeur'),
(3, 'Blanc', 'Nathalie', '06 67 89 01 23', 'nathalie.blanc@webmaster.fr', 'Responsable formation'),
(4, 'Garcia', 'Carlos', '06 78 90 12 34', 'carlos.garcia@datasoft.fr', 'Architecte logiciel'),
(4, 'Lopez', 'Isabelle', '06 89 01 23 45', 'isabelle.lopez@datasoft.fr', 'Chef de projet');

-- Insertion des groupes
INSERT INTO groupes (nom_groupe, annee_scolaire) VALUES
('BTS SIO 1', '2024-2025'),
('BTS SIO 2', '2024-2025'),
('BTS SIO 3', '2024-2025'),
('BTS SIO 4', '2024-2025');

-- Insertion des apprentis
INSERT INTO apprentis (groupe_id, entreprise_id, maitre_apprentissage_id, nom, prenom, email, telephone, adresse, date_debut_contrat, date_fin_contrat) VALUES
(1, 1, 1, 'Dupont', 'Alexandre', 'alexandre.dupont@email.fr', '06 11 22 33 44', '10 Rue de la Paix, 75001 Paris', '2024-09-01', '2026-08-31'),
(1, 1, 2, 'Martin', 'Camille', 'camille.martin@email.fr', '06 22 33 44 55', '20 Avenue des Champs, 75002 Paris', '2024-09-01', '2026-08-31'),
(1, 2, 3, 'Durand', 'Lucas', 'lucas.durand@email.fr', '06 33 44 55 66', '30 Boulevard Saint-Germain, 75005 Paris', '2024-09-01', '2026-08-31'),
(2, 2, 4, 'Leroy', 'Emma', 'emma.leroy@email.fr', '06 44 55 66 77', '40 Rue de Rivoli, 75004 Paris', '2024-09-01', '2026-08-31'),
(2, 3, 5, 'Moreau', 'Hugo', 'hugo.moreau@email.fr', '06 55 66 77 88', '50 Place de la République, 75003 Paris', '2024-09-01', '2026-08-31'),
(2, 3, 6, 'Petit', 'Léa', 'lea.petit@email.fr', '06 66 77 88 99', '60 Rue de la Bastille, 75011 Paris', '2024-09-01', '2026-08-31'),
(3, 4, 7, 'Roux', 'Nathan', 'nathan.roux@email.fr', '06 77 88 99 00', '70 Avenue des Ternes, 75017 Paris', '2024-09-01', '2026-08-31'),
(3, 4, 8, 'Simon', 'Chloé', 'chloe.simon@email.fr', '06 88 99 00 11', '80 Rue de la Pompe, 75016 Paris', '2024-09-01', '2026-08-31'),
(4, 1, 1, 'Blanc', 'Maxime', 'maxime.blanc@email.fr', '06 99 00 11 22', '90 Boulevard Haussmann, 75009 Paris', '2024-09-01', '2026-08-31'),
(4, 2, 3, 'Garcia', 'Manon', 'manon.garcia@email.fr', '06 00 11 22 33', '100 Rue de la Roquette, 75011 Paris', '2024-09-01', '2026-08-31');

-- Insertion de quelques visites de test
INSERT INTO visites (apprenti_id, chef_projet_id, date_visite, modalite, commentaire, apprecations, date_retour_apprenti, statut) VALUES
(1, 2, '2024-10-15', 'deplacement', 'Première visite de suivi. L\'apprenti s\'intègre bien dans l\'équipe.', 'Très satisfaisant. Bonne progression technique.', '2024-10-20', 'effectuee'),
(2, 2, '2024-10-20', 'telephone', 'Visite téléphonique avec le maître d\'apprentissage. Tout se passe bien.', 'Satisfaisant. Quelques points d\'amélioration à travailler.', '2024-10-25', 'effectuee'),
(3, 3, '2024-11-05', 'deplacement', 'Visite sur site. Bonne ambiance de travail.', 'Très satisfaisant. Excellente progression.', '2024-11-10', 'effectuee'),
(1, 2, '2024-12-15', 'deplacement', 'Deuxième visite. Continuité dans la progression.', 'Satisfaisant. Bonne évolution depuis la première visite.', NULL, 'planifiee');

-- Insertion des affectations de visites
INSERT INTO affectations_visites (visite_id, manager_id, chef_projet_id) VALUES
(1, 1, 2),
(2, 1, 2),
(3, 1, 3),
(4, 1, 2);

-- Insertion du suivi des visites annuelles
INSERT INTO suivi_visites_annuelles (apprenti_id, annee, visite_1_id, visite_2_id, visite_3_id, visite_4_id) VALUES
(1, 2024, 1, 4, NULL, NULL),
(2, 2024, 2, NULL, NULL, NULL),
(3, 2024, 3, NULL, NULL, NULL);
