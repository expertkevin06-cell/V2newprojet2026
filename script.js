// ==========================================
// KEV FUSION 2026 - MEGA BASE MASSIVE
// Intégration auto-diagnostic + auto-vérifications
// ==========================================
'use strict';

// ==========================================
// 1. SÉCURITÉ - MOT DE PASSE CORRIGÉ "Kevin83600"
// ==========================================
const SECURITY_SALT = 'kev_fusion_2026_salt';
const SESSION_DURATION = 30 * 60 * 1000;
let isSecureModeActive = false;
let secureSessionTimeout = null;
let ADMIN_HASH = null;

async function hashPassword(password) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + SECURITY_SALT);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        return '';
    }
}

async function initAdminHash() {
    ADMIN_HASH = await hashPassword('Kevin83600');
}

// ==========================================
// 2. MÉGA BASE MASSIVE - DONNÉES AUTO-DIAGNOSTIC
// Structure: [marque, modèle, motorisation, codeMoteur, puissance, année, type, entretiens, dtc, rappels, notes]
// ==========================================
const MEGA_BASE_INITIALE = [
    // === FRANÇAISES ===
    { marque: "Peugeot", modele: "308 III", motorisation: "1.2 PureTech", codeMoteur: "HNS", puissance: "130 ch", annee: "2021-2024", typeCarburant: "Essence",
      entretiens: { "30000": ["Vidange huile 0W20 C5", "Filtre à huile", "Filtre habitacle", "Contrôle courroie humide"], "60000": ["Vidange", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies iridium"], "90000": ["Vidange", "Filtre à huile", "Filtre habitacle", "Liquide de frein DOT 4"], "120000": ["Vidange", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Kit distribution + pompe à eau"], "160000": ["Vidange", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide refroidissement G12+"] },
      dtc: ["P0420","P0300","P0301","P0171","P0087","P0340"],
      rappels: ["Rappel système freinage 2022", "Campagne tendeur courroie 2022-2023", "Campagne pompe à huile 2017-2023"],
      notes: "Distribution humide à surveiller tous les 30 000 km - Campagne majeure" },
    { marque: "Peugeot", modele: "208 II", motorisation: "1.2 PureTech", codeMoteur: "EB2ADTD", puissance: "100 ch", annee: "2019-2024", typeCarburant: "Essence",
      entretiens: { "30000": ["Vidange 0W20", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange", "Filtre à huile", "Filtre à air", "Bougies"], "90000": ["Vidange", "Filtre à huile", "Liquide de frein"], "120000": ["Kit distribution humide"], "160000": ["Vidange complète", "Bougies", "Liquide refroidissement"] },
      dtc: ["P0420","P0300","P0087"],
      rappels: ["Campagne courroie 2022-2023"],
      notes: "Distribution humide PSA" },
    { marque: "Peugeot", modele: "e-208", motorisation: "Électrique 136", codeMoteur: "EM0", puissance: "136 ch", annee: "2020-2026", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle batterie HV", "Filtre habitacle"], "60000": ["Vidange réducteur", "Filtre habitacle"], "120000": ["Contrôle SOH batterie", "Liquide refroidissement HV"] },
      dtc: ["P0AA6","U0111","P0C00"],
      rappels: ["Campagne perte autonomie hiver", "Campagne BMS"],
      notes: "Autonomie -40% en hiver - Campagne constructeur" },
    { marque: "Peugeot", modele: "3008 II", motorisation: "1.5 BlueHDi", codeMoteur: "DV5", puissance: "130 ch", annee: "2019-2024", typeCarburant: "Diesel",
      entretiens: { "30000": ["Vidange 0W30 C3", "Filtre à huile", "Filtre habitacle", "Contrôle FAP"], "60000": ["Vidange", "Filtre à huile", "Filtre à gasoil"], "90000": ["Vidange", "Filtre à huile", "Liquide de frein"], "120000": ["Kit distribution"], "160000": ["Vidange", "Filtre à gasoil", "Liquide refroidissement"] },
      dtc: ["P2002","P0401","P0471","P20EE"],
      rappels: ["Campagne FAP 2021", "Campagne AdBlue"],
      notes: "FAP sensible trajets courts" },
    { marque: "Peugeot", modele: "5008 II", motorisation: "2.0 BlueHDi", codeMoteur: "DW10", puissance: "180 ch", annee: "2018-2024", typeCarburant: "Diesel",
      entretiens: { "30000": ["Vidange", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange", "Filtre à huile", "Filtre à gasoil"], "120000": ["Kit distribution complet"], "160000": ["Vidange", "Filtre à gasoil"] },
      dtc: ["P2002","P0401","P2453"],
      rappels: [], notes: "" },
    { marque: "Peugeot", modele: "Boxer", motorisation: "2.0 BlueHDi", codeMoteur: "DW10", puissance: "165 ch", annee: "2019-2027", typeCarburant: "Diesel",
      entretiens: { "40000": ["Vidange", "Filtre à huile"], "80000": ["Filtre à gasoil"], "120000": ["Kit chaîne distribution"] },
      dtc: ["P0016","P2002"],
      rappels: ["Campagne chaîne distribution"],
      notes: "Chaîne distribution à surveiller" },
    { marque: "Renault", modele: "Clio V", motorisation: "1.5 dCi", codeMoteur: "K9K", puissance: "85 ch", annee: "2019-2024", typeCarburant: "Diesel",
      entretiens: { "30000": ["Vidange 5W30 RN0720", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange", "Filtre à gasoil"], "90000": ["Liquide de frein"], "120000": ["Kit distribution"], "160000": ["Liquide refroidissement Type D"] },
      dtc: ["P2263","P0401","P0299"],
      rappels: ["Campagne EGR 1.5 dCi"],
      notes: "Turbo fragile 2019-2020" },
    { marque: "Renault", modele: "Clio 6", motorisation: "E-Tech 140", codeMoteur: "H5H-Hybrid", puissance: "140 ch", annee: "2025-2027", typeCarburant: "Hybride",
      entretiens: { "30000": ["Vidange", "Filtre à huile", "Contrôle hybride"], "60000": ["Vidange", "Filtre à air"], "120000": ["Contrôle onduleur"] },
      dtc: ["P0A93","P0AA6"],
      rappels: ["Campagne onduleur surchauffe"],
      notes: "Onduleur E-Tech sensible" },
    { marque: "Renault", modele: "Megane IV", motorisation: "1.3 TCe", codeMoteur: "H5H", puissance: "140 ch", annee: "2018-2023", typeCarburant: "Essence",
      entretiens: { "30000": ["Vidange 5W40 RN17", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange", "Filtre à air", "Bougies"], "120000": ["Kit distribution"] },
      dtc: ["P0420","P0171","P0300"],
      rappels: ["Campagne chaîne distribution 2020"],
      notes: "Chaîne à surveiller" },
    { marque: "Renault", modele: "Captur II", motorisation: "1.0 TCe", codeMoteur: "H4D", puissance: "100 ch", annee: "2020-2024", typeCarburant: "Essence",
      entretiens: { "30000": ["Vidange", "Filtre à huile"], "60000": ["Filtre à air", "Bougies"], "120000": ["Kit distribution"] },
      dtc: ["P0420","P0300"], rappels: [], notes: "" },
    { marque: "Renault", modele: "Zoe", motorisation: "Électrique 135", codeMoteur: "5AGen2", puissance: "135 ch", annee: "2019-2024", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle SOH", "Filtre habitacle"], "60000": ["Vidange réducteur"], "120000": ["Contrôle batterie"] },
      dtc: ["P0AA6","U0111","P0D11"],
      rappels: ["Campagne OBC", "Campagne connecteur Type2"],
      notes: "" },
    { marque: "Renault", modele: "R4 E-Tech", motorisation: "Électrique 150", codeMoteur: "R4-EV", puissance: "150 ch", annee: "2025-2027", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle BMS"], "60000": ["Contrôle batterie"], "120000": ["Équilibrage cellules"] },
      dtc: ["P0AA6","U0111"],
      rappels: ["Campagne BMS LFP déséquilibrage"],
      notes: "Batterie LFP" },
    { marque: "Citroën", modele: "C5 Aircross", motorisation: "1.5 BlueHDi", codeMoteur: "DV5", puissance: "130 ch", annee: "2020-2024", typeCarburant: "Diesel",
      entretiens: { "30000": ["Vidange", "Filtre à huile"], "60000": ["Filtre à gasoil"], "120000": ["Kit distribution"] },
      dtc: ["P2002","P0401"], rappels: [], notes: "" },
    { marque: "Citroën", modele: "C3 III", motorisation: "1.2 PureTech", codeMoteur: "EB2", puissance: "110 ch", annee: "2018-2024", typeCarburant: "Essence",
      entretiens: { "30000": ["Vidange 0W20", "Filtre à huile"], "60000": ["Filtre à air", "Bougies"], "120000": ["Kit distribution humide"] },
      dtc: ["P0420","P0300","P0301","P0087"],
      rappels: ["Campagne courroie humide"],
      notes: "Distribution humide PSA" },
    { marque: "Citroën", modele: "ë-C4", motorisation: "Électrique 136", codeMoteur: "EM0", puissance: "136 ch", annee: "2021-2026", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle"], "60000": ["Vidange réducteur"] },
      dtc: ["P0D11","P0AA6"],
      rappels: ["Campagne OBC"],
      notes: "" },
    { marque: "DS", modele: "DS 7 Crossback", motorisation: "E-Tense 300", codeMoteur: "EP6-PHEV", puissance: "300 ch", annee: "2019-2024", typeCarburant: "Hybride",
      entretiens: { "30000": ["Vidange", "Contrôle HV"], "60000": ["Filtre à air"], "120000": ["Contrôle batterie HV"] },
      dtc: ["P0AA6","U0111"],
      rappels: ["Campagne batterie HV"],
      notes: "Perte capacité HV" },

    // === ALLEMANDES ===
    { marque: "Volkswagen", modele: "Golf 8", motorisation: "2.0 TDI", codeMoteur: "DSR", puissance: "150 ch", annee: "2020-2024", typeCarburant: "Diesel",
      entretiens: { "30000": ["Vidange 5W30 LL-IV", "Filtre à huile"], "60000": ["Filtre à gasoil"], "90000": ["Liquide de frein"], "120000": ["Kit distribution"], "160000": ["Liquide refroidissement G13"] },
      dtc: ["P2002","P0401","P0471","P0406"],
      rappels: ["Campagne sonde NOx 2023", "Campagne ICU 12V"],
      notes: "Électronique fragile 2020-2021" },
    { marque: "Volkswagen", modele: "T-Roc", motorisation: "1.5 TSI", codeMoteur: "DPCA", puissance: "150 ch", annee: "2019-2024", typeCarburant: "Essence",
      entretiens: { "30000": ["Vidange 5W40", "Filtre à huile"], "60000": ["Filtre à air", "Bougies"], "120000": ["Kit distribution"] },
      dtc: ["P0420","P0300"], rappels: [], notes: "" },
    { marque: "Volkswagen", modele: "ID.4", motorisation: "Électrique 204", codeMoteur: "APP310", puissance: "204 ch", annee: "2021-2024", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle"], "60000": ["Vidange réducteur"] },
      dtc: ["U0111","P0AA6"],
      rappels: ["Campagne ICU décharge 12V"],
      notes: "" },
    { marque: "Volkswagen", modele: "Tiguan II", motorisation: "2.0 TDI", codeMoteur: "DFG", puissance: "150 ch", annee: "2018-2024", typeCarburant: "Diesel",
      entretiens: { "30000": ["Vidange"], "60000": ["Filtre à gasoil"], "120000": ["Kit distribution"] },
      dtc: ["P2002","P0401","P0406"],
      rappels: ["Campagne AdBlue 2021"], notes: "" },
    { marque: "BMW", modele: "Série 3 G20", motorisation: "2.0d B47", codeMoteur: "B47", puissance: "190 ch", annee: "2019-2024", typeCarburant: "Diesel",
      entretiens: { "30000": ["Vidange 0W30 LL-04", "Filtre à huile"], "60000": ["Filtre à gasoil"], "90000": ["Liquide de frein"], "120000": ["Contrôle chaîne"], "160000": ["Liquide refroidissement BMW"] },
      dtc: ["P0401","P2002","P0299"],
      rappels: ["Campagne EGR risque incendie", "Campagne refroidisseur EGR 2018-2020"],
      notes: "Chaîne à contrôler 160 000 km" },
    { marque: "BMW", modele: "X1 F48", motorisation: "1.8d B47", codeMoteur: "B47", puissance: "150 ch", annee: "2018-2023", typeCarburant: "Diesel",
      entretiens: { "30000": ["Vidange"], "60000": ["Filtre à gasoil"], "120000": ["Contrôle chaîne"] },
      dtc: ["P0401","P2002"], rappels: [], notes: "" },
    { marque: "BMW", modele: "iX", motorisation: "Électrique 523", codeMoteur: "EKA", puissance: "523 ch", annee: "2021-2026", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle HV"], "60000": ["Liquide refroidissement"] },
      dtc: ["P0C00","P0AA6"],
      rappels: ["Campagne charge DC bridée"],
      notes: "" },
    { marque: "Mercedes-Benz", modele: "Classe A W177", motorisation: "A 200d OM654", codeMoteur: "OM654", puissance: "150 ch", annee: "2019-2024", typeCarburant: "Diesel",
      entretiens: { "25000": ["Vidange 5W30 MB 229.52", "Filtre à huile"], "50000": ["Filtre à gasoil"], "75000": ["Liquide de frein"], "100000": ["Filtre à air"], "125000": ["Liquide refroidissement MB"] },
      dtc: ["P0401","P2002","P0234","P20EE"],
      rappels: ["Campagne injecteur AdBlue", "Campagne alterno-démarreur 48V"],
      notes: "" },
    { marque: "Mercedes-Benz", modele: "EQ", motorisation: "Électrique", codeMoteur: "EQ", puissance: "Multi", annee: "2019-2026", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle HV"] },
      dtc: ["P0C00","P0AA6"],
      rappels: ["Campagne charge DC bridée"],
      notes: "" },
    { marque: "Audi", modele: "A3 8Y", motorisation: "2.0 TDI", codeMoteur: "DSR", puissance: "150 ch", annee: "2020-2024", typeCarburant: "Diesel",
      entretiens: { "30000": ["Vidange 5W30 LL"], "60000": ["Filtre à gasoil"], "120000": ["Kit distribution"] },
      dtc: ["P2002","P0401","P0406"], rappels: [], notes: "" },
    { marque: "Audi", modele: "e-tron", motorisation: "Électrique 408", codeMoteur: "UA1", puissance: "408 ch", annee: "2019-2026", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle HV"] },
      dtc: ["P0C00","P0AA6"],
      rappels: ["Campagne charge DC bridée"],
      notes: "" },
    { marque: "Porsche", modele: "Taycan", motorisation: "Électrique 761", codeMoteur: "Taycan", puissance: "761 ch", annee: "2020-2026", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle HV"] },
      dtc: ["P0C00","P0AA6"],
      rappels: ["Campagne charge DC bridée"],
      notes: "" },
    { marque: "Opel", modele: "Corsa F", motorisation: "1.2 Turbo", codeMoteur: "EB2ADTD", puissance: "130 ch", annee: "2020-2024", typeCarburant: "Essence",
      entretiens: { "30000": ["Vidange 0W20"], "120000": ["Kit distribution humide"] },
      dtc: ["P0420","P0300","P0301","P0087"],
      rappels: ["Campagne courroie humide"],
      notes: "Distribution humide PSA" },
    { marque: "Opel", modele: "Corsa-e", motorisation: "Électrique 136", codeMoteur: "EM0", puissance: "136 ch", annee: "2020-2024", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle"] },
      dtc: ["P0D11"],
      rappels: ["Campagne OBC"],
      notes: "" },

    // === ASIATIQUES ===
    { marque: "Toyota", modele: "Yaris Cross", motorisation: "1.5 Hybride", codeMoteur: "M15A-FXE", puissance: "116 ch", annee: "2021-2024", typeCarburant: "Hybride",
      entretiens: { "15000": ["Vidange 0W16", "Contrôle hybride"], "30000": ["Filtre habitacle"], "60000": ["Filtre à air"], "90000": ["Liquide de frein"], "120000": ["Bougies"] },
      dtc: [], rappels: [],
      notes: "Fiabilité exceptionnelle - Chaîne" },
    { marque: "Toyota", modele: "RAV4 V", motorisation: "2.5 Hybride", codeMoteur: "A25A-FXS", puissance: "218 ch", annee: "2019-2024", typeCarburant: "Hybride",
      entretiens: { "15000": ["Vidange 0W20"], "30000": ["Filtre habitacle"], "60000": ["Filtre à air"], "120000": ["Bougies iridium"] },
      dtc: [], rappels: ["Campagne pompe à carburant 2019-2020"],
      notes: "Chaîne - Très fiable" },
    { marque: "Toyota", modele: "Corolla XII", motorisation: "1.8 Hybride", codeMoteur: "2ZR-FXE", puissance: "122 ch", annee: "2019-2024", typeCarburant: "Hybride",
      entretiens: { "15000": ["Vidange"], "30000": ["Filtre habitacle"], "60000": ["Filtre à air"], "120000": ["Bougies"] },
      dtc: [], rappels: [], notes: "" },
    { marque: "Hyundai", modele: "Tucson IV", motorisation: "1.6 CRDi", codeMoteur: "D4FE", puissance: "136 ch", annee: "2021-2024", typeCarburant: "Diesel",
      entretiens: { "30000": ["Vidange 5W30 C3"], "60000": ["Filtre à gasoil"], "120000": ["Kit distribution"] },
      dtc: ["P2002","P0401"],
      rappels: ["Campagne logiciel FAP"],
      notes: "" },
    { marque: "Hyundai", modele: "Ioniq 5", motorisation: "Électrique 325", codeMoteur: "EM17", puissance: "325 ch", annee: "2021-2026", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle HV"] },
      dtc: ["U0111","P0AA6"],
      rappels: ["Campagne ICCU"],
      notes: "ICCU défaillant" },
    { marque: "Hyundai", modele: "Kona EV", motorisation: "Électrique 204", codeMoteur: "EM16", puissance: "204 ch", annee: "2018-2022", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle HV"] },
      dtc: ["P0AA6"],
      rappels: ["Campagne incendie batterie"],
      notes: "Risque incendie - Rappel majeur" },
    { marque: "Kia", modele: "Sportage V", motorisation: "1.6 T-GDi Hybride", codeMoteur: "G4FT", puissance: "230 ch", annee: "2022-2024", typeCarburant: "Hybride",
      entretiens: { "15000": ["Vidange 0W20"], "30000": ["Filtre habitacle"], "60000": ["Filtre à air"], "120000": ["Bougies"] },
      dtc: [], rappels: [], notes: "" },
    { marque: "Kia", modele: "EV6", motorisation: "Électrique 585", codeMoteur: "EM21", puissance: "585 ch", annee: "2021-2026", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle HV"] },
      dtc: ["U0111"],
      rappels: ["Campagne ICCU"],
      notes: "" },
    { marque: "Nissan", modele: "Leaf", motorisation: "Électrique 150", codeMoteur: "EM57", puissance: "150 ch", annee: "2018-2026", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle SOH"] },
      dtc: [],
      rappels: ["Campagne SOH batterie"],
      notes: "Perte autonomie" },
    { marque: "Honda", modele: "HR-V III", motorisation: "1.5 e:HEV", codeMoteur: "LEB", puissance: "131 ch", annee: "2022-2024", typeCarburant: "Hybride",
      entretiens: { "20000": ["Vidange 0W20"], "40000": ["Filtre habitacle"], "60000": ["Filtre à air"], "100000": ["Bougies"] },
      dtc: [], rappels: [], notes: "" },

    // === AMÉRICAINES ===
    { marque: "Tesla", modele: "Model 3/Y", motorisation: "Électrique", codeMoteur: "Tesla", puissance: "Multi", annee: "2019-2024", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle HV", "Filtre habitacle"] },
      dtc: ["U0101","P0AA6"],
      rappels: ["Campagne freinage fantôme 2023", "Campagne eMMC MCU", "Campagne contacteurs HV", "Campagne suspension AV"],
      notes: "Multiples campagnes NHTSA" },
    { marque: "Tesla", modele: "Model Q", motorisation: "Électrique 204", codeMoteur: "TeslaMQ", puissance: "204 ch", annee: "2026-2027", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle"] },
      dtc: ["U0121"],
      rappels: ["Campagne caméra habitacle"],
      notes: "Nouveau modèle" },
    { marque: "Ford", modele: "Kuga III", motorisation: "2.5 PHEV", codeMoteur: "PHEV", puissance: "225 ch", annee: "2020-2022", typeCarburant: "Hybride",
      entretiens: { "30000": ["Vidange", "Contrôle HV"] },
      dtc: ["P0AA6"],
      rappels: ["Campagne batterie HV incendie"],
      notes: "Risque incendie module HV" },
    { marque: "Ford", modele: "Puma", motorisation: "1.0 EcoBoost Hybrid", codeMoteur: "B3JA", puissance: "155 ch", annee: "2020-2024", typeCarburant: "Hybride",
      entretiens: { "30000": ["Vidange 5W20"], "60000": ["Filtre à air", "Bougies"] },
      dtc: ["P0420","P0300"], rappels: [], notes: "" },
    { marque: "Ford", modele: "Mustang Mach-E", motorisation: "Électrique 487", codeMoteur: "Mach-E", puissance: "487 ch", annee: "2021-2026", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle HV"] },
      dtc: ["P0AA6"], rappels: [], notes: "" },

    // === ITALIENNES ===
    { marque: "Fiat", modele: "500e", motorisation: "Électrique 118", codeMoteur: "500e", puissance: "118 ch", annee: "2021-2024", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle"] },
      dtc: ["P0D11"],
      rappels: ["Campagne OBC"],
      notes: "" },
    { marque: "Alfa Romeo", modele: "Giulia II", motorisation: "2.2 JTDm", codeMoteur: "940A", puissance: "180 ch", annee: "2019-2024", typeCarburant: "Diesel",
      entretiens: { "30000": ["Vidange"], "60000": ["Filtre à gasoil"], "120000": ["Contrôle chaîne"] },
      dtc: ["P2002","P0401"], rappels: [], notes: "" },
    { marque: "Jeep", modele: "Compass II", motorisation: "1.6 Multijet", codeMoteur: "55283860", puissance: "120 ch", annee: "2019-2024", typeCarburant: "Diesel",
      entretiens: { "30000": ["Vidange"], "60000": ["Filtre à gasoil"] },
      dtc: ["P2002","P0401"], rappels: [], notes: "" },

    // === AUTRES EUROPÉENNES ===
    { marque: "Volvo", modele: "XC40 I", motorisation: "D4", codeMoteur: "D4204T14", puissance: "190 ch", annee: "2018-2024", typeCarburant: "Diesel",
      entretiens: { "30000": ["Vidange 0W20 VCC"], "60000": ["Filtre à gasoil"], "120000": ["Kit distribution"] },
      dtc: ["P2002","P0401"], rappels: [], notes: "" },
    { marque: "Volvo", modele: "EX30", motorisation: "Électrique 428", codeMoteur: "EX30", puissance: "428 ch", annee: "2023-2026", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle HV"] },
      dtc: ["P0AA6","P0C00"],
      rappels: ["Campagne BMS surchauffe"],
      notes: "" },
    { marque: "Dacia", modele: "Spring", motorisation: "Électrique 45", codeMoteur: "Spring", puissance: "45 ch", annee: "2021-2026", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle"] },
      dtc: ["P0D11","P0562","C1365"],
      rappels: ["Campagne servofrein électrique", "Campagne OBC", "Campagne DC-DC"],
      notes: "Multiples campagnes" },
    { marque: "Dacia", modele: "Bigster", motorisation: "Hybrid 155", codeMoteur: "Bigster-Hybrid", puissance: "155 ch", annee: "2025-2027", typeCarburant: "Hybride",
      entretiens: { "30000": ["Vidange"] },
      dtc: ["P0700"],
      rappels: ["Campagne ressorts AR rupture", "Campagne boîte DCT à-coups"],
      notes: "Ressorts AR - diamètre fil insuffisant" },
    { marque: "Skoda", modele: "Octavia IV", motorisation: "2.0 TDI", codeMoteur: "DSR", puissance: "150 ch", annee: "2020-2024", typeCarburant: "Diesel",
      entretiens: { "30000": ["Vidange"], "60000": ["Filtre à gasoil"], "120000": ["Kit distribution"] },
      dtc: ["P2002","P0401"], rappels: [], notes: "" },
    { marque: "Seat", modele: "Leon IV", motorisation: "2.0 TDI", codeMoteur: "DSR", puissance: "150 ch", annee: "2020-2024", typeCarburant: "Diesel",
      entretiens: { "30000": ["Vidange"], "60000": ["Filtre à gasoil"], "120000": ["Kit distribution"] },
      dtc: ["P2002","P0401"], rappels: [], notes: "" },
    { marque: "Cupra", modele: "Born", motorisation: "Électrique 231", codeMoteur: "Born", puissance: "231 ch", annee: "2021-2026", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle HV"] },
      dtc: ["P0AA6"],
      rappels: ["Campagne logiciel HV"],
      notes: "" },
    { marque: "Polestar", modele: "Polestar 2", motorisation: "Électrique 476", codeMoteur: "PS2", puissance: "476 ch", annee: "2020-2026", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle HV"] },
      dtc: ["P0AA6"],
      rappels: ["Campagne capteurs isolement HV"],
      notes: "" },

    // === CHINOISES ===
    { marque: "BYD", modele: "Seal U DM-i", motorisation: "DM-i 218", codeMoteur: "BYD-DMi", puissance: "218 ch", annee: "2026-2027", typeCarburant: "Hybride",
      entretiens: { "30000": ["Vidange"] },
      dtc: ["P0087"],
      rappels: ["Campagne pompe à huile DM-i"],
      notes: "Pompe à huile pression basse à chaud" },
    { marque: "MG", modele: "MG4", motorisation: "Électrique 204", codeMoteur: "MG4", puissance: "204 ch", annee: "2022-2026", typeCarburant: "Électrique",
      entretiens: { "30000": ["Contrôle HV"] },
      dtc: ["U0111"],
      rappels: ["Campagne 12V / DC-DC"],
      notes: "" }
];

let megaBase = [...MEGA_BASE_INITIALE];
let syncStatus = { autoDiagnostic: 'inactive', myTech: 'inactive', lastSync: null, sources: [] };

// ==========================================
// 3. AUTO-VÉRIFICATION MASSIVE - RAPATRIEMENT
// ==========================================
const AUTO_DIAGNOSTIC_URLS = [
    'https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/faults2019.js',
    'https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/update2026.js',
    'https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/premium22.js',
    'https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/app.js',
    'https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/coherence.js',
    'https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/engineguard.js',
    'https://raw.githubusercontent.com/expertkevin06-cell/auto-diagnostic/main/utilitaires.js'
];

const MY_TECH_URLS = [
    'https://raw.githubusercontent.com/expertkevin06-cell/my-tech-by-kevin/main/data.json',
    'https://expertkevin06-cell.github.io/my-tech-by-kevin/data.json',
    'https://expertkevin06-cell.github.io/my-tech-by-kevin/db.json'
];

async function autoVerificationMassive() {
    if (!navigator.onLine) {
        showNotification('📡 Hors ligne - Base locale active', 'info');
        updateSyncStatus('inactive');
        return;
    }
    
    showNotification('🔍 Démarrage auto-vérification massive...', 'info');
    updateSyncStatus('active');
    
    let totalAjouts = 0;
    let sourcesOK = [];
    
    // 1. Tentative de récupération depuis auto-diagnostic (fichiers JS)
    for (const url of AUTO_DIAGNOSTIC_URLS) {
        try {
            const result = await recupererEtAnalyserFichierJS(url);
            if (result.count > 0) {
                totalAjouts += result.count;
                sourcesOK.push(`auto-diagnostic (${result.count} éléments)`);
            }
        } catch (e) {
            console.warn(`Échec sur ${url}:`, e.message);
        }
    }
    
    // 2. Tentative de récupération depuis my-tech-by-kevin (JSON)
    for (const url of MY_TECH_URLS) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(url, {
                mode: 'cors',
                headers: { 'Accept': 'application/json' },
                signal: controller.signal
            });
            clearTimeout(timeout);
            
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    const ajout = fusionnerDonnees(data, 'my-tech');
                    totalAjouts += ajout;
                    sourcesOK.push(`my-tech (${ajout} éléments)`);
                    syncStatus.myTech = 'success';
                }
            }
        } catch (e) {
            console.warn(`Échec my-tech ${url}:`, e.message);
        }
    }
    
    // 3. Vérification localStorage
    const saved = localStorage.getItem('kevFusion_megaBase');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > megaBase.length) {
                megaBase = parsed;
                sourcesOK.push(`localStorage (${parsed.length} véhicules)`);
            }
        } catch (e) {}
    }
    
    // 4. Vérification IndexedDB
    try {
        const idbData = await verifierIndexedDB();
        if (idbData.length > 0) {
            const ajout = fusionnerDonnees(idbData, 'indexeddb');
            totalAjouts += ajout;
            sourcesOK.push(`IndexedDB (${ajout} éléments)`);
        }
    } catch (e) {}
    
    // 5. Sauvegarde automatique
    sauvegarderLocalStorage();
    
    syncStatus.lastSync = new Date().toISOString();
    syncStatus.sources = sourcesOK;
    updateSyncStatus('inactive');
    
    const msg = totalAjouts > 0 
        ? `✅ Auto-vérification : +${totalAjouts} nouveaux éléments | ${megaBase.length} véhicules au total`
        : `📦 ${megaBase.length} véhicules en base locale`;
    showNotification(msg, totalAjouts > 0 ? 'success' : 'info');
    
    // Rafraîchir UI
    if (document.getElementById('view-stats') && !document.getElementById('view-stats').classList.contains('hidden')) {
        afficherStats();
    }
}

async function recupererEtAnalyserFichierJS(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    try {
        const response = await fetch(url, {
            mode: 'cors',
            signal: controller.signal
        });
        clearTimeout(timeout);
        
        if (!response.ok) return { count: 0 };
        
        const code = await response.text();
        const count = analyserEtIntegrerCodeJS(code, url);
        return { count };
    } finally {
        clearTimeout(timeout);
    }
}

function analyserEtIntegrerCodeJS(code, url) {
    let total = 0;
    
    // Extraire F2019 (faults2019.js)
    const f2019Match = code.match(/const F2019 = \[([\s\S]*?)\];/);
    if (f2019Match) {
        try {
            const elements = eval(`[${f2019Match[1]}]`);
            total += convertirEtIntegrer(elements, 'F2019');
        } catch (e) {}
    }
    
    // Extraire BATCH_2026_ISSUES
    const b2026Match = code.match(/const BATCH_2026_ISSUES = \[([\s\S]*?)\];/);
    if (b2026Match) {
        try {
            const elements = eval(`[${b2026Match[1]}]`);
            total += convertirEtIntegrer(elements, 'BATCH_2026');
        } catch (e) {}
    }
    
    // Extraire PREMIUM_EXPERT
    const premMatch = code.match(/const PREMIUM_EXPERT = \[([\s\S]*?)\];/);
    if (premMatch) {
        try {
            const elements = eval(`[${premMatch[1]}]`);
            total += convertirEtIntegrer(elements, 'PREMIUM');
        } catch (e) {}
    }
    
    // Extraire BATCH_ISSUES
    const batchMatch = code.match(/const BATCH_ISSUES = \[([\s\S]*?)\];/);
    if (batchMatch) {
        try {
            const elements = eval(`[${batchMatch[1]}]`);
            total += convertirEtIntegrer(elements, 'BATCH');
        } catch (e) {}
    }
    
    // Extraire BRAND_EXPERT
    const brandMatch = code.match(/const BRAND_EXPERT = \[([\s\S]*?)\];/);
    if (brandMatch) {
        try {
            const elements = eval(`[${brandMatch[1]}]`);
            total += convertirEtIntegrer(elements, 'BRAND');
        } catch (e) {}
    }
    
    return total;
}

function convertirEtIntegrer(elements, source) {
    let count = 0;
    
    elements.forEach(el => {
        if (!Array.isArray(el) || el.length < 5) return;
        
        // Format [brand, model, motor, type, title, ...]
        const [brand, model, motor, type, title] = el;
        if (!brand || !model) return;
        
        const vehicule = {
            marque: normaliserMarque(brand),
            modele: model || 'Modèle',
            motorisation: motor || type || 'Standard',
            codeMoteur: genererCodeMoteur(brand, motor),
            puissance: 'Auto',
            annee: el[el.length - 1] || '2020-2026',
            typeCarburant: determinerCarburant(motor, type, title),
            entretiens: {},
            dtc: [],
            rappels: [],
            notes: ''
        };
        
        // Extraire DTC
        const dtcIndex = el.findIndex(x => typeof x === 'string' && /^[PUBC]\d{4}/.test(x));
        if (dtcIndex >= 0) {
            const dtcStr = el[dtcIndex];
            vehicule.dtc = dtcStr.split(/[,\/\s]+/).filter(c => /^[PUBC]\d{4}/i.test(c));
        }
        
        // Source/rappel
        const sourceIndex = el.findIndex(x => typeof x === 'string' && (x.includes('Rappel') || x.includes('Campagne') || x.includes('TSB') || x.includes('NHTSA') || x.includes('Safety Gate')));
        if (sourceIndex >= 0) {
            vehicule.rappels = [el[sourceIndex]];
        }
        
        // Titre = note
        if (title && typeof title === 'string' && title.length > 5) {
            vehicule.notes = title;
        }
        
        // Fusionner sans doublons
        const existe = megaBase.find(v => 
            v.marque.toLowerCase() === vehicule.marque.toLowerCase() &&
            v.modele.toLowerCase() === vehicule.modele.toLowerCase()
        );
        
        if (!existe) {
            megaBase.push(vehicule);
            count++;
        } else {
            // Fusionner DTC et rappels
            vehicule.dtc.forEach(d => { if (!existe.dtc.includes(d)) existe.dtc.push(d); });
            vehicule.rappels.forEach(r => { if (!existe.rappels.includes(r)) existe.rappels.push(r); });
        }
    });
    
    return count;
}

function normaliserMarque(brand) {
    const map = {
        'peugeot': 'Peugeot', 'renault': 'Renault', 'citroen': 'Citroën', 'citroën': 'Citroën',
        'ds': 'DS', 'volkswagen': 'Volkswagen', 'audi': 'Audi', 'bmw': 'BMW',
        'mercedes': 'Mercedes-Benz', 'mercedes-benz': 'Mercedes-Benz', 'porsche': 'Porsche',
        'opel': 'Opel', 'fiat': 'Fiat', 'alfa': 'Alfa Romeo', 'jeep': 'Jeep',
        'toyota': 'Toyota', 'honda': 'Honda', 'nissan': 'Nissan', 'hyundai': 'Hyundai',
        'kia': 'Kia', 'mazda': 'Mazda', 'ford': 'Ford', 'chevrolet': 'Chevrolet',
        'tesla': 'Tesla', 'volvo': 'Volvo', 'dacia': 'Dacia', 'skoda': 'Skoda',
        'seat': 'Seat', 'cupra': 'Cupra', 'polestar': 'Polestar', 'byd': 'BYD',
        'mg': 'MG', 'xpeng': 'Xpeng', 'nio': 'Nio', 'landrover': 'Land Rover',
        'jaguar': 'Jaguar', 'ferrari': 'Ferrari', 'maserati': 'Maserati',
        'mclaren': 'McLaren', 'bugatti': 'Bugatti', 'mini': 'Mini', 'lexus': 'Lexus',
        'alpine': 'Alpine', 'lancia': 'Lancia', 'subaru': 'Subaru', 'suzuki': 'Suzuki',
        'mitsubishi': 'Mitsubishi', 'dodge': 'Dodge', 'cadillac': 'Cadillac',
        'gmc': 'GMC', 'omoda': 'Omoda', 'jaecoo': 'Jaecoo', 'leapmotor': 'Leapmotor',
        'ora': 'Ora', 'aiways': 'Aiways', 'seres': 'Seres', 'lynkco': 'Lynk&Co'
    };
    return map[brand.toLowerCase()] || brand;
}

function genererCodeMoteur(brand, motor) {
    if (!motor) return `${brand.toUpperCase().slice(0,3)}-STD`;
    const clean = motor.replace(/[^A-Za-z0-9]/g, '').slice(0, 10).toUpperCase();
    return clean || `${brand.toUpperCase().slice(0,3)}-AUTO`;
}

function determinerCarburant(motor, type, title) {
    const text = `${motor} ${type} ${title}`.toLowerCase();
    if (text.includes('electrique') || text.includes('év') || text.includes('ev') || text.includes('id.') || text.includes('e-tron') || text.includes('bms')) return 'Électrique';
    if (text.includes('hybride') || text.includes('hybrid') || text.includes('phev') || text.includes('e-tech') || text.includes('dm-i')) return 'Hybride';
    if (text.includes('diesel') || text.includes('tdi') || text.includes('dci') || text.includes('bluehdi') || text.includes('crdi') || text.includes('multijet') || text.includes('fap') || text.includes('adblue')) return 'Diesel';
    if (text.includes('essence') || text.includes('tsi') || text.includes('tce') || text.includes('puretech') || text.includes('ecoboost') || text.includes('gdi')) return 'Essence';
    return 'Essence';
}

async function verifierIndexedDB() {
    return new Promise((resolve) => {
        try {
            const request = indexedDB.open('kevFusionDB', 1);
            request.onerror = () => resolve([]);
            request.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('vehicles')) {
                    resolve([]);
                    return;
                }
                const tx = db.transaction('vehicles', 'readonly');
                const store = tx.objectStore('vehicles');
                const getAll = store.getAll();
                getAll.onsuccess = () => resolve(getAll.result || []);
                getAll.onerror = () => resolve([]);
            };
        } catch (e) {
            resolve([]);
        }
    });
}

function fusionnerDonnees(nouvellesDonnees, source) {
    let count = 0;
    nouvellesDonnees.forEach(item => {
        if (!item.marque || !item.modele) return;
        const existe = megaBase.find(v => v.marque === item.marque && v.modele === item.modele && v.codeMoteur === item.codeMoteur);
        if (!existe) {
            megaBase.push(item);
            count++;
        } else {
            if (item.dtc) item.dtc.forEach(d => { if (!existe.dtc.includes(d)) existe.dtc.push(d); });
            if (item.rappels) item.rappels.forEach(r => { if (!existe.rappels.includes(r)) existe.rappels.push(r); });
            if (item.entretiens) Object.assign(existe.entretiens, item.entretiens);
        }
    });
    return count;
}

function updateSyncStatus(status) {
    const syncEl = document.getElementById('sync-status');
    if (!syncEl) return;
    if (status === 'active') {
        syncEl.className = 'sync-indicator sync-active';
        syncEl.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4 sync-icon"></i><span>Vérif...</span>';
    } else {
        syncEl.className = 'sync-indicator sync-inactive';
        const hasSource = syncStatus.sources && syncStatus.sources.length > 0;
        syncEl.innerHTML = hasSource 
            ? `<i data-lucide="check" class="w-4 h-4"></i><span>${megaBase.length} véh.</span>`
            : `<i data-lucide="database" class="w-4 h-4"></i><span>${megaBase.length} véh.</span>`;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function forcerSynchro() {
    autoVerificationMassive();
}

// ==========================================
// 4. GESTION RÉSEAU
// ==========================================
function updateNetworkStatus() {
    const statusEl = document.getElementById('network-status');
    if (!statusEl) return;
    if (navigator.onLine) {
        const conn = navigator.connection || navigator.mozConnection;
        const type = conn ? conn.effectiveType.toUpperCase() : 'WIFI';
        statusEl.innerHTML = `<span class="pulse-dot online"></span><span>${type}</span>`;
    } else {
        statusEl.innerHTML = `<span class="pulse-dot offline"></span><span>Offline</span>`;
    }
}

window.addEventListener('online', () => {
    updateNetworkStatus();
    showNotification('🌐 Connexion rétablie', 'success');
    setTimeout(autoVerificationMassive, 2000);
});

window.addEventListener('offline', () => {
    updateNetworkStatus();
    showNotification('📡 Mode hors ligne', 'warning');
});

// ==========================================
// 5. NAVIGATION
// ==========================================
function showTab(tabName) {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('fade-in');
    });
    const target = document.getElementById(`view-${tabName}`);
    if (target) { target.classList.remove('hidden'); target.classList.add('fade-in'); }
    
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('tab-active');
        el.classList.add('text-slate-400');
    });
    const active = document.getElementById(`tab-${tabName}`);
    if (active) { active.classList.add('tab-active'); active.classList.remove('text-slate-400'); }
    
    if (tabName === 'entretien') initFiltresEntretien();
    if (tabName === 'stats') afficherStats();
    if (tabName === 'secure') resetSecureForm();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function resetSecureForm() {
    const input = document.getElementById('secure-code-input');
    if (input) input.value = '';
    const err = document.getElementById('secure-error');
    if (err) err.classList.add('hidden');
    setTimeout(nettoyerChampsSecurises, 100);
}

// ==========================================
// 6. RECHERCHE VIN
// ==========================================
async function rechercherVIN() {
    const vin = document.getElementById('vin-input').value.trim().toUpperCase();
    const results = document.getElementById('vin-results');
    if (vin.length !== 17) {
        results.innerHTML = `<div class="glass rounded-3xl p-8 border-l-4 border-red-500 slide-up"><div class="flex items-center gap-4 mb-3"><i data-lucide="alert-circle" class="w-8 h-8 text-red-400"></i><h3 class="text-2xl font-black text-red-400">VIN invalide</h3></div><p class="text-slate-300 text-lg">17 caractères requis.</p></div>`;
        lucide.createIcons();
        return;
    }
    results.innerHTML = `<div class="glass rounded-3xl p-10 text-center"><div class="loading-spinner mx-auto mb-6"></div><p class="text-slate-300 text-xl">Analyse VIN en cours...</p></div>`;
    try {
        const response = await fetch(`https://api.nhtsa.gov/recalls/recallsByVin?vin=${vin}&format=json`);
        const data = await response.json();
        if (data.Results && data.Results.length > 0) {
            let html = `<div class="glass rounded-3xl p-8 border-l-4 border-red-500 slide-up"><div class="flex items-center gap-4 mb-6"><i data-lucide="alert-triangle" class="w-10 h-10 text-red-400"></i><div><h3 class="text-3xl font-black text-red-400">⚠️ ${data.Results.length} rappel(s)</h3><p class="text-slate-400 text-lg">VIN: ${vin}</p></div></div><div class="space-y-5">`;
            data.Results.forEach((r, i) => {
                html += `<div class="bg-red-900/30 border-2 border-red-500/40 rounded-2xl p-6"><div class="flex items-start gap-4"><div class="w-10 h-10 rounded-xl bg-red-500/40 flex items-center justify-center"><span class="text-red-300 font-black">${i+1}</span></div><div class="flex-1"><p class="font-black text-cyan-400 text-xl mb-2">${r.Component}</p><p class="text-slate-200 mb-3">${r.Summary}</p><div class="flex gap-2"><span class="recall-badge px-3 py-1.5 rounded-lg font-bold">NHTSA</span>${r.Manufacturer ? `<span class="success-badge px-3 py-1.5 rounded-lg font-bold">${r.Manufacturer}</span>` : ''}</div></div></div></div>`;
            });
            html += '</div></div>';
            results.innerHTML = html;
        } else {
            results.innerHTML = `<div class="glass rounded-3xl p-8 border-l-4 border-green-500 slide-up"><div class="flex items-center gap-4 mb-3"><i data-lucide="check-circle" class="w-10 h-10 text-green-400"></i><div><h3 class="text-3xl font-black text-green-400">✅ Aucun rappel</h3><p class="text-slate-400 text-lg">VIN: ${vin}</p></div></div></div>`;
        }
        lucide.createIcons();
    } catch (e) {
        results.innerHTML = `<div class="glass rounded-3xl p-8 border-l-4 border-amber-500 slide-up"><div class="flex items-center gap-4 mb-3"><i data-lucide="wifi-off" class="w-8 h-8 text-amber-400"></i><h3 class="text-2xl font-black text-amber-400">Erreur connexion API</h3></div></div>`;
        lucide.createIcons();
    }
}

// ==========================================
// 7. PRÉCONISATIONS
// ==========================================
function initFiltresEntretien() {
    const marques = [...new Set(megaBase.map(v => v.marque))].sort();
    const sel = document.getElementById('filter-marque');
    if (!sel) return;
    sel.innerHTML = '<option value="">🏷️ Marque</option>';
    marques.forEach(m => sel.innerHTML += `<option value="${m}">${m}</option>`);
}

function updateModeles() {
    const marque = document.getElementById('filter-marque').value;
    const selM = document.getElementById('filter-modele');
    const selMo = document.getElementById('filter-moteur');
    selM.innerHTML = '<option value="">🚗 Modèle</option>';
    selMo.innerHTML = '<option value="">⚙️ Motorisation</option>';
    selMo.disabled = true;
    if (marque) {
        const modeles = [...new Set(megaBase.filter(v => v.marque === marque).map(v => v.modele))].sort();
        modeles.forEach(m => selM.innerHTML += `<option value="${m}">${m}</option>`);
        selM.disabled = false;
    } else selM.disabled = true;
}

function updateMotorisations() {
    const marque = document.getElementById('filter-marque').value;
    const modele = document.getElementById('filter-modele').value;
    const sel = document.getElementById('filter-moteur');
    sel.innerHTML = '<option value="">⚙️ Motorisation</option>';
    if (marque && modele) {
        const moteurs = megaBase.filter(v => v.marque === marque && v.modele === modele);
        moteurs.forEach(m => sel.innerHTML += `<option value="${m.codeMoteur}">${m.motorisation} - ${m.codeMoteur} (${m.puissance})</option>`);
        sel.disabled = false;
    }
}

function afficherEntretien() {
    const marque = document.getElementById('filter-marque').value;
    const modele = document.getElementById('filter-modele').value;
    const code = document.getElementById('filter-moteur').value;
    const results = document.getElementById('entretien-results');
    const v = megaBase.find(x => x.marque === marque && x.modele === modele && x.codeMoteur === code);
    if (!v) return;
    
    let html = `<div class="glass rounded-3xl p-8 border-t-4 border-cyan-500 slide-up"><div class="flex items-start gap-5 mb-8"><div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center"><i data-lucide="car" class="w-8 h-8 text-white"></i></div><div class="flex-1"><h3 class="text-3xl font-black mb-2">${v.marque} ${v.modele}</h3><p class="text-cyan-400 font-mono text-lg mb-3">${v.motorisation} | ${v.codeMoteur} | ${v.puissance} | ${v.annee}</p>${v.notes ? `<p class="text-amber-400 italic">⚠️ ${v.notes}</p>` : ''}</div></div><div class="space-y-5">`;
    
    const paliers = ["15000","30000","60000","90000","120000","160000"];
    paliers.forEach(km => {
        const ops = v.entretiens[km];
        if (ops && ops.length > 0) {
            html += `<div class="bg-slate-800/60 rounded-2xl p-6 border-2 border-slate-700"><div class="flex flex-col md:flex-row gap-5"><div class="km-badge text-white px-6 py-4 rounded-xl text-center min-w-[140px] text-xl">${parseInt(km).toLocaleString()} km</div><ul class="flex-1 space-y-3">${ops.map(op => `<li class="flex items-start gap-3"><i data-lucide="check-circle" class="w-6 h-6 text-green-400 mt-0.5"></i><span>${op}</span></li>`).join('')}</ul></div></div>`;
        }
    });
    
    if (v.dtc && v.dtc.length > 0) {
        html += `<div class="mt-8 pt-8 border-t-2 border-slate-700"><h4 class="font-black text-xl mb-4 flex items-center gap-3"><i data-lucide="alert-circle" class="w-6 h-6 text-red-400"></i>Codes DTC</h4><div class="flex flex-wrap gap-3">${v.dtc.map(d => `<span class="dtc-badge px-4 py-2 rounded-xl text-sm font-mono">${d}</span>`).join('')}</div></div>`;
    }
    if (v.rappels && v.rappels.length > 0) {
        html += `<div class="mt-6 pt-6 border-t-2 border-slate-700"><h4 class="font-black text-xl mb-4 flex items-center gap-3"><i data-lucide="alert-triangle" class="w-6 h-6 text-amber-400"></i>Rappels</h4><div class="space-y-3">${v.rappels.map(r => `<div class="bg-amber-900/30 border-2 border-amber-500/40 rounded-xl p-4"><p class="text-amber-100">${r}</p></div>`).join('')}</div></div>`;
    }
    html += '</div></div>';
    results.innerHTML = html;
    lucide.createIcons();
}

// ==========================================
// 8. RECHERCHE MEGA BASE
// ==========================================
function rechercherMegaBase() {
    const q = document.getElementById('mega-search').value.toLowerCase().trim();
    const results = document.getElementById('megabase-results');
    if (q.length < 2) { results.innerHTML = ''; return; }
    const r = megaBase.filter(v => 
        v.marque.toLowerCase().includes(q) ||
        v.modele.toLowerCase().includes(q) ||
        v.codeMoteur.toLowerCase().includes(q) ||
        (v.dtc && v.dtc.some(d => d.toLowerCase().includes(q))) ||
        (v.rappels && v.rappels.some(r => r.toLowerCase().includes(q)))
    ).slice(0, 30);
    
    if (r.length === 0) { results.innerHTML = `<div class="text-center text-slate-500 py-12">Aucune correspondance.</div>`; return; }
    
    results.innerHTML = r.map(v => `
        <div class="glass rounded-2xl p-6 cursor-pointer hover:border-cyan-500 transition-all" onclick="naviguerVersVehicule('${v.marque.replace(/'/g,"\\'")}','${v.modele.replace(/'/g,"\\'")}','${v.codeMoteur.replace(/'/g,"\\'")}')">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <p class="font-black text-cyan-400 text-xl">${v.marque} ${v.modele}</p>
                    <p class="text-slate-300 mt-2">${v.motorisation} (${v.codeMoteur}) • ${v.puissance}</p>
                    ${v.dtc && v.dtc.length > 0 ? `<p class="text-slate-400 text-sm mt-2">DTC: ${v.dtc.slice(0,3).join(', ')}</p>` : ''}
                </div>
                <i data-lucide="arrow-right" class="w-6 h-6 text-slate-500"></i>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function naviguerVersVehicule(marque, modele, code) {
    showTab('entretien');
    setTimeout(() => {
        document.getElementById('filter-marque').value = marque;
        updateModeles();
        setTimeout(() => {
            document.getElementById('filter-modele').value = modele;
            updateMotorisations();
            setTimeout(() => {
                document.getElementById('filter-moteur').value = code;
                afficherEntretien();
            }, 100);
        }, 100);
    }, 100);
}

// ==========================================
// 9. AUTHENTIFICATION SÉCURISÉE
// ==========================================
async function verifierAcces(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('secure-code-input');
    const errorEl = document.getElementById('secure-error');
    const code = input.value.trim();
    
    if (!code || code.toLowerCase() === 'admin' || code.length < 4) {
        errorEl.classList.remove('hidden');
        input.value = '';
        showNotification('❌ Code incorrect', 'error');
        return;
    }
    
    if (!ADMIN_HASH) await initAdminHash();
    const hash = await hashPassword(code);
    
    if (hash === ADMIN_HASH) {
        isSecureModeActive = true;
        errorEl.classList.add('hidden');
        document.getElementById('secure-auth').classList.add('hidden');
        document.getElementById('secure-panel').classList.remove('hidden');
        document.getElementById('secure-panel').classList.remove('admin-locked');
        document.getElementById('secure-panel').classList.add('admin-unlocked');
        document.getElementById('secure-session-time').textContent = new Date().toLocaleTimeString('fr-FR');
        if (secureSessionTimeout) clearTimeout(secureSessionTimeout);
        secureSessionTimeout = setTimeout(fermerSessionSecurisee, SESSION_DURATION);
        showNotification('✅ Accès déverrouillé', 'success');
        input.value = '';
    } else {
        errorEl.classList.remove('hidden');
        showNotification('❌ Code incorrect', 'error');
        input.value = '';
    }
}

function fermerSessionSecurisee() {
    isSecureModeActive = false;
    document.getElementById('secure-auth').classList.remove('hidden');
    document.getElementById('secure-panel').classList.add('hidden');
    document.getElementById('secure-panel').classList.add('admin-locked');
    const input = document.getElementById('secure-code-input');
    if (input) input.value = '';
    if (secureSessionTimeout) clearTimeout(secureSessionTimeout);
    showNotification('🔒 Session fermée', 'info');
}

function verifierAdmin() { verifierAcces(null); }
function deconnecterAdmin() { fermerSessionSecurisee(); }

// ==========================================
// 10. GESTION BASE
// ==========================================
function ajouterEntree(event) {
    event.preventDefault();
    if (!isSecureModeActive) { showNotification('⚠️ Accès requis', 'error'); return; }
    const form = event.target;
    const v = {
        marque: form.marque.value.trim(),
        modele: form.modele.value.trim(),
        motorisation: "À définir",
        codeMoteur: form.codeMoteur.value.trim().toUpperCase(),
        puissance: form.puissance.value.trim(),
        annee: "À définir",
        typeCarburant: "À définir",
        entretiens: { "30000":["Vidange"], "60000":["Vidange"], "120000":["Vidange"], "160000":["Vidange"] },
        dtc: [], rappels: [], notes: ""
    };
    try { v.entretiens = JSON.parse(form.preconisations.value); } catch(e) {}
    megaBase.push(v);
    sauvegarderLocalStorage();
    showNotification('✅ Fiche ajoutée', 'success');
    form.reset();
    initFiltresEntretien();
}

function reinitialiserBase() {
    if (!isSecureModeActive) { showNotification('⚠️ Accès requis', 'error'); return; }
    if (confirm('Réinitialiser la base ?')) {
        megaBase = [...MEGA_BASE_INITIALE];
        localStorage.removeItem('kevFusion_megaBase');
        showNotification('🔄 Base réinitialisée', 'warning');
        initFiltresEntretien();
    }
}

function sauvegarderLocalStorage() {
    try {
        localStorage.setItem('kevFusion_megaBase', JSON.stringify(megaBase));
        showNotification('💾 Sauvegarde OK', 'success');
    } catch (e) { showNotification('❌ Erreur', 'error'); }
}

function exporterJSON() {
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(megaBase, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", data);
    a.setAttribute("download", `kev_fusion_megabase_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showNotification('📥 Export OK', 'success');
}

function importerJSON(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (Array.isArray(data)) {
                const n = fusionnerDonnees(data, 'import');
                sauvegarderLocalStorage();
                showNotification(`✅ Import : +${n} véhicules`, 'success');
                initFiltresEntretien();
            }
        } catch (err) { showNotification('❌ Fichier invalide', 'error'); }
    };
    reader.readAsText(file);
    input.value = '';
}

// ==========================================
// 11. IMPORT MASSIF - OUVERTURE APK SOURCES
// ==========================================
function ouvrirProjetSource(source) {
    const urls = {
        'auto-diagnostic': 'https://expertkevin06-cell.github.io/auto-diagnostic/',
        'my-tech': 'https://expertkevin06-cell.github.io/my-tech-by-kevin/'
    };
    const url = urls[source];
    if (!url) return;
    
    showNotification(`📲 Ouverture de ${source} - Exportez les données puis importez-les ici`, 'info');
    
    // Ouvrir dans une nouvelle fenêtre ou onglet
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    // Après 2 secondes, proposer l'import
    setTimeout(() => {
        showNotification(`💡 Dans ${source}, utilisez "Export JSON", puis revenez ici pour importer`, 'info');
    }, 2000);
}

// ==========================================
// 12. STATISTIQUES
// ==========================================
function afficherStats() {
    const container = document.getElementById('stats-container');
    const fuelStats = document.getElementById('fuel-stats');
    const syncDetails = document.getElementById('sync-details');
    if (!container) return;
    
    const total = megaBase.length;
    const marques = [...new Set(megaBase.map(v => v.marque))].length;
    const dtc = megaBase.reduce((a,v) => a + (v.dtc?.length || 0), 0);
    const rappels = megaBase.reduce((a,v) => a + (v.rappels?.length || 0), 0);
    
    container.innerHTML = `
        <div class="stat-card rounded-2xl p-6"><div class="flex items-center gap-3 mb-3"><i data-lucide="car" class="w-8 h-8 text-cyan-400"></i><span class="text-slate-400 font-bold text-sm uppercase">Véhicules</span></div><p class="text-4xl font-black">${total}</p></div>
        <div class="stat-card rounded-2xl p-6"><div class="flex items-center gap-3 mb-3"><i data-lucide="tag" class="w-8 h-8 text-purple-400"></i><span class="text-slate-400 font-bold text-sm uppercase">Marques</span></div><p class="text-4xl font-black">${marques}</p></div>
        <div class="stat-card rounded-2xl p-6"><div class="flex items-center gap-3 mb-3"><i data-lucide="alert-circle" class="w-8 h-8 text-red-400"></i><span class="text-slate-400 font-bold text-sm uppercase">DTC</span></div><p class="text-4xl font-black">${dtc}</p></div>
        <div class="stat-card rounded-2xl p-6"><div class="flex items-center gap-3 mb-3"><i data-lucide="alert-triangle" class="w-8 h-8 text-amber-400"></i><span class="text-slate-400 font-bold text-sm uppercase">Rappels</span></div><p class="text-4xl font-black">${rappels}</p></div>
    `;
    
    const carb = {};
    megaBase.forEach(v => { if (v.typeCarburant) carb[v.typeCarburant] = (carb[v.typeCarburant] || 0) + 1; });
    if (fuelStats) {
        fuelStats.innerHTML = Object.entries(carb).map(([t, c]) => {
            const p = ((c/total)*100).toFixed(1);
            return `<div class="glass rounded-2xl p-5"><div class="flex justify-between mb-3"><span class="font-bold text-lg">${t}</span><span class="text-slate-400">${c} (${p}%)</span></div><div class="progress-bar"><div class="progress-fill" style="width:${p}%"></div></div></div>`;
        }).join('');
    }
    
    if (syncDetails) {
        syncDetails.innerHTML = `
            <div class="glass rounded-2xl p-5"><div class="flex items-center justify-between"><span class="font-bold text-lg">Auto-Diagnostic</span><span class="font-semibold text-green-400">✅ Intégré</span></div></div>
            <div class="glass rounded-2xl p-5"><div class="flex items-center justify-between"><span class="font-bold text-lg">My-Tech</span><span class="font-semibold ${syncStatus.myTech === 'success' ? 'text-green-400' : 'text-slate-400'}">${syncStatus.myTech === 'success' ? '✅ Sync' : '⏳ Local'}</span></div></div>
            <div class="glass rounded-2xl p-5 border-l-4 border-cyan-500"><div class="flex items-center gap-3 mb-2"><i data-lucide="database" class="w-6 h-6 text-cyan-400"></i><span class="font-bold text-lg">Base locale</span></div><p class="text-slate-300">${megaBase.length} véhicules</p>${syncStatus.lastSync ? `<p class="text-xs text-slate-500 mt-2">Dernière : ${new Date(syncStatus.lastSync).toLocaleString('fr-FR')}</p>` : ''}</div>
        `;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// 13. NOTIFICATIONS
// ==========================================
function showNotification(msg, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    const n = document.createElement('div');
    const colors = { success: 'bg-green-500', error: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-cyan-500' };
    n.className = `notification ${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl font-bold`;
    n.textContent = msg;
    container.appendChild(n);
    setTimeout(() => {
        n.style.opacity = '0';
        n.style.transform = 'translateX(400px)';
        n.style.transition = 'all 0.5s';
        setTimeout(() => n.remove(), 500);
    }, 4000);
}

// ==========================================
// 14. PROTECTION ANTI-AUTOFILL
// ==========================================
function nettoyerChampsSecurises() {
    const input = document.getElementById('secure-code-input');
    if (input && input.value && input.value.toLowerCase().includes('admin')) {
        input.value = '';
    }
}

function protegerContreAutofill() {
    const input = document.getElementById('secure-code-input');
    if (!input) return;
    nettoyerChampsSecurises();
    [100, 500, 1000, 2000].forEach(t => setTimeout(nettoyerChampsSecurises, t));
    input.addEventListener('focus', nettoyerChampsSecurises);
    input.addEventListener('input', (e) => {
        if (e.target.value.toLowerCase().includes('admin')) e.target.value = '';
    });
}

// ==========================================
// 15. INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateNetworkStatus();
    initFiltresEntretien();
    protegerContreAutofill();
    initAdminHash();
    
    // Charger localStorage
    const saved = localStorage.getItem('kevFusion_megaBase');
    if (saved) {
        try {
            const p = JSON.parse(saved);
            if (Array.isArray(p) && p.length > 0) {
                megaBase = p;
                console.log('✅ Base localStorage:', megaBase.length);
            }
        } catch (e) {}
    }
    
    // Lancer auto-vérification massive
    setTimeout(() => {
        if (navigator.onLine) autoVerificationMassive();
    }, 2000);
    
    // Sync périodique toutes les 10 min
    setInterval(() => {
        if (navigator.onLine) autoVerificationMassive();
    }, 10 * 60 * 1000);
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
});

document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'secure-code-input') verifierAcces(e);
});
