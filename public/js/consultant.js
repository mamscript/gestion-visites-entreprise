// Variables globales
let currentUser = null;
let dataTables = {};
let charts = {};

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
        case 'visites':
            loadVisites();
            break;
        case 'apprentis':
            loadApprentis();
            break;
        case 'entreprises':
            loadEntreprises();
            break;
        case 'suivi':
            loadSuivi();
            break;
        case 'rapports':
            loadRapports();
            break;
    }
}

// Chargement du tableau de bord
async function loadDashboard() {
    try {
        // Charger les statistiques
        const response = await fetch('/api/consultant/statistiques');
        const stats = await response.json();

        // Mettre à jour les statistiques
        document.getElementById('statsApprentis').textContent = stats.generales.totalApprentis;
        document.getElementById('statsEntreprises').textContent = stats.generales.totalEntreprises;
        document.getElementById('statsVisites').textContent = stats.generales.totalVisites;
        document.getElementById('statsChefs').textContent = stats.generales.totalChefsProjet;

        // Créer les graphiques
        createModaliteChart(stats.visitesParModalite);
        createMoisChart(stats.visitesParMois);
        createGroupesChart(stats.repartitionGroupes);
        loadTopEntreprises(stats.topEntreprises);

    } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
    }
}

// Création du graphique des modalités
function createModaliteChart(data) {
    const ctx = document.getElementById('modaliteChart').getContext('2d');
    
    if (charts.modalite) {
        charts.modalite.destroy();
    }

    const labels = data.map(item => {
        return item.modalite === 'telephone' ? 'Téléphone' : 'Déplacement';
    });
    const values = data.map(item => item.nombre);
    const colors = ['#4ecdc4', '#ff6b6b'];

    charts.modalite = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Création du graphique des mois
function createMoisChart(data) {
    const ctx = document.getElementById('moisChart').getContext('2d');
    
    if (charts.mois) {
        charts.mois.destroy();
    }

    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const values = new Array(12).fill(0);
    
    data.forEach(item => {
        values[item.mois - 1] = item.nombre;
    });

    charts.mois = new Chart(ctx, {
        type: 'line',
        data: {
            labels: mois,
            datasets: [{
                label: 'Visites',
                data: values,
                borderColor: '#4ecdc4',
                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Création du graphique des groupes
function createGroupesChart(data) {
    const ctx = document.getElementById('groupesChart').getContext('2d');
    
    if (charts.groupes) {
        charts.groupes.destroy();
    }

    const labels = data.map(item => item.nom_groupe);
    const values = data.map(item => item.nb_apprentis);
    const colors = ['#4ecdc4', '#ff6b6b', '#ffd93d', '#74b9ff', '#a8edea'];

    charts.groupes = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nombre d\'apprentis',
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Chargement du top des entreprises
function loadTopEntreprises(entreprises) {
    const container = document.getElementById('topEntreprises');
    
    if (entreprises.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Aucune donnée disponible</p>';
        return;
    }

    container.innerHTML = entreprises.map((entreprise, index) => `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
            <div>
                <strong>${index + 1}. ${entreprise.nom_entreprise}</strong><br>
                <small class="text-muted">${entreprise.nb_apprentis} apprentis</small>
            </div>
            <span class="badge bg-primary">${entreprise.nb_apprentis}</span>
        </div>
    `).join('');
}

// Chargement des visites
async function loadVisites() {
    try {
        const response = await fetch('/api/consultant/visites');
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
                        <button class="btn btn-sm btn-info" onclick="viewVisite(${row.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    `;
                }}
            ],
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/fr-FR.json'
            }
        });

        // Charger les chefs de projet pour le filtre
        loadChefsProjetFilter();

    } catch (error) {
        console.error('Erreur lors du chargement des visites:', error);
    }
}

// Chargement des chefs de projet pour le filtre
async function loadChefsProjetFilter() {
    try {
        const response = await fetch('/api/admin/chefs-projet');
        const chefs = await response.json();
        
        const select = document.getElementById('filterChefProjet');
        select.innerHTML = '<option value="">Tous les chefs de projet</option>';
        
        chefs.forEach(chef => {
            const option = document.createElement('option');
            option.value = chef.id;
            option.textContent = `${chef.first_name} ${chef.last_name}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des chefs de projet:', error);
    }
}

// Filtrage des visites
function filterVisites() {
    const periode = document.getElementById('filterPeriode').value;
    const statut = document.getElementById('filterStatut').value;
    const modalite = document.getElementById('filterModalite').value;
    const chefProjet = document.getElementById('filterChefProjet').value;

    // Appliquer les filtres à la DataTable
    if (dataTables.visites) {
        dataTables.visites.clear();
        
        // Recharger les données avec les filtres
        loadVisitesWithFilters(periode, statut, modalite, chefProjet);
    }
}

// Chargement des visites avec filtres
async function loadVisitesWithFilters(periode, statut, modalite, chefProjet) {
    try {
        let url = '/api/consultant/visites';
        
        // Construire l'URL avec les paramètres de filtre
        const params = new URLSearchParams();
        if (periode && periode !== 'tout') {
            params.append('periode', periode);
        }
        if (statut) {
            params.append('statut', statut);
        }
        if (modalite) {
            params.append('modalite', modalite);
        }
        if (chefProjet) {
            params.append('chef_projet', chefProjet);
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }

        const response = await fetch(url);
        const visites = await response.json();

        dataTables.visites.clear();
        dataTables.visites.rows.add(visites);
        dataTables.visites.draw();

    } catch (error) {
        console.error('Erreur lors du filtrage des visites:', error);
    }
}

// Chargement des apprentis
async function loadApprentis() {
    try {
        const response = await fetch('/api/consultant/apprentis');
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
                { data: 'nb_visites_total' },
                { data: null, render: function(data, type, row) {
                    return `
                        <button class="btn btn-sm btn-info" onclick="viewApprenti(${row.id})">
                            <i class="fas fa-eye"></i>
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
        const response = await fetch('/api/consultant/entreprises');
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
                { data: 'nb_apprentis' },
                { data: 'nb_visites_total' },
                { data: null, render: function(data, type, row) {
                    return `
                        <button class="btn btn-sm btn-info" onclick="viewEntreprise(${row.id})">
                            <i class="fas fa-eye"></i>
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

// Chargement du suivi
async function loadSuivi() {
    try {
        const response = await fetch('/api/consultant/suivi-visites');
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

// Chargement des rapports
function loadRapports() {
    // Cette fonction peut être étendue pour charger des rapports prédéfinis
    console.log('Chargement des rapports');
}

// Fonctions d'export
function exportVisites(format) {
    if (dataTables.visites) {
        if (format === 'csv') {
            dataTables.visites.button('.buttons-csv').trigger();
        } else if (format === 'pdf') {
            dataTables.visites.button('.buttons-pdf').trigger();
        }
    }
}

// Génération de rapports
function generateReport(type) {
    // Implémentation de la génération de rapports
    console.log('Génération du rapport:', type);
    
    // Simuler le téléchargement
    showAlert(`Rapport ${type} généré avec succès!`, 'success');
}

// Fonctions de visualisation
function viewVisite(id) {
    // Implémentation de la vue détaillée d'une visite
    console.log('Voir visite', id);
}

function viewApprenti(id) {
    // Implémentation de la vue détaillée d'un apprenti
    console.log('Voir apprenti', id);
}

function viewEntreprise(id) {
    // Implémentation de la vue détaillée d'une entreprise
    console.log('Voir entreprise', id);
}

// Fonction utilitaire pour afficher les alertes
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
