-- Version simplifiée pour créer la table apprentis

-- Créer la table apprentis
CREATE TABLE IF NOT EXISTS apprentis (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    telephone VARCHAR(20),
    groupe_classe VARCHAR(50),
    formation VARCHAR(100),
    annee_formation INTEGER,
    entreprise_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    maitre_apprentissage_nom VARCHAR(100),
    maitre_apprentissage_email VARCHAR(100),
    maitre_apprentissage_telephone VARCHAR(20),
    date_debut_contrat DATE,
    date_fin_contrat DATE,
    statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'suspendu', 'termine', 'abandon')),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_apprentis_entreprise ON apprentis(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_apprentis_groupe ON apprentis(groupe_classe);
CREATE INDEX IF NOT EXISTS idx_apprentis_statut ON apprentis(statut);
CREATE INDEX IF NOT EXISTS idx_apprentis_active ON apprentis(is_active);

-- Données de test pour les apprentis
INSERT INTO apprentis (nom, prenom, email, telephone, groupe_classe, formation, annee_formation, entreprise_id, maitre_apprentissage_nom, maitre_apprentissage_email, maitre_apprentissage_telephone, date_debut_contrat, date_fin_contrat, statut) VALUES
('Martin', 'Lucas', 'lucas.martin@email.fr', '06 12 34 56 78', 'BTS SIO 1', 'BTS Services Informatiques aux Organisations', 2024, 1, 'Alice Dubois', 'alice.dubois@techcorp.fr', '01 23 45 67 89', '2024-09-01', '2026-08-31', 'actif'),
('Bernard', 'Emma', 'emma.bernard@email.fr', '06 23 45 67 89', 'BTS SIO 1', 'BTS Services Informatiques aux Organisations', 2024, 2, 'Bob Martin', 'bob.martin@innovation-plus.fr', '04 56 78 90 12', '2024-09-01', '2026-08-31', 'actif'),
('Leroy', 'Thomas', 'thomas.leroy@email.fr', '06 34 56 78 90', 'BTS SIO 2', 'BTS Services Informatiques aux Organisations', 2024, 3, 'Claire Bernard', 'claire.bernard@digital-future.fr', '04 91 23 45 67', '2024-09-01', '2026-08-31', 'actif'),
('Moreau', 'Sophie', 'sophie.moreau@email.fr', '06 45 67 89 01', 'BTS SIO 2', 'BTS Services Informatiques aux Organisations', 2024, 4, 'David Leroy', 'david.leroy@smart-systems.fr', '05 61 23 45 67', '2024-09-01', '2026-08-31', 'actif'),
('Petit', 'Alexandre', 'alexandre.petit@email.fr', '06 56 78 90 12', 'BTS SIO 1', 'BTS Services Informatiques aux Organisations', 2024, 1, 'Alice Dubois', 'alice.dubois@techcorp.fr', '01 23 45 67 89', '2024-09-01', '2026-08-31', 'actif')
ON CONFLICT DO NOTHING;
