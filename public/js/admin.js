// Variables globales
let currentUser = null;
let dataTables = {};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadDashboard();
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
        case 'apprentis':
            loadApprentis();
            break;
        case 'entreprises':
            loadEntreprises();
            break;
        case 'visites':
            loadVisites();
            break;
        case 'suivi':
            loadSuivi();
            break;
        case 'utilisateurs':
            loadUtilisateurs();
            break;
    }
}

// Chargement du tableau de bord
async function loadDashboard() {
    try {
        // Charger les statistiques
        const [apprentisResponse, entreprisesResponse, visitesResponse, chefsResponse] = await Promise.all([
            fetch('/api/admin/apprentis'),
            fetch('/api/admin/entreprises'),
            fetch('/api/visites'),
            fetch('/api/admin/chefs-projet')
        ]);

        const apprentis = await apprentisResponse.json();
        const entreprises = await entreprisesResponse.json();
        const visites = await visitesResponse.json();
        const chefs = await chefsResponse.json();

        // Mettre à jour les statistiques
        document.getElementById('statsApprentis').textContent = apprentis.length;
        document.getElementById('statsEntreprises').textContent = entreprises.length;
        document.getElementById('statsVisites').textContent = visites.length;
        document.getElementById('statsChefs').textContent = chefs.length;

        // Charger les visites récentes
        loadRecentVisites(visites.slice(0, 5));

        // Charger la répartition par groupe
        loadRepartitionGroupes(apprentis);

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
                <span class="badge bg-${visite.statut === 'effectuee' ? 'success' : 'warning'}">${visite.statut}</span><br>
                <small class="text-muted">${new Date(visite.date_visite).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
}

// Chargement de la répartition par groupe
function loadRepartitionGroupes(apprentis) {
    const container = document.getElementById('repartitionGroupes');
    
    const groupes = {};
    apprentis.forEach(apprenti => {
        const groupe = apprenti.nom_groupe;
        groupes[groupe] = (groupes[groupe] || 0) + 1;
    });

    container.innerHTML = Object.entries(groupes).map(([groupe, count]) => `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
            <span><strong>${groupe}</strong></span>
            <span class="badge bg-primary">${count} apprentis</span>
        </div>
    `).join('');
}

// Chargement des apprentis
async function loadApprentis() {
    try {
        const response = await fetch('/api/admin/apprentis');
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
                { data: null, render: function(data, type, row) {
                    return `
                        <button class="btn btn-sm btn-warning me-1" onclick="editApprenti(${row.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteApprenti(${row.id})">
                            <i class="fas fa-trash"></i>
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

// Chargement des entreprises
async function loadEntreprises() {
    try {
        const response = await fetch('/api/admin/entreprises');
        const entreprises = await response.json();

        if (dataTables.entreprises) {
            dataTables.entreprises.destroy();
        }

        dataTables.entreprises = $('#entreprisesTable').DataTable({
            data: entreprises,
            columns: [
                { data: 'nom_entreprise' },
                { data: 'enseigne' },
                { data: 'adresse_postale' },
                { data: 'telephone' },
                { data: 'email' },
                { data: null, render: function(data, type, row) {
                    return `
                        <button class="btn btn-sm btn-warning me-1" onclick="editEntreprise(${row.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteEntreprise(${row.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                }}
            ],
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/fr-FR.json'
            }
        });
    } catch (error) {
        console.error('Erreur lors du chargement des entreprises:', error);
    }
}

// Chargement des visites
async function loadVisites() {
    try {
        const response = await fetch('/api/visites');
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
                { data: 'chef_projet_prenom', render: function(data, type, row) {
                    return `${row.chef_projet_prenom} ${row.chef_projet_nom}`;
                }},
                { data: 'modalite' },
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
                        <button class="btn btn-sm btn-danger" onclick="deleteVisite(${row.id})">
                            <i class="fas fa-trash"></i>
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

// Chargement du suivi
async function loadSuivi() {
    try {
        const response = await fetch('/api/admin/suivi-visites');
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
                { data: null, render: function(data, type, row) {
                    const completed = [row.visite_1_date, row.visite_2_date, row.visite_3_date, row.visite_4_date]
                        .filter(date => date).length;
                    const progress = `${completed}/4`;
                    const badgeClass = completed === 4 ? 'success' : completed >= 2 ? 'warning' : 'danger';
                    return `<span class="badge bg-${badgeClass}">${progress}</span>`;
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

// Chargement des utilisateurs
async function loadUtilisateurs() {
    try {
        const [managersResponse, chefsResponse, consultantsResponse] = await Promise.all([
            fetch('/api/admin/chefs-projet'),
            fetch('/api/admin/chefs-projet'),
            fetch('/api/admin/chefs-projet')
        ]);

        const managers = await managersResponse.json();
        const chefs = await chefsResponse.json();
        const consultants = await consultantsResponse.json();

        const utilisateurs = [
            ...managers.map(u => ({...u, role: 'manager'})),
            ...chefs.map(u => ({...u, role: 'chef_projet'})),
            ...consultants.map(u => ({...u, role: 'consultant'}))
        ];

        if (dataTables.utilisateurs) {
            dataTables.utilisateurs.destroy();
        }

        dataTables.utilisateurs = $('#utilisateursTable').DataTable({
            data: utilisateurs,
            columns: [
                { data: 'username' },
                { data: 'first_name' },
                { data: 'last_name' },
                { data: 'email' },
                { data: 'role', render: function(data) {
                    const roles = {
                        'manager': 'Manager',
                        'chef_projet': 'Chef de Projet',
                        'consultant': 'Consultant'
                    };
                    return roles[data] || data;
                }},
                { data: 'is_active', render: function(data) {
                    return data ? '<span class="badge bg-success">Actif</span>' : '<span class="badge bg-danger">Inactif</span>';
                }},
                { data: null, render: function(data, type, row) {
                    return `
                        <button class="btn btn-sm btn-warning me-1" onclick="editUser(${row.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${row.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                }}
            ],
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/fr-FR.json'
            }
        });
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
    }
}

// Fonctions pour les modals (à implémenter selon les besoins)
function showAddApprentiModal() {
    // Implémentation du modal d'ajout d'apprenti
    console.log('Ajouter apprenti');
}

function showAddEntrepriseModal() {
    // Implémentation du modal d'ajout d'entreprise
    console.log('Ajouter entreprise');
}

function showAddUserModal() {
    // Implémentation du modal d'ajout d'utilisateur
    console.log('Ajouter utilisateur');
}

// Fonctions d'édition et suppression (à implémenter)
function editApprenti(id) {
    console.log('Éditer apprenti', id);
}

function deleteApprenti(id) {
    console.log('Supprimer apprenti', id);
}

function editEntreprise(id) {
    console.log('Éditer entreprise', id);
}

function deleteEntreprise(id) {
    console.log('Supprimer entreprise', id);
}

function viewVisite(id) {
    console.log('Voir visite', id);
}

function editVisite(id) {
    console.log('Éditer visite', id);
}

function deleteVisite(id) {
    console.log('Supprimer visite', id);
}

function editUser(id) {
    console.log('Éditer utilisateur', id);
}

function deleteUser(id) {
    console.log('Supprimer utilisateur', id);
}
