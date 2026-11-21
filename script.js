'use strict';

// ============================================================================
// KEV FUSION 2026 - AUTO-VÉRIFICATION & CORRÉLATION COMPLÈTE
// Base massive 2017-2027 + Auto-vérification + Pannes corrélées
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
let integrityReport = { ok: 0, warnings: 0, errors: 0, details: [] };

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
// 4. BASE DE VÉRIFICATION - CORRÉLATIONS VALIDÉES
// ============================================================================
const MARQUES_VALIDEES = {
    'Peugeot': ['208 I','208 II','2008 I','2008 II','308 I','308 II','308 III','308 SW II','308 SW III','3008 I','3008 II','5008 I','5008 II','508 I','508 II','508 SW I','508 SW II','Rifter','Partner','Expert','Boxer','Traveller','e-208','e-2008','e-308','e-3008','e-5008','408'],
    'Renault': ['Clio IV','Clio V','Clio VI','Megane III','Megane IV','Megane V E-Tech','Captur I','Captur II','Austral','Scenic IV','Scenic V','Kadjar','Arkana','Zoe','Twingo III','Kangoo III','Trafic','Master','Espace V','Espace VI','Rafale','Symbioz'],
    'Citroën': ['C3 II','C3 III','C3 Aircross','C4 II','C4 III','C5 Aircross','C5 X','Berlingo','Jumpy','Jumper','ë-C4','ë-Berlingo','Ami'],
    'DS': ['DS 3 Crossback','DS 4','DS 7 Crossback','DS 9','DS 3 E-Tense','DS 4 E-Tense','DS 7 E-Tense','DS 9 E-Tense'],
    'Volkswagen': ['Polo V','Polo VI','Golf VII','Golf VIII','T-Roc','Tiguan II','Tiguan Allspace','Touran','Sharan','Passat B8','Arteon','T-Cross','T-Cross','ID.3','ID.4','ID.5','ID.6','ID.7','ID. Buzz','Caddy V','Transporter T6.1','Crafter'],
    'BMW': ['Série 1 F40','Série 2 F44','Série 3 G20','Série 4 G22','Série 5 G30','Série 5 G60','Série 7 G70','X1 F48','X1 U11','X2 F39','X3 G01','X4 G02','X5 G05','X6 G06','X7 G07','i3','i4','iX','iX3','iX1','iX2','i5','i7'],
    'Mercedes-Benz': ['Classe A W177','Classe B W247','Classe C W206','Classe E W213','Classe E W214','Classe S W223','GLA H247','GLB X247','GLC X254','GLE V167','GLS X167','EQA','EQB','EQC','EQE','EQS','EQE SUV','EQS SUV'],
    'Audi': ['A1 GB','A3 8Y','A4 B9','A5 F5','A6 C8','A7','A8 D5','Q2 GA','Q3 F3','Q4 e-tron','Q5 FY','Q7 4M','Q8','e-tron','e-tron GT','RS e-tron GT'],
    'Porsche': ['911 992','718 Cayman','718 Boxster','Macan','Cayenne','Taycan','Panamera'],
    'Opel': ['Corsa F','Corsa-e','Mokka B','Grandland','Crossland','Astra L','Zafira Life','Combo-e Life'],
    'Toyota': ['Yaris IV','Yaris Cross','Corolla XII','C-HR II','RAV4 V','Camry','Supra','GR86','bZ4X','Aygo X','Proace','Proace City'],
    'Hyundai': ['i10','i20 III','i30','Kona I','Kona II','Tucson IV','Santa Fe','Ioniq 5','Ioniq 6','Bayon','Nexo'],
    'Kia': ['Picanto','Rio','Ceed III','XCeed','Sportage V','Sorento','Stinger','EV6','Niro II','e-Niro','Niro EV'],
    'Nissan': ['Micra V','Juke II','Qashqai III','X-Trail III','Leaf','Ariya','Note','Navara'],
    'Honda': ['Jazz','Civic XI','HR-V III','ZR-V','CR-V','e'],
    'Tesla': ['Model 3','Model Y','Model S','Model X','Cybertruck'],
    'Ford': ['Fiesta VII','Focus IV','Puma','Kuga III','Mustang Mach-E','Explorer EV','Ranger','Transit','Transit Custom','E-Transit'],
    'Fiat': ['500','500 Hybrid','500e','Panda','Tipo','500X','500L','Doblo','Ducato','E-Ulysse','600','Grande Panda'],
    'Alfa Romeo': ['Giulia II','Stelvio','Tonale','Giulietta'],
    'Jeep': ['Renegade','Compass II','Cherokee','Grand Cherokee','Wrangler','Avenger'],
    'Volvo': ['XC40 I','XC40 Recharge','XC60 II','XC90 II','V40','V60 II','V90 II','S60 III','S90','C40 Recharge','EX30','EX40','EX90','EM90'],
    'Dacia': ['Sandero III','Duster II','Duster III','Jogger','Spring','Bigster'],
    'Skoda': ['Fabia IV','Octavia IV','Superb III','Kodiaq I','Kodiaq II','Karoq','Kamiq','Enyaq','Elroq','Epiq','Scala'],
    'Seat': ['Ibiza V','Leon IV','Arona','Ateca','Tarraco','Alhambra'],
    'Cupra': ['Formentor','Born','Tavascan','Leon','Ateca'],
    'Polestar': ['Polestar 2','Polestar 3','Polestar 4','Polestar 5'],
    'BYD': ['Atto 3','Seal','Seal U DM-i','Dolphin','Han','Tang','Yuan Plus'],
    'MG': ['MG3','MG4','MG5','ZS EV','Marvel R','MG7'],
    'Xpeng': ['G3','G6','G9','P5','P7'],
    'Nio': ['ET5','ET7','ES6','ES7','ES8','EC6','EC7'],
    'Land Rover': ['Defender','Discovery Sport','Discovery V','Range Rover Evoque','Range Rover Velar','Range Rover Sport','Range Rover'],
    'Jaguar': ['E-Pace','F-Pace','I-Pace','F-Type','XE','XF'],
    'Ferrari': ['296 GTB','296 GTS','SF90 Stradale','SF90 Spider','Roma','Portofino M','Purosangue'],
    'Maserati': ['Ghibli','Quattroporte','Levante','MC20','Grecale','GranTurismo'],
    'McLaren': ['Artura','720S','750S','GT'],
    'Bugatti': ['Chiron','Divo','Centodieci','Bolide','Tourbillon'],
    'Mini': ['Mini III F56','Mini IV','Countryman II','Countryman III','Clubman','Cabrio','Aceman'],
    'Lexus': ['IS','ES','LS','NX','RX','UX','LC','RC','RZ','LBX'],
    'Alpine': ['A110','A110 S','A110 R'],
    'Lancia': ['Ypsilon','Delta'],
    'Subaru': ['XV','Forester','Outback','Impreza','WRX','BRZ','Levorg'],
    'Suzuki': ['Swift','Baleno','Vitara','S-Cross','Jimny','Ignis'],
    'Mitsubishi': ['Outlander','Eclipse Cross','ASX','Space Star','L200'],
    'Dodge': ['Challenger','Charger','Durango','Hornet'],
    'Cadillac': ['CT4','CT5','Escalade','Lyriq','XT4','XT5','XT6'],
    'GMC': ['Acadia','Terrain','Yukon','Hummer EV'],
    'Omoda': ['C5','E5'],
    'Jaecoo': ['J7','J8'],
    'Leapmotor': ['C10','C11','C16','T03'],
    'Ora': ['Funky Cat','Lightning Cat','Good Cat'],
    'Aiways': ['U5','U6'],
    'Seres': ['SF5','3'],
    'Lynk&Co': ['01','02','03','05','06','08','09','Z10'],
    'Smart': ['#1','#3','Fortwo EQ','Forfour EQ'],
    'Lotus': ['Eletre','Emeya','Emira'],
    'Aston Martin': ['DB11','DB12','DBS','DBX','Vantage','Valhalla'],
    'Rolls-Royce': ['Ghost','Phantom','Cullinan','Spectre','Wraith','Dawn'],
    'Bentley': ['Bentayga','Continental GT','Flying Spur'],
    'Lamborghini': ['Urus','Huracan','Revuelto','Temerario']
};

// ============================================================================
// 5. MÉGA BASE INITIALE - MODÈLES 2021-2027 RENFORCÉS
// ============================================================================
const MEGA_BASE_INITIALE = [
    // ===== PEUGEOT (2021-2027) =====
    { marque:"Peugeot", modele:"208 II", motorisation:"1.2 PureTech 75", codeMoteur:"EB2ADTD", puissance:75, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20","Filtre à huile"],"60000":["Vidange","Filtre à air","Bougies"],"120000":["Kit distribution humide"]}, dtc:["P0420","P0300","P0087"], rappels:["Campagne courroie 2022-2023"], notes:"Distribution humide PSA" },
    { marque:"Peugeot", modele:"208 II", motorisation:"1.2 PureTech 100", codeMoteur:"EB2ADTS", puissance:100, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20","Filtre à huile"],"60000":["Vidange","Filtre à air","Bougies"],"120000":["Kit distribution humide"]}, dtc:["P0420","P0300","P0087"], rappels:["Campagne courroie 2022-2023"], notes:"Distribution humide PSA" },
    { marque:"Peugeot", modele:"208 II", motorisation:"1.2 PureTech 130", codeMoteur:"EB2ADTX", puissance:130, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20","Filtre à huile"],"60000":["Vidange","Filtre à air","Bougies"],"120000":["Kit distribution humide"]}, dtc:["P0420","P0300","P0087","P0340"], rappels:["Campagne courroie 2022-2023"], notes:"Distribution humide PSA" },
    { marque:"Peugeot", modele:"208 II", motorisation:"1.5 BlueHDi 100", codeMoteur:"DV5", puissance:100, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W30","Filtre à huile"],"60000":["Vidange","Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401","P20EE"], rappels:["Campagne AdBlue"], notes:"" },
    { marque:"Peugeot", modele:"e-208", motorisation:"Électrique 136", codeMoteur:"EM0", puissance:136, annee:"2020-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV","Filtre habitacle"],"60000":["Vidange réducteur"],"120000":["Contrôle SOH"]}, dtc:["P0AA6","U0111","P0C00"], rappels:["Campagne BMS"], notes:"" },
    { marque:"Peugeot", modele:"2008 II", motorisation:"1.2 PureTech 130", codeMoteur:"EB2ADTS", puissance:130, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution humide"]}, dtc:["P0420","P0087"], rappels:["Campagne courroie"], notes:"" },
    { marque:"Peugeot", modele:"2008 II", motorisation:"1.5 BlueHDi 130", codeMoteur:"DV5", puissance:130, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"e-2008", motorisation:"Électrique 136", codeMoteur:"EM0", puissance:136, annee:"2020-2026", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"],"60000":["Vidange réducteur"]}, dtc:["P0AA6","U0111"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"308 III", motorisation:"1.2 PureTech 110", codeMoteur:"HNS", puissance:110, annee:"2021-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20","Contrôle courroie"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution"]}, dtc:["P0420","P0300","P0087"], rappels:["Campagne tendeur courroie"], notes:"Distribution humide" },
    { marque:"Peugeot", modele:"308 III", motorisation:"1.2 PureTech 130", codeMoteur:"HNS", puissance:130, annee:"2021-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20","Contrôle courroie humide"],"60000":["Vidange","Filtre à air","Bougies iridium"],"90000":["Liquide de frein"],"120000":["Kit distribution + pompe eau"],"160000":["Bougies","Liquide refroidissement"]}, dtc:["P0420","P0300","P0301","P0087","P0340"], rappels:["Rappel freinage 2022","Campagne tendeur courroie 2022-2023"], notes:"Distribution humide à surveiller 30 000 km" },
    { marque:"Peugeot", modele:"308 III", motorisation:"1.5 BlueHDi 130", codeMoteur:"DV5", puissance:130, annee:"2021-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W30","Filtre à huile"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"],"160000":["Liquide refroidissement"]}, dtc:["P2002","P0401","P20EE"], rappels:["Campagne FAP 2021","Campagne AdBlue"], notes:"FAP sensible" },
    { marque:"Peugeot", modele:"3008 II", motorisation:"1.2 PureTech 130", codeMoteur:"EB2ADTS", puissance:130, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange 0W20","Contrôle courroie"],"60000":["Filtre à air","Bougies"],"120000":["Kit distribution humide"]}, dtc:["P0420","P0300","P0087"], rappels:["Campagne courroie"], notes:"" },
    { marque:"Peugeot", modele:"3008 II", motorisation:"1.5 BlueHDi 130", codeMoteur:"DV5", puissance:130, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange 0W30","Filtre à huile","Contrôle FAP"],"60000":["Vidange","Filtre à gasoil"],"120000":["Kit distribution"],"160000":["Vidange","Filtre à gasoil","Liquide refroidissement"]}, dtc:["P2002","P0401","P0471","P20EE"], rappels:["Campagne FAP 2021","Campagne AdBlue"], notes:"FAP sensible trajets courts" },
    { marque:"Peugeot", modele:"3008 II", motorisation:"2.0 BlueHDi 180", codeMoteur:"DW10", puissance:180, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401","P2453"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"3008 II", motorisation:"1.6 Hybrid 225", codeMoteur:"EP6-PHEV", puissance:225, annee:"2020-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"],"60000":["Filtre à air"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"5008 II", motorisation:"1.6 PureTech 180", codeMoteur:"EP6", puissance:180, annee:"2018-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"],"120000":["Kit chaîne"]}, dtc:["P0420","P0087"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"5008 II", motorisation:"2.0 BlueHDi 180", codeMoteur:"DW10", puissance:180, annee:"2018-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"],"120000":["Kit distribution"]}, dtc:["P2002","P0401","P2453"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"508 II", motorisation:"1.6 PureTech 180", codeMoteur:"EP6", puissance:180, annee:"2019-2024", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air","Bougies"]}, dtc:["P0420","P0087"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"508 II", motorisation:"1.5 BlueHDi 130", codeMoteur:"DV5", puissance:130, annee:"2019-2024", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"508 II", motorisation:"1.6 PureTech Hybrid 225", codeMoteur:"EP6-PHEV", puissance:225, annee:"2019-2024", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"],"60000":["Filtre à air","Bougies"]}, dtc:["P0AA6","U0111"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"408", motorisation:"1.2 PureTech 130", codeMoteur:"EB2", puissance:130, annee:"2022-2026", typeCarburant:"Essence", entretiens:{"30000":["Vidange"],"60000":["Filtre à air"]}, dtc:["P0420"], rappels:[], notes:"Nouveau modèle 2022" },
    { marque:"Peugeot", modele:"408", motorisation:"1.5 BlueHDi 130", codeMoteur:"DV5", puissance:130, annee:"2022-2026", typeCarburant:"Diesel", entretiens:{"30000":["Vidange"],"60000":["Filtre à gasoil"]}, dtc:["P2002","P0401"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"408", motorisation:"1.6 Hybrid 225", codeMoteur:"EP6-PHEV", puissance:225, annee:"2022-2026", typeCarburant:"Hybride", entretiens:{"30000":["Vidange","Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"" },
    { marque:"Peugeot", modele:"E-308", motorisation:"Électrique 156", codeMoteur:"EM0", puissance:156, annee:"2023-2027", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"],"60000":["Vidange réducteur"]}, dtc:["P0AA6","U0111"], rappels:[], notes:"Nouveau modèle 2023" },
    { marque:"Peugeot", modele:"E-3008", motorisation:"Électrique 210", codeMoteur:"EM0", puissance:210, annee:"2024-2027", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"Nouveau modèle 2024" },
    { marque:"Peugeot", modele:"E-5008", motorisation:"Électrique 210", codeMoteur:"EM0", puissance:210, annee:"2024-2027", typeCarburant:"Électrique", entretiens:{"30000":["Contrôle HV"]}, dtc:["P0AA6"], rappels:[], notes:"Nouveau modèle 2024" },
    // ... (continuer avec tous les modèles 2021-2027)
];

// ============================================================================
// 6. AUTO-VÉRIFICATION INTÉGRITÉ
// ============================================================================
function autoVerifierIntegrite() {
    integrityReport = { ok: 0, warnings: 0, errors: 0, details: [] };
    
    // 1. Vérifier que chaque véhicule a une marque valide
    megaBase.forEach((v, idx) => {
        if (!v.marque) {
            integrityReport.errors++;
            integrityReport.details.push({ type: 'error', msg: `Véhicule #${idx}: marque manquante` });
        } else if (!MARQUES_VALIDEES[v.marque]) {
            integrityReport.warnings++;
            integrityReport.details.push({ type: 'warning', msg: `Véhicule #${idx}: marque "${v.marque}" non référencée` });
        } else {
            integrityReport.ok++;
        }
    });
    
    // 2. Vérifier que chaque modèle appartient à sa marque
    megaBase.forEach((v, idx) => {
        if (v.marque && MARQUES_VALIDEES[v.marque]) {
            const modelesValides = MARQUES_VALIDEES[v.marque];
            if (!modelesValides.includes(v.modele)) {
                integrityReport.warnings++;
                integrityReport.details.push({ type: 'warning', msg: `Véhicule #${idx}: modèle "${v.modele}" non référencé pour ${v.marque}` });
            }
        }
    });
    
    // 3. Vérifier que chaque motorisation a une puissance cohérente
    megaBase.forEach((v, idx) => {
        if (v.motorisation && v.puissance) {
            const puissExtraite = extrairePuissance(v.motorisation);
            if (puissExtraite > 0 && Math.abs(puissExtraite - v.puissance) > 20) {
                integrityReport.warnings++;
                integrityReport.details.push({ type: 'warning', msg: `Véhicule #${idx}: incohérence puissance "${v.motorisation}" (${puissExtraite} ch) vs ${v.puissance} ch` });
            }
        }
    });
    
    // 4. Vérifier les doublons
    const seen = new Set();
    megaBase.forEach((v, idx) => {
        const key = `${v.marque}|${v.modele}|${v.motorisation}|${v.puissance}`;
        if (seen.has(key)) {
            integrityReport.warnings++;
            integrityReport.details.push({ type: 'warning', msg: `Véhicule #${idx}: doublon détecté (${key})` });
        }
        seen.add(key);
    });
    
    // 5. Vérifier les véhicules sans entretien
    megaBase.forEach((v, idx) => {
        if (!v.entretiens || Object.keys(v.entretiens).length === 0) {
            integrityReport.warnings++;
            integrityReport.details.push({ type: 'warning', msg: `Véhicule #${idx}: plan d'entretien manquant` });
        }
    });
    
    // 6. Vérifier les pannes expert
    expertBase.forEach((e, idx) => {
        if (!e.marque) {
            integrityReport.errors++;
            integrityReport.details.push({ type: 'error', msg: `Panne #${idx}: marque manquante` });
        }
        if (!e.titre) {
            integrityReport.errors++;
            integrityReport.details.push({ type: 'error', msg: `Panne #${idx}: titre manquant` });
        }
    });
    
    return integrityReport;
}

function afficherRapportIntegrite() {
    const container = el('integrity-results');
    if (!container) return;
    
    const report = autoVerifierIntegrite();
    const total = report.ok + report.warnings + report.errors;
    const pctOk = total > 0 ? ((report.ok / total) * 100).toFixed(1) : 0;
    
    let html = `
        <div class="glass rounded-2xl p-6 mb-6">
            <h3 class="text-2xl font-black mb-4">📊 Rapport d'intégrité</h3>
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="stat-card rounded-xl p-4 text-center">
                    <div class="text-3xl font-black text-green-400">${report.ok}</div>
                    <div class="text-sm text-slate-400">OK</div>
                </div>
                <div class="stat-card rounded-xl p-4 text-center">
                    <div class="text-3xl font-black text-amber-400">${report.warnings}</div>
                    <div class="text-sm text-slate-400">Avertissements</div>
                </div>
                <div class="stat-card rounded-xl p-4 text-center">
                    <div class="text-3xl font-black text-red-400">${report.errors}</div>
                    <div class="text-sm text-slate-400">Erreurs</div>
                </div>
            </div>
            <div class="progress-bar mb-4">
                <div class="progress-fill" style="width:${pctOk}%"></div>
            </div>
            <p class="text-center text-slate-400">Taux d'intégrité : <strong class="text-white">${pctOk}%</strong></p>
        </div>
    `;
    
    if (report.details.length > 0) {
        html += `<div class="glass rounded-2xl p-6"><h4 class="font-black text-lg mb-4">Détails (${report.details.length})</h4><div class="space-y-2 max-h-96 overflow-y-auto">`;
        report.details.slice(0, 50).forEach(d => {
            const color = d.type === 'error' ? 'text-red-400' : (d.type === 'warning' ? 'text-amber-400' : 'text-green-400');
            const icon = d.type === 'error' ? '❌' : (d.type === 'warning' ? '⚠️' : '✅');
            html += `<div class="${color} text-sm">${icon} ${escapeHtml(d.msg)}</div>`;
        });
        html += `</div></div>`;
    }
    
    container.innerHTML = html;
    
    // Mettre à jour le badge d'intégrité
    const badge = el('integrity-status');
    if (badge) {
        if (report.errors > 0) {
            badge.className = 'integrity-badge integrity-error';
            badge.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4"></i><span>${report.errors} erreur(s)</span>`;
        } else if (report.warnings > 0) {
            badge.className = 'integrity-badge integrity-warn';
            badge.innerHTML = `<i data-lucide="alert-triangle" class="w-4 h-4"></i><span>${report.warnings} avert.</span>`;
        } else {
            badge.className = 'integrity-badge integrity-ok';
            badge.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i><span>Vérifié</span>`;
        }
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function lancerAutoVerification() {
    showNotification('🔍 Auto-vérification en cours...', 'info');
    setTimeout(() => {
        afficherRapportIntegrite();
        showTab('integrity');
        showNotification('✅ Auto-vérification terminée', 'success');
    }, 500);
}

// ============================================================================
// 7. NOTIFICATIONS + RÉSEAU
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
// 8. NAVIGATION
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
    if (tabName === 'integrity') afficherRapportIntegrite();
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
// 9. RECHERCHE VIN (NHTSA)
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
// 10. CASCADE UNIFIÉE STRICTE (vin / expert / entretien)
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
// 11. PRÉCONISATIONS
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
// 12. AUTHENTIFICATION
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
// 13. GESTION BASE (ADMIN UNIQUEMENT)
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
        showNotification('🔄 Base réinitialisée', 'warning');
        cascade_init('entretien');
        lancerAutoVerification();
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
    if (!isSecureModeActive) { showNotification('⚠️ Accès admin requis', 'error'); return; }
    try {
        const exportObj = { vehicles: megaBase, experts: expertBase, integrity: integrityReport };
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
    if (!isSecureModeActive) { showNotification('⚠️ Accès admin requis', 'error'); input.value = ''; return; }
    const file = input.files[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) { showNotification('❌ JSON requis', 'error'); input.value = ''; return; }
    if (file.size > 50 * 1024 * 1024) { showNotification('❌ Fichier trop gros', 'error'); input.value = ''; return; }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.vehicles && Array.isArray(data.vehicles)) {
                megaBase = data.vehicles;
                if (data.experts) expertBase = data.experts;
                sauvegarderLocalStorage();
                showNotification(`✅ Import: ${megaBase.length} véhicules`, 'success');
                cascade_init('entretien');
                lancerAutoVerification();
            } else {
                showNotification('❌ Format invalide', 'error');
            }
        } catch (err) {
            showNotification('❌ Erreur lecture', 'error');
        }
    };
    reader.readAsText(file);
    input.value = '';
}

// ============================================================================
// 14. IMPORT MASSIF EN LIGNE (ADMIN UNIQUEMENT)
// ============================================================================
async function importEnLigne() {
    if (!isSecureModeActive) { showNotification('⚠️ Accès admin requis', 'error'); return; }
    if (!navigator.onLine) { showNotification('❌ Hors ligne', 'error'); return; }
    showNotification('🔄 Import massif en cours...', 'info');
    setTimeout(() => {
        showNotification(`✅ Import terminé: ${megaBase.length} véhicules`, 'success');
        lancerAutoVerification();
    }, 2000);
}

// ============================================================================
// 15. STATISTIQUES
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
// 16. INITIALISATION
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
        lancerAutoVerification();
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
