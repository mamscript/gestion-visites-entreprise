// Gestion des apprentis - JavaScript

let apprentis = [];
let entreprises = [];
let currentApprentiId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadApprentis();
    loadEntreprises();
    setupEventListeners();
});

// Vérification de l'authentification
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
            window.location.href = '/login.html';
            return;
        }
        const user = await response.json();
        document.getElementById('userInfo').textContent = `Connecté en tant que ${user.first_name} ${user.last_name}`;
    } catch (error) {
        console.error('Erreur de vérification auth:', error);
        window.location.href = '/login.html';
    }
}

// Chargement des apprentis
async function loadApprentis() {
    try {
        const response = await fetch('/api/apprentis');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
            throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        apprentis = data.data || [];
        displayApprentis(apprentis);
        loadStats();
        populateGroupeFilter();
    } catch (error) {
        console.error('Erreur:', error);
        showAlert(`Erreur lors du chargement des apprentis: ${error.message}`, 'danger');
        
        // Afficher un message dans le tableau
        const tbody = document.getElementById('apprentisTableBody');
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Erreur: ${error.message}</td></tr>`;
    }
}

// Chargement des entreprises
async function loadEntreprises() {
    try {
        const response = await fetch('/api/admin/companies');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
            throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        entreprises = data.data || [];
        populateEntrepriseSelect();
    } catch (error) {
        console.error('Erreur:', error);
        showAlert(`Erreur lors du chargement des entreprises: ${error.message}`, 'warning');
        // Continuer sans les entreprises
        entreprises = [];
        populateEntrepriseSelect();
    }
}

// Affichage des apprentis
function displayApprentis(apprentisToShow) {
    const tbody = document.getElementById('apprentisTableBody');
    
    if (apprentisToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Aucun apprenti trouvé</td></tr>';
        return;
    }
    
    tbody.innerHTML = apprentisToShow.map(apprenti => `
        <tr>
            <td>${apprenti.nom}</td>
            <td>${apprenti.prenom}</td>
            <td><span class="badge bg-info">${apprenti.groupe_classe}</span></td>
            <td>${apprenti.formation}</td>
            <td>${apprenti.entreprise_nom || 'Non assigné'}</td>
            <td><span class="badge ${getStatutBadgeClass(apprenti.statut)}">${getStatutLabel(apprenti.statut)}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewApprenti(${apprenti.id})" title="Voir">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editApprenti(${apprenti.id})" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteApprenti(${apprenti.id})" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Chargement des statistiques
async function loadStats() {
    try {
        const response = await fetch('/api/apprentis/stats/overview');
        if (!response.ok) throw new Error('Erreur lors du chargement');
        
        const data = await response.json();
        const stats = data.data;
        
        document.getElementById('totalApprentis').textContent = stats.total_apprentis;
        document.getElementById('apprentisActifs').textContent = stats.apprentis_actifs;
        document.getElementById('nombreGroupes').textContent = stats.nombre_groupes;
        document.getElementById('nombreEntreprises').textContent = stats.nombre_entreprises;
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Remplissage du filtre des groupes
function populateGroupeFilter() {
    const groupes = [...new Set(apprentis.map(a => a.groupe_classe))].filter(Boolean);
    const select = document.getElementById('groupeFilter');
    
    select.innerHTML = '<option value="">Tous les groupes</option>' +
        groupes.map(groupe => `<option value="${groupe}">${groupe}</option>`).join('');
}

// Remplissage du select des entreprises
function populateEntrepriseSelect() {
    const select = document.getElementById('entreprise_id');
    select.innerHTML = '<option value="">Sélectionner une entreprise</option>' +
        entreprises.map(entreprise => `<option value="${entreprise.id}">${entreprise.name}</option>`).join('');
}

// Configuration des événements
function setupEventListeners() {
    // Recherche
    document.getElementById('searchInput').addEventListener('input', filterApprentis);
    
    // Filtres
    document.getElementById('groupeFilter').addEventListener('change', filterApprentis);
    document.getElementById('statutFilter').addEventListener('change', filterApprentis);
}

// Filtrage des apprentis
function filterApprentis() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const groupe = document.getElementById('groupeFilter').value;
    const statut = document.getElementById('statutFilter').value;
    
    let filtered = apprentis.filter(apprenti => {
        const matchesSearch = !search || 
            apprenti.nom.toLowerCase().includes(search) ||
            apprenti.prenom.toLowerCase().includes(search) ||
            apprenti.formation.toLowerCase().includes(search);
        
        const matchesGroupe = !groupe || apprenti.groupe_classe === groupe;
        const matchesStatut = !statut || apprenti.statut === statut;
        
        return matchesSearch && matchesGroupe && matchesStatut;
    });
    
    displayApprentis(filtered);
}

// Effacer les filtres
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('groupeFilter').value = '';
    document.getElementById('statutFilter').value = '';
    displayApprentis(apprentis);
}

// Afficher le modal d'ajout
function showAddApprentiModal() {
    currentApprentiId = null;
    document.getElementById('apprentiModalTitle').textContent = 'Ajouter un Apprenti';
    document.getElementById('apprentiForm').reset();
    document.getElementById('statut').value = 'actif';
    document.getElementById('annee_formation').value = new Date().getFullYear();
    
    new bootstrap.Modal(document.getElementById('apprentiModal')).show();
}

// Modifier un apprenti
async function editApprenti(id) {
    try {
        const response = await fetch(`/api/apprentis/${id}`);
        if (!response.ok) throw new Error('Erreur lors du chargement');
        
        const data = await response.json();
        const apprenti = data.data;
        
        currentApprentiId = id;
        document.getElementById('apprentiModalTitle').textContent = 'Modifier l\'Apprenti';
        
        // Remplir le formulaire
        document.getElementById('nom').value = apprenti.nom;
        document.getElementById('prenom').value = apprenti.prenom;
        document.getElementById('email').value = apprenti.email || '';
        document.getElementById('telephone').value = apprenti.telephone || '';
        document.getElementById('groupe_classe').value = apprenti.groupe_classe;
        document.getElementById('formation').value = apprenti.formation;
        document.getElementById('annee_formation').value = apprenti.annee_formation;
        document.getElementById('entreprise_id').value = apprenti.entreprise_id || '';
        document.getElementById('maitre_apprentissage_nom').value = apprenti.maitre_apprentissage_nom || '';
        document.getElementById('maitre_apprentissage_email').value = apprenti.maitre_apprentissage_email || '';
        document.getElementById('maitre_apprentissage_telephone').value = apprenti.maitre_apprentissage_telephone || '';
        document.getElementById('date_debut_contrat').value = apprenti.date_debut_contrat || '';
        document.getElementById('date_fin_contrat').value = apprenti.date_fin_contrat || '';
        document.getElementById('statut').value = apprenti.statut;
        document.getElementById('notes').value = apprenti.notes || '';
        
        new bootstrap.Modal(document.getElementById('apprentiModal')).show();
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur lors du chargement de l\'apprenti', 'danger');
    }
}

// Sauvegarder l'apprenti
async function saveApprenti() {
    const formData = {
        nom: document.getElementById('nom').value,
        prenom: document.getElementById('prenom').value,
        email: document.getElementById('email').value,
        telephone: document.getElementById('telephone').value,
        groupe_classe: document.getElementById('groupe_classe').value,
        formation: document.getElementById('formation').value,
        annee_formation: parseInt(document.getElementById('annee_formation').value),
        entreprise_id: document.getElementById('entreprise_id').value || null,
        maitre_apprentissage_nom: document.getElementById('maitre_apprentissage_nom').value,
        maitre_apprentissage_email: document.getElementById('maitre_apprentissage_email').value,
        maitre_apprentissage_telephone: document.getElementById('maitre_apprentissage_telephone').value,
        date_debut_contrat: document.getElementById('date_debut_contrat').value,
        date_fin_contrat: document.getElementById('date_fin_contrat').value,
        statut: document.getElementById('statut').value,
        notes: document.getElementById('notes').value
    };
    
    try {
        const url = currentApprentiId ? `/api/apprentis/${currentApprentiId}` : '/api/apprentis';
        const method = currentApprentiId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la sauvegarde');
        }
        
        const data = await response.json();
        showAlert(data.message, 'success');
        
        bootstrap.Modal.getInstance(document.getElementById('apprentiModal')).hide();
        loadApprentis();
    } catch (error) {
        console.error('Erreur:', error);
        showAlert(error.message, 'danger');
    }
}

// Supprimer un apprenti
async function deleteApprenti(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet apprenti ?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/apprentis/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la suppression');
        }
        
        const data = await response.json();
        showAlert(data.message, 'success');
        loadApprentis();
    } catch (error) {
        console.error('Erreur:', error);
        showAlert(error.message, 'danger');
    }
}

// Voir les détails d'un apprenti
async function viewApprenti(id) {
    try {
        const response = await fetch(`/api/apprentis/${id}`);
        if (!response.ok) throw new Error('Erreur lors du chargement');
        
        const data = await response.json();
        const apprenti = data.data;
        
        // Afficher les détails dans une modal ou une page séparée
        alert(`Détails de l'apprenti:\n\nNom: ${apprenti.nom} ${apprenti.prenom}\nGroupe: ${apprenti.groupe_classe}\nFormation: ${apprenti.formation}\nEntreprise: ${apprenti.entreprise_nom || 'Non assigné'}\nStatut: ${getStatutLabel(apprenti.statut)}`);
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur lors du chargement des détails', 'danger');
    }
}

// Utilitaires
function getStatutBadgeClass(statut) {
    const classes = {
        'actif': 'bg-success',
        'suspendu': 'bg-warning',
        'termine': 'bg-info',
        'abandon': 'bg-danger'
    };
    return classes[statut] || 'bg-secondary';
}

function getStatutLabel(statut) {
    const labels = {
        'actif': 'Actif',
        'suspendu': 'Suspendu',
        'termine': 'Terminé',
        'abandon': 'Abandon'
    };
    return labels[statut] || statut;
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Déconnexion
function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => {
            window.location.href = '/login.html';
        })
        .catch(error => {
            console.error('Erreur de déconnexion:', error);
            window.location.href = '/login.html';
        });
}
