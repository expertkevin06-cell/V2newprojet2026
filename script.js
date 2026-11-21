// ==========================================
// SYNCHRONISATION INTELLIGENTE AVEC FALLBACK
// ==========================================

const SYNC_SOURCES = {
    autoDiagnostic: [
        'https://expertkevin06-cell.github.io/auto-diagnostic/data.json',
        'https://expertkevin06-cell.github.io/auto-diagnostic/db.json',
        'https://expertkevin06-cell.github.io/auto-diagnostic/database.json',
        'https://expertkevin06-cell.github.io/auto-diagnostic/assets/data.json',
        'https://expertkevin06-cell.github.io/auto-diagnostic/vehicles.json',
        'https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/data.json',
        'https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/master/data.json'
    ],
    myTech: [
        'https://expertkevin06-cell.github.io/my-tech-by-kevin/data.json',
        'https://expertkevin06-cell.github.io/my-tech-by-kevin/db.json',
        'https://expertkevin06-cell.github.io/my-tech-by-kevin/database.json',
        'https://expertkevin06-cell.github.io/my-tech-by-kevin/assets/data.json',
        'https://expertkevin06-cell.github.io/my-tech-by-kevin/vehicles.json',
        'https://raw.githubusercontent.com/expertkevin06-cell/my-tech-by-kevin/main/data.json',
        'https://raw.githubusercontent.com/expertkevin06-cell/my-tech-by-kevin/master/data.json'
    ]
};

async function synchroniserBases() {
    if (!navigator.onLine) {
        showNotification('📡 Hors ligne - Mode local actif', 'info');
        updateSyncStatus('inactive');
        return;
    }
    
    showNotification('🔄 Synchronisation en cours...', 'info');
    updateSyncStatus('active');
    
    let successCount = 0;
    let totalSources = 2;
    
    // Tentative de synchronisation auto-diagnostic
    const autoDiagResult = await tenterSyncMultiSources('autoDiagnostic');
    if (autoDiagResult.success) {
        successCount++;
        syncStatus.autoDiagnostic = 'success';
    } else {
        syncStatus.autoDiagnostic = 'failed';
    }
    
    // Tentative de synchronisation my-tech
    const myTechResult = await tenterSyncMultiSources('myTech');
    if (myTechResult.success) {
        successCount++;
        syncStatus.myTech = 'success';
    } else {
        syncStatus.myTech = 'failed';
    }
    
    sauvegarderLocalStorage();
    updateSyncStatus('inactive');
    syncStatus.lastSync = new Date().toISOString();
    
    // Messages adaptés selon le résultat
    if (successCount === totalSources) {
        showNotification(`✅ Synchronisation complète : ${megaBase.length} véhicules`, 'success');
    } else if (successCount > 0) {
        showNotification(`⚡ Synchronisation partielle : ${megaBase.length} véhicules en base locale`, 'warning');
    } else {
        showNotification(`📦 Mode local : ${megaBase.length} véhicules disponibles`, 'info');
    }
    
    // Rafraîchir l'affichage si nécessaire
    if (document.getElementById('view-stats') && !document.getElementById('view-stats').classList.contains('hidden')) {
        afficherStats();
    }
}

async function tenterSyncMultiSources(sourceName) {
    const urls = SYNC_SOURCES[sourceName];
    
    for (const url of urls) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);
            
            const response = await fetch(url, {
                mode: 'cors',
                headers: { 'Accept': 'application/json' },
                cache: 'no-cache',
                signal: controller.signal
            });
            
            clearTimeout(timeout);
            
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        fusionnerDonnees(data, sourceName);
                        console.log(`✅ Sync réussie depuis: ${url}`);
                        return { success: true, url: url, count: data.length };
                    }
                }
            }
        } catch (error) {
            console.log(`⏭️ Échec sur ${url}: ${error.message}`);
            continue;
        }
    }
    
    return { success: false, url: null, count: 0 };
}

function updateSyncStatus(status) {
    const syncEl = document.getElementById('sync-status');
    if (!syncEl) return;
    
    if (status === 'active') {
        syncEl.className = 'sync-indicator sync-active';
        syncEl.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4 sync-icon"></i><span>Synchro...</span>';
    } else {
        // Vérifier si au moins une source est OK
        const hasSuccess = syncStatus.autoDiagnostic === 'success' || syncStatus.myTech === 'success';
        syncEl.className = hasSuccess ? 'sync-indicator sync-active' : 'sync-indicator sync-inactive';
        syncEl.innerHTML = hasSuccess 
            ? '<i data-lucide="check" class="w-4 h-4"></i><span>Synchro OK</span>'
            : '<i data-lucide="database" class="w-4 h-4"></i><span>Mode local</span>';
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}
