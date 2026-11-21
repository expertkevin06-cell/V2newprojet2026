// ==========================================
// CONFIGURATION & SÉCURITÉ
// ==========================================
const ADMIN_PASSWORD = "Kevin83600";
let isAdmin = false;

// ==========================================
// MÉGA BASE TECHNIQUE (Corrélée)
// ==========================================
let megaBase = [
    {
        marque: "Peugeot",
        modele: "308",
        motorisation: "1.2 PureTech",
        codeMoteur: "HNS",
        puissance: "130 ch",
        annee: "2020-2023",
        typeCarburant: "Essence",
        entretiens: {
            "30000": ["Vidange huile 0W20", "Filtre à huile", "Filtre habitacle", "Contrôle courroie distribution (humide)"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies d'allumage"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Kit courroie de distribution + pompe à eau"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies d'allumage", "Liquide de refroidissement"]
        },
        dtc: ["P0420", "P0300", "P0301"],
        rappels: ["Rappel système de freinage 2021", "Mise à jour calculateur injection"]
    },
    {
        marque: "Renault",
        modele: "Clio V",
        motorisation: "1.5 dCi",
        codeMoteur: "K9K",
        puissance: "85 ch",
        annee: "2019-2024",
        typeCarburant: "Diesel",
        entretiens: {
            "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"]
        },
        dtc: ["P2263", "P0401"],
        rappels: []
    }
];

// ==========================================
// GESTION DU RÉSEAU (4G/5G/WiFi Permanent)
// ==========================================
function updateNetworkStatus() {
    const statusEl = document.getElementById('network-status');
    if (navigator.onLine) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const type = connection ? connection.effectiveType.toUpperCase() : 'WIFI/4G/5G';
        statusEl.innerHTML = `<span class="pulse-dot online"></span> En ligne (${type})`;
    } else {
        statusEl.innerHTML = `<span class="pulse-dot offline"></span> Mode Hors Ligne (Base locale active)`;
    }
}
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
updateNetworkStatus();

// ==========================================
// NAVIGATION
// ==========================================
function showTab(tabName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${tabName}`).classList.remove('hidden');
    
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('tab-active', 'text-cyan-400');
        el.classList.add('text-slate-400');
    });
    document.getElementById(`tab-${tabName}`).classList.add('tab-active', 'text-cyan-400');
    document.getElementById(`tab-${tabName}`).classList.remove('text-slate-400');
    
    if (tabName === 'entretien') initFiltresEntretien();
}

// ==========================================
// 1. RECHERCHE VIN & RAPPELS (API RÉELLE)
// ==========================================
async function rechercherVIN() {
    const vin = document.getElementById('vin-input').value.trim().toUpperCase();
    const resultsDiv = document.getElementById('vin-results');
    
    if (vin.length !== 17) {
        resultsDiv.innerHTML = `<div class="glass p-4 rounded-xl text-red-400">Le VIN doit contenir exactement 17 caractères.</div>`;
        return;
    }

    resultsDiv.innerHTML = `<div class="text-center py-8"><div class="inline-block w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div><p class="mt-2 text-slate-400">Interrogation des bases de rappels...</p></div>`;

    try {
        // API NHTSA (Réelle et gratuite). Pour l'UE, remplacer par l'endpoint API européen de votre choix.
        const response = await fetch(`https://api.nhtsa.gov/recalls/recallsByVin?vin=${vin}&format=json`);
        const data = await response.json();
        
        if (data.Results && data.Results.length > 0) {
            let html = `<div class="glass p-6 rounded-2xl border-l-4 border-red-500">
                <h3 class="text-xl font-bold text-red-400 mb-2">⚠️ Rappels trouvés pour ce VIN</h3>
                <p class="text-sm text-slate-300 mb-4">VIN : ${vin}</p>`;
            
            data.Results.forEach((rappel, index) => {
                html += `<div class="bg-slate-800/50 p-4 rounded-lg mb-3">
                    <p class="font-bold text-cyan-400">${rappel.Component}</p>
                    <p class="text-sm text-slate-300 mt-1">${rappel.Summary}</p>
                    <p class="text-xs text-slate-500 mt-2">Source : NHTSA / Constructeur</p>
                </div>`;
            });
            html += `</div>`;
            resultsDiv.innerHTML = html;
        } else {
            resultsDiv.innerHTML = `<div class="glass p-6 rounded-2xl border-l-4 border-green-500">
                <h3 class="text-xl font-bold text-green-400">✅ Aucun rappel actif trouvé</h3>
                <p class="text-sm text-slate-300 mt-2">Le VIN ${vin} ne présente pas de campagnes de rappel enregistrées dans la base interrogée.</p>
            </div>`;
        }
    } catch (error) {
        resultsDiv.innerHTML = `<div class="glass p-4 rounded-xl text-red-400">Erreur de connexion à l'API de rappels. Vérifiez votre connexion 4G/5G/WiFi.</div>`;
    }
}

// ==========================================
// 2. PRÉCONISATIONS CORRÉLÉES (Jusqu'à 160 000 km)
// ==========================================
function initFiltresEntretien() {
    const marques = [...new Set(megaBase.map(v => v.marque))];
    const selectMarque = document.getElementById('filter-marque');
    selectMarque.innerHTML = '<option value="">Sélectionner la Marque</option>';
    marques.forEach(m => {
        selectMarque.innerHTML += `<option value="${m}">${m}</option>`;
    });
}

function updateModeles() {
    const marque = document.getElementById('filter-marque').value;
    const selectModele = document.getElementById('filter-modele');
    const selectMoteur = document.getElementById('filter-moteur');
    
    selectModele.innerHTML = '<option value="">Sélectionner le Modèle</option>';
    selectMoteur.innerHTML = '<option value="">Sélectionner la Motorisation</option>';
    selectMoteur.disabled = true;

    if (marque) {
        const modeles = [...new Set(megaBase.filter(v => v.marque === marque).map(v => v.modele))];
        modeles.forEach(m => {
            selectModele.innerHTML += `<option value="${m}">${m}</option>`;
        });
        selectModele.disabled = false;
    } else {
        selectModele.disabled = true;
    }
}

function updateMotorisations() {
    const marque = document.getElementById('filter-marque').value;
    const modele = document.getElementById('filter-modele').value;
    const selectMoteur = document.getElementById('filter-moteur');
    
    selectMoteur.innerHTML = '<option value="">Sélectionner la Motorisation</option>';

    if (marque && modele) {
        const moteurs = megaBase.filter(v => v.marque === marque && v.modele === modele);
        moteurs.forEach(m => {
            selectMoteur.innerHTML += `<option value="${m.codeMoteur}">${m.motorisation} - ${m.codeMoteur} (${m.puissance})</option>`;
        });
        selectMoteur.disabled = false;
    }
}

function afficherEntretien() {
    const marque = document.getElementById('filter-marque').value;
    const modele = document.getElementById('filter-modele').value;
    const codeMoteur = document.getElementById('filter-moteur').value;
    const resultsDiv = document.getElementById('entretien-results');

    const vehicule = megaBase.find(v => v.marque === marque && v.modele === modele && v.codeMoteur === codeMoteur);

    if (!vehicule) return;

    let html = `<div class="glass rounded-2xl p-6 border-t-4 border-cyan-500">
        <h3 class="text-2xl font-bold mb-1">${vehicule.marque} ${vehicule.modele}</h3>
        <p class="text-cyan-400 font-mono mb-6">${vehicule.motorisation} | Code: ${vehicule.codeMoteur} | ${vehicule.puissance} | ${vehicule.annee}</p>
        
        <div class="space-y-4">`;

    const paliers = ["30000", "60000", "90000", "120000", "160000"];
    paliers.forEach(km => {
        const operations = vehicule.entretiens[km] || ["Aucune préconisation spécifique à ce palier"];
        html += `
        <div class="bg-slate-800/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div class="bg-cyan-900/30 text-cyan-400 font-bold px-4 py-2 rounded-lg text-center min-w-[100px] border border-cyan-500/30">
                ${parseInt(km).toLocaleString()} km
            </div>
            <ul class="flex-1 space-y-1">
                ${operations.map(op => `<li class="flex items-start gap-2 text-sm text-slate-200"><i data-lucide="check-circle" class="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0"></i> ${op}</li>`).join('')}
            </ul>
        </div>`;
    });

    // Ajout des DTC et rappels corrélés
    if (vehicule.dtc.length > 0 || vehicule.rappels.length > 0) {
        html += `<div class="mt-6 pt-6 border-t border-slate-700">
            <h4 class="font-bold text-slate-300 mb-3">⚠️ Points de vigilance corrélés</h4>
            <div class="grid md:grid-cols-2 gap-4">
                <div class="bg-slate-800 p-4 rounded-lg">
                    <p class="text-xs text-slate-500 uppercase font-bold mb-2">Codes DTC fréquents</p>
                    <div class="flex flex-wrap gap-2">${vehicule.dtc.map(d => `<span class="bg-red-900/30 text-red-400 px-2 py-1 rounded text-xs font-mono border border-red-500/30">${d}</span>`).join('')}</div>
                </div>
                <div class="bg-slate-800 p-4 rounded-lg">
                    <p class="text-xs text-slate-500 uppercase font-bold mb-2">Campagnes / Rappels</p>
                    <div class="flex flex-wrap gap-2">${vehicule.rappels.length > 0 ? vehicule.rappels.map(r => `<span class="bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded text-xs border border-yellow-500/30">${r}</span>`).join('') : '<span class="text-green-400 text-sm">Aucun</span>'}</div>
                </div>
            </div>
        </div>`;
    }

    html += `</div></div>`;
    resultsDiv.innerHTML = html;
    lucide.createIcons();
}

// ==========================================
// 3. MÉGA BASE RECHERCHE UNIFIÉE
// ==========================================
function rechercherMegaBase() {
    const query = document.getElementById('mega-search').value.toLowerCase();
    const resultsDiv = document.getElementById('megabase-results');
    
    if (query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
    }

    const resultats = megaBase.filter(v => 
        v.marque.toLowerCase().includes(query) ||
        v.modele.toLowerCase().includes(query) ||
        v.codeMoteur.toLowerCase().includes(query) ||
        v.dtc.some(d => d.toLowerCase().includes(query))
    );

    if (resultats.length === 0) {
        resultsDiv.innerHTML = `<div class="text-center text-slate-500 py-8">Aucune correspondance trouvée.</div>`;
        return;
    }

    resultsDiv.innerHTML = resultats.map(v => `
        <div class="glass p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-slate-800 transition" onclick="document.getElementById('filter-marque').value='${v.marque}'; showTab('entretien'); updateModeles(); document.getElementById('filter-modele').value='${v.modele}'; updateMotorisations(); document.getElementById('filter-moteur').value='${v.codeMoteur}'; afficherEntretien();">
            <div>
                <p class="font-bold text-cyan-400">${v.marque} ${v.modele}</p>
                <p class="text-sm text-slate-400">${v.motorisation} (${v.codeMoteur}) • DTC: ${v.dtc.join(', ')}</p>
            </div>
            <i data-lucide="arrow-right" class="text-slate-500"></i>
        </div>
    `).join('');
    lucide.createIcons();
}

// ==========================================
// 4. ADMINISTRATION (Mot de passe : Kevin83600)
// ==========================================
function verifierAdmin() {
    const input = document.getElementById('admin-password').value;
    if (input === ADMIN_PASSWORD) {
        isAdmin = true;
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        document.getElementById('db-date').textContent = new Date().toLocaleDateString('fr-FR');
    } else {
        document.getElementById('admin-error').classList.remove('hidden');
    }
}

function exporterJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(megaBase, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "kev_fusion_megabase_" + new Date().toISOString().slice(0,10) + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importerJSON(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                // Fusion intelligente sans doublons de code moteur
                importedData.forEach(newItem => {
                    const exists = megaBase.some(item => item.codeMoteur === newItem.codeMoteur && item.modele === newItem.modele);
                    if (!exists) {
                        megaBase.push(newItem);
                    }
                });
                alert(`Fusion réussie ! ${megaBase.length} entrées dans la base.`);
                initFiltresEntretien();
            }
        } catch (err) {
            alert("Erreur lors de la lecture du fichier JSON.");
        }
    };
    reader.readAsText(file);
}

function ajouterEntree(event) {
    event.preventDefault();
    const form = event.target;
    const nouvelleEntree = {
        marque: form.marque.value,
        modele: form.modele.value,
        motorisation: "À définir",
        codeMoteur: form.codeMoteur.value.toUpperCase(),
        puissance: "À définir",
        annee: "À définir",
        typeCarburant: "À définir",
        entretiens: { "30000": ["Vidange"], "60000": ["Vidange"], "90000": ["Vidange"], "120000": ["Vidange"], "160000": ["Vidange"] },
        dtc: [],
        rappels: []
    };
    
    // Tentative de parsing des préconisations si format JSON, sinon texte brut dans 30000
    try {
        const precon = JSON.parse(form.preconisations.value);
        nouvelleEntree.entretiens = precon;
    } catch(e) {
        nouvelleEntree.entretiens["30000"].push(form.preconisations.value);
    }

    megaBase.push(nouvelleEntree);
    alert("Entrée ajoutée avec succès à la Méga Base !");
    form.reset();
    initFiltresEntretien();
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initFiltresEntretien();
});
