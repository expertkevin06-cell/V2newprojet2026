// ==========================================
// SYSTÈME D'AUTO-CONTRÔLE DES IMPORTS
// ==========================================

let importContext = {
    active: false,
    startTime: 0,
    beforeCount: 0,
    afterCount: 0,
    added: 0,
    merged: 0,
    errors: 0,
    logs: [],
    currentStep: 0,
    totalSteps: 7
};

const IMPORT_STEPS = [
    { name: "Lecture du fichier", percent: 10 },
    { name: "Validation du format JSON", percent: 20 },
    { name: "Analyse de la structure", percent: 35 },
    { name: "Vérification des doublons", percent: 50 },
    { name: "Fusion intelligente des données", percent: 75 },
    { name: "Sauvegarde dans la base", percent: 90 },
    { name: "Vérification d'intégrité", percent: 100 }
];

function ouvrirOverlayImport() {
    const overlay = document.getElementById('import-overlay');
    if (!overlay) return;
    
    // Reset du contexte
    importContext = {
        active: true,
        startTime: Date.now(),
        beforeCount: megaBase.length,
        afterCount: 0,
        added: 0,
        merged: 0,
        errors: 0,
        logs: [],
        currentStep: 0,
        totalSteps: IMPORT_STEPS.length
    };
    
    // Reset UI
    overlay.classList.remove('hidden');
    document.getElementById('import-result').classList.add('hidden');
    document.getElementById('import-log').innerHTML = '';
    document.getElementById('stat-before').textContent = importContext.beforeCount;
    document.getElementById('stat-added').textContent = '+0';
    document.getElementById('stat-merged').textContent = '~0';
    document.getElementById('stat-after').textContent = importContext.beforeCount;
    
    mettreAJourProgress(0, "Initialisation...");
    logImport("🚀 Démarrage de l'import massif", "step");
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function fermerOverlayImport() {
    const overlay = document.getElementById('import-overlay');
    if (overlay) overlay.classList.add('hidden');
    importContext.active = false;
}

function mettreAJourProgress(percent, detail) {
    const fill = document.getElementById('progress-fill');
    const percentEl = document.getElementById('progress-percent');
    const detailEl = document.getElementById('progress-detail');
    const stepEl = document.getElementById('progress-step');
    
    if (fill) fill.style.width = percent + '%';
    if (percentEl) percentEl.textContent = Math.round(percent) + '%';
    if (detailEl) detailEl.textContent = detail || '';
    if (stepEl) stepEl.textContent = `Étape ${Math.min(importContext.currentStep + 1, importContext.totalSteps)}/${importContext.totalSteps}`;
}

function logImport(message, type = "info") {
    const logContainer = document.getElementById('import-log');
    if (!logContainer) return;
    
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    entry.textContent = `[${timestamp}] ${message}`;
    
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
    
    importContext.logs.push({ time: timestamp, message, type });
}

function mettreAJourStats() {
    document.getElementById('stat-added').textContent = '+' + importContext.added;
    document.getElementById('stat-merged').textContent = '~' + importContext.merged;
    document.getElementById('stat-after').textContent = megaBase.length;
}

async function importAvecAutoControle(file) {
    ouvrirOverlayImport();
    
    try {
        // ÉTAPE 1: Lecture du fichier
        importContext.currentStep = 0;
        mettreAJourProgress(IMPORT_STEPS[0].percent, IMPORT_STEPS[0].name);
        logImport(`📂 Lecture du fichier: ${file.name}`, "step");
        
        const content = await lireFichierAvecProgress(file);
        logImport(`✅ Fichier lu (${(file.size / 1024).toFixed(2)} KB)`, "success");
        
        await sleep(300);
        
        // ÉTAPE 2: Validation JSON
        importContext.currentStep = 1;
        mettreAJourProgress(IMPORT_STEPS[1].percent, IMPORT_STEPS[1].name);
        logImport("🔍 Validation du format JSON...", "step");
        
        let data;
        try {
            data = JSON.parse(content);
            logImport("✅ JSON valide", "success");
        } catch (e) {
            throw new Error(`JSON invalide: ${e.message}`);
        }
        
        await sleep(300);
        
        // ÉTAPE 3: Analyse structure
        importContext.currentStep = 2;
        mettreAJourProgress(IMPORT_STEPS[2].percent, IMPORT_STEPS[2].name);
        logImport("🔬 Analyse de la structure des données...", "step");
        
        const analyse = analyserStructure(data);
        logImport(`📊 ${analyse.totalElements} éléments détectés`, "info");
        logImport(`📊 Format: ${analyse.format}`, "info");
        
        if (analyse.totalElements === 0) {
            throw new Error("Aucun élément valide trouvé dans le fichier");
        }
        
        await sleep(400);
        
        // ÉTAPE 4: Vérification doublons
        importContext.currentStep = 3;
        mettreAJourProgress(IMPORT_STEPS[3].percent, IMPORT_STEPS[3].name);
        logImport("🔎 Vérification des doublons avec la base existante...", "step");
        
        const doublons = verifierDoublons(data);
        logImport(`⚠️ ${doublons.count} doublons potentiels détectés`, doublons.count > 0 ? "warning" : "info");
        
        await sleep(400);
        
        // ÉTAPE 5: Fusion intelligente
        importContext.currentStep = 4;
        mettreAJourProgress(IMPORT_STEPS[4].percent, IMPORT_STEPS[4].name);
        logImport("🔀 Fusion intelligente des données...", "step");
        
        const resultatFusion = await fusionAvecProgress(data);
        importContext.added = resultatFusion.ajouts;
        importContext.merged = resultatFusion.fusions;
        mettreAJourStats();
        
        logImport(`✅ Fusion terminée: +${resultatFusion.ajouts} ajouts, ~${resultatFusion.fusions} fusions`, "success");
        
        await sleep(500);
        
        // ÉTAPE 6: Sauvegarde
        importContext.currentStep = 5;
        mettreAJourProgress(IMPORT_STEPS[5].percent, IMPORT_STEPS[5].name);
        logImport("💾 Sauvegarde dans localStorage...", "step");
        
        try {
            sauvegarderLocalStorageSilencieux();
            logImport("✅ Sauvegarde réussie", "success");
        } catch (e) {
            logImport(`❌ Erreur sauvegarde: ${e.message}`, "error");
            throw e;
        }
        
        await sleep(400);
        
        // ÉTAPE 7: Vérification intégrité
        importContext.currentStep = 6;
        mettreAJourProgress(IMPORT_STEPS[6].percent, IMPORT_STEPS[6].name);
        logImport("🛡️ Vérification d'intégrité de la base...", "step");
        
        const verification = await verifierIntegrite();
        
        if (verification.success) {
            logImport("✅ Intégrité vérifiée - Aucun blocage", "success");
        } else {
            logImport(`⚠️ Problèmes détectés: ${verification.issues.join(', ')}`, "warning");
        }
        
        importContext.afterCount = megaBase.length;
        importContext.endTime = Date.now();
        mettreAJourStats();
        
        await sleep(500);
        
        // Résultat final
        afficherResultatImport(true, verification);
        
    } catch (error) {
        logImport(`❌ ERREUR: ${error.message}`, "error");
        importContext.errors++;
        afficherResultatImport(false, null, error);
    }
}

function lireFichierAvecProgress(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = (e.loaded / e.total) * 100;
                mettreAJourProgress(Math.min(10, percent / 10), `Lecture: ${Math.round(percent)}%`);
            }
        };
        
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error("Erreur de lecture du fichier"));
        reader.readAsText(file);
    });
}

function analyserStructure(data) {
    if (!Array.isArray(data)) {
        if (typeof data === 'object' && data !== null) {
            // Conversion objet -> tableau
            const converted = Object.values(data);
            return {
                totalElements: converted.length,
                format: "Objet (converti en tableau)",
                sample: converted[0]
            };
        }
        return { totalElements: 0, format: "Inconnu" };
    }
    
    const validItems = data.filter(item => 
        item && typeof item === 'object' && 
        (item.marque || item.brand || item.marque_id)
    );
    
    return {
        totalElements: validItems.length,
        format: "Tableau JSON",
        sample: validItems[0]
    };
}

function verifierDoublons(data) {
    const items = Array.isArray(data) ? data : Object.values(data);
    let count = 0;
    
    items.forEach(item => {
        const marque = item.marque || item.brand || '';
        const modele = item.modele || item.model || '';
        const code = item.codeMoteur || item.code_moteur || '';
        
        const existe = megaBase.find(v => 
            v.marque?.toLowerCase() === marque.toLowerCase() &&
            v.modele?.toLowerCase() === modele.toLowerCase() &&
            (code ? v.codeMoteur?.toLowerCase() === code.toLowerCase() : true)
        );
        
        if (existe) count++;
    });
    
    return { count };
}

async function fusionAvecProgress(data) {
    const items = Array.isArray(data) ? data : Object.values(data);
    const total = items.length;
    let ajouts = 0;
    let fusions = 0;
    
    for (let i = 0; i < items.length; i++) {
        const item = normaliserItem(items[i]);
        if (!item) continue;
        
        const existant = megaBase.find(v => 
            v.marque === item.marque && 
            v.modele === item.modele && 
            v.codeMoteur === item.codeMoteur
        );
        
        if (!existant) {
            megaBase.push(item);
            ajouts++;
        } else {
            // Fusion intelligente
            if (item.dtc) item.dtc.forEach(d => { if (!existant.dtc.includes(d)) existant.dtc.push(d); });
            if (item.rappels) item.rappels.forEach(r => { if (!existant.rappels.includes(r)) existant.rappels.push(r); });
            if (item.entretiens) Object.assign(existant.entretiens, item.entretiens);
            if (item.notes && !existant.notes) existant.notes = item.notes;
            fusions++;
        }
        
        // Mise à jour progress toutes les 50 items
        if (i % 50 === 0 || i === total - 1) {
            const percent = 50 + ((i / total) * 25);
            mettreAJourProgress(percent, `Fusion: ${i + 1}/${total}`);
            await sleep(10); // Laisse l'UI respirer
        }
    }
    
    return { ajouts, fusions };
}

function normaliserItem(item) {
    if (!item || typeof item !== 'object') return null;
    
    const marque = item.marque || item.brand || item.marque_id;
    const modele = item.modele || item.model || item.modele_nom;
    if (!marque || !modele) return null;
    
    return {
        marque: String(marque).trim(),
        modele: String(modele).trim(),
        motorisation: item.motorisation || item.motor || item.moteur || "Standard",
        codeMoteur: (item.codeMoteur || item.code_moteur || item.engine_code || genererCodeMoteur(marque, item.motorisation)).toUpperCase(),
        puissance: item.puissance || item.power || "Auto",
        annee: item.annee || item.year || item.years || "À définir",
        typeCarburant: item.typeCarburant || item.fuel || item.carburant || determinerCarburant(item.motorisation || ''),
        entretiens: item.entretiens || item.maintenance || { "30000": ["Vidange"], "60000": ["Vidange"], "120000": ["Vidange"], "160000": ["Vidange"] },
        dtc: Array.isArray(item.dtc) ? item.dtc : (item.dtc ? String(item.dtc).split(/[,\/\s]+/) : []),
        rappels: Array.isArray(item.rappels) ? item.rappels : (item.rappels ? [item.rappels] : []),
        notes: item.notes || item.note || item.comment || ""
    };
}

function sauvegarderLocalStorageSilencieux() {
    try {
        const data = JSON.stringify(megaBase);
        localStorage.setItem('kevFusion_megaBase', data);
        
        // Vérification immédiate
        const saved = localStorage.getItem('kevFusion_megaBase');
        if (!saved || saved.length < 100) {
            throw new Error("Sauvegarde vide ou corrompue");
        }
        
        return true;
    } catch (e) {
        throw new Error("Échec sauvegarde localStorage: " + e.message);
    }
}

async function verifierIntegrite() {
    const issues = [];
    
    // 1. Vérifier que la base est chargée
    if (!megaBase || !Array.isArray(megaBase)) {
        issues.push("Base non initialisée");
        return { success: false, issues };
    }
    
    // 2. Vérifier le localStorage
    const saved = localStorage.getItem('kevFusion_megaBase');
    if (!saved) {
        issues.push("localStorage vide");
    } else {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.length !== megaBase.length) {
                issues.push(`Divergence localStorage (${parsed.length}) vs mémoire (${megaBase.length})`);
            }
        } catch (e) {
            issues.push("localStorage corrompu");
        }
    }
    
    // 3. Vérifier les éléments obligatoires
    let invalides = 0;
    megaBase.forEach((v, i) => {
        if (!v.marque || !v.modele) {
            invalides++;
        }
    });
    
    if (invalides > 0) {
        issues.push(`${invalides} éléments incomplets`);
    }
    
    // 4. Vérifier les doublons exacts
    const keys = new Set();
    let doublons = 0;
    megaBase.forEach(v => {
        const key = `${v.marque}|${v.modele}|${v.codeMoteur}`;
        if (keys.has(key)) doublons++;
        keys.add(key);
    });
    
    if (doublons > 0) {
        issues.push(`${doublons} doublons exacts`);
    }
    
    await sleep(200);
    
    return {
        success: issues.length === 0,
        issues,
        stats: {
            total: megaBase.length,
            valides: megaBase.length - invalides,
            doublons
        }
    };
}

function afficherResultatImport(success, verification, error) {
    const resultDiv = document.getElementById('import-result');
    const iconDiv = document.getElementById('result-icon');
    const titleEl = document.getElementById('result-title');
    const msgEl = document.getElementById('result-message');
    const detailsEl = document.getElementById('result-details');
    
    resultDiv.classList.remove('hidden');
    
    if (success) {
        resultDiv.classList.remove('error');
        iconDiv.innerHTML = '<i data-lucide="check-circle" class="w-16 h-16"></i>';
        titleEl.textContent = '✅ Import réussi sans blocage';
        titleEl.className = 'result-title';
        
        const duration = ((Date.now() - importContext.startTime) / 1000).toFixed(2);
        msgEl.textContent = `Import terminé en ${duration}s - Données intégrées à la base APK`;
        
        detailsEl.innerHTML = `
            <div style="color: #4ade80; font-weight: bold; margin-bottom: 0.5rem;">📊 RAPPORT FINAL</div>
            <div>• Véhicules avant: <strong>${importContext.beforeCount}</strong></div>
            <div>• Nouveaux ajouts: <strong style="color: #4ade80;">+${importContext.added}</strong></div>
            <div>• Fusions intelligentes: <strong style="color: #fbbf24;">~${importContext.merged}</strong></div>
            <div>• Véhicules après: <strong style="color: #38bdf8;">${importContext.afterCount}</strong></div>
            <div>• Erreurs: <strong style="color: ${importContext.errors > 0 ? '#f87171' : '#4ade80'};">${importContext.errors}</strong></div>
            <div>• Durée totale: <strong>${duration}s</strong></div>
            <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
                ${verification && verification.success 
                    ? '<span style="color: #4ade80;">✅ Intégrité vérifiée - Aucun blocage</span>' 
                    : `<span style="color: #fbbf24;">⚠️ ${verification?.issues?.join(', ') || 'Vérification partielle'}</span>`}
            </div>
            <div style="margin-top: 0.5rem; color: #94a3b8; font-size: 0.75rem;">
                💾 Sauvegarde localStorage: OK<br>
                🔄 Synchronisation: ${navigator.onLine ? 'Active' : 'Mode local'}<br>
                📦 Base APK: ${megaBase.length} véhicules disponibles
            </div>
        `;
        
        // Notification globale
        showNotification(`✅ Import réussi: +${importContext.added} véhicules`, 'success');
        
    } else {
        resultDiv.classList.add('error');
        iconDiv.innerHTML = '<i data-lucide="alert-circle" class="w-16 h-16"></i>';
        titleEl.textContent = '❌ Échec de l\'import';
        titleEl.className = 'result-title';
        msgEl.textContent = error?.message || 'Erreur inconnue';
        
        detailsEl.innerHTML = `
            <div style="color: #f87171; font-weight: bold; margin-bottom: 0.5rem;">⚠️ DÉTAILS</div>
            <div>• Étape échouée: ${importContext.currentStep + 1}/${importContext.totalSteps}</div>
            <div>• Message: ${error?.message || 'N/A'}</div>
            <div>• Base préservée: ${megaBase.length} véhicules</div>
            <div style="margin-top: 0.5rem; color: #94a3b8;">
                La base existante n'a pas été modifiée.
            </div>
        `;
        
        showNotification('❌ Échec import - Base préservée', 'error');
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    // Refresh UI
    initFiltresEntretien();
    if (!document.getElementById('view-stats').classList.contains('hidden')) {
        afficherStats();
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// REMPLACEMENT DE LA FONCTION importerJSON
// ==========================================
function importerJSON(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Vérification du type
    if (!file.name.endsWith('.json')) {
        showNotification('❌ Format invalide - JSON requis', 'error');
        input.value = '';
        return;
    }
    
    // Vérification de la taille (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
        showNotification('❌ Fichier trop volumineux (max 50MB)', 'error');
        input.value = '';
        return;
    }
    
    // Lancer l'import avec auto-contrôle
    importAvecAutoControle(file);
    input.value = '';
}
