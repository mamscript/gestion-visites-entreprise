# 🏢 Gestion des Visites d'Entreprise

Application web complète pour la gestion des visites d'entreprise dans un centre de formation professionnelle. Cette application permet aux chefs de projet pédagogique de suivre les visites des apprentis en entreprise et aux managers de superviser l'ensemble du processus.

## 🎯 Fonctionnalités

### 👨‍💼 Interface Manager/Directeur Pédagogique
- **Tableau de bord** avec statistiques globales
- **Gestion des apprentis** (ajout, modification, suppression)
- **Gestion des entreprises** et maîtres d'apprentissage
- **Affectation des visites** aux chefs de projet
- **Suivi des visites annuelles** (4 visites par apprenti par an)
- **Gestion des utilisateurs** (création de comptes)

### 👨‍🏫 Interface Chef de Projet Pédagogique
- **Tableau de bord personnel** avec statistiques
- **Formulaire de visite complet** avec tous les champs requis :
  - Sélection de l'apprenti et du groupe
  - Informations de l'entreprise et du maître d'apprentissage
  - Coordonnées de l'apprenti
  - Date et modalité de visite (téléphone/déplacement)
  - Commentaires et appréciations
  - Date de retour de l'apprenti
- **Gestion des visites** (planifiées, effectuées)
- **Suivi des apprentis** assignés
- **Progression des visites annuelles**

### 📊 Interface Consultant
- **Tableau de bord analytique** avec graphiques
- **Consultation des données** (visites, apprentis, entreprises)
- **Filtres avancés** par période, statut, modalité, chef de projet
- **Rapports** (mensuel, annuel, complet)
- **Export des données** (CSV, PDF)
- **Statistiques visuelles** avec Chart.js

## 🛠️ Technologies Utilisées

- **Backend**: Node.js, Express.js
- **Base de données**: MySQL
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5
- **Graphiques**: Chart.js
- **Tables**: DataTables
- **Authentification**: Sessions Express
- **Sécurité**: bcryptjs pour le hachage des mots de passe

## 📋 Prérequis

- Node.js (version 14 ou supérieure)
- MySQL (version 5.7 ou supérieure)
- npm ou yarn

## 🚀 Installation

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd gestion-visites-entreprise
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer la base de données**
   - Créer une base de données MySQL nommée `gestion_visites_entreprise`
   - Copier `config.env.example` vers `.env` et configurer les paramètres :
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=votre_mot_de_passe
   DB_NAME=gestion_visites_entreprise
   PORT=3000
   JWT_SECRET=votre_secret_jwt
   SESSION_SECRET=votre_secret_session
   ```

4. **Initialiser la base de données**
   ```bash
   npm run init-db
   ```

5. **Démarrer l'application**
   ```bash
   npm start
   ```

6. **Accéder à l'application**
   Ouvrir votre navigateur sur `http://localhost:3000`

## 👥 Comptes de Test

L'initialisation de la base de données crée automatiquement des comptes de test :

- **Manager**: `manager1` / `password`
- **Chef de Projet**: `chef1` / `password`
- **Consultant**: `consultant1` / `password`

## 📊 Structure de la Base de Données

### Tables Principales
- `users` - Utilisateurs (managers, chefs de projet, consultants)
- `entreprises` - Entreprises partenaires
- `maitres_apprentissage` - Maîtres d'apprentissage
- `groupes` - Groupes/classes d'apprentis
- `apprentis` - Apprentis en formation
- `visites` - Visites effectuées
- `affectations_visites` - Affectation des visites par les managers
- `suivi_visites_annuelles` - Suivi des 4 visites annuelles par apprenti

## 🔐 Gestion des Droits

### Manager/Directeur Pédagogique
- Accès complet à toutes les fonctionnalités
- Création et gestion des utilisateurs
- Affectation des visites aux chefs de projet
- Consultation de toutes les données

### Chef de Projet Pédagogique
- Gestion des visites assignées
- Création de nouvelles visites
- Consultation des apprentis suivis
- Suivi de la progression des visites

### Consultant
- Consultation seule des données
- Génération de rapports
- Export des données
- Analyses statistiques

## 📱 Interface Responsive

L'application est entièrement responsive et s'adapte à tous les écrans :
- Desktop
- Tablette
- Mobile

## 🎨 Design

- Interface moderne avec dégradés de couleurs
- Navigation intuitive avec sidebar
- Cartes statistiques visuelles
- Graphiques interactifs
- Tables avec tri et recherche
- Modals pour les formulaires

## 📈 Fonctionnalités Avancées

### Suivi des Visites Annuelles
- Automatique : 4 visites par apprenti par an
- Suivi de la progression (1/4, 2/4, 3/4, 4/4)
- Alertes pour les visites manquantes

### Filtres et Recherche
- Filtres par période, statut, modalité
- Recherche dans les tables
- Tri par colonnes
- Pagination automatique

### Export et Rapports
- Export CSV des données
- Génération de rapports PDF
- Rapports par période (mois, année, complet)

## 🔧 Scripts Disponibles

```bash
npm start          # Démarrer l'application
npm run dev        # Démarrer en mode développement
npm run init-db    # Initialiser la base de données
```

## 📝 Notes de Développement

- L'application utilise des sessions Express pour l'authentification
- Les mots de passe sont hachés avec bcryptjs
- Les données sont validées côté serveur avec express-validator
- L'interface utilise Bootstrap 5 pour le responsive design
- Les graphiques sont générés avec Chart.js

## 🤝 Contribution

Pour contribuer au projet :
1. Fork le repository
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur le repository GitHub.

---

**Développé pour les centres de formation professionnelle** 🎓
