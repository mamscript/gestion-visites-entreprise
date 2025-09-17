-- Base de données pour la gestion des visites d'entreprise
-- Centre de formation professionnelle

-- Table des utilisateurs (managers, chefs de projet, consultants)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('manager', 'chef_projet', 'consultant') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des entreprises
CREATE TABLE entreprises (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom_entreprise VARCHAR(100) NOT NULL,
    enseigne VARCHAR(100),
    adresse_postale TEXT NOT NULL,
    telephone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des maîtres d'apprentissage
CREATE TABLE maitres_apprentissage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entreprise_id INT NOT NULL,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    telephone_portable VARCHAR(20),
    email VARCHAR(100),
    fonction VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE
);

-- Table des groupes/classes
CREATE TABLE groupes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom_groupe VARCHAR(50) NOT NULL,
    annee_scolaire VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des apprentis
CREATE TABLE apprentis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    groupe_id INT NOT NULL,
    entreprise_id INT NOT NULL,
    maitre_apprentissage_id INT NOT NULL,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    telephone VARCHAR(20),
    adresse TEXT,
    date_debut_contrat DATE,
    date_fin_contrat DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (groupe_id) REFERENCES groupes(id) ON DELETE CASCADE,
    FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE,
    FOREIGN KEY (maitre_apprentissage_id) REFERENCES maitres_apprentissage(id) ON DELETE CASCADE
);

-- Table des visites
CREATE TABLE visites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    apprenti_id INT NOT NULL,
    chef_projet_id INT NOT NULL,
    date_visite DATE NOT NULL,
    modalite ENUM('telephone', 'deplacement') NOT NULL,
    commentaire TEXT,
    apprecations TEXT,
    date_retour_apprenti DATE,
    statut ENUM('planifiee', 'effectuee', 'annulee') DEFAULT 'planifiee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (apprenti_id) REFERENCES apprentis(id) ON DELETE CASCADE,
    FOREIGN KEY (chef_projet_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des affectations de visites (par les managers)
CREATE TABLE affectations_visites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    visite_id INT NOT NULL,
    manager_id INT NOT NULL,
    chef_projet_id INT NOT NULL,
    date_affectation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visite_id) REFERENCES visites(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chef_projet_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table de suivi des visites annuelles (4 visites par apprenti par an)
CREATE TABLE suivi_visites_annuelles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    apprenti_id INT NOT NULL,
    annee INT NOT NULL,
    visite_1_id INT,
    visite_2_id INT,
    visite_3_id INT,
    visite_4_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (apprenti_id) REFERENCES apprentis(id) ON DELETE CASCADE,
    FOREIGN KEY (visite_1_id) REFERENCES visites(id) ON DELETE SET NULL,
    FOREIGN KEY (visite_2_id) REFERENCES visites(id) ON DELETE SET NULL,
    FOREIGN KEY (visite_3_id) REFERENCES visites(id) ON DELETE SET NULL,
    FOREIGN KEY (visite_4_id) REFERENCES visites(id) ON DELETE SET NULL,
    UNIQUE KEY unique_apprenti_annee (apprenti_id, annee)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_visites_apprenti ON visites(apprenti_id);
CREATE INDEX idx_visites_chef_projet ON visites(chef_projet_id);
CREATE INDEX idx_visites_date ON visites(date_visite);
CREATE INDEX idx_apprentis_groupe ON apprentis(groupe_id);
CREATE INDEX idx_apprentis_entreprise ON apprentis(entreprise_id);
CREATE INDEX idx_suivi_visites_apprenti ON suivi_visites_annuelles(apprenti_id);
