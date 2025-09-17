-- Données de test pour PostgreSQL

-- Insertion des utilisateurs de test
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('manager1', 'manager1@ecole.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jean', 'Dupont', 'manager'),
('chef1', 'chef1@ecole.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marie', 'Martin', 'chef_projet'),
('chef2', 'chef2@ecole.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pierre', 'Durand', 'chef_projet'),
('consultant1', 'consultant1@ecole.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sophie', 'Leroy', 'consultant'),
('consultant2', 'consultant2@ecole.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Thomas', 'Moreau', 'consultant')
ON CONFLICT (username) DO NOTHING;

-- Insertion des entreprises de test
INSERT INTO companies (name, address, contact_person, contact_email, contact_phone, industry, website) VALUES
('TechCorp Solutions', '123 Rue de la Technologie, 75001 Paris', 'Alice Dubois', 'alice.dubois@techcorp.fr', '01 23 45 67 89', 'Technologie', 'https://www.techcorp.fr'),
('Innovation Plus', '456 Avenue de l''Innovation, 69000 Lyon', 'Bob Martin', 'bob.martin@innovation-plus.fr', '04 56 78 90 12', 'Innovation', 'https://www.innovation-plus.fr'),
('Digital Future', '789 Boulevard du Digital, 13000 Marseille', 'Claire Bernard', 'claire.bernard@digital-future.fr', '04 91 23 45 67', 'Digital', 'https://www.digital-future.fr'),
('Smart Systems', '321 Place des Systèmes, 31000 Toulouse', 'David Leroy', 'david.leroy@smart-systems.fr', '05 61 23 45 67', 'Systèmes', 'https://www.smart-systems.fr')
ON CONFLICT DO NOTHING;

-- Insertion des projets de test
INSERT INTO projects (name, description, company_id, chef_projet_id, start_date, end_date, status, budget) VALUES
('Migration vers le Cloud', 'Migration de l''infrastructure vers AWS', 1, 2, '2024-01-15', '2024-06-15', 'active', 50000.00),
('Formation Digital', 'Formation des équipes aux outils digitaux', 2, 3, '2024-02-01', '2024-05-01', 'planning', 25000.00),
('Audit Sécurité', 'Audit complet de la sécurité informatique', 3, 2, '2024-03-01', '2024-04-30', 'active', 15000.00),
('Développement Mobile', 'Création d''une application mobile', 4, 3, '2024-04-01', '2024-08-31', 'planning', 75000.00)
ON CONFLICT DO NOTHING;

-- Insertion des visites de test
INSERT INTO visits (project_id, consultant_id, visit_date, visit_time, duration_hours, visit_type, objectives, status) VALUES
(1, 4, '2024-01-20', '09:00:00', 4.0, 'consultation', 'Analyse des besoins et planification de la migration', 'completed'),
(1, 5, '2024-01-25', '14:00:00', 3.0, 'formation', 'Formation des équipes sur AWS', 'completed'),
(2, 4, '2024-02-05', '10:00:00', 2.0, 'consultation', 'Présentation des outils digitaux', 'planned'),
(3, 5, '2024-03-05', '09:30:00', 6.0, 'audit', 'Audit de sécurité complet', 'in_progress'),
(4, 4, '2024-04-05', '11:00:00', 4.0, 'consultation', 'Définition des spécifications de l''application', 'planned')
ON CONFLICT DO NOTHING;

-- Insertion des rapports de visite de test
INSERT INTO visit_reports (visit_id, consultant_id, summary, key_points, recommendations, next_steps, satisfaction_rating, is_final) VALUES
(1, 4, 'Visite de consultation réussie pour la migration cloud', 
 'Analyse des besoins complète, équipe motivée, infrastructure actuelle bien documentée',
 'Procéder par étapes, commencer par les applications non-critiques',
 'Préparer la phase de test avec un environnement de développement',
 4, true),
(2, 5, 'Formation AWS bien accueillie par l''équipe',
 'Équipe réceptive, bon niveau technique de base, questions pertinentes',
 'Organiser des sessions de pratique supplémentaires',
 'Planifier des sessions de suivi dans 2 semaines',
 5, true)
ON CONFLICT DO NOTHING;

-- Insertion des tâches de test
INSERT INTO tasks (title, description, project_id, assigned_to, assigned_by, priority, status, due_date, estimated_hours) VALUES
('Préparation environnement AWS', 'Créer les comptes et configurer les environnements de test', 1, 4, 2, 'high', 'completed', '2024-01-18', 8.0),
('Formation équipe DevOps', 'Former l''équipe aux outils de déploiement', 1, 5, 2, 'medium', 'in_progress', '2024-02-15', 16.0),
('Audit sécurité réseau', 'Analyser la sécurité du réseau actuel', 3, 5, 2, 'high', 'pending', '2024-03-10', 12.0),
('Spécifications fonctionnelles', 'Rédiger les spécifications de l''application mobile', 4, 4, 3, 'medium', 'pending', '2024-04-10', 20.0)
ON CONFLICT DO NOTHING;

-- Insertion des notifications de test
INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id) VALUES
(2, 'Nouvelle visite planifiée', 'Une nouvelle visite est prévue pour le projet Migration vers le Cloud', 'info', 'visit', 1),
(3, 'Tâche assignée', 'Vous avez une nouvelle tâche : Formation équipe DevOps', 'info', 'task', 2),
(4, 'Rapport à finaliser', 'Veuillez finaliser le rapport de votre dernière visite', 'warning', 'visit_report', 1),
(5, 'Visite confirmée', 'Votre visite du 5 mars est confirmée', 'success', 'visit', 4)
ON CONFLICT DO NOTHING;
