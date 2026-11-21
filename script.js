// ==========================================
// SÉCURITÉ ADMIN (Mot de passe hashé SHA-256)
// ==========================================
const ADMIN_HASH = 'a3f0c7e8d9b2a1f4e6c8b7d9a2f5e8c1b4d7a0f3e6c9b2a5d8f1e4c7b0a3d6f9'; // Hash du mot de passe
let isAdminAuthenticated = false;
let sessionTimeout = null;

// Fonction de hashage SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==========================================
// MÉGA BASE TECHNIQUE ÉTENDUE (Intégration auto-diagnostic)
// ==========================================
const megaBaseInitiale = [
    // FRANÇAISES
    {
        marque: "Peugeot",
        modele: "308 III",
        motorisation: "1.2 PureTech",
        codeMoteur: "HNS",
        puissance: "130 ch",
        annee: "2021-2024",
        typeCarburant: "Essence",
        entretiens: {
            "30000": ["Vidange huile 0W20 C5", "Filtre à huile", "Filtre habitacle pollens", "Contrôle visuel courroie distribution humide"],
            "60000": ["Vidange huile 0W20", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies d'allumage iridium"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein DOT 4"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Kit courroie distribution + pompe à eau"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies d'allumage", "Liquide de refroidissement G12+"]
        },
        dtc: ["P0420", "P0300", "P0301", "P0171"],
        rappels: ["Rappel système de freinage 2022", "Mise à jour calculateur injection 2023"],
        notes: "Distribution humide à surveiller tous les 30 000 km"
    },
    {
        marque: "Peugeot",
        modele: "3008 II",
        motorisation: "1.5 BlueHDi",
        codeMoteur: "DV5",
        puissance: "130 ch",
        annee: "2019-2024",
        typeCarburant: "Diesel",
        entretiens: {
            "30000": ["Vidange huile 0W30 C3", "Filtre à huile", "Filtre habitacle", "Contrôle FAP"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution + galets"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"]
        },
        dtc: ["P2002", "P0401", "P0471", "P20EE"],
        rappels: ["Campagne FAP 2021", "Mise à jour AdBlue 2022"],
        notes: "FAP sensible aux trajets courts"
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
            "30000": ["Vidange huile 5W30 RN0720", "Filtre à huile", "Filtre habitacle"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein DOT 4"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution + pompe à eau"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement Type D"]
        },
        dtc: ["P2263", "P0401", "P0299"],
        rappels: [],
        notes: "Turbo fragile sur les premiers modèles 2019-2020"
    },
    {
        marque: "Renault",
        modele: "Megane IV",
        motorisation: "1.3 TCe",
        codeMoteur: "H5H",
        puissance: "140 ch",
        annee: "2018-2023",
        typeCarburant: "Essence",
        entretiens: {
            "30000": ["Vidange huile 5W40 RN17", "Filtre à huile", "Filtre habitacle"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies d'allumage"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"]
        },
        dtc: ["P0420", "P0171", "P0300"],
        rappels: ["Campagne chaîne de distribution 2020"],
        notes: "Chaîne de distribution à surveiller"
    },
    {
        marque: "Citroën",
        modele: "C5 Aircross",
        motorisation: "1.5 BlueHDi",
        codeMoteur: "DV5",
        puissance: "130 ch",
        annee: "2020-2024",
        typeCarburant: "Diesel",
        entretiens: {
            "30000": ["Vidange huile 0W30", "Filtre à huile", "Filtre habitacle"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Kit distribution complet"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"]
        },
        dtc: ["P2002", "P0401"],
        rappels: [],
        notes: ""
    },
    
    // ALLEMANDES
    {
        marque: "Volkswagen",
        modele: "Golf 8",
        motorisation: "2.0 TDI",
        codeMoteur: "DSR",
        puissance: "150 ch",
        annee: "2020-2024",
        typeCarburant: "Diesel",
        entretiens: {
            "30000": ["Vidange huile 5W30 LongLife IV", "Filtre à huile", "Filtre habitacle anti-odeurs"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein DOT 4"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution + pompe à eau"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement G13"]
        },
        dtc: ["P2002", "P0401", "P0471", "P0406"],
        rappels: ["Mise à jour logiciel infodivertissement 2022", "Campagne sonde NOx 2023"],
        notes: "Problème électronique connu sur modèles 2020-2021"
    },
    {
        marque: "Volkswagen",
        modele: "T-Roc",
        motorisation: "1.5 TSI",
        codeMoteur: "DPCA",
        puissance: "150 ch",
        annee: "2019-2024",
        typeCarburant: "Essence",
        entretiens: {
            "30000": ["Vidange huile 5W40", "Filtre à huile", "Filtre habitacle"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies d'allumage"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"]
        },
        dtc: ["P0420", "P0300"],
        rappels: [],
        notes: ""
    },
    {
        marque: "BMW",
        modele: "Série 3 G20",
        motorisation: "2.0d",
        codeMoteur: "B47",
        puissance: "190 ch",
        annee: "2019-2024",
        typeCarburant: "Diesel",
        entretiens: {
            "30000": ["Vidange huile 0W30 LL-04", "Filtre à huile", "Filtre habitacle microfiltre"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein DOT 4"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Chaîne de distribution (contrôle)"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement BMW"]
        },
        dtc: ["P0401", "P2002", "P0299"],
        rappels: ["Campagne EGR 2021"],
        notes: "Chaîne de distribution à contrôler à 160 000 km"
    },
    {
        marque: "Mercedes-Benz",
        modele: "Classe A W177",
        motorisation: "A 200d",
        codeMoteur: "OM654",
        puissance: "150 ch",
        annee: "2019-2024",
        typeCarburant: "Diesel",
        entretiens: {
            "25000": ["Vidange huile 5W30 MB 229.52", "Filtre à huile", "Filtre habitacle"],
            "50000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"],
            "75000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"],
            "100000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"],
            "125000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement MB"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Contrôle chaîne distribution"]
        },
        dtc: ["P0401", "P2002", "P0234"],
        rappels: ["Mise à jour logiciel MBUX 2022"],
        notes: ""
    },
    {
        marque: "Audi",
        modele: "A3 8Y",
        motorisation: "2.0 TDI",
        codeMoteur: "DSR",
        puissance: "150 ch",
        annee: "2020-2024",
        typeCarburant: "Diesel",
        entretiens: {
            "30000": ["Vidange huile 5W30 LongLife", "Filtre à huile", "Filtre habitacle"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement G12++"]
        },
        dtc: ["P2002", "P0401", "P0406"],
        rappels: [],
        notes: ""
    },
    
    // ASIATIQUES
    {
        marque: "Toyota",
        modele: "Yaris Cross",
        motorisation: "1.5 Hybride",
        codeMoteur: "M15A-FXE",
        puissance: "116 ch",
        annee: "2021-2024",
        typeCarburant: "Hybride",
        entretiens: {
            "15000": ["Vidange huile 0W16", "Filtre à huile", "Contrôle système hybride"],
            "30000": ["Vidange huile", "Filtre à huile", "Filtre habitacle"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein DOT 3"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies d'allumage"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement Toyota"]
        },
        dtc: [],
        rappels: [],
        notes: "Fiabilité exceptionnelle - Distribution par chaîne"
    },
    {
        marque: "Toyota",
        modele: "RAV4 V",
        motorisation: "2.5 Hybride",
        codeMoteur: "A25A-FXS",
        puissance: "218 ch",
        annee: "2019-2024",
        typeCarburant: "Hybride",
        entretiens: {
            "15000": ["Vidange huile 0W20", "Filtre à huile", "Contrôle hybride"],
            "30000": ["Vidange huile", "Filtre à huile", "Filtre habitacle"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies iridium"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"]
        },
        dtc: [],
        rappels: [],
        notes: "Distribution par chaîne - Très fiable"
    },
    {
        marque: "Hyundai",
        modele: "Tucson IV",
        motorisation: "1.6 CRDi",
        codeMoteur: "D4FE",
        puissance: "136 ch",
        annee: "2021-2024",
        typeCarburant: "Diesel",
        entretiens: {
            "30000": ["Vidange huile 5W30 C3", "Filtre à huile", "Filtre habitacle"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement Hyundai"]
        },
        dtc: ["P2002", "P0401"],
        rappels: [],
        notes: ""
    },
    {
        marque: "Kia",
        modele: "Sportage V",
        motorisation: "1.6 T-GDi Hybride",
        codeMoteur: "G4FT",
        puissance: "230 ch",
        annee: "2022-2024",
        typeCarburant: "Hybride",
        entretiens: {
            "15000": ["Vidange huile 0W20", "Filtre à huile", "Contrôle système hybride"],
            "30000": ["Vidange huile", "Filtre à huile", "Filtre habitacle"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"]
        },
        dtc: [],
        rappels: [],
        notes: ""
    },
    {
        marque: "Nissan",
        modele: "Qashqai III",
        motorisation: "1.3 DIG-T",
        codeMoteur: "HR13DDT",
        puissance: "158 ch",
        annee: "2021-2024",
        typeCarburant: "Essence",
        entretiens: {
            "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"]
        },
        dtc: ["P0420", "P0300"],
        rappels: [],
        notes: ""
    },
    
    // AMÉRICAINES
    {
        marque: "Ford",
        modele: "Kuga III",
        motorisation: "2.0 EcoBlue",
        codeMoteur: "YLCB",
        puissance: "150 ch",
        annee: "2020-2024",
        typeCarburant: "Diesel",
        entretiens: {
            "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement Motorcraft"]
        },
        dtc: ["P2002", "P0401", "P0299"],
        rappels: ["Campagne AdBlue 2022"],
        notes: ""
    },
    {
        marque: "Ford",
        modele: "Puma",
        motorisation: "1.0 EcoBoost Hybrid",
        codeMoteur: "B3JA",
        puissance: "155 ch",
        annee: "2020-2024",
        typeCarburant: "Hybride",
        entretiens: {
            "30000": ["Vidange huile 5W20", "Filtre à huile", "Filtre habitacle"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"]
        },
        dtc: ["P0420", "P0300"],
        rappels: [],
        notes: ""
    },
    {
        marque: "Opel",
        modele: "Corsa F",
        motorisation: "1.2 Turbo",
        codeMoteur: "EB2ADTD",
        puissance: "130 ch",
        annee: "2020-2024",
        typeCarburant: "Essence",
        entretiens: {
            "30000": ["Vidange huile 0W20", "Filtre à huile", "Filtre habitacle"],
            "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"],
            "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"],
            "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Kit distribution humide"],
            "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"]
        },
        dtc: ["P0420", "P0300", "P0301"],
        rappels: [],
        notes: "Distribution humide PSA"
    }
];

let megaBase = [...megaBaseInitiale];

// Charger depuis localStorage si disponible
function chargerBaseLocale() {
    const saved = localStorage.getItem('kevFusion_megaBase');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                megaBase = parsed;
                console.log('Base chargée depuis localStorage:', megaBase.length, 'véhicules');
            }
        } catch (e) {
            console.error('Erreur chargement localStorage:', e);
        }
    }
}

// ==========================================
// GESTION DU RÉSEAU
// ==========================================
function updateNetworkStatus() {
    const statusEl = document.getElementById('network-status');
    if (navigator.onLine) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const type = connection ? connection.effectiveType.toUpperCase() : 'WIFI/4G/5G';
        statusEl.innerHTML = `<span class="pulse-dot online"></span><span>En ligne (${type})</span>`;
    } else {
        statusEl.innerHTML = `<span class="pulse-dot offline"></span><span>Hors ligne (Base locale)</span>`;
    }
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

// ==========================================
// NAVIGATION
// ==========================================
function showTab(tabName) {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('fade-in');
    });
    
    const targetView = document.getElementById(`view-${tabName}`);
    targetView.classList.remove('hidden');
    targetView.classList.add('fade-in');
    
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('tab-active');
        el.classList.add('text-slate-400');
    });
    
    const activeTab = document.getElementById(`tab-${tabName}`);
    activeTab.classList.add('tab-active');
    activeTab.classList.remove('text-slate-400');
    
    // Initialisations spécifiques
    if (tabName === 'entretien') initFiltresEntretien();
    if (tabName === 'stats') afficherStats();
    if (tabName === 'admin') resetAdminForm();
}

function resetAdminForm() {
    const passwordInput = document.getElementById('admin-password');
    if (passwordInput) {
        passwordInput.value = '';
    }
    document.getElementById('admin-error')?.classList.add('hidden');
}

// ==========================================
// 1. RECHERCHE VIN & RAPPELS
// ==========================================
async function rechercherVIN() {
    const vin = document.getElementById('vin-input').value.trim().toUpperCase();
    const resultsDiv = document.getElementById('vin-results');
    
    if (vin.length !== 17) {
        resultsDiv.innerHTML = `
            <div class="glass rounded-2xl p-6 border-l-4 border-red-500 slide-up">
                <div class="flex items-center gap-3 mb-2">
                    <i data-lucide="alert-circle" class="w-6 h-6 text-red-400"></i>
                    <h3 class="text-lg font-bold text-red-400">VIN invalide</h3>
                </div>
                <p class="text-slate-300">Le VIN doit contenir exactement 17 caractères alphanumériques.</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    resultsDiv.innerHTML = `
        <div class="glass rounded-2xl p-8 text-center">
            <div class="loading-spinner mx-auto mb-4"></div>
            <p class="text-slate-300">Interrogation des bases de rappels en cours...</p>
        </div>`;

    try {
        const response = await fetch(`https://api.nhtsa.gov/recalls/recallsByVin?vin=${vin}&format=json`);
        const data = await response.json();
        
        if (data.Results && data.Results.length > 0) {
            let html = `
                <div class="glass rounded-2xl p-6 border-l-4 border-red-500 slide-up">
                    <div class="flex items-center gap-3 mb-4">
                        <i data-lucide="alert-triangle" class="w-8 h-8 text-red-400"></i>
                        <div>
                            <h3 class="text-xl font-bold text-red-400">⚠️ ${data.Results.length} rappel(s) trouvé(s)</h3>
                            <p class="text-sm text-slate-400">VIN: ${vin}</p>
                        </div>
                    </div>
                    <div class="space-y-3">`;
            
            data.Results.forEach((rappel, index) => {
                html += `
                    <div class="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                        <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-lg bg-red-500/30 flex items-center justify-center flex-shrink-0">
                                <span class="text-red-400 font-bold text-sm">${index + 1}</span>
                            </div>
                            <div class="flex-1">
                                <p class="font-bold text-cyan-400 mb-1">${rappel.Component}</p>
                                <p class="text-sm text-slate-300 mb-2">${rappel.Summary}</p>
                                <div class="flex flex-wrap gap-2 text-xs">
                                    <span class="recall-badge px-2 py-1 rounded">NHTSA</span>
                                    ${rappel.Manufacturer ? `<span class="success-badge px-2 py-1 rounded">${rappel.Manufacturer}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>`;
            });
            html += `</div></div>`;
            resultsDiv.innerHTML = html;
        } else {
            resultsDiv.innerHTML = `
                <div class="glass rounded-2xl p-6 border-l-4 border-green-500 slide-up">
                    <div class="flex items-center gap-3 mb-2">
                        <i data-lucide="check-circle" class="w-8 h-8 text-green-400"></i>
                        <div>
                            <h3 class="text-xl font-bold text-green-400">✅ Aucun rappel actif</h3>
                            <p class="text-sm text-slate-400">VIN: ${vin}</p>
                        </div>
                    </div>
                    <p class="text-slate-300 mt-3">Ce véhicule ne présente pas de campagnes de rappel enregistrées dans les bases officielles interrogées.</p>
                </div>`;
        }
        lucide.createIcons();
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="glass rounded-2xl p-6 border-l-4 border-amber-500 slide-up">
                <div class="flex items-center gap-3 mb-2">
                    <i data-lucide="wifi-off" class="w-6 h-6 text-amber-400"></i>
                    <h3 class="text-lg font-bold text-amber-400">Erreur de connexion</h3>
                </div>
                <p class="text-slate-300">Impossible de contacter l'API de rappels. Vérifiez votre connexion 4G/5G/WiFi.</p>
            </div>`;
        lucide.createIcons();
    }
}

// ==========================================
// 2. PRÉCONISATIONS CONSTR
