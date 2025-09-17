// Variables globales
let currentUser = null;
let dataTables = {};
let currentFilter = 'all';

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadDashboard();
    setupVisiteForm();
});

// Vérification de l'authentification
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Erreur de vérification auth:', error);
        window.location.href = '/login';
    }
}

// Déconnexion
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (error) {
        console.error('Erreur de déconnexion:', error);
    }
}

// Navigation entre sections
function showSection(sectionName) {
    // Masquer toutes les sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Désactiver tous les liens
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Afficher la section demandée
    document.getElementById(`${sectionName}-section`).style.display = 'block';
    
    // Activer le lien correspondant
    event.target.classList.add('active');
    
    // Charger les données selon la section
    switch(sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'mes-visites':
            loadMesVisites();
            break;
        case 'nouvelle-visite':
            loadApprentisForForm();
            break;
        case 'mes-apprentis':
            loadMesApprentis();
            break;
        case 'suivi':
            loadSuivi();
            break;
    }
}

// Configuration du formulaire de visite
function setupVisiteForm() {
    document.getElementById('visiteForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const visiteData = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch('/api/visites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(visiteData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showAlert('Visite enregistrée avec succès!', 'success');
                resetForm();
                // Recharger les données si on est sur la section des visites
                if (document.getElementById('mes-visites-section').style.display !== 'none') {
                    loadMesVisites();
                }
            } else {
                showAlert(data.message || 'Erreur lors de l\'enregistrement', 'danger');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showAlert('Erreur de connexion au serveur', 'danger');
        }
    });
}

// Chargement du tableau de bord
async function loadDashboard() {
    try {
        // Charger les statistiques
        const response = await fetch('/api/chef-projet/statistiques');
        const stats = await response.json();

        // Mettre à jour les statistiques
        document.getElementById('statsVisitesEffectuees').textContent = stats.totalVisites;
        document.getElementById('statsApprentisSuivis').textContent = stats.apprentisSuivis;
        
        // Calculer les visites par modalité
        const telephoneCount = stats.visitesParModalite.find(v => v.modalite === 'telephone')?.nombre || 0;
        const deplacementCount = stats.visitesParModalite.find(v => v.modalite === 'deplacement')?.nombre || 0;
        
        document.getElementById('statsVisitesTelephone').textContent = telephoneCount;
        document.getElementById('statsVisitesDeplacement').textContent = deplacementCount;

        // Charger les visites récentes
        const visitesResponse = await fetch('/api/chef-projet/visites-effectuees');
        const visites = await visitesResponse.json();
        loadRecentVisites(visites.slice(0, 5));

        // Charger la progression mensuelle
        loadProgressionMensuelle(stats.visitesParMois);

    } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
    }
}

// Chargement des visites récentes
function loadRecentVisites(visites) {
    const container = document.getElementById('recentVisites');
    
    if (visites.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Aucune visite récente</p>';
        return;
    }

    container.innerHTML = visites.map(visite => `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
            <div>
                <strong>${visite.apprenti_prenom} ${visite.apprenti_nom}</strong><br>
                <small class="text-muted">${visite.nom_entreprise}</small>
            </div>
            <div class="text-end">
                <span class="badge bg-${visite.modalite === 'telephone' ? 'info' : 'success'}">${visite.modalite}</span><br>
                <small class="text-muted">${new Date(visite.date_visite).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
}

// Chargement de la progression mensuelle
function loadProgressionMensuelle(visitesMois) {
    const container = document.getElementById('progressionMensuelle');
    
    if (visitesMois.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Aucune donnée disponible</p>';
        return;
    }

    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    container.innerHTML = visitesMois.map(visite => `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
            <span><strong>${mois[visite.mois - 1]}</strong></span>
            <span class="badge bg-primary">${visite.nombre} visites</span>
        </div>
    `).join('');
}

// Chargement des visites du chef de projet
async function loadMesVisites() {
    try {
        const response = await fetch('/api/chef-projet/mes-visites');
        const visites = await response.json();

        if (dataTables.visites) {
            dataTables.visites.destroy();
        }

        dataTables.visites = $('#visitesTable').DataTable({
            data: visites,
            columns: [
                { data: 'date_visite', render: function(data) {
                    return new Date(data).toLocaleDateString();
                }},
                { data: 'apprenti_prenom', render: function(data, type, row) {
                    return `${row.apprenti_prenom} ${row.apprenti_nom}`;
                }},
                { data: 'nom_groupe' },
                { data: 'nom_entreprise' },
                { data: 'modalite', render: function(data) {
                    const badges = {
                        'telephone': 'info',
                        'deplacement': 'success'
                    };
                    return `<span class="badge bg-${badges[data]}">${data}</span>`;
                }},
                { data: 'statut', render: function(data) {
                    const badges = {
                        'planifiee': 'warning',
                        'effectuee': 'success',
                        'annulee': 'danger'
                    };
                    return `<span class="badge bg-${badges[data]}">${data}</span>`;
                }},
                { data: null, render: function(data, type, row) {
                    return `
                        <button class="btn btn-sm btn-info me-1" onclick="viewVisite(${row.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning me-1" onclick="editVisite(${row.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    `;
                }}
            ],
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/fr-FR.json'
            }
        });
    } catch (error) {
        console.error('Erreur lors du chargement des visites:', error);
    }
}

// Filtrage des visites
function filterVisites(filter) {
    currentFilter = filter;
    
    // Mettre à jour les boutons
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Recharger les données avec le filtre
    loadMesVisites();
}

// Chargement des apprentis pour le formulaire
async function loadApprentisForForm() {
    try {
        const response = await fetch('/api/chef-projet/mes-apprentis');
        const apprentis = await response.json();
        
        const select = document.getElementById('apprenti_id');
        select.innerHTML = '<option value="">Sélectionner un apprenti</option>';
        
        apprentis.forEach(apprenti => {
            const option = document.createElement('option');
            option.value = apprenti.id;
            option.textContent = `${apprenti.prenom} ${apprenti.nom} - ${apprenti.nom_groupe} - ${apprenti.nom_entreprise}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des apprentis:', error);
    }
}

// Chargement des apprentis du chef de projet
async function loadMesApprentis() {
    try {
        const response = await fetch('/api/chef-projet/mes-apprentis');
        const apprentis = await response.json();

        if (dataTables.apprentis) {
            dataTables.apprentis.destroy();
        }

        dataTables.apprentis = $('#apprentisTable').DataTable({
            data: apprentis,
            columns: [
                { data: 'nom' },
                { data: 'prenom' },
                { data: 'nom_groupe' },
                { data: 'nom_entreprise' },
                { data: 'maitre_prenom', render: function(data, type, row) {
                    return `${row.maitre_prenom} ${row.maitre_nom}`;
                }},
                { data: 'nb_visites_effectuees' },
                { data: null, render: function(data, type, row) {
                    return `
                        <button class="btn btn-sm btn-primary" onclick="createVisiteForApprenti(${row.id})">
                            <i class="fas fa-plus me-1"></i>Nouvelle Visite
                        </button>
                    `;
                }}
            ],
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/fr-FR.json'
            }
        });
    } catch (error) {
        console.error('Erreur lors du chargement des apprentis:', error);
    }
}

// Chargement du suivi
async function loadSuivi() {
    try {
        const response = await fetch('/api/chef-projet/suivi-mes-apprentis');
        const suivi = await response.json();

        if (dataTables.suivi) {
            dataTables.suivi.destroy();
        }

        dataTables.suivi = $('#suiviTable').DataTable({
            data: suivi,
            columns: [
                { data: 'apprenti_prenom', render: function(data, type, row) {
                    return `${row.apprenti_prenom} ${row.apprenti_nom}`;
                }},
                { data: 'nom_groupe' },
                { data: 'nom_entreprise' },
                { data: 'annee' },
                { data: 'visite_1_date', render: function(data) {
                    return data ? new Date(data).toLocaleDateString() : '-';
                }},
                { data: 'visite_2_date', render: function(data) {
                    return data ? new Date(data).toLocaleDateString() : '-';
                }},
                { data: 'visite_3_date', render: function(data) {
                    return data ? new Date(data).toLocaleDateString() : '-';
                }},
                { data: 'visite_4_date', render: function(data) {
                    return data ? new Date(data).toLocaleDateString() : '-';
                }},
                { data: 'progression', render: function(data) {
                    const badgeClass = data === 'Complet' ? 'success' : 
                                     data.includes('3/4') ? 'warning' : 
                                     data.includes('2/4') ? 'info' : 'danger';
                    return `<span class="badge bg-${badgeClass}">${data}</span>`;
                }}
            ],
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/fr-FR.json'
            }
        });
    } catch (error) {
        console.error('Erreur lors du chargement du suivi:', error);
    }
}

// Fonctions utilitaires
function resetForm() {
    document.getElementById('visiteForm').reset();
}

function showAlert(message, type) {
    // Créer une alerte Bootstrap
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insérer l'alerte en haut de la section active
    const activeSection = document.querySelector('.content-section[style*="block"]');
    activeSection.insertBefore(alertDiv, activeSection.firstChild);
    
    // Supprimer l'alerte après 5 secondes
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Fonctions d'action
function viewVisite(id) {
    // Implémentation de la vue détaillée d'une visite
    console.log('Voir visite', id);
}

function editVisite(id) {
    // Implémentation de l'édition d'une visite
    console.log('Éditer visite', id);
}

function createVisiteForApprenti(apprentiId) {
    // Sélectionner l'apprenti dans le formulaire et aller à la section nouvelle visite
    document.getElementById('apprenti_id').value = apprentiId;
    showSection('nouvelle-visite');
}
