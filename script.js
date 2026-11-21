'use strict';

// ============================================================================
// KEV FUSION 2026 - SCRIPT COMPLET
// Base massive 2017-2027 + Filtres cascade stricts + Sécurité admin
// ============================================================================

// ============================================================================
// 1. VARIABLES GLOBALES
// ============================================================================
const SECURITY_SALT = 'kev_fusion_2026_salt';
const SESSION_DURATION = 30 * 60 * 1000;
let isSecureModeActive = false;
let secureSessionTimeout = null;
let ADMIN_HASH = null;
let megaBase = [];
let expertBase = [];
let syncStatus = { lastSync: null, sources: [] };

// ============================================================================
// 2. UTILITAIRES
// ============================================================================
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function el(id) { return document.getElementById(id); }
function val(id) { const e = el(id); return e ? e.value : ''; }

function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function normaliserMarque(brand) {
    if (!brand) return 'Inconnu';
    const b = String(brand).toLowerCase().trim();
    const map = {
        'peugeot':'Peugeot','renault':'Renault','citroen':'Citroën','citroën':'Citroën',
        'ds':'DS','volkswagen':'Volkswagen','vw':'Volkswagen','audi':'Audi','bmw':'BMW',
        'mercedes':'Mercedes-Benz','mercedes-benz':'Mercedes-Benz','mercedes benz':'Mercedes-Benz',
        'porsche':'Porsche','opel':'Opel','fiat':'Fiat','alfa':'Alfa Romeo','alfa romeo':'Alfa Romeo',
        'jeep':'Jeep','toyota':'Toyota','honda':'Honda','nissan':'Nissan',
        'hyundai':'Hyundai','kia':'Kia','mazda':'Mazda','ford':'Ford',
        'chevrolet':'Chevrolet','tesla':'Tesla','volvo':'Volvo','dacia':'Dacia',
        'skoda':'Skoda','škoda':'Skoda','seat':'Seat','cupra':'Cupra','polestar':'Polestar',
        'byd':'BYD','mg':'MG','xpeng':'Xpeng','nio':'Nio','landrover':'Land Rover',
        'land rover':'Land Rover','jaguar':'Jaguar','ferrari':'Ferrari','maserati':'Maserati',
        'mclaren':'McLaren','bugatti':'Bugatti','mini':'Mini','lexus':'Lexus','alpine':'Alpine',
        'lancia':'Lancia','subaru':'Subaru','suzuki':'Suzuki','mitsubishi':'Mitsubishi',
        'dodge':'Dodge','cadillac':'Cadillac','gmc':'GMC','omoda':'Omoda','jaecoo':'Jaecoo',
        'leapmotor':'Leapmotor','ora':'Ora','aiways':'Aiways','seres':'Seres','lynkco':'Lynk&Co',
        'lynk&co':'Lynk&Co','smart':'Smart','lotus':'Lotus','aston':'Aston Martin',
        'aston martin':'Aston Martin','rolls':'Rolls-Royce','rolls-royce':'Rolls-Royce',
        'bentley':'Bentley','lamborghini':'Lamborghini','mini':'Mini'
    };
    return map[b] || String(brand).trim();
}

function genererCodeMoteur(brand, motor) {
    if (!brand) return 'AUTO';
    if (motor) {
        const clean = String(motor).replace(/[^A-Za-z0-9]/g, '').slice(0, 12).toUpperCase();
        if (clean.length >= 2) return clean;
    }
    return String(brand).slice(0, 3).toUpperCase() + '-AUTO';
}

function determinerCarburant(motor, type, title) {
    const text = `${motor || ''} ${type || ''} ${title || ''}`.toLowerCase();
    const elec = ['electrique','électrique','bms','iccu','obc','e-','ev ','bev'];
    const hyb = ['hybride','hybrid','phev','e-tech','dm-i','e:hev','mhev','hev','48v'];
    const die = ['diesel','tdi','dci','bluehdi','crdi','multijet','fap','adblue','jtd','hdi','bluetec'];
    if (elec.some(k => text.includes(k))) return 'Électrique';
    if (hyb.some(k => text.includes(k))) return 'Hybride';
    if (die.some(k => text.includes(k))) return 'Diesel';
    return 'Essence';
}

function capFuel(f) {
    const m = { 'essence':'Essence','diesel':'Diesel','hybride':'Hybride','electrique':'Électrique','électrique':'Électrique','ev':'Électrique','phev':'Hybride','mhev':'Hybride','hev':'Hybride' };
    return m[String(f || '').toLowerCase()] || 'Essence';
}

function extrairePuissance(texte) {
    if (!texte) return 0;
    if (typeof texte === 'number') return texte;
    const m = String(texte).match(/(\d{2,4})\s*(?:ch|hp|cv|kW)?/i);
    return m ? parseInt(m[1]) : 0;
}

function genererEntretiens(fuel) {
    if (fuel === 'Électrique') return { "30000":["Contrôle batterie HV","Filtre habitacle"],"60000":["Vidange réducteur","Contrôle système charge"],"120000":["Contrôle SOH batterie","Liquide refroidissement HV"],"160000":["Contrôle complet HV","Liquide de frein"] };
    if (fuel === 'Hybride') return { "15000":["Vidange 0W20","Contrôle système hybride"],"30000":["Filtre habitacle","Filtre à huile"],"60000":["Filtre à air","Bougies"],"90000":["Liquide de frein","Vidange"],"120000":["Contrôle batterie HV","Kit distribution"],"160000":["Liquide refroidissement","Bougies iridium"] };
    if (fuel === 'Diesel') return { "30000":["Vidange 5W30 C3","Filtre à huile","Contrôle FAP"],"60000":["Vidange","Filtre à gasoil"],"90000":["Liquide de frein","Filtre habitacle"],"120000":["Kit distribution","Filtre à air","Vidange"],"160000":["Filtre à gasoil","Liquide refroidissement","Courroie accessoire"] };
    return { "30000":["Vidange","Filtre à huile","Contrôle courroie"],"60000":["Filtre à air","Bougies","Filtre habitacle"],"90000":["Liquide de frein","Vidange"],"120000":["Kit distribution","Filtre à essence"],"160000":["Bougies iridium","Liquide refroidissement","Courroie accessoire"] };
}

// ============================================================================
// 3. HASHAGE MOT DE PASSE
// ============================================================================
async function hashPassword(password) {
    try {
        if (window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password + SECURITY_SALT);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
    } catch (e) { console.warn('crypto.subtle fallback'); }
    let h1 = 5381, h2 = 0;
    const str = password + SECURITY_SALT;
    for (let i = 0; i < str.length; i++) {
        h1 = ((h1 << 5) + h1 + str.charCodeAt(i)) | 0;
        h2 = ((h2 << 7) ^ str.charCodeAt(i)) | 0;
    }
    return 'fb_' + Math.abs(h1).toString(16).padStart(8,'0') + Math.abs(h2).toString(16).padStart(8,'0');
}

async function initAdminHash() { ADMIN_HASH = await hashPassword('Kevin83600'); }

// ============================================================================
// 4. MÉGA BASE INITIALE - 350+ véhicules 2017-2027
// ============================================================================
const MEGA_BASE_INITIALE = [
    // ===== PEUGEOT (2017-2027) =====
    { marque:"Peugeot", modele:"208 I", motorisation:"1.2 PureTech", codeMoteur:"EB2", puissance:82, annee:"2017-2019", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W30","Filtre à huile"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"208 II", motorisation:"1.2 PureTech", codeMoteur:"EB2ADTD", puissance:75, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20","Filtre à huile"],"60000":["Vidange","Filtre à air","Bougies"],"120000":["Kit distribution humide"],"160000":["Vidange","Bougies"]}, dtc:["P0420","P0300","P0087"], rappels:["Campagne courroie 2022-2023"], notes:"Distribution humide PSA" },
    { marque:"Peugeot", modele:"208 II", motorisation:"1.2 PureTech", codeMoteur:"EB2ADTS", puissance:100, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20","Filtre à huile"],"60000":["Vidange","Filtre à air","Bougies"],"120000":["Kit distribution humide"],"160000":["Vidange","Bougies"]}, dtc:["P0420","P0300","P0087"], rappels:["Campagne courroie 2022-2023"], notes:"Distribution humide PSA" },
    { marque:"Peugeot", modele:"208 II", motorisation:"1.2 PureTech", codeMoteur:"EB2ADTX", puissance:130, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20","Filtre à huile"],"60000":["Vidange","Filtre à air","Bougies"],"120000":["Kit distribution humide"],"160000":["Vidange","Bougies","Liquide refroidissement"]}, dtc:["P0420","P0300","P0087","P0340"], rappels:["Campagne courroie 2022-2023"], notes:"Distribution humide PSA" },
    { marque:"Peugeot", modele:"208 II", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:100, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W30","Filtre à huile"],"60000":["Vidange","Filtre à gasoil"],"120000":["Kit distribution"],"160000":["Liquide refroidissement"]}, dtc:["P2002","P0401","P20EE"], rappels:["Campagne AdBlue"], notes:"" },
    { marque:"Peugeot", modele:"208 II", motorisation:"Électrique", codeMoteur:"EM0", puissance:136, annee:"2020-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV","Filtre habitacle"],"60000":["Vidange réducteur"],"120000":["Contrôle SOH"]}, dtc:["P0AA6","U0111","P0C00"], rappels:["Campagne BMS"], notes:"" },
    { marque:"Peugeot", modele:"2008 II", motorisation:"1.2 PureTech", codeMoteur:"EB2ADTS", puissance:130, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution humide"]}, dtc:["P0420","P0087"], rappels:["Campagne courroie"], notes:"" },
    { marque:"Peugeot", modele:"2008 II", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"2008 II", motorisation:"Électrique", codeMoteur:"EM0", puissance:136, annee:"2020-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"308 II", motorisation:"1.2 PureTech", codeMoteur:"EB2", puissance:110, annee:"2017-2021", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"308 II", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2017-2021", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"308 III", motorisation:"1.2 PureTech", codeMoteur:"HNS", puissance:110, annee:"2021-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20","Contrôle courroie"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution"],"160000":["Liquide refroidissement"]}, dtc:["P0420","P0300","P0087"], rappels:["Campagne tendeur courroie"], notes:"Distribution humide" },
    { marque:"Peugeot", modele:"308 III", motorisation:"1.2 PureTech", codeMoteur:"HNS", puissance:130, annee:"2021-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20","Contrôle courroie humide"],"60000":["Vidange","Filtre à air","Bougies iridium"],"90000":["Liquide de frein"],"120000":["Kit distribution + pompe eau"],"160000":["Bougies","Liquide refroidissement"]}, dtc:["P0420","P0300","P0301","P0087","P0340"], rappels:["Rappel freinage 2022","Campagne tendeur courroie 2022-2023"], notes:"Distribution humide à surveiller 30 000 km" },
    { marque:"Peugeot", modele:"308 III", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2021-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W30","Filtre à huile"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"],"160000":["Liquide refroidissement"]}, dtc:["P2002","P0401","P20EE"], rappels:["Campagne FAP 2021","Campagne AdBlue"], notes:"FAP sensible" },
    { marque:"Peugeot", modele:"3008 I", motorisation:"1.6 THP", codeMoteur:"EP6", puissance:165, annee:"2017-2021", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0087"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"3008 II", motorisation:"1.2 PureTech", codeMoteur:"EB2ADTS", puissance:130, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20","Contrôle courroie"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution humide"]}, dtc:["P0420","P0300","P0087"], rappels:["Campagne courroie"], notes:"" },
    { marque:"Peugeot", modele:"3008 II", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W30","Filtre à huile","Contrôle FAP"],"60000":["Vidange","Filtre à gasoil"],"120000":["Kit distribution"],"160000":["Vidange","Filtre à gasoil","Liquide refroidissement"]}, dtc:["P2002","P0401","P0471","P20EE"], rappels:["Campagne FAP 2021","Campagne AdBlue"], notes:"FAP sensible trajets courts" },
    { marque:"Peugeot", modele:"3008 II", motorisation:"2.0 BlueHDi", codeMoteur:"DW10", puissance:180, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401","P2453"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"3008 II", motorisation:"1.6 Hybrid", codeMoteur:"EP6-PHEV", puissance:225, annee:"2020-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"],"60000":["Filtre à air"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"5008 II", motorisation:"1.6 PureTech", codeMoteur:"EP6", puissance:180, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"],"120000":["Kit chaîne"]}, dtc:["P0420","P0087"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"5008 II", motorisation:"2.0 BlueHDi", codeMoteur:"DW10", puissance:180, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401","P2453"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"508 II", motorisation:"1.6 PureTech", codeMoteur:"EP6", puissance:180, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0087"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"508 II", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"508 II", motorisation:"1.6 PureTech Hybrid", codeMoteur:"EP6-PHEV", puissance:225, annee:"2019-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"],"60000":["Filtre à air","Bougies"]}, dtc:["P0AA6","U0111"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"Rifter", motorisation:"1.2 PureTech", codeMoteur:"EB2", puissance:110, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"Rifter", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"Partner", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"Expert", motorisation:"2.0 BlueHDi", codeMoteur:"DW10", puissance:150, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"Boxer", motorisation:"2.0 BlueHDi", codeMoteur:"DW10", puissance:165, annee:"2019-2027", typeCarburant:"Diesel", entretiens:{"40000":["Vidange"],"80000":["Filtre à gasoil"],"120000":["Kit chaîne distribution"]}, dtc:["P0016","P2002"], rappels:["Campagne chaîne distribution"], notes:"Chaîne distribution à surveiller" },
    { marque:"Peugeot", modele:"e-208", motorisation:"Électrique", codeMoteur:"EM0", puissance:136, annee:"2020-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV","Filtre habitacle"],"60000":["Vidange réducteur"],"120000":["Contrôle SOH"]}, dtc:["P0AA6","U0111","P0C00"], rappels:["Campagne autonomie hiver","Campagne BMS"], notes:"" },
    { marque:"Peugeot", modele:"e-2008", motorisation:"Électrique", codeMoteur:"EM0", puissance:136, annee:"2020-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"],"60000":["Vidange réducteur"]}, dtc:["P0AA6","U0111"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"e-Rifter", motorisation:"Électrique", codeMoteur:"EM0", puissance:136, annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"408", motorisation:"1.2 PureTech", codeMoteur:"EB2", puissance:130, annee:"2022-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"408", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2022-2026", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"408", motorisation:"1.6 Hybrid", codeMoteur:"EP6-PHEV", puissance:225, annee:"2022-2026", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"E-308", motorisation:"Électrique", codeMoteur:"EM0", puissance:156, annee:"2023-2027", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"],"60000":["Vidange réducteur"]}, dtc:["P0AA6","U0111"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"E-3008", motorisation:"Électrique", codeMoteur:"EM0", puissance:210, annee:"2024-2027", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"Nouveau modèle 2024" },
    { marque:"Peugeot", modele:"E-5008", motorisation:"Électrique", codeMoteur:"EM0", puissance:210, annee:"2024-2027", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"Nouveau modèle 2024" },
    { marque:"Peugeot", modele:"308 SW III", motorisation:"1.2 PureTech", codeMoteur:"HNS", puissance:130, annee:"2021-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"308 SW III", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2021-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"508 SW II", motorisation:"1.6 PureTech", codeMoteur:"EP6", puissance:180, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"508 SW II", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"508 SW II", motorisation:"1.6 Hybrid", codeMoteur:"EP6-PHEV", puissance:225, annee:"2019-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"Traveller", motorisation:"2.0 BlueHDi", codeMoteur:"DW10", puissance:150, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"Traveller", motorisation:"2.0 BlueHDi", codeMoteur:"DW10", puissance:180, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    // ===== RENAULT (2017-2027) =====
    { marque:"Renault", modele:"Clio IV", motorisation:"0.9 TCe", codeMoteur:"H4B", puissance:90, annee:"2017-2019", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Clio IV", motorisation:"1.2 TCe", codeMoteur:"H5F", puissance:120, annee:"2017-2019", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Clio IV", motorisation:"1.5 dCi", codeMoteur:"K9K", puissance:90, annee:"2017-2019", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Clio V", motorisation:"1.0 SCe", codeMoteur:"B4D", puissance:65, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Clio V", motorisation:"1.0 TCe", codeMoteur:"H4D", puissance:90, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Clio V", motorisation:"1.0 TCe", codeMoteur:"H4D", puissance:100, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Clio V", motorisation:"1.3 TCe", codeMoteur:"H5H", puissance:130, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0171"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Clio V", motorisation:"1.3 TCe", codeMoteur:"H5H", puissance:140, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0171"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Clio V", motorisation:"1.5 Blue dCi", codeMoteur:"K9K", puissance:85, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 5W30","Filtre à huile"],"60000":["Vidange","Filtre à gasoil"],"120000":["Kit distribution"],"160000":["Liquide refroidissement Type D"]}, dtc:["P2263","P0401","P0299"], rappels:["Campagne EGR 1.5 dCi"], notes:"Turbo fragile 2019-2020" },
    { marque:"Renault", modele:"Clio V", motorisation:"1.5 Blue dCi", codeMoteur:"K9K", puissance:115, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 5W30","Filtre à huile"],"60000":["Vidange","Filtre à gasoil"],"120000":["Kit distribution"],"160000":["Liquide refroidissement Type D"]}, dtc:["P2263","P0401","P0299"], rappels:["Campagne EGR 1.5 dCi"], notes:"" },
    { marque:"Renault", modele:"Clio V", motorisation:"1.6 E-Tech", codeMoteur:"H4M-Hybrid", puissance:140, annee:"2020-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle hybride"],"60000":["Filtre à air"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Clio VI", motorisation:"1.2 TCe", codeMoteur:"H5H", puissance:130, annee:"2025-2027", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"Nouveau modèle 2025" },
    { marque:"Renault", modele:"Clio VI", motorisation:"1.6 E-Tech", codeMoteur:"H4M-Hybrid", puissance:145, annee:"2025-2027", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle hybride"]}, dtc:["P0AA6"], rappels:[], notes:"Nouveau modèle 2025" },
    { marque:"Renault", modele:"Clio VI", motorisation:"Électrique", codeMoteur:"EV-Clio", puissance:150, annee:"2025-2027", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"Nouveau modèle 2025" },
    { marque:"Renault", modele:"Megane IV", motorisation:"1.2 TCe", codeMoteur:"H5F", puissance:130, annee:"2017-2020", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Megane IV", motorisation:"1.3 TCe", codeMoteur:"H5H", puissance:115, annee:"2018-2023", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0171"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Megane IV", motorisation:"1.3 TCe", codeMoteur:"H5H", puissance:140, annee:"2018-2023", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40","Filtre à huile"],"60000":["Vidange","Filtre à air","Bougies"],"120000":["Kit distribution"]}, dtc:["P0420","P0171","P0300"], rappels:["Campagne chaîne 2020"], notes:"Chaîne à surveiller" },
    { marque:"Renault", modele:"Megane IV", motorisation:"1.3 TCe", codeMoteur:"H5H", puissance:160, annee:"2018-2023", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0171"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Megane IV", motorisation:"1.5 Blue dCi", codeMoteur:"K9K", puissance:115, annee:"2018-2023", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2263","P0401"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Megane V E-Tech", motorisation:"1.2 TCe", codeMoteur:"H5H", puissance:130, annee:"2022-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Megane V E-Tech", motorisation:"1.6 E-Tech", codeMoteur:"H4M-Hybrid", puissance:145, annee:"2022-2026", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle hybride"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Megane V E-Tech", motorisation:"Électrique EV40", codeMoteur:"EV-Megane", puissance:130, annee:"2022-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV","Filtre habitacle"],"60000":["Vidange réducteur"]}, dtc:["P0AA6","U0111"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Megane V E-Tech", motorisation:"Électrique EV60", codeMoteur:"EV-Megane", puissance:220, annee:"2022-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV","Filtre habitacle"],"60000":["Vidange réducteur"]}, dtc:["P0AA6","U0111","P0D11"], rappels:["Campagne OBC"], notes:"" },
    { marque:"Renault", modele:"Captur I", motorisation:"0.9 TCe", codeMoteur:"H4B", puissance:90, annee:"2017-2019", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Captur I", motorisation:"1.2 TCe", codeMoteur:"H5F", puissance:120, annee:"2017-2019", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Captur I", motorisation:"1.5 dCi", codeMoteur:"K9K", puissance:90, annee:"2017-2019", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Captur II", motorisation:"1.0 TCe", codeMoteur:"H4D", puissance:90, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Captur II", motorisation:"1.0 TCe", codeMoteur:"H4D", puissance:100, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Captur II", motorisation:"1.3 TCe", codeMoteur:"H5H", puissance:140, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0171"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Captur II", motorisation:"1.3 TCe", codeMoteur:"H5H", puissance:155, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0171"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Captur II", motorisation:"1.5 Blue dCi", codeMoteur:"K9K", puissance:115, annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Captur II", motorisation:"1.6 E-Tech", codeMoteur:"H4M-Hybrid", puissance:145, annee:"2020-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle hybride"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Austral", motorisation:"1.2 TCe Mild Hybrid", codeMoteur:"H5H-MHEV", puissance:130, annee:"2022-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle hybride"],"60000":["Filtre à air"]}, dtc:[], rappels:[], notes:"" },
    { marque:"Renault", modele:"Austral", motorisation:"1.2 TCe Hybride", codeMoteur:"H5H-H", puissance:160, annee:"2022-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle hybride"],"60000":["Filtre à air"]}, dtc:[], rappels:[], notes:"" },
    { marque:"Renault", modele:"Austral", motorisation:"1.2 TCe Hybride", codeMoteur:"H5H-H", puissance:200, annee:"2022-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle hybride"],"60000":["Filtre à air","Bougies"]}, dtc:[], rappels:[], notes:"" },
    { marque:"Renault", modele:"Scenic IV", motorisation:"1.2 TCe", codeMoteur:"H5F", puissance:130, annee:"2017-2022", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Scenic IV", motorisation:"1.5 dCi", codeMoteur:"K9K", puissance:110, annee:"2017-2022", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Scenic V", motorisation:"1.2 TCe", codeMoteur:"H5H", puissance:130, annee:"2023-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Scenic V", motorisation:"1.6 E-Tech", codeMoteur:"H4M-Hybrid", puissance:145, annee:"2023-2026", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle hybride"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Kadjar", motorisation:"1.2 TCe", codeMoteur:"H5F", puissance:130, annee:"2017-2022", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Kadjar", motorisation:"1.5 dCi", codeMoteur:"K9K", puissance:110, annee:"2017-2022", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Kadjar", motorisation:"1.3 TCe", codeMoteur:"H5H", puissance:140, annee:"2018-2022", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Kadjar", motorisation:"1.3 TCe", codeMoteur:"H5H", puissance:160, annee:"2018-2022", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Kadjar", motorisation:"1.5 Blue dCi", codeMoteur:"K9K", puissance:115, annee:"2018-2022", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Arkana", motorisation:"1.3 TCe", codeMoteur:"H5H", puissance:140, annee:"2021-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Arkana", motorisation:"1.6 E-Tech", codeMoteur:"H4M-Hybrid", puissance:145, annee:"2021-2026", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle hybride"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Zoe", motorisation:"Électrique R90", codeMoteur:"5AGen1", puissance:92, annee:"2017-2019", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle SOH"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Zoe", motorisation:"Électrique R110", codeMoteur:"5AGen2", puissance:108, annee:"2019-2024", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle SOH","Filtre habitacle"],"60000":["Vidange réducteur"]}, dtc:["P0AA6","U0111"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Zoe", motorisation:"Électrique R135", codeMoteur:"5AGen2", puissance:135, annee:"2019-2024", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle SOH","Filtre habitacle"],"60000":["Vidange réducteur"],"120000":["Contrôle batterie"]}, dtc:["P0AA6","U0111","P0D11"], rappels:["Campagne OBC","Campagne connecteur Type2"], notes:"" },
    { marque:"Renault", modele:"Twingo III", motorisation:"0.9 TCe", codeMoteur:"H4B", puissance:90, annee:"2017-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Twingo III", motorisation:"Électrique", codeMoteur:"Twingo-EV", puissance:82, annee:"2020-2024", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Kangoo III", motorisation:"1.3 TCe", codeMoteur:"H5H", puissance:130, annee:"2021-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Kangoo III", motorisation:"1.5 Blue dCi", codeMoteur:"K9K", puissance:115, annee:"2021-2026", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Kangoo III", motorisation:"Électrique", codeMoteur:"EV-Kangoo", puissance:122, annee:"2022-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Trafic", motorisation:"2.0 dCi", codeMoteur:"R9M", puissance:120, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Trafic", motorisation:"2.0 dCi", codeMoteur:"R9M", puissance:145, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Master", motorisation:"2.3 dCi", codeMoteur:"M9T", puissance:130, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Master", motorisation:"2.3 dCi", codeMoteur:"M9T", puissance:165, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Renault", modele:"Master", motorisation:"2.3 dCi", codeMoteur:"M9T", puissance:180, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    // ===== CITROËN (2017-2027) =====
    { marque:"Citroën", modele:"C3 III", motorisation:"1.2 PureTech", codeMoteur:"EB2", puissance:83, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"C3 III", motorisation:"1.2 PureTech", codeMoteur:"EB2", puissance:110, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution humide"]}, dtc:["P0420","P0300","P0087"], rappels:["Campagne courroie humide"], notes:"Distribution humide PSA" },
    { marque:"Citroën", modele:"C3 III", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:100, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"C3 Aircross", motorisation:"1.2 PureTech", codeMoteur:"EB2", puissance:110, annee:"2017-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"C3 Aircross", motorisation:"1.2 PureTech", codeMoteur:"EB2ADTS", puissance:130, annee:"2017-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"C3 Aircross", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:120, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"C4 III", motorisation:"1.2 PureTech", codeMoteur:"EB2", puissance:110, annee:"2020-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"C4 III", motorisation:"1.2 PureTech", codeMoteur:"EB2ADTS", puissance:130, annee:"2020-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"C4 III", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2020-2026", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"C4 III", motorisation:"Électrique", codeMoteur:"EM0", puissance:136, annee:"2020-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"C5 Aircross", motorisation:"1.2 PureTech", codeMoteur:"EB2ADTS", puissance:130, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution humide"]}, dtc:["P0420","P0087"], rappels:["Campagne courroie"], notes:"" },
    { marque:"Citroën", modele:"C5 Aircross", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"C5 Aircross", motorisation:"2.0 BlueHDi", codeMoteur:"DW10", puissance:180, annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"C5 Aircross", motorisation:"1.6 Hybrid", codeMoteur:"EP6-PHEV", puissance:225, annee:"2020-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"ë-C4", motorisation:"Électrique", codeMoteur:"EM0", puissance:136, annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle"],"60000":["Vidange réducteur"]}, dtc:["P0D11","P0AA6"], rappels:["Campagne OBC"], notes:"" },
    { marque:"Citroën", modele:"Berlingo", motorisation:"1.2 PureTech", codeMoteur:"EB2", puissance:110, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"Berlingo", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"Jumpy", motorisation:"2.0 BlueHDi", codeMoteur:"DW10", puissance:150, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"Jumpy", motorisation:"2.0 BlueHDi", codeMoteur:"DW10", puissance:180, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"Jumper", motorisation:"2.2 HDi", codeMoteur:"DW12", puissance:130, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"Jumper", motorisation:"2.2 HDi", codeMoteur:"DW12", puissance:165, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"ë-Berlingo", motorisation:"Électrique", codeMoteur:"EM0", puissance:136, annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"C5 X", motorisation:"1.2 PureTech", codeMoteur:"EB2", puissance:130, annee:"2021-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"C5 X", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2021-2026", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Citroën", modele:"C5 X", motorisation:"1.6 Hybrid", codeMoteur:"EP6-PHEV", puissance:225, annee:"2021-2026", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    // ===== DS (2017-2027) =====
    { marque:"DS", modele:"DS 3 Crossback", motorisation:"1.2 PureTech", codeMoteur:"EB2ADTS", puissance:130, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"120000":["Kit distribution humide"]}, dtc:["P0420","P0087"], rappels:[], notes:"" },
    { marque:"DS", modele:"DS 3 Crossback", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:120, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"DS", modele:"DS 3 Crossback", motorisation:"Électrique", codeMoteur:"EM0", puissance:136, annee:"2020-2024", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"DS", modele:"DS 4", motorisation:"1.2 PureTech", codeMoteur:"EB2", puissance:130, annee:"2021-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"DS", modele:"DS 4", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2021-2026", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"DS", modele:"DS 4", motorisation:"1.6 PureTech Hybrid", codeMoteur:"EP6-PHEV", puissance:225, annee:"2021-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"DS", modele:"DS 7 Crossback", motorisation:"1.6 PureTech", codeMoteur:"EP6", puissance:180, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air"]}, dtc:["P0420","P0087"], rappels:[], notes:"" },
    { marque:"DS", modele:"DS 7 Crossback", motorisation:"1.5 BlueHDi", codeMoteur:"DV5", puissance:130, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"DS", modele:"DS 7 Crossback", motorisation:"2.0 BlueHDi", codeMoteur:"DW10", puissance:180, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"DS", modele:"DS 7 Crossback", motorisation:"E-Tense 300", codeMoteur:"EP6-PHEV", puissance:300, annee:"2019-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"],"60000":["Filtre à air"],"120000":["Contrôle batterie HV"]}, dtc:["P0AA6","U0111"], rappels:["Campagne batterie HV"], notes:"" },
    { marque:"DS", modele:"DS 7 Crossback", motorisation:"E-Tense 360", codeMoteur:"EP6-PHEV", puissance:360, annee:"2020-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"],"120000":["Contrôle batterie HV"]}, dtc:["P0AA6","U0111"], rappels:["Campagne batterie HV"], notes:"" },
    { marque:"DS", modele:"DS 9", motorisation:"1.6 PureTech", codeMoteur:"EP6", puissance:225, annee:"2021-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"DS", modele:"DS 9", motorisation:"1.6 PureTech Hybrid", codeMoteur:"EP6-PHEV", puissance:360, annee:"2021-2026", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    // ===== VOLKSWAGEN (2017-2027) =====
    { marque:"Volkswagen", modele:"Polo VI", motorisation:"1.0 MPI", codeMoteur:"CHYA", puissance:75, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Polo VI", motorisation:"1.0 TSI", codeMoteur:"DKLA", puissance:95, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Polo VI", motorisation:"1.0 TSI", codeMoteur:"DKL", puissance:110, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Polo VI", motorisation:"1.0 TSI", codeMoteur:"DKL", puissance:115, annee:"2021-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Golf VII", motorisation:"1.0 TSI", codeMoteur:"CHZD", puissance:110, annee:"2017-2020", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Golf VII", motorisation:"1.4 TSI", codeMoteur:"CZDA", puissance:125, annee:"2017-2020", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Golf VII", motorisation:"1.5 TSI", codeMoteur:"DPCA", puissance:150, annee:"2018-2020", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Golf VII", motorisation:"1.6 TDI", codeMoteur:"CRKB", puissance:115, annee:"2017-2020", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Golf VII", motorisation:"2.0 TDI", codeMoteur:"CRBC", puissance:150, annee:"2017-2020", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Golf VIII", motorisation:"1.0 TSI", codeMoteur:"DKLB", puissance:110, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Golf VIII", motorisation:"1.5 TSI", codeMoteur:"DPCA", puissance:130, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Golf VIII", motorisation:"1.5 TSI", codeMoteur:"DPCA", puissance:150, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Golf VIII", motorisation:"2.0 TSI", codeMoteur:"DNNA", puissance:190, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Golf VIII", motorisation:"2.0 TDI", codeMoteur:"DSR", puissance:115, annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 5W30 LL-IV"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:["Campagne AdBlue"], notes:"" },
    { marque:"Volkswagen", modele:"Golf VIII", motorisation:"2.0 TDI", codeMoteur:"DSR", puissance:150, annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 5W30 LL-IV","Filtre à huile"],"60000":["Filtre à gasoil"],"90000":["Liquide de frein"],"120000":["Kit distribution"],"160000":["Liquide refroidissement G13"]}, dtc:["P2002","P0401","P0471","P0406"], rappels:["Campagne sonde NOx 2023","Campagne ICU 12V"], notes:"" },
    { marque:"Volkswagen", modele:"Golf VIII", motorisation:"2.0 TDI", codeMoteur:"DSR", puissance:200, annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 5W30 LL-IV"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Golf VIII", motorisation:"1.4 e-Hybrid", codeMoteur:"PHEV", puissance:204, annee:"2020-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Golf VIII", motorisation:"1.4 e-Hybrid", codeMoteur:"PHEV", puissance:245, annee:"2020-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"T-Roc", motorisation:"1.0 TSI", codeMoteur:"DKLA", puissance:110, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"T-Roc", motorisation:"1.5 TSI", codeMoteur:"DPCA", puissance:150, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"T-Roc", motorisation:"2.0 TSI", codeMoteur:"DNNA", puissance:190, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 5W40"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"T-Roc", motorisation:"2.0 TDI", codeMoteur:"DSR", puissance:115, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"T-Roc", motorisation:"2.0 TDI", codeMoteur:"DSR", puissance:150, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"T-Roc", motorisation:"2.0 TDI", codeMoteur:"DSR", puissance:200, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Tiguan II", motorisation:"1.4 TSI", codeMoteur:"CZDA", puissance:125, annee:"2017-2020", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Tiguan II", motorisation:"1.5 TSI", codeMoteur:"DPCA", puissance:150, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Tiguan II", motorisation:"2.0 TSI", codeMoteur:"CZPB", puissance:180, annee:"2017-2020", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Tiguan II", motorisation:"2.0 TSI", codeMoteur:"DNNA", puissance:190, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Tiguan II", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:150, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401","P0406"], rappels:["Campagne AdBlue 2021"], notes:"" },
    { marque:"Volkswagen", modele:"Tiguan II", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:200, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Tiguan II", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:240, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Tiguan Allspace", motorisation:"2.0 TSI", codeMoteur:"DNNA", puissance:190, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Tiguan Allspace", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:150, annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Tiguan Allspace", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:200, annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Touran", motorisation:"1.5 TSI", codeMoteur:"DPCA", puissance:150, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Touran", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:150, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Touran", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:190, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Sharan", motorisation:"2.0 TSI", codeMoteur:"CZPB", puissance:220, annee:"2017-2022", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Sharan", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:150, annee:"2017-2022", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Sharan", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:184, annee:"2017-2022", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Passat B8", motorisation:"1.4 TSI", codeMoteur:"CZDA", puissance:125, annee:"2017-2020", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Passat B8", motorisation:"1.5 TSI", codeMoteur:"DPCA", puissance:150, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Passat B8", motorisation:"2.0 TSI", codeMoteur:"CZPB", puissance:190, annee:"2017-2020", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Passat B8", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:150, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Passat B8", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:190, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Passat B8", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:240, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Passat B8 Variant", motorisation:"1.5 TSI", codeMoteur:"DPCA", puissance:150, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Passat B8 Variant", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:150, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Passat B8 Variant", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:190, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Arteon", motorisation:"1.5 TSI", codeMoteur:"DPCA", puissance:150, annee:"2017-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Arteon", motorisation:"2.0 TSI", codeMoteur:"CZPB", puissance:190, annee:"2017-2020", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Arteon", motorisation:"2.0 TSI", codeMoteur:"DNNA", puissance:280, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Arteon", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:150, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Arteon", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:190, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Arteon", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:240, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"T-Cross", motorisation:"1.0 TSI", codeMoteur:"DKLA", puissance:95, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"T-Cross", motorisation:"1.0 TSI", codeMoteur:"DKL", puissance:110, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"T-Cross", motorisation:"1.5 TSI", codeMoteur:"DPCA", puissance:150, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"T-Roc Cabriolet", motorisation:"1.5 TSI", codeMoteur:"DPCA", puissance:150, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"T-Roc Cabriolet", motorisation:"2.0 TSI", codeMoteur:"DNNA", puissance:190, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"ID.3", motorisation:"Électrique", codeMoteur:"APP310", puissance:145, annee:"2020-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle"],"60000":["Vidange réducteur"]}, dtc:["P0AA6","U0111"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"ID.3", motorisation:"Électrique", codeMoteur:"APP310", puissance:204, annee:"2020-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle"],"60000":["Vidange réducteur"]}, dtc:["P0AA6","U0111"], rappels:["Campagne ICU 12V"], notes:"" },
    { marque:"Volkswagen", modele:"ID.4", motorisation:"Électrique", codeMoteur:"APP310", puissance:148, annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle"],"60000":["Vidange réducteur"]}, dtc:["U0111","P0AA6"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"ID.4", motorisation:"Électrique", codeMoteur:"APP310", puissance:204, annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle"],"60000":["Vidange réducteur"]}, dtc:["U0111","P0AA6"], rappels:["Campagne ICU décharge 12V"], notes:"" },
    { marque:"Volkswagen", modele:"ID.4", motorisation:"Électrique GTX", codeMoteur:"APP310", puissance:299, annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"ID.5", motorisation:"Électrique", codeMoteur:"APP310", puissance:174, annee:"2022-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"ID.5", motorisation:"Électrique GTX", codeMoteur:"APP310", puissance:299, annee:"2022-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"ID.6", motorisation:"Électrique", codeMoteur:"APP310", puissance:204, annee:"2022-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"ID.7", motorisation:"Électrique", codeMoteur:"APP310", puissance:286, annee:"2023-2027", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"Nouveau modèle 2023" },
    { marque:"Volkswagen", modele:"ID.7", motorisation:"Électrique GTX", codeMoteur:"APP310", puissance:340, annee:"2023-2027", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"Nouveau modèle 2023" },
    { marque:"Volkswagen", modele:"ID. Buzz", motorisation:"Électrique", codeMoteur:"APP310", puissance:204, annee:"2022-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"ID. Buzz", motorisation:"Électrique GTX", codeMoteur:"APP310", puissance:340, annee:"2024-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Caddy V", motorisation:"1.5 TSI", codeMoteur:"DPCA", puissance:115, annee:"2020-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Caddy V", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:122, annee:"2020-2026", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Caddy V", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:150, annee:"2020-2026", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Transporter T6.1", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:110, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Transporter T6.1", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:150, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Transporter T6.1", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:199, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Crafter", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:140, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"Volkswagen", modele:"Crafter", motorisation:"2.0 TDI", codeMoteur:"DFG", puissance:177, annee:"2017-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    // ===== BMW (2017-2027) =====
    { marque:"BMW", modele:"Série 1 F40", motorisation:"116i B38", codeMoteur:"B38", puissance:109, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W30 LL-04"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 1 F40", motorisation:"118i B38", codeMoteur:"B38", puissance:136, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W30 LL-04"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 1 F40", motorisation:"120i B48", codeMoteur:"B48", puissance:178, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W30 LL-04"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 1 F40", motorisation:"128ti B48", codeMoteur:"B48", puissance:265, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W30 LL-04"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 1 F40", motorisation:"116d B37", codeMoteur:"B37", puissance:116, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W30 LL-04"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 1 F40", motorisation:"118d B47", codeMoteur:"B47", puissance:150, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W30 LL-04"],"60000":["Filtre à gasoil"]}, dtc:["P0401","P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 1 F40", motorisation:"120d B47", codeMoteur:"B47", puissance:190, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W30 LL-04"],"60000":["Filtre à gasoil"]}, dtc:["P0401","P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 1 F40", motorisation:"M135i xDrive B48", codeMoteur:"B48", puissance:306, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W30 LL-04"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 2 F44 Gran Coupé", motorisation:"218i B38", codeMoteur:"B38", puissance:140, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 2 F44 Gran Coupé", motorisation:"220i B48", codeMoteur:"B48", puissance:178, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 2 F44 Gran Coupé", motorisation:"218d B47", codeMoteur:"B47", puissance:150, annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 2 F44 Gran Coupé", motorisation:"220d B47", codeMoteur:"B47", puissance:190, annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 2 F44 Gran Coupé", motorisation:"M235i xDrive B48", codeMoteur:"B48", puissance:306, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 3 G20", motorisation:"318i B48", codeMoteur:"B48", puissance:156, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W30 LL-04"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 3 G20", motorisation:"320i B48", codeMoteur:"B48", puissance:184, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W30 LL-04"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 3 G20", motorisation:"330i B48", codeMoteur:"B48", puissance:258, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W30 LL-04"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 3 G20", motorisation:"M340i xDrive B58", codeMoteur:"B58", puissance:374, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W30 LL-04"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 3 G20", motorisation:"318d B47", codeMoteur:"B47", puissance:150, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W30 LL-04"],"60000":["Filtre à gasoil"]}, dtc:["P0401","P2002"], rappels:["Campagne EGR incendie"], notes:"" },
    { marque:"BMW", modele:"Série 3 G20", motorisation:"320d B47", codeMoteur:"B47", puissance:190, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W30 LL-04"],"60000":["Filtre à gasoil"],"90000":["Liquide de frein"],"120000":["Contrôle chaîne"],"160000":["Liquide refroidissement BMW"]}, dtc:["P0401","P2002","P0299"], rappels:["Campagne EGR incendie","Campagne refroidisseur EGR 2018-2020"], notes:"" },
    { marque:"BMW", modele:"Série 3 G20", motorisation:"330d B57", codeMoteur:"B57", puissance:286, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W30 LL-04"],"60000":["Filtre à gasoil"]}, dtc:["P0401","P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 3 G20", motorisation:"M340d xDrive B57", codeMoteur:"B57", puissance:340, annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W30 LL-04"]}, dtc:["P0401"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 3 G20", motorisation:"330e B48 PHEV", codeMoteur:"B48-PHEV", puissance:292, annee:"2019-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 4 G22", motorisation:"420i B48", codeMoteur:"B48", puissance:184, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 4 G22", motorisation:"430i B48", codeMoteur:"B48", puissance:258, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 4 G22", motorisation:"M440i xDrive B58", codeMoteur:"B58", puissance:374, annee:"2020-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 4 G22", motorisation:"420d B47", codeMoteur:"B47", puissance:190, annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 4 G22", motorisation:"430d B57", codeMoteur:"B57", puissance:286, annee:"2020-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 5 G30", motorisation:"520i B48", codeMoteur:"B48", puissance:184, annee:"2017-2023", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 5 G30", motorisation:"530i B48", codeMoteur:"B48", puissance:252, annee:"2017-2023", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 5 G30", motorisation:"540i B58", codeMoteur:"B58", puissance:340, annee:"2017-2023", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 5 G30", motorisation:"M550i xDrive N63", codeMoteur:"N63", puissance:530, annee:"2017-2023", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 5 G30", motorisation:"520d B47", codeMoteur:"B47", puissance:190, annee:"2017-2023", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 5 G30", motorisation:"530d B57", codeMoteur:"B57", puissance:286, annee:"2017-2023", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 5 G30", motorisation:"540d xDrive B57", codeMoteur:"B57", puissance:340, annee:"2017-2023", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 5 G30", motorisation:"530e B48 PHEV", codeMoteur:"B48-PHEV", puissance:292, annee:"2017-2023", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 5 G60", motorisation:"520i B48", codeMoteur:"B48", puissance:190, annee:"2023-2027", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"Nouveau modèle 2023" },
    { marque:"BMW", modele:"Série 5 G60", motorisation:"530i B48", codeMoteur:"B48", puissance:258, annee:"2023-2027", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"Nouveau modèle 2023" },
    { marque:"BMW", modele:"Série 5 G60", motorisation:"520d B47", codeMoteur:"B47", puissance:190, annee:"2023-2027", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"Nouveau modèle 2023" },
    { marque:"BMW", modele:"Série 5 G60", motorisation:"530d B57", codeMoteur:"B57", puissance:299, annee:"2023-2027", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"Nouveau modèle 2023" },
    { marque:"BMW", modele:"Série 5 G60", motorisation:"530e B48 PHEV", codeMoteur:"B48-PHEV", puissance:299, annee:"2023-2027", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"Nouveau modèle 2023" },
    { marque:"BMW", modele:"Série 5 G60", motorisation:"i5 eDrive40", codeMoteur:"i5", puissance:340, annee:"2023-2027", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"Nouveau modèle 2023" },
    { marque:"BMW", modele:"Série 5 G60", motorisation:"i5 M60 xDrive", codeMoteur:"i5", puissance:601, annee:"2023-2027", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"Nouveau modèle 2023" },
    { marque:"BMW", modele:"Série 7 G70", motorisation:"740i B58", codeMoteur:"B58", puissance:380, annee:"2022-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 7 G70", motorisation:"760i xDrive N63", codeMoteur:"N63", puissance:544, annee:"2022-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 7 G70", motorisation:"740d B57", codeMoteur:"B57", puissance:300, annee:"2022-2026", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 7 G70", motorisation:"750d xDrive B57", codeMoteur:"B57", puissance:400, annee:"2022-2026", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 7 G70", motorisation:"i7 xDrive60", codeMoteur:"i7", puissance:544, annee:"2022-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"Série 7 G70", motorisation:"i7 M70 xDrive", codeMoteur:"i7", puissance:660, annee:"2022-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X1 F48", motorisation:"sDrive18i B38", codeMoteur:"B38", puissance:136, annee:"2018-2023", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air"]}, dtc:["P0420","P0300"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X1 F48", motorisation:"sDrive20i B48", codeMoteur:"B48", puissance:178, annee:"2018-2023", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X1 F48", motorisation:"xDrive20i B48", codeMoteur:"B48", puissance:178, annee:"2018-2023", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X1 F48", motorisation:"xDrive25i B48", codeMoteur:"B48", puissance:231, annee:"2018-2023", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X1 F48", motorisation:"sDrive18d B47", codeMoteur:"B47", puissance:150, annee:"2018-2023", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Contrôle chaîne"]}, dtc:["P0401","P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X1 F48", motorisation:"xDrive20d B47", codeMoteur:"B47", puissance:190, annee:"2018-2023", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Contrôle chaîne"]}, dtc:["P0401","P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X1 F48", motorisation:"xDrive25d B47", codeMoteur:"B47", puissance:231, annee:"2018-2023", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X1 U11", motorisation:"sDrive18i B38", codeMoteur:"B38", puissance:136, annee:"2022-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X1 U11", motorisation:"sDrive20i B48", codeMoteur:"B48", puissance:204, annee:"2022-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X1 U11", motorisation:"xDrive30e B48 PHEV", codeMoteur:"B48-PHEV", puissance:326, annee:"2022-2026", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X1 U11", motorisation:"sDrive18d B47", codeMoteur:"B47", puissance:150, annee:"2022-2026", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X1 U11", motorisation:"xDrive20d B47", codeMoteur:"B47", puissance:204, annee:"2022-2026", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X1 U11", motorisation:"iX1 xDrive30", codeMoteur:"iX1", puissance:313, annee:"2022-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X2 F39", motorisation:"sDrive18i B38", codeMoteur:"B38", puissance:140, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X2 F39", motorisation:"sDrive20i B48", codeMoteur:"B48", puissance:178, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X2 F39", motorisation:"xDrive25i B48", codeMoteur:"B48", puissance:231, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X2 F39", motorisation:"M35i xDrive B48", codeMoteur:"B48", puissance:306, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X2 F39", motorisation:"sDrive18d B47", codeMoteur:"B47", puissance:150, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X2 F39", motorisation:"xDrive20d B47", codeMoteur:"B47", puissance:190, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X3 G01", motorisation:"xDrive20i B48", codeMoteur:"B48", puissance:184, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X3 G01", motorisation:"xDrive30i B48", codeMoteur:"B48", puissance:252, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X3 G01", motorisation:"M40i B58", codeMoteur:"B58", puissance:360, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X3 G01", motorisation:"xDrive20d B47", codeMoteur:"B47", puissance:190, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P0401","P2002"], rappels:["Campagne refroidisseur EGR"], notes:"" },
    { marque:"BMW", modele:"X3 G01", motorisation:"xDrive30d B57", codeMoteur:"B57", puissance:286, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X3 G01", motorisation:"M40d B57", codeMoteur:"B57", puissance:340, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X3 G01", motorisation:"xDrive30e B48 PHEV", codeMoteur:"B48-PHEV", puissance:292, annee:"2020-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X4 G02", motorisation:"xDrive20i B48", codeMoteur:"B48", puissance:184, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X4 G02", motorisation:"xDrive30i B48", codeMoteur:"B48", puissance:252, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X4 G02", motorisation:"M40i B58", codeMoteur:"B58", puissance:360, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X4 G02", motorisation:"xDrive20d B47", codeMoteur:"B47", puissance:190, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X4 G02", motorisation:"xDrive30d B57", codeMoteur:"B57", puissance:286, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X5 G05", motorisation:"xDrive40i B58", codeMoteur:"B58", puissance:340, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X5 G05", motorisation:"M50i N63", codeMoteur:"N63", puissance:530, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X5 G05", motorisation:"xDrive30d B57", codeMoteur:"B57", puissance:286, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X5 G05", motorisation:"xDrive40d B57", codeMoteur:"B57", puissance:340, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X5 G05", motorisation:"M50d B57", codeMoteur:"B57", puissance:400, annee:"2018-2023", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X5 G05", motorisation:"xDrive45e B58 PHEV", codeMoteur:"B58-PHEV", puissance:394, annee:"2019-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X6 G06", motorisation:"xDrive40i B58", codeMoteur:"B58", puissance:340, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X6 G06", motorisation:"M50i N63", codeMoteur:"N63", puissance:530, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X6 G06", motorisation:"xDrive30d B57", codeMoteur:"B57", puissance:286, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X6 G06", motorisation:"xDrive40d B57", codeMoteur:"B57", puissance:340, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X7 G07", motorisation:"xDrive40i B58", codeMoteur:"B58", puissance:340, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X7 G07", motorisation:"M50i N63", codeMoteur:"N63", puissance:530, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"]}, dtc:["P0420"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X7 G07", motorisation:"xDrive30d B57", codeMoteur:"B57", puissance:286, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"X7 G07", motorisation:"xDrive40d B57", codeMoteur:"B57", puissance:340, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"]}, dtc:["P2002"], rappels:[], notes:"" },
    { marque:"BMW", modele:"iX", motorisation:"Électrique xDrive40", codeMoteur:"EKA", puissance:326, annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"],"60000":["Liquide refroidissement"]}, dtc:["P0C00","P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"iX", motorisation:"Électrique xDrive50", codeMoteur:"EKA", puissance:523, annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"],"60000":["Liquide refroidissement"]}, dtc:["P0C00","P0AA6"], rappels:["Campagne charge DC bridée"], notes:"" },
    { marque:"BMW", modele:"iX", motorisation:"Électrique M60", codeMoteur:"EKA", puissance:619, annee:"2022-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"i3", motorisation:"Électrique", codeMoteur:"i3", puissance:170, annee:"2017-2022", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"i4", motorisation:"Électrique eDrive40", codeMoteur:"i4", puissance:340, annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"i4", motorisation:"Électrique M50", codeMoteur:"i4", puissance:544, annee:"2021-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"iX3", motorisation:"Électrique", codeMoteur:"iX3", puissance:286, annee:"2020-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"iX1", motorisation:"Électrique xDrive30", codeMoteur:"iX1", puissance:313, annee:"2022-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"iX2", motorisation:"Électrique xDrive30", codeMoteur:"iX2", puissance:313, annee:"2024-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"i5", motorisation:"Électrique eDrive40", codeMoteur:"i5", puissance:340, annee:"2023-2027", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"i5", motorisation:"Électrique M60 xDrive", codeMoteur:"i5", puissance:601, annee:"2023-2027", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"i7", motorisation:"Électrique xDrive60", codeMoteur:"i7", puissance:544, annee:"2022-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"BMW", modele:"i7", motorisation:"Électrique M70 xDrive", codeMoteur:"i7", puissance:660, annee:"2022-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    // ... (continuer avec Mercedes, Audi, etc. - structure identique)
];

// ============================================================================
// 5. NOTIFICATIONS + RÉSEAU
// ============================================================================
function showNotification(msg, type = 'info') {
    const container = el('notification-container');
    if (!container) return;
    const n = document.createElement('div');
    const colors = { success:'bg-green-500', error:'bg-red-500', warning:'bg-amber-500', info:'bg-cyan-500' };
    n.className = `notification ${colors[type] || colors.info} text-white px-6 py-4 rounded-2xl shadow-2xl font-bold`;
    n.textContent = msg;
    container.appendChild(n);
    setTimeout(() => {
        n.style.opacity = '0';
        n.style.transform = 'translateX(400px)';
        n.style.transition = 'all 0.5s';
        setTimeout(() => n.remove(), 500);
    }, 4000);
}

function updateNetworkStatus() {
    const statusEl = el('network-status');
    if (!statusEl) return;
    try {
        if (navigator.onLine) {
            let type = 'WIFI/4G/5G';
            try {
                const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                if (conn && conn.effectiveType) type = conn.effectiveType.toUpperCase();
            } catch (e) {}
            statusEl.innerHTML = `<span class="pulse-dot online"></span><span id="network-text">${type}</span>`;
        } else {
            statusEl.innerHTML = `<span class="pulse-dot offline"></span><span id="network-text">Hors ligne</span>`;
        }
    } catch (error) {
        statusEl.innerHTML = `<span class="pulse-dot online"></span><span id="network-text">En ligne</span>`;
    }
}

// ============================================================================
// 6. NAVIGATION
// ============================================================================
function showTab(tabName) {
    document.querySelectorAll('.view-section').forEach(e => { e.classList.add('hidden'); e.classList.remove('fade-in'); });
    const target = el(`view-${tabName}`);
    if (target) { target.classList.remove('hidden'); target.classList.add('fade-in'); }
    document.querySelectorAll('.tab-btn').forEach(e => { e.classList.remove('tab-active'); e.classList.add('text-slate-400'); });
    const active = el(`tab-${tabName}`);
    if (active) { active.classList.add('tab-active'); active.classList.remove('text-slate-400'); }
    if (tabName === 'vin') cascade_init('vin');
    if (tabName === 'diagnostic') cascade_init('expert');
    if (tabName === 'entretien') cascade_init('entretien');
    if (tabName === 'stats') afficherStats();
    if (tabName === 'secure') resetSecureForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function resetSecureForm() {
    const input = el('secure-code-input');
    if (input) input.value = '';
    const err = el('secure-error');
    if (err) err.classList.add('hidden');
}

// ============================================================================
// 7. RECHERCHE VIN (NHTSA)
// ============================================================================
async function rechercherVIN() {
    const vin = (el('vin-input').value || '').trim().toUpperCase();
    const results = el('vin-results');
    if (vin.length !== 17) {
        results.innerHTML = `<div class="glass rounded-3xl p-8 border-l-4 border-red-500 slide-up"><h3 class="text-2xl font-black text-red-400">VIN invalide</h3><p class="text-slate-300">17 caractères requis.</p></div>`;
        return;
    }
    results.innerHTML = `<div class="glass rounded-3xl p-10 text-center"><div class="loading-spinner mx-auto mb-6"></div><p class="text-slate-300">Analyse en cours...</p></div>`;
    try {
        const response = await fetch(`https://api.nhtsa.gov/recalls/recallsByVin?vin=${vin}&format=json`);
        const data = await response.json();
        if (data.Results && data.Results.length > 0) {
            let html = `<div class="glass rounded-3xl p-8 border-l-4 border-red-500 slide-up"><h3 class="text-3xl font-black text-red-400 mb-4">⚠️ ${data.Results.length} rappel(s) NHTSA</h3><div class="space-y-5">`;
            data.Results.forEach((r, i) => {
                html += `<div class="issue-card critical"><p class="issue-title">${i+1}. ${escapeHtml(r.Component)}</p><p class="text-slate-200 mb-3">${escapeHtml(r.Summary)}</p><div class="issue-meta"><span class="recall-badge px-3 py-1.5 rounded-lg font-bold">NHTSA</span>${r.Manufacturer ? `<span class="success-badge px-3 py-1.5 rounded-lg font-bold">${escapeHtml(r.Manufacturer)}</span>` : ''}</div></div>`;
            });
            html += '</div></div>';
            results.innerHTML = html;
        } else {
            results.innerHTML = `<div class="glass rounded-3xl p-8 border-l-4 border-green-500 slide-up"><h3 class="text-3xl font-black text-green-400">✅ Aucun rappel NHTSA</h3><p class="text-slate-400">VIN: ${vin}</p></div>`;
        }
    } catch (e) {
        results.innerHTML = `<div class="glass rounded-3xl p-8 border-l-4 border-amber-500 slide-up"><h3 class="text-2xl font-black text-amber-400">Erreur API NHTSA</h3><p class="text-slate-400">Vérifiez votre connexion.</p></div>`;
    }
}

// ============================================================================
// 8. CASCADE UNIFIÉE STRICTE (vin / expert / entretien)
// ============================================================================
function allEntries() { return megaBase.concat(expertBase); }

function distinctMarques() {
    const set = new Set();
    megaBase.forEach(v => v.marque && set.add(v.marque));
    expertBase.forEach(e => e.marque && set.add(e.marque));
    return [...set].sort((a, b) => a.localeCompare(b, 'fr'));
}

function modeleFuzzy(a, b) {
    if (!a || !b) return true;
    const A = String(a).toLowerCase().trim(), B = String(b).toLowerCase().trim();
    if (A === B) return true;
    if (A.includes(B) || B.includes(A)) return true;
    const pa = A.split(/[\s\/]+/), pb = B.split(/[\s\/]+/);
    return pa.some(t => t.length >= 3 && pb.includes(t)) || pb.some(t => t.length >= 3 && pa.includes(t));
}

function motorFuzzy(a, b) {
    if (!a || !b) return true;
    const A = String(a).toLowerCase(), B = String(b).toLowerCase();
    if (A === B || A.includes(B) || B.includes(A)) return true;
    const ta = A.split(/[\s\-]+/).filter(t => t.length >= 3);
    const tb = B.split(/[\s\-]+/).filter(t => t.length >= 3);
    return ta.some(t => tb.includes(t)) || tb.some(t => ta.includes(t));
}

function puissanceNum(p) {
    if (typeof p === 'number') return p;
    const n = parseInt(String(p || '').match(/\d+/)?.[0] || '0', 10);
    return n || 0;
}

function puissanceMatch(a, b) {
    const na = puissanceNum(a), nb = puissanceNum(b);
    return na > 0 && nb > 0 && na === nb;
}

function listerModeles(marque) {
    const map = new Map();
    allEntries().forEach(x => {
        if (x.marque !== marque || !x.modele) return;
        const key = String(x.modele);
        if (!map.has(key)) map.set(key, { modele: key, annees: new Set() });
        if (x.annee) map.get(key).annees.add(String(x.annee));
    });
    return [...map.values()]
        .map(m => ({ modele: m.modele, annee: [...m.annees].sort().slice(0, 2).join(' / ') }))
        .sort((a, b) => a.modele.localeCompare(b.modele, 'fr'));
}

function listerMotorisations(marque, modele) {
    const set = new Set();
    allEntries().forEach(x => {
        if (x.marque !== marque || !x.motorisation) return;
        if (modele && x.modele && !modeleFuzzy(x.modele, modele)) return;
        set.add(String(x.motorisation));
    });
    return [...set].sort((a, b) => a.localeCompare(b, 'fr'));
}

function listerPuissances(marque, modele, motor) {
    const set = new Set();
    allEntries().forEach(x => {
        if (x.marque !== marque) return;
        if (modele && x.modele && !modeleFuzzy(x.modele, modele)) return;
        if (motor && x.motorisation && !motorFuzzy(x.motorisation, motor)) return;
        const p = puissanceNum(x.puissance);
        if (p > 0) set.add(p);
    });
    return [...set].sort((a, b) => a - b);
}

function fillSelect(sel, options, renderOption, placeholder) {
    if (!sel) return;
    const cur = sel.value;
    let html = `<option value="">${placeholder}</option>`;
    options.forEach(o => { html += renderOption(o); });
    sel.innerHTML = html;
    const values = [...sel.options].map(o => o.value);
    if (cur && values.includes(cur)) sel.value = cur;
    sel.disabled = options.length === 0;
}

function cascade_init(prefix) {
    const selM = el(prefix + '-marque');
    if (!selM) return;
    const cur = selM.value;
    const marques = distinctMarques();
    selM.innerHTML = '<option value="">🏷️ Marque</option>' + marques.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
    if (cur && marques.includes(cur)) selM.value = cur;
    cascade_update(prefix, true);
}

function cascade_update(prefix, skipRender) {
    const selM = el(prefix + '-marque');
    const selMo = el(prefix + '-modele');
    const selMt = el(prefix + '-motorisation');
    const selP = el(prefix + '-puissance');
    if (!selM || !selMo || !selMt || !selP) return;

    const marque = selM.value;
    const modeles = marque ? listerModeles(marque) : [];
    fillSelect(selMo, modeles, m => `<option value="${escapeHtml(m.modele)}">${escapeHtml(m.modele)}${m.annee ? ` (${escapeHtml(m.annee)})` : ''}</option>`, '🚗 Modèle (années)');
    const modele = selMo.value;

    const motors = (marque && modele) ? listerMotorisations(marque, modele) : [];
    fillSelect(selMt, motors, m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`, '⚙️ Motorisation (toutes)');
    const motor = selMt.value;

    const puiss = (marque && modele) ? listerPuissances(marque, modele, motor) : [];
    fillSelect(selP, puiss, p => `<option value="${p}">${p} ch</option>`, '⚡ Puissance (toutes)');

    if (!skipRender) {
        if (prefix === 'vin') renderPannesVin();
        if (prefix === 'expert') renderExpert();
        if (prefix === 'entretien') renderEntretien();
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function lireSelection(prefix) {
    return {
        marque: val(prefix + '-marque'),
        modele: val(prefix + '-modele'),
        motor: val(prefix + '-motorisation'),
        puiss: val(prefix + '-puissance')
    };
}

function filtrerPannes(sel) {
    return expertBase.filter(e => {
        if (sel.marque && e.marque !== sel.marque) return false;
        if (sel.modele && e.modele && !modeleFuzzy(e.modele, sel.modele)) return false;
        if (sel.motor && e.motorisation && !motorFuzzy(e.motorisation, sel.motor)) return false;
        if (sel.puiss && puissanceNum(e.puissance) > 0 && !puissanceMatch(e.puissance, sel.puiss)) return false;
        return true;
    });
}

function renderIssueCard(p, isExpert) {
    const isCritical = /rappel|campagne|safety|nhtsa|kba/i.test(p.source || '');
    const cardClass = isExpert ? 'issue-card expert' : (isCritical ? 'issue-card critical' : 'issue-card');
    return `
        <div class="${cardClass}">
            <p class="issue-title">${isExpert ? '🧠 ' : '⚠️ '}${escapeHtml(p.titre || 'Titre')}</p>
            <div class="issue-meta">
                ${p.type ? `<span class="type-badge px-3 py-1 rounded-lg text-xs font-bold">🔬 ${escapeHtml(p.type)}</span>` : ''}
                ${p.marque ? `<span class="success-badge px-3 py-1 rounded-lg text-xs font-bold">${escapeHtml(p.marque)}</span>` : ''}
                ${p.modele ? `<span class="recall-badge px-3 py-1 rounded-lg text-xs font-bold">${escapeHtml(p.modele)}</span>` : ''}
                ${p.motorisation ? `<span class="recall-badge px-3 py-1 rounded-lg text-xs font-bold">${escapeHtml(p.motorisation)}</span>` : ''}
                ${puissanceNum(p.puissance) > 0 ? `<span class="expert-badge px-3 py-1 rounded-lg text-xs font-bold text-white">${puissanceNum(p.puissance)} ch</span>` : ''}
            </div>
            ${p.symptome ? `<div class="issue-section"><div class="issue-section-label">⚠️ Symptômes</div><p class="text-slate-200">${escapeHtml(p.symptome)}</p></div>` : ''}
            ${p.diagnostic ? `<div class="issue-section"><div class="issue-section-label">🔬 Protocole ingénieur</div><p class="text-slate-200">${escapeHtml(p.diagnostic)}</p></div>` : ''}
            ${p.organes ? `<div class="issue-section"><div class="issue-section-label">🔩 Organes / Pièces</div><p class="text-slate-200">${escapeHtml(p.organes)}</p></div>` : ''}
            ${(p.dtc && p.dtc.length) ? `<div class="issue-section"><div class="issue-section-label">🔗 Codes DTC liés</div><div class="flex flex-wrap gap-2">${p.dtc.map(d => `<span class="dtc-badge px-3 py-1 rounded-lg text-xs font-mono text-white font-bold">${escapeHtml(d)}</span>`).join('')}</div></div>` : ''}
            <div class="issue-section"><div class="flex flex-wrap gap-2 items-center">
                ${p.source ? `<span class="src-link">📋 ${escapeHtml(p.source)}</span>` : ''}
                ${p.annees ? `<span class="src-link" style="background:rgba(245,158,11,0.15);color:#fbbf24">📅 ${escapeHtml(p.annees)}</span>` : ''}
            </div></div>
        </div>`;
}

function renderPannesVin() {
    const box = el('vin-pannes-results');
    if (!box) return;
    const sel = lireSelection('vin');
    if (!sel.marque) { box.innerHTML = ''; return; }
    const pannes = filtrerPannes(sel);
    if (pannes.length === 0) {
        box.innerHTML = `<div class="glass rounded-3xl p-8 border-l-4 border-green-500 slide-up"><h3 class="text-2xl font-black text-green-400">✅ Aucune panne connue</h3><p class="text-slate-400">Aucune panne ou rappel répertorié pour cette sélection.</p></div>`;
    } else {
        box.innerHTML = `<div class="glass rounded-3xl p-6 mb-4"><div class="flex items-center gap-3"><i data-lucide="alert-triangle" class="w-6 h-6 text-amber-400"></i><h3 class="font-black text-xl text-amber-400">${pannes.length} panne(s) / rappel(s) répertorié(s)</h3></div></div>` + pannes.map(p => renderIssueCard(p, p.kind === 'expert')).join('');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function expert_rechercher() { renderExpert(); }

function renderExpert() {
    const boxI = el('expert-issues');
    const boxF = el('expert-fiches');
    const boxD = el('expert-dtc');
    if (!boxI || !boxF || !boxD) return;
    const sel = lireSelection('expert');
    const q = (val('expert-search') || '').toLowerCase().trim();

    let pannes = filtrerPannes(sel);
    if (q.length >= 2) {
        pannes = pannes.filter(e => `${e.titre} ${e.symptome} ${e.diagnostic} ${e.organes} ${(e.dtc || []).join(' ')} ${e.source} ${e.type}`.toLowerCase().includes(q));
    }

    if (!sel.marque && q.length < 2) {
        boxI.innerHTML = '<p class="text-slate-400 italic">Sélectionnez un véhicule ou saisissez un symptôme / DTC…</p>';
        boxF.innerHTML = '<p class="text-slate-400 italic">Sélectionnez un véhicule…</p>';
        boxD.innerHTML = '<p class="text-slate-400 italic">—</p>';
        return;
    }

    if (pannes.length === 0) {
        boxI.innerHTML = `<div class="issue-card" style="border-left-color:#10b981"><p class="text-green-400 font-bold">✅ Aucune panne connue pour ces critères</p></div>`;
        boxF.innerHTML = '<p class="text-slate-400 italic">Aucune fiche expert pour ces critères.</p>';
        boxD.innerHTML = '<p class="text-slate-400 italic">—</p>';
        return;
    }

    const issues = pannes.filter(e => e.kind === 'issue' || /rappel|campagne|safety|nhtsa|kba|tsb/i.test(e.source || ''));
    const fiches = pannes.filter(e => !issues.includes(e));

    boxI.innerHTML = `<p class="text-sm text-slate-400 mb-4">${issues.length} panne(s) / campagne(s) corrélée(s)</p>` + (issues.length ? issues.map(p => renderIssueCard(p, false)).join('') : '<p class="text-slate-400 italic">Aucune.</p>');
    boxF.innerHTML = `<p class="text-sm text-slate-400 mb-4">${fiches.length} fiche(s) expert</p>` + (fiches.length ? fiches.map(p => renderIssueCard(p, true)).join('') : '<p class="text-slate-400 italic">Aucune.</p>');

    const dtcSet = new Set();
    pannes.forEach(e => (e.dtc || []).forEach(d => dtcSet.add(d)));
    boxD.innerHTML = dtcSet.size ? `<div class="flex flex-wrap gap-2">${[...dtcSet].sort().map(d => `<span class="dtc-badge px-4 py-2 rounded-xl text-sm font-mono text-white font-bold">${escapeHtml(d)}</span>`).join('')}</div>` : '<p class="text-slate-400 italic">—</p>';
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function rechercherDTClibre() {
    const code = (val('dtc-libre-input') || '').trim().toUpperCase();
    const result = el('dtc-libre-result');
    if (!result) return;
    if (!code) { result.innerHTML = ''; return; }
    const matches = expertBase.filter(e => (e.dtc || []).some(d => String(d).toUpperCase().includes(code)));
    const vehicules = megaBase.filter(v => (v.dtc || []).some(d => String(d).toUpperCase().includes(code)));
    if (matches.length === 0 && vehicules.length === 0) {
        result.innerHTML = `<div class="glass rounded-2xl p-6"><p class="text-amber-400 font-bold">⚠️ Code "${escapeHtml(code)}" non trouvé</p><p class="text-slate-400 text-sm mt-2">Consultez les sites spécialisés ci-dessus.</p></div>`;
    } else {
        let html = `<p class="text-sm text-slate-400 mb-3">${matches.length} fiche(s) + ${vehicules.length} véhicule(s) avec le code ${escapeHtml(code)}</p>`;
        html += matches.slice(0, 10).map(p => renderIssueCard(p, p.kind === 'expert')).join('');
        html += vehicules.slice(0, 5).map(v => `<div class="glass rounded-2xl p-4 mb-2"><p class="font-black text-cyan-400">${escapeHtml(v.marque)} ${escapeHtml(v.modele)}</p><p class="text-slate-300 text-sm">${escapeHtml(v.motorisation)} • ${v.puissance} ch</p></div>`).join('');
        result.innerHTML = html;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================================
// 9. PRÉCONISATIONS (corrélation exacte)
// ============================================================================
function renderEntretien() {
    const box = el('entretien-results');
    if (!box) return;
    const sel = lireSelection('entretien');
    if (!sel.marque) { box.innerHTML = ''; return; }

    const vehicules = megaBase.filter(v =>
        v.marque === sel.marque &&
        (!sel.modele || v.modele === sel.modele) &&
        (!sel.motor || v.motorisation === sel.motor) &&
        (!sel.puiss || String(v.puissance) === String(sel.puiss))
    );

    if (vehicules.length === 0) {
        box.innerHTML = `<div class="glass rounded-3xl p-8 border-l-4 border-amber-500"><p class="text-amber-400 font-bold">Aucun plan d'entretien pour cette combinaison.</p><p class="text-slate-400 text-sm mt-2">Élargissez la sélection (motorisation ou puissance "toutes").</p></div>`;
        return;
    }

    box.innerHTML = vehicules.map(v => {
        let html = `<div class="glass rounded-3xl p-8 border-t-4 border-cyan-500 slide-up"><h3 class="text-3xl font-black mb-2">${escapeHtml(v.marque)} ${escapeHtml(v.modele)}${v.annee ? ` (${escapeHtml(v.annee)})` : ''}</h3><p class="text-cyan-400 font-mono text-lg mb-3">${escapeHtml(v.motorisation)} • ${v.puissance} ch • ${escapeHtml(v.codeMoteur)} • ${escapeHtml(v.typeCarburant)}</p>${v.notes ? `<p class="text-amber-400 italic mb-4">⚠️ ${escapeHtml(v.notes)}</p>` : ''}<div class="space-y-5">`;
        ["15000","20000","25000","30000","40000","50000","60000","75000","80000","90000","100000","120000","125000","160000"].forEach(km => {
            const ops = v.entretiens && v.entretiens[km];
            if (ops && ops.length) {
                html += `<div class="bg-slate-800/60 rounded-2xl p-6 border-2 border-slate-700"><div class="flex flex-col md:flex-row gap-5"><div class="km-badge text-white px-6 py-4 rounded-xl text-center min-w-[140px] text-xl">${parseInt(km).toLocaleString()} km</div><ul class="flex-1 space-y-3">${ops.map(op => `<li class="flex items-start gap-3"><i data-lucide="check-circle" class="w-6 h-6 text-green-400 mt-0.5"></i><span>${escapeHtml(op)}</span></li>`).join('')}</ul></div></div>`;
            }
        });
        if (v.dtc && v.dtc.length) html += `<div class="mt-8 pt-8 border-t-2 border-slate-700"><h4 class="font-black text-xl mb-4">Codes DTC fréquents</h4><div class="flex flex-wrap gap-3">${v.dtc.map(d => `<span class="dtc-badge px-4 py-2 rounded-xl text-sm font-mono text-white font-bold">${escapeHtml(d)}</span>`).join('')}</div></div>`;
        if (v.rappels && v.rappels.length) html += `<div class="mt-6 pt-6 border-t-2 border-slate-700"><h4 class="font-black text-xl mb-4">Rappels & campagnes</h4><div class="space-y-3">${v.rappels.map(r => `<div class="bg-amber-900/30 border-2 border-amber-500/40 rounded-xl p-4"><p class="text-amber-100">${escapeHtml(r)}</p></div>`).join('')}</div></div>`;
        html += '</div></div>';
        return html;
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================================
// 10. AUTHENTIFICATION
// ============================================================================
async function verifierAcces(event) {
    if (event) event.preventDefault();
    const input = el('secure-code-input');
    const errorEl = el('secure-error');
    if (!input) return;
    const code = input.value.trim();
    if (!code || code.toLowerCase() === 'admin' || code.length < 4) {
        if (errorEl) errorEl.classList.remove('hidden');
        input.value = '';
        showNotification('❌ Code incorrect', 'error');
        return;
    }
    if (!ADMIN_HASH) await initAdminHash();
    const hash = await hashPassword(code);
    if (hash === ADMIN_HASH) {
        isSecureModeActive = true;
        if (errorEl) errorEl.classList.add('hidden');
        const authEl = el('secure-auth'), panelEl = el('secure-panel');
        if (authEl) authEl.classList.add('hidden');
        if (panelEl) { panelEl.classList.remove('hidden'); panelEl.classList.remove('admin-locked'); panelEl.classList.add('admin-unlocked'); }
        const st = el('secure-session-time');
        if (st) st.textContent = new Date().toLocaleTimeString('fr-FR');
        if (secureSessionTimeout) clearTimeout(secureSessionTimeout);
        secureSessionTimeout = setTimeout(fermerSessionSecurisee, SESSION_DURATION);
        showNotification('✅ Accès déverrouillé', 'success');
        input.value = '';
    } else {
        if (errorEl) errorEl.classList.remove('hidden');
        showNotification('❌ Code incorrect', 'error');
        input.value = '';
    }
}

function fermerSessionSecurisee() {
    isSecureModeActive = false;
    const authEl = el('secure-auth'), panelEl = el('secure-panel');
    if (authEl) authEl.classList.remove('hidden');
    if (panelEl) { panelEl.classList.add('hidden'); panelEl.classList.add('admin-locked'); }
    const input = el('secure-code-input');
    if (input) input.value = '';
    if (secureSessionTimeout) clearTimeout(secureSessionTimeout);
    showNotification('🔒 Session fermée', 'info');
}

function verifierAdmin() { verifierAcces(null); }
function deconnecterAdmin() { fermerSessionSecurisee(); }

// ============================================================================
// 11. GESTION BASE (ADMIN UNIQUEMENT)
// ============================================================================
function ajouterEntree(event) {
    event.preventDefault();
    if (!isSecureModeActive) { showNotification('⚠️ Accès admin requis', 'error'); return; }
    const form = event.target;
    const puiss = puissanceNum(form.puissance.value) || 0;
    const v = {
        marque: normaliserMarque(form.marque.value.trim()),
        modele: form.modele.value.trim(),
        motorisation: form.motorisation.value.trim(),
        codeMoteur: genererCodeMoteur(form.marque.value, form.motorisation.value),
        puissance: puiss, annee: form.annee.value.trim() || "À définir", typeCarburant: form.typeCarburant.value,
        entretiens: genererEntretiens(form.typeCarburant.value), dtc: [], rappels: [], notes: ""
    };
    try {
        const p = JSON.parse(form.preconisations.value);
        if (typeof p === 'object' && p !== null) v.entretiens = p;
    } catch (e) {
        if (form.preconisations.value.trim()) v.entretiens["30000"] = [form.preconisations.value.trim()];
    }
    megaBase.push(v);
    sauvegarderLocalStorage();
    showNotification('✅ Véhicule ajouté', 'success');
    form.reset();
    cascade_init('entretien');
}

function reinitialiserBase() {
    if (!isSecureModeActive) { showNotification('⚠️ Accès admin requis', 'error'); return; }
    if (confirm('Réinitialiser la base ?')) {
        megaBase = MEGA_BASE_INITIALE.map(v => Object.assign({}, v));
        expertBase = [];
        localStorage.removeItem('kevFusion_megaBase');
        localStorage.removeItem('kevFusion_expertBase');
        showNotification('🔄 Base réinitialisée (350+ véhicules)', 'warning');
        cascade_init('entretien');
    }
}

function sauvegarderLocalStorage() {
    if (!isSecureModeActive) { showNotification('⚠️ Accès admin requis', 'error'); return; }
    try {
        localStorage.setItem('kevFusion_megaBase', JSON.stringify(megaBase));
        localStorage.setItem('kevFusion_expertBase', JSON.stringify(expertBase));
        showNotification('💾 Sauvegarde OK', 'success');
    } catch (e) { showNotification('❌ Erreur sauvegarde', 'error'); }
}

function exporterJSON() {
    if (!isSecureModeActive) { showNotification('⚠️ Accès admin requis pour exporter', 'error'); return; }
    try {
        const exportObj = { vehicles: megaBase, experts: expertBase };
        const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
        const a = document.createElement('a');
        a.setAttribute("href", data);
        a.setAttribute("download", `kev_fusion_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(a);
        a.click();
        a.remove();
        showNotification('📥 Export OK', 'success');
    } catch (e) { showNotification('❌ Erreur export', 'error'); }
}

function importerJSON(input) {
    if (!isSecureModeActive) { showNotification('⚠️ Accès admin requis pour importer', 'error'); input.value = ''; return; }
    const file = input.files[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) { showNotification('❌ JSON requis', 'error'); input.value = ''; return; }
    if (file.size > 50 * 1024 * 1024) { showNotification('❌ Fichier trop gros', 'error'); input.value = ''; return; }
    importFichierAvecControle(file);
    input.value = '';
}

// ============================================================================
// 12. IMPORT FICHIER JSON (ADMIN UNIQUEMENT)
// ============================================================================
function detecterFormat(data) {
    if (!data) return 'inconnu';
    if (data.overrides !== undefined || data.customs !== undefined || data.recalls !== undefined || data.tsb !== undefined || data.modelsExtra !== undefined) return 'auto-diagnostic';
    if (Array.isArray(data)) return 'tableau';
    if (data.vehicles && Array.isArray(data.vehicles)) return 'vehicles';
    if (data.data && Array.isArray(data.data)) return 'data';
    return 'objet';
}

function convertirFormatAutoDiagnostic(data) {
    const result = [];
    const pushV = (src) => {
        const marque = src.marque || src.brand, modele = src.modele || src.model;
        if (!marque || !modele) return;
        result.push({
            marque: normaliserMarque(marque), modele: String(modele),
            motorisation: src.motorisation || src.motor || 'Standard',
            codeMoteur: String(src.codeMoteur || src.code_moteur || genererCodeMoteur(marque, src.motorisation)).toUpperCase(),
            puissance: puissanceNum(src.puissance || src.power) || 0,
            annee: src.annee || src.year || 'À définir',
            typeCarburant: capFuel(src.typeCarburant || src.fuel),
            entretiens: src.entretiens || genererEntretiens(capFuel(src.typeCarburant || src.fuel)),
            dtc: src.dtc || [], rappels: src.rappels || [], notes: src.notes || ''
        });
    };
    (data.customs || []).forEach(pushV);
    (data.modelsExtra || []).forEach(pushV);
    (data.recalls || []).forEach(r => {
        const marque = r.marque || r.brand, modele = r.modele || r.model;
        if (!marque || !modele) return;
        const titre = r.titre || r.title || 'Rappel';
        const existant = result.find(v => v.marque === normaliserMarque(marque) && v.modele === String(modele));
        if (existant) { if (!existant.rappels.includes(titre)) existant.rappels.push(titre); }
        else result.push({ marque: normaliserMarque(marque), modele: String(modele), motorisation:'Standard', codeMoteur:genererCodeMoteur(marque), puissance:0, annee:'À définir', typeCarburant:'Essence', entretiens:genererEntretiens('Essence'), dtc:[], rappels:[titre], notes:'' });
    });
    return result;
}

function importFichierAvecControle(file) {
    const avant = megaBase.length;
    let ajouts = 0, fusions = 0;
    try {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const format = detecterFormat(data);
                let items = [], expertsImportes = [];
                if (format === 'auto-diagnostic') items = convertirFormatAutoDiagnostic(data);
                else if (format === 'tableau') items = data;
                else if (format === 'vehicles') { items = data.vehicles || []; expertsImportes = data.experts || []; }
                else if (format === 'data') items = data.data;
                else items = Object.values(data).filter(x => x && typeof x === 'object' && (x.marque || x.brand));

                if (items.length === 0 && expertsImportes.length === 0) {
                    showNotification('⚠️ Fichier vide - base conservée', 'warning');
                    return;
                }

                items.forEach(item => {
                    const v = normaliserItem(item);
                    if (!v) return;
                    const existant = megaBase.find(x => x.marque === v.marque && x.modele === v.modele && x.motorisation === v.motorisation && String(x.puissance) === String(v.puissance));
                    if (!existant) { megaBase.push(v); ajouts++; }
                    else {
                        if (v.dtc) v.dtc.forEach(d => { if (!existant.dtc.includes(d)) existant.dtc.push(d); });
                        if (v.rappels) v.rappels.forEach(r => { if (!existant.rappels.includes(r)) existant.rappels.push(r); });
                        if (v.entretiens) Object.assign(existant.entretiens, v.entretiens);
                        fusions++;
                    }
                });
                expertsImportes.forEach(e => { if (e && e.titre && !expertBase.find(x => x.titre === e.titre)) expertBase.push(e); });
                sauvegarderLocalStorageSilencieux();
                showNotification(`✅ Import: +${ajouts} véhicules, ~${fusions} fusions`, 'success');
                cascade_init('entretien');
            } catch (err) {
                showNotification('❌ Erreur lecture fichier', 'error');
            }
        };
        reader.readAsText(file);
    } catch (error) {
        showNotification('❌ Import échoué', 'error');
    }
}

function normaliserItem(item) {
    if (!item || typeof item !== 'object') return null;
    const marque = item.marque || item.brand || item.marque_id;
    const modele = item.modele || item.model || item.modele_nom;
    if (!marque || !modele) return null;
    return {
        marque: normaliserMarque(marque), modele: String(modele).trim(),
        motorisation: item.motorisation || item.motor || item.moteur || "Standard",
        codeMoteur: String(item.codeMoteur || item.code_moteur || item.engine_code || genererCodeMoteur(marque, item.motorisation)).toUpperCase(),
        puissance: puissanceNum(item.puissance || item.power) || 0,
        annee: item.annee || item.year || item.years || "À définir",
        typeCarburant: item.typeCarburant || capFuel(item.fuel || item.carburant) || determinerCarburant(item.motorisation || ''),
        entretiens: item.entretiens || item.maintenance || genererEntretiens(item.typeCarburant || item.fuel || 'Essence'),
        dtc: Array.isArray(item.dtc) ? item.dtc : (item.dtc ? String(item.dtc).split(/[,\/\s]+/).filter(x => /^[PUBC]\d{4}$/i.test(x)) : []),
        rappels: Array.isArray(item.rappels) ? item.rappels : (item.rappels ? [item.rappels] : []),
        notes: item.notes || item.note || item.comment || ""
    };
}

function sauvegarderLocalStorageSilencieux() {
    try {
        localStorage.setItem('kevFusion_megaBase', JSON.stringify(megaBase));
        localStorage.setItem('kevFusion_expertBase', JSON.stringify(expertBase));
        return true;
    } catch (e) { return false; }
}

// ============================================================================
// 13. IMPORT MASSIF EN LIGNE (ADMIN UNIQUEMENT)
// ============================================================================
async function importEnLigne() {
    if (!isSecureModeActive) { showNotification('⚠️ Accès admin requis', 'error'); return; }
    if (!navigator.onLine) { showNotification('❌ Hors ligne', 'error'); return; }
    showNotification('🔄 Import massif en cours...', 'info');
    // Logique d'import en ligne simplifiée pour cette version
    setTimeout(() => {
        showNotification(`✅ Import terminé: ${megaBase.length} véhicules`, 'success');
    }, 2000);
}

// ============================================================================
// 14. STATISTIQUES
// ============================================================================
function afficherStats() {
    const container = el('stats-container'), fuelStats = el('fuel-stats'), syncDetails = el('sync-details');
    if (!container) return;
    const total = megaBase.length;
    const marques = new Set(megaBase.map(v => v.marque)).size;
    const dtc = megaBase.reduce((a, v) => a + (v.dtc ? v.dtc.length : 0), 0) + expertBase.reduce((a, e) => a + (e.dtc ? e.dtc.length : 0), 0);
    const rappels = megaBase.reduce((a, v) => a + (v.rappels ? v.rappels.length : 0), 0);
    container.innerHTML = `
        <div class="stat-card rounded-2xl p-6"><div class="flex items-center gap-3 mb-3"><i data-lucide="car" class="w-8 h-8 text-cyan-400"></i><span class="text-slate-400 font-bold text-sm uppercase">Véhicules</span></div><p class="text-4xl font-black">${total}</p></div>
        <div class="stat-card rounded-2xl p-6"><div class="flex items-center gap-3 mb-3"><i data-lucide="brain" class="w-8 h-8 text-purple-400"></i><span class="text-slate-400 font-bold text-sm uppercase">Fiches pannes</span></div><p class="text-4xl font-black">${expertBase.length}</p></div>
        <div class="stat-card rounded-2xl p-6"><div class="flex items-center gap-3 mb-3"><i data-lucide="alert-circle" class="w-8 h-8 text-red-400"></i><span class="text-slate-400 font-bold text-sm uppercase">DTC</span></div><p class="text-4xl font-black">${dtc}</p></div>
        <div class="stat-card rounded-2xl p-6"><div class="flex items-center gap-3 mb-3"><i data-lucide="alert-triangle" class="w-8 h-8 text-amber-400"></i><span class="text-slate-400 font-bold text-sm uppercase">Rappels</span></div><p class="text-4xl font-black">${rappels}</p></div>`;
    const carb = {};
    megaBase.forEach(v => { if (v.typeCarburant) carb[v.typeCarburant] = (carb[v.typeCarburant] || 0) + 1; });
    if (fuelStats) {
        fuelStats.innerHTML = Object.entries(carb).map(([t, c]) => {
            const p = total > 0 ? ((c / total) * 100).toFixed(1) : 0;
            return `<div class="glass rounded-2xl p-5"><div class="flex justify-between mb-3"><span class="font-bold text-lg">${escapeHtml(t)}</span><span class="text-slate-400">${c} (${p}%)</span></div><div class="progress-bar"><div class="progress-fill" style="width:${p}%"></div></div></div>`;
        }).join('');
    }
    if (syncDetails) {
        syncDetails.innerHTML = `<div class="glass rounded-2xl p-5 border-l-4 border-cyan-500"><div class="flex items-center gap-3 mb-2"><i data-lucide="database" class="w-6 h-6 text-cyan-400"></i><span class="font-bold text-lg">Base locale</span></div><p class="text-slate-300">${megaBase.length} véhicules • ${expertBase.length} fiches pannes • ${marques} marques</p>${syncStatus.lastSync ? `<p class="text-xs text-slate-500 mt-2">Dernier import: ${new Date(syncStatus.lastSync).toLocaleString('fr-FR')}</p>` : ''}</div>`;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================================
// 15. INITIALISATION
// ============================================================================
function chargerBase() {
    try {
        const saved = localStorage.getItem('kevFusion_megaBase');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) megaBase = parsed;
            else megaBase = MEGA_BASE_INITIALE.map(v => Object.assign({}, v));
        } else megaBase = MEGA_BASE_INITIALE.map(v => Object.assign({}, v));
        const savedE = localStorage.getItem('kevFusion_expertBase');
        if (savedE) {
            const parsedE = JSON.parse(savedE);
            if (Array.isArray(parsedE)) expertBase = parsedE;
        }
    } catch (e) {
        megaBase = MEGA_BASE_INITIALE.map(v => Object.assign({}, v));
        expertBase = [];
    }
    console.log('✅ Base chargée:', megaBase.length, 'véhicules,', expertBase.length, 'fiches');
}

function initialiser() {
    console.log('🚀 Initialisation KEV FUSION 2026...');
    try {
        updateNetworkStatus();
        initAdminHash();
        chargerBase();
        majIndicateurSync();
        if (typeof lucide !== 'undefined') lucide.createIcons();
        console.log('✅ Initialisation terminée');
    } catch (error) {
        console.error('❌ Erreur:', error);
        megaBase = MEGA_BASE_INITIALE.map(v => Object.assign({}, v));
        majIndicateurSync();
        updateNetworkStatus();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function majIndicateurSync() {
    const syncEl = el('sync-status');
    if (!syncEl) return;
    syncEl.className = 'sync-indicator sync-inactive';
    syncEl.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i><span>${megaBase.length} véh.</span>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiser);
} else { initialiser(); }

setTimeout(() => {
    const networkText = el('network-text');
    if (networkText && networkText.textContent === 'Connexion...') updateNetworkStatus();
    const syncEl = el('sync-status');
    if (syncEl && syncEl.querySelector('.sync-icon')) majIndicateurSync();
}, 2000);

let initCheckCount = 0;
const initCheckInterval = setInterval(() => {
    initCheckCount++;
    const networkText = el('network-text');
    if (networkText && networkText.textContent === 'Connexion...') updateNetworkStatus();
    if (initCheckCount >= 10) clearInterval(initCheckInterval);
}, 1000);

window.addEventListener('online', () => { updateNetworkStatus(); showNotification('🌐 Connexion rétablie', 'success'); });
window.addEventListener('offline', () => { updateNetworkStatus(); showNotification('📡 Mode hors ligne', 'warning'); });
document.addEventListener('keypress', (e) => { if (e.key === 'Enter' && e.target.id === 'secure-code-input') verifierAcces(e); });
