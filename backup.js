'use strict';

const BACKUP_PREFIX = 'kevFusion_backup_';
const BACKUP_INDEX = 'kevFusion_backups_index';
const MAX_BACKUPS = 3;

function empreinteBase() {
    try {
        const s = JSON.stringify(megaBase) + '|' + JSON.stringify(expertBase);
        let h = 5381;
        for (let i = 0; i < s.length; i += 7) {
            h = ((h << 5) + h + s.charCodeAt(i)) | 0;
        }
        return h + ':' + s.length;
    } catch (e) { return 'err:' + Math.random(); }
}

function getIndex() {
    try {
        const idx = JSON.parse(localStorage.getItem(BACKUP_INDEX) || '[]');
        return Array.isArray(idx) ? idx : [];
    } catch (e) { return []; }
}

function setIndex(idx) {
    try { localStorage.setItem(BACKUP_INDEX, JSON.stringify(idx)); } catch (e) {}
}

function listerSauvegardes() {
    return getIndex().sort((a, b) => b.id - a.id);
}

function nettoyerSauvegardes() {
    const idx = listerSauvegardes();
    if (idx.length > MAX_BACKUPS) {
        idx.slice(MAX_BACKUPS).forEach(old => localStorage.removeItem(BACKUP_PREFIX + old.id));
        setIndex(idx.slice(0, MAX_BACKUPS));
    }
}

function creerSauvegardeLocale(source) {
    const id = Date.now();
    let payload = '';
    try {
        payload = JSON.stringify({
            id, source: source || 'manuelle', date: new Date().toISOString(),
            counts: { vehicles: megaBase.length, experts: expertBase.length },
            vehicles: megaBase, experts: expertBase
        });
    } catch (e) {
        showNotification('❌ Sauvegarde impossible', 'error');
        return null;
    }
    let ok = false;
    try {
        localStorage.setItem(BACKUP_PREFIX + id, payload);
        ok = true;
    } catch (e) {
        const olds = listerSauvegardes().sort((a, b) => a.id - b.id);
        if (olds.length > 0) {
            localStorage.removeItem(BACKUP_PREFIX + olds[0].id);
            try { localStorage.setItem(BACKUP_PREFIX + id, payload); ok = true; } catch (e2) { ok = false; }
        }
    }
    if (ok) {
        const idx = getIndex();
        idx.push({ id, source: source || 'manuelle', date: new Date().toISOString(), counts: { vehicles: megaBase.length, experts: expertBase.length }, size: payload.length });
        setIndex(idx);
        nettoyerSauvegardes();
        showNotification('🗄️ Sauvegarde locale créée', 'success');
        afficherSauvegardes();
        return id;
    }
    showNotification('⚠️ Sauvegarde impossible (stockage plein)', 'warning');
    return null;
}

function creerSauvegardeManuelle() {
    if (creerSauvegardeLocale('manuelle')) showNotification('💾 Sauvegarde manuelle effectuée', 'success');
}

function restaurerSauvegarde(id) {
    const raw = localStorage.getItem(BACKUP_PREFIX + id);
    if (!raw) { showNotification('❌ Sauvegarde introuvable', 'error'); return; }
    if (!confirm('Restaurer cette sauvegarde ?')) return;
    try {
        const b = JSON.parse(raw);
        creerSauvegardeLocale('pre-restauration');
        megaBase = Array.isArray(b.vehicles) && b.vehicles.length > 0 ? b.vehicles : [...MEGA_BASE_INITIALE];
        expertBase = Array.isArray(b.experts) ? b.experts : [];
        localStorage.setItem('kevFusion_megaBase', JSON.stringify(megaBase));
        localStorage.setItem('kevFusion_expertBase', JSON.stringify(expertBase));
        initFiltresEntretien();
        if (typeof majIndicateurSync === 'function') majIndicateurSync();
        afficherSauvegardes();
        showNotification('✅ Sauvegarde restaurée', 'success');
    } catch (e) { showNotification('❌ Restauration impossible', 'error'); }
}

function supprimerSauvegarde(id) {
    if (!confirm('Supprimer cette sauvegarde ?')) return;
    localStorage.removeItem(BACKUP_PREFIX + id);
    setIndex(getIndex().filter(x => x.id !== id));
    afficherSauvegardes();
    showNotification('🗑️ Supprimée', 'info');
}

function telechargerSauvegarde(id) {
    const raw = localStorage.getItem(BACKUP_PREFIX + id);
    if (!raw) { showNotification('❌ Introuvable', 'error'); return; }
    try {
        const data = "data:text/json;charset=utf-8," + encodeURIComponent(raw);
        const a = document.createElement('a');
        a.setAttribute("href", data);
        a.setAttribute("download", `kev_fusion_sauvegarde_${id}.json`);
        document.body.appendChild(a);
        a.click();
        a.remove();
        showNotification('📥 Téléchargée', 'success');
    } catch (e) { showNotification('❌ Téléchargement impossible', 'error'); }
}

function afficherSauvegardes() {
    const container = document.getElementById('backup-list');
    if (!container) return;
    const list = listerSauvegardes();
    if (list.length === 0) {
        container.innerHTML = `<div class="glass rounded-2xl p-4 text-center text-slate-400 text-sm">Aucune sauvegarde. Une sera créée automatiquement après import massif.</div>`;
        return;
    }
    container.innerHTML = list.map(b => `
        <div class="glass rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div class="flex-1">
                <p class="font-black text-white">🗄️ ${new Date(b.date).toLocaleString('fr-FR')}</p>
                <p class="text-xs text-slate-400 mt-1">${b.source} • ${b.counts.vehicles} véh. • ${b.counts.experts || 0} pannes • ${Math.round((b.size || 0) / 1024)} KB</p>
            </div>
            <div class="flex flex-wrap gap-2">
                <button onclick="restaurerSauvegarde(${b.id})" class="btn-success text-white px-3 py-1.5 rounded-lg text-xs font-bold">Restaurer</button>
                <button onclick="telechargerSauvegarde(${b.id})" class="glass-hover px-3 py-1.5 rounded-lg text-xs font-bold">⬇️</button>
                <button onclick="supprimerSauvegarde(${b.id})" class="btn-danger text-white px-3 py-1.5 rounded-lg text-xs font-bold">🗑️</button>
            </div>
        </div>
    `).join('');
}

function annoterRapportImport(backupId) {
    const details = document.getElementById('result-details');
    if (!details || !backupId) return;
    details.innerHTML += `<div style="margin-top:.5rem;padding-top:.5rem;border-top:1px solid rgba(255,255,255,.1);color:#38bdf8">🗄️ Sauvegarde locale créée : ${new Date(backupId).toLocaleString('fr-FR')}</div>`;
}

(function installerHooks() {
    if (typeof window.importEnLigne === 'function') {
        const orig = window.importEnLigne;
        window.importEnLigne = async function () {
            const avant = empreinteBase();
            const r = await orig.apply(this, arguments);
            const apres = empreinteBase();
            if (avant !== apres) {
                const id = creerSauvegardeLocale('import-massif-en-ligne');
                annoterRapportImport(id);
            }
            return r;
        };
    }
    if (typeof window.importFichierAvecControle === 'function') {
        const origF = window.importFichierAvecControle;
        window.importFichierAvecControle = async function (file) {
            const avant = empreinteBase();
            const r = await origF.apply(this, arguments);
            const apres = empreinteBase();
            if (avant !== apres) {
                const id = creerSauvegardeLocale('import-fichier:' + (file && file.name ? file.name : 'json'));
                annoterRapportImport(id);
            }
            return r;
        };
    }
    if (typeof window.showTab === 'function') {
        const origT = window.showTab;
        window.showTab = function (t) {
            const r = origT.apply(this, arguments);
            if (t === 'megabase') afficherSauvegardes();
            return r;
        };
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => afficherSauvegardes());
    } else { afficherSauvegardes(); }
})();
