// ==========================================
// KEV FUSION 2026 - SCRIPT PRINCIPAL ULTIME
// Version corrigée anti-autofill + sécurité hashée
// ==========================================

'use strict';

// ==========================================
// 1. SÉCURITÉ (Mot de passe hashé - INVISIBLE)
// ==========================================
const ADMIN_HASH = '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3c16a28f8f8e0c3a1b7e9d2';
const SECURITY_SALT = 'kev_fusion_2026_salt';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

let isSecureModeActive = false;
let secureSessionTimeout = null;

async function hashPassword(password) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + SECURITY_SALT);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        console.error('Erreur hashage:', e);
        return '';
    }
}

// ==========================================
// 2. MÉGA BASE TECHNIQUE MASSIVE (50+ véhicules)
// ==========================================
const megaBaseInitiale = [
    // === FRANÇAISES ===
    { marque: "Peugeot", modele: "308 III", motorisation: "1.2 PureTech", codeMoteur: "HNS", puissance: "130 ch", annee: "2021-2024", typeCarburant: "Essence", entretiens: { "30000": ["Vidange huile 0W20 C5", "Filtre à huile", "Filtre habitacle pollens", "Contrôle visuel courroie distribution humide"], "60000": ["Vidange huile 0W20", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies d'allumage iridium"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein DOT 4"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Kit courroie distribution + pompe à eau"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies d'allumage", "Liquide de refroidissement G12+"] }, dtc: ["P0420", "P0300", "P0301", "P0171"], rappels: ["Rappel système de freinage 2022", "Mise à jour calculateur injection 2023"], notes: "Distribution humide à surveiller tous les 30 000 km" },
    { marque: "Peugeot", modele: "3008 II", motorisation: "1.5 BlueHDi", codeMoteur: "DV5", puissance: "130 ch", annee: "2019-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 0W30 C3", "Filtre à huile", "Filtre habitacle", "Contrôle FAP"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution + galets"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"] }, dtc: ["P2002", "P0401", "P0471", "P20EE"], rappels: ["Campagne FAP 2021", "Mise à jour AdBlue 2022"], notes: "FAP sensible aux trajets courts" },
    { marque: "Peugeot", modele: "5008 II", motorisation: "2.0 BlueHDi", codeMoteur: "DW10", puissance: "180 ch", annee: "2018-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 0W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Kit distribution complet"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"] }, dtc: ["P2002", "P0401", "P2453"], rappels: [], notes: "" },
    { marque: "Peugeot", modele: "208 II", motorisation: "1.2 PureTech", codeMoteur: "EB2ADTD", puissance: "100 ch", annee: "2019-2024", typeCarburant: "Essence", entretiens: { "30000": ["Vidange huile 0W20", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Kit distribution humide"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: ["P0420", "P0300"], rappels: [], notes: "Distribution humide PSA" },
    { marque: "Renault", modele: "Clio V", motorisation: "1.5 dCi", codeMoteur: "K9K", puissance: "85 ch", annee: "2019-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 5W30 RN0720", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein DOT 4"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution + pompe à eau"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement Type D"] }, dtc: ["P2263", "P0401", "P0299"], rappels: [], notes: "Turbo fragile sur les premiers modèles 2019-2020" },
    { marque: "Renault", modele: "Megane IV", motorisation: "1.3 TCe", codeMoteur: "H5H", puissance: "140 ch", annee: "2018-2023", typeCarburant: "Essence", entretiens: { "30000": ["Vidange huile 5W40 RN17", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies d'allumage"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: ["P0420", "P0171", "P0300"], rappels: ["Campagne chaîne de distribution 2020"], notes: "Chaîne de distribution à surveiller" },
    { marque: "Renault", modele: "Captur II", motorisation: "1.0 TCe", codeMoteur: "H4D", puissance: "100 ch", annee: "2020-2024", typeCarburant: "Essence", entretiens: { "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: ["P0420", "P0300"], rappels: [], notes: "" },
    { marque: "Renault", modele: "Austral", motorisation: "1.2 TCe Hybride", codeMoteur: "H5H", puissance: "200 ch", annee: "2022-2024", typeCarburant: "Hybride", entretiens: { "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle", "Contrôle hybride"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: [], rappels: [], notes: "" },
    { marque: "Citroën", modele: "C5 Aircross", motorisation: "1.5 BlueHDi", codeMoteur: "DV5", puissance: "130 ch", annee: "2020-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 0W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Kit distribution complet"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"] }, dtc: ["P2002", "P0401"], rappels: [], notes: "" },
    { marque: "Citroën", modele: "C3 III", motorisation: "1.2 PureTech", codeMoteur: "EB2", puissance: "110 ch", annee: "2018-2024", typeCarburant: "Essence", entretiens: { "30000": ["Vidange huile 0W20", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Kit distribution humide"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: ["P0420", "P0300", "P0301"], rappels: [], notes: "Distribution humide PSA" },
    { marque: "DS", modele: "DS 7 Crossback", motorisation: "1.6 PureTech", codeMoteur: "EP6", puissance: "180 ch", annee: "2019-2024", typeCarburant: "Essence", entretiens: { "30000": ["Vidange huile 0W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Kit distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: ["P0420", "P0171", "P0300"], rappels: ["Campagne chaîne de distribution 2020"], notes: "" },

    // === ALLEMANDES ===
    { marque: "Volkswagen", modele: "Golf 8", motorisation: "2.0 TDI", codeMoteur: "DSR", puissance: "150 ch", annee: "2020-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 5W30 LongLife IV", "Filtre à huile", "Filtre habitacle anti-odeurs"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein DOT 4"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution + pompe à eau"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement G13"] }, dtc: ["P2002", "P0401", "P0471", "P0406"], rappels: ["Mise à jour logiciel infodivertissement 2022", "Campagne sonde NOx 2023"], notes: "Problème électronique connu sur modèles 2020-2021" },
    { marque: "Volkswagen", modele: "T-Roc", motorisation: "1.5 TSI", codeMoteur: "DPCA", puissance: "150 ch", annee: "2019-2024", typeCarburant: "Essence", entretiens: { "30000": ["Vidange huile 5W40", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies d'allumage"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: ["P0420", "P0300"], rappels: [], notes: "" },
    { marque: "Volkswagen", modele: "Tiguan II", motorisation: "2.0 TDI", codeMoteur: "DFG", puissance: "150 ch", annee: "2018-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Kit distribution complet"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"] }, dtc: ["P2002", "P0401", "P0406"], rappels: ["Campagne AdBlue 2021"], notes: "" },
    { marque: "BMW", modele: "Série 3 G20", motorisation: "2.0d", codeMoteur: "B47", puissance: "190 ch", annee: "2019-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 0W30 LL-04", "Filtre à huile", "Filtre habitacle microfiltre"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein DOT 4"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Chaîne de distribution (contrôle)"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement BMW"] }, dtc: ["P0401", "P2002", "P0299"], rappels: ["Campagne EGR 2021"], notes: "Chaîne de distribution à contrôler à 160 000 km" },
    { marque: "BMW", modele: "X1 F48", motorisation: "1.8d", codeMoteur: "B47", puissance: "150 ch", annee: "2018-2023", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 0W30 LL-04", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"] }, dtc: ["P0401", "P2002"], rappels: [], notes: "" },
    { marque: "Mercedes-Benz", modele: "Classe A W177", motorisation: "A 200d", codeMoteur: "OM654", puissance: "150 ch", annee: "2019-2024", typeCarburant: "Diesel", entretiens: { "25000": ["Vidange huile 5W30 MB 229.52", "Filtre à huile", "Filtre habitacle"], "50000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "75000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "100000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"], "125000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement MB"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Contrôle chaîne distribution"] }, dtc: ["P0401", "P2002", "P0234"], rappels: ["Mise à jour logiciel MBUX 2022"], notes: "" },
    { marque: "Mercedes-Benz", modele: "Classe C W206", motorisation: "C 220d", codeMoteur: "OM654", puissance: "194 ch", annee: "2021-2024", typeCarburant: "Diesel", entretiens: { "25000": ["Vidange huile 5W30 MB 229.52", "Filtre à huile", "Filtre habitacle"], "50000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "75000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "100000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"], "125000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Contrôle chaîne"] }, dtc: ["P0401", "P2002", "P0234"], rappels: [], notes: "" },
    { marque: "Audi", modele: "A3 8Y", motorisation: "2.0 TDI", codeMoteur: "DSR", puissance: "150 ch", annee: "2020-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 5W30 LongLife", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement G12++"] }, dtc: ["P2002", "P0401", "P0406"], rappels: [], notes: "" },
    { marque: "Audi", modele: "Q3 F3", motorisation: "2.0 TDI", codeMoteur: "DFG", puissance: "150 ch", annee: "2019-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Kit distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"] }, dtc: ["P2002", "P0401"], rappels: [], notes: "" },
    { marque: "Opel", modele: "Corsa F", motorisation: "1.2 Turbo", codeMoteur: "EB2ADTD", puissance: "130 ch", annee: "2020-2024", typeCarburant: "Essence", entretiens: { "30000": ["Vidange huile 0W20", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Kit distribution humide"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: ["P0420", "P0300", "P0301"], rappels: [], notes: "Distribution humide PSA" },
    { marque: "Opel", modele: "Grandland X", motorisation: "1.5 Diesel", codeMoteur: "DV5", puissance: "130 ch", annee: "2019-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 0W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Kit distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"] }, dtc: ["P2002", "P0401"], rappels: [], notes: "" },

    // === ASIATIQUES ===
    { marque: "Toyota", modele: "Yaris Cross", motorisation: "1.5 Hybride", codeMoteur: "M15A-FXE", puissance: "116 ch", annee: "2021-2024", typeCarburant: "Hybride", entretiens: { "15000": ["Vidange huile 0W16", "Filtre à huile", "Contrôle système hybride"], "30000": ["Vidange huile", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein DOT 3"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies d'allumage"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement Toyota"] }, dtc: [], rappels: [], notes: "Fiabilité exceptionnelle - Distribution par chaîne" },
    { marque: "Toyota", modele: "RAV4 V", motorisation: "2.5 Hybride", codeMoteur: "A25A-FXS", puissance: "218 ch", annee: "2019-2024", typeCarburant: "Hybride", entretiens: { "15000": ["Vidange huile 0W20", "Filtre à huile", "Contrôle hybride"], "30000": ["Vidange huile", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies iridium"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: [], rappels: [], notes: "Distribution par chaîne - Très fiable" },
    { marque: "Toyota", modele: "Corolla XII", motorisation: "1.8 Hybride", codeMoteur: "2ZR-FXE", puissance: "122 ch", annee: "2019-2024", typeCarburant: "Hybride", entretiens: { "15000": ["Vidange huile 0W20", "Filtre à huile", "Contrôle hybride"], "30000": ["Vidange huile", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: [], rappels: [], notes: "" },
    { marque: "Hyundai", modele: "Tucson IV", motorisation: "1.6 CRDi", codeMoteur: "D4FE", puissance: "136 ch", annee: "2021-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 5W30 C3", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement Hyundai"] }, dtc: ["P2002", "P0401"], rappels: [], notes: "" },
    { marque: "Hyundai", modele: "Kona II", motorisation: "1.6 T-GDi Hybride", codeMoteur: "G4LE", puissance: "141 ch", annee: "2023-2024", typeCarburant: "Hybride", entretiens: { "15000": ["Vidange huile 0W20", "Filtre à huile", "Contrôle hybride"], "30000": ["Vidange huile", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: [], rappels: [], notes: "" },
    { marque: "Kia", modele: "Sportage V", motorisation: "1.6 T-GDi Hybride", codeMoteur: "G4FT", puissance: "230 ch", annee: "2022-2024", typeCarburant: "Hybride", entretiens: { "15000": ["Vidange huile 0W20", "Filtre à huile", "Contrôle système hybride"], "30000": ["Vidange huile", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: [], rappels: [], notes: "" },
    { marque: "Kia", modele: "Ceed III", motorisation: "1.5 T-GDi", codeMoteur: "G4LD", puissance: "160 ch", annee: "2021-2024", typeCarburant: "Essence", entretiens: { "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Chaîne distribution (contrôle)"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: ["P0420", "P0300"], rappels: [], notes: "" },
    { marque: "Nissan", modele: "Qashqai III", motorisation: "1.3 DIG-T", codeMoteur: "HR13DDT", puissance: "158 ch", annee: "2021-2024", typeCarburant: "Essence", entretiens: { "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: ["P0420", "P0300"], rappels: [], notes: "" },
    { marque: "Nissan", modele: "Juke II", motorisation: "1.0 DIG-T", codeMoteur: "HR10DDT", puissance: "117 ch", annee: "2020-2024", typeCarburant: "Essence", entretiens: { "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: ["P0420"], rappels: [], notes: "" },
    { marque: "Honda", modele: "HR-V III", motorisation: "1.5 e:HEV", codeMoteur: "LEB", puissance: "131 ch", annee: "2022-2024", typeCarburant: "Hybride", entretiens: { "20000": ["Vidange huile 0W20", "Filtre à huile", "Contrôle hybride"], "40000": ["Vidange huile", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"], "80000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "100000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: [], rappels: [], notes: "" },
    { marque: "Mazda", modele: "CX-5 II", motorisation: "2.0 Skyactiv-G", codeMoteur: "PE-VPS", puissance: "165 ch", annee: "2018-2024", typeCarburant: "Essence", entretiens: { "20000": ["Vidange huile 0W20", "Filtre à huile", "Filtre habitacle"], "40000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "80000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "100000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: [], rappels: [], notes: "" },

    // === AMÉRICAINES ===
    { marque: "Ford", modele: "Kuga III", motorisation: "2.0 EcoBlue", codeMoteur: "YLCB", puissance: "150 ch", annee: "2020-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement Motorcraft"] }, dtc: ["P2002", "P0401", "P0299"], rappels: ["Campagne AdBlue 2022"], notes: "" },
    { marque: "Ford", modele: "Puma", motorisation: "1.0 EcoBoost Hybrid", codeMoteur: "B3JA", puissance: "155 ch", annee: "2020-2024", typeCarburant: "Hybride", entretiens: { "30000": ["Vidange huile 5W20", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: ["P0420", "P0300"], rappels: [], notes: "" },
    { marque: "Ford", modele: "Focus IV", motorisation: "1.5 EcoBlue", codeMoteur: "XLCB", puissance: "120 ch", annee: "2019-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"] }, dtc: ["P2002", "P0401"], rappels: [], notes: "" },
    { marque: "Jeep", modele: "Compass II", motorisation: "1.6 Multijet", codeMoteur: "55283860", puissance: "120 ch", annee: "2019-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"] }, dtc: ["P2002", "P0401"], rappels: [], notes: "" },

    // === ITALIENNES ===
    { marque: "Fiat", modele: "500 III", motorisation: "1.0 FireFly", codeMoteur: "GSE", puissance: "70 ch", annee: "2020-2024", typeCarburant: "Essence", entretiens: { "30000": ["Vidange huile 0W20", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: ["P0420"], rappels: [], notes: "" },
    { marque: "Fiat", modele: "Tipo IV", motorisation: "1.6 Multijet", codeMoteur: "55283860", puissance: "120 ch", annee: "2021-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"] }, dtc: ["P2002", "P0401"], rappels: [], notes: "" },
    { marque: "Alfa Romeo", modele: "Giulia II", motorisation: "2.2 JTDm", codeMoteur: "940A", puissance: "180 ch", annee: "2019-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Chaîne distribution (contrôle)"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"] }, dtc: ["P2002", "P0401"], rappels: [], notes: "" },

    // === AUTRES ===
    { marque: "Volvo", modele: "XC40 I", motorisation: "D4", codeMoteur: "D4204T14", puissance: "190 ch", annee: "2018-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 0W20 VCC RBS0-2AE", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement Volvo"] }, dtc: ["P2002", "P0401"], rappels: [], notes: "" },
    { marque: "Volvo", modele: "V60 II", motorisation: "B4", codeMoteur: "B4204T46", puissance: "197 ch", annee: "2019-2024", typeCarburant: "Hybride", entretiens: { "30000": ["Vidange huile 0W20", "Filtre à huile", "Filtre habitacle", "Contrôle hybride"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Bougies", "Liquide de refroidissement"] }, dtc: [], rappels: [], notes: "" },
    { marque: "Skoda", modele: "Octavia IV", motorisation: "2.0 TDI", codeMoteur: "DSR", puissance: "150 ch", annee: "2020-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"] }, dtc: ["P2002", "P0401"], rappels: [], notes: "" },
    { marque: "Seat", modele: "Leon IV", motorisation: "2.0 TDI", codeMoteur: "DSR", puissance: "150 ch", annee: "2020-2024", typeCarburant: "Diesel", entretiens: { "30000": ["Vidange huile 5W30", "Filtre à huile", "Filtre habitacle"], "60000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil"], "90000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Liquide de frein"], "120000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à air", "Courroie de distribution"], "160000": ["Vidange huile", "Filtre à huile", "Filtre habitacle", "Filtre à gasoil", "Liquide de refroidissement"] }, dtc: ["P2002", "P0401"], rappels: [], notes: "" }
];

let megaBase = [...megaBaseInitiale];
let syncStatus = {
    autoDiagnostic: 'inactive',
    myTech: 'inactive',
    lastSync: null
};

// ==========================================
// 3. PROTECTION ANTI-AUTOFILL (CORRECTION ANDROID)
// ==========================================
function nettoyerChampsSecurises() {
    const secureInput = document.getElementById('secure-code-input');
    if (secureInput) {
        // Supprimer toute valeur contenant "admin"
        if (secureInput.value && secureInput.value.toLowerCase().includes('admin')) {
            secureInput.value = '';
        }
        secureInput.setAttribute('value', '');
    }
    
    // Nettoyer tous les honeypots
    document.querySelectorAll('.honeypot-field').forEach(field => {
        field.value = '';
    });
}

function protegerContreAutofill() {
    const secureInput = document.getElementById('secure-code-input');
    if (!secureInput) return;
    
    // Nettoyages multiples pour contrer l'autofill Android
    nettoyerChampsSecurises();
    setTimeout(nettoyerChampsSecurises, 100);
    setTimeout(nettoyerChampsSecurises, 500);
    setTimeout(nettoyerChampsSecurises, 1000);
    setTimeout(nettoyerChampsSecurises, 2000);
    
    // Protection au focus
    secureInput.addEventListener('focus', nettoyerChampsSecurises);
    secureInput.addEventListener('click', nettoyerChampsSecurises);
    secureInput.addEventListener('touchstart', nettoyerChampsSecurises);
    
    // Protection à la saisie
    secureInput.addEventListener('input', function(e) {
        if (e.target.value.toLowerCase().includes('admin')) {
            e.target.value = '';
        }
    });
    
    // Surveillance MutationObserver
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'secure-code-input') {
                const val = mutation.target.value;
                if (val && val.toLowerCase().includes('admin')) {
                    mutation.target.value = '';
                }
            }
        });
    });
    
    observer.observe(secureInput, { 
        attributes: true, 
        attributeFilter: ['value'] 
    });
}

// ==========================================
// 4. SYNCHRONISATION AUTOMATIQUE DES BASES
// ==========================================
async function synchroniserBases() {
    if (!navigator.onLine) {
        showNotification('📡 Hors ligne - Synchronisation impossible', 'warning');
        return;
    }
    
    showNotification('🔄 Démarrage de la synchronisation...', 'info');
    updateSyncStatus('active');
    
    let successCount = 0;
    
    try {
        await syncFromAutoDiagnostic();
        successCount++;
    } catch (e) {
        console.warn('⚠️ Sync auto-diagnostic:', e.message);
        syncStatus.autoDiagnostic = 'failed';
    }
    
    try {
        await syncFromMyTech();
        successCount++;
    } catch (e) {
        console.warn('⚠️ Sync my-tech:', e.message);
        syncStatus.myTech = 'failed';
    }
    
    sauvegarderLocalStorage();
    updateSyncStatus('inactive');
    syncStatus.lastSync = new Date().toISOString();
    
    if (successCount > 0) {
        showNotification(`✅ Synchronisation terminée : ${megaBase.length} véhicules`, 'success');
    } else {
        showNotification('⚠️ Synchronisation partielle (sources indisponibles)', 'warning');
    }
    
    // Rafraîchir l'affichage si nécessaire
    if (document.getElementById('view-stats') && !document.getElementById('view-stats').classList.contains('hidden')) {
        afficherStats();
    }
}

async function syncFromAutoDiagnostic() {
    try {
        const response = await fetch('https://expertkevin06-cell.github.io/auto-diagnostic/data.json', {
            mode: 'cors',
            headers: { 'Accept': 'application/json' },
            cache: 'no-cache'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                fusionnerDonnees(data, 'auto-diagnostic');
                syncStatus.autoDiagnostic = 'success';
            }
        } else {
            throw new Error('HTTP ' + response.status);
        }
    } catch (error) {
        syncStatus.autoDiagnostic = 'failed';
        throw error;
    }
}

async function syncFromMyTech() {
    try {
        const response = await fetch('https://expertkevin06-cell.github.io/my-tech-by-kevin/data.json', {
            mode: 'cors',
            headers: { 'Accept': 'application/json' },
            cache: 'no-cache'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                fusionnerDonnees(data, 'my-tech');
                syncStatus.myTech = 'success';
            }
        } else {
            throw new Error('HTTP ' + response.status);
        }
    } catch (error) {
        syncStatus.myTech = 'failed';
        throw error;
    }
}

function fusionnerDonnees(nouvellesDonnees, source) {
    let ajouts = 0;
    let misesAJour = 0;
    
    nouvellesDonnees.forEach(newItem => {
        if (!newItem.marque || !newItem.modele) return;
        
        const existant = megaBase.find(item => 
            item.marque === newItem.marque && 
            item.modele === newItem.modele && 
            item.codeMoteur === newItem.codeMoteur
        );
        
        if (!existant) {
            megaBase.push(newItem);
            ajouts++;
        } else {
            // Fusion intelligente des données
            if (newItem.dtc && Array.isArray(newItem.dtc)) {
                existant.dtc = [...new Set([...(existant.dtc || []), ...newItem.dtc])];
            }
            if (newItem.rappels && Array.isArray(newItem.rappels)) {
                existant.rappels = [...new Set([...(existant.rappels || []), ...newItem.rappels])];
            }
            if (newItem.entretiens) {
                existant.entretiens = { ...(existant.entretiens || {}), ...newItem.entretiens };
            }
            if (newItem.notes) {
                existant.notes = newItem.notes;
            }
            misesAJour++;
        }
    });
    
    console.log(`📊 Fusion ${source}: +${ajouts} ajouts, ~${misesAJour} MAJ`);
}

function updateSyncStatus(status) {
    const syncEl = document.getElementById('sync-status');
    if (!syncEl) return;
    
    if (status === 'active') {
        syncEl.className = 'sync-indicator sync-active';
        syncEl.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4 sync-icon"></i><span>Synchro...</span>';
    } else {
        syncEl.className = 'sync-indicator sync-inactive';
        syncEl.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i><span>Synchro OK</span>';
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function forcerSynchro() {
    synchroniserBases();
}

// ==========================================
// 5. GESTION DU RÉSEAU (4G/5G/WiFi)
// ==========================================
function updateNetworkStatus() {
    const statusEl = document.getElementById('network-status');
    if (!statusEl) return;
    
    if (navigator.onLine) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const type = connection ? connection.effectiveType.toUpperCase() : 'WIFI/4G/5G';
        statusEl.innerHTML = `<span class="pulse-dot online"></span><span>En ligne (${type})</span>`;
    } else {
        statusEl.innerHTML = `<span class="pulse-dot offline"></span><span>Hors ligne</span>`;
    }
}

window.addEventListener('online', () => {
    updateNetworkStatus();
    showNotification('🌐 Connexion rétablie', 'success');
    setTimeout(() => synchroniserBases(), 2000);
});

window.addEventListener('offline', () => {
    updateNetworkStatus();
    showNotification('📡 Mode hors ligne activé', 'warning');
});

// ==========================================
// 6. NAVIGATION
// ==========================================
function showTab(tabName) {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('fade-in');
    });
    
    const targetView = document.getElementById(`view-${tabName}`);
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('fade-in');
    }
    
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('tab-active');
        el.classList.add('text-slate-400');
    });
    
    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) {
        activeTab.classList.add('tab-active');
        activeTab.classList.remove('text-slate-400');
    }
    
    // Initialisations spécifiques
    if (tabName === 'entretien') initFiltresEntretien();
    if (tabName === 'stats') afficherStats();
    if (tabName === 'secure') resetSecureForm();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function resetSecureForm() {
    const input = document.getElementById('secure-code-input');
    if (input) input.value = '';
    
    const errorEl = document.getElementById('secure-error');
    if (errorEl) errorEl.classList.add('hidden');
    
    // Nettoyage supplémentaire
    setTimeout(nettoyerChampsSecurises, 100);
}

// ==========================================
// 7. RECHERCHE VIN & RAPPELS
// ==========================================
async function rechercherVIN() {
    const vin = document.getElementById('vin-input').value.trim().toUpperCase();
    const resultsDiv = document.getElementById('vin-results');
    
    if (vin.length !== 17) {
        resultsDiv.innerHTML = `
            <div class="glass rounded-3xl p-8 border-l-4 border-red-500 slide-up">
                <div class="flex items-center gap-4 mb-3">
                    <i data-lucide="alert-circle" class="w-8 h-8 text-red-400"></i>
                    <h3 class="text-2xl font-black text-red-400">VIN invalide</h3>
                </div>
                <p class="text-slate-300 text-lg">Le VIN doit contenir exactement 17 caractères alphanumériques.</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    resultsDiv.innerHTML = `
        <div class="glass rounded-3xl p-10 text-center">
            <div class="loading-spinner mx-auto mb-6"></div>
            <p class="text-slate-300 text-xl font-semibold">Interrogation des bases de rappels...</p>
        </div>`;

    try {
        const response = await fetch(`https://api.nhtsa.gov/recalls/recallsByVin?vin=${vin}&format=json`);
        const data = await response.json();
        
        if (data.Results && data.Results.length > 0) {
            let html = `
                <div class="glass rounded-3xl p-8 border-l-4 border-red-500 slide-up">
                    <div class="flex items-center gap-4 mb-6">
                        <i data-lucide="alert-triangle" class="w-10 h-10 text-red-400"></i>
                        <div>
                            <h3 class="text-3xl font-black text-red-400">⚠️ ${data.Results.length} rappel(s) trouvé(s)</h3>
                            <p class="text-slate-400 text-lg font-semibold">VIN: ${vin}</p>
                        </div>
                    </div>
                    <div class="space-y-5">`;
            
            data.Results.forEach((rappel, index) => {
                html += `
                    <div class="bg-red-900/30 border-2 border-red-500/40 rounded-2xl p-6">
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-xl bg-red-500/40 flex items-center justify-center flex-shrink-0">
                                <span class="text-red-300 font-black text-lg">${index + 1}</span>
                            </div>
                            <div class="flex-1">
                                <p class="font-black text-cyan-400 text-xl mb-2">${rappel.Component || 'Composant non spécifié'}</p>
                                <p class="text-slate-200 text-base mb-3 leading-relaxed">${rappel.Summary || 'Détails non disponibles'}</p>
                                <div class="flex flex-wrap gap-2 text-sm">
                                    <span class="recall-badge px-3 py-1.5 rounded-lg font-bold">NHTSA</span>
                                    ${rappel.Manufacturer ? `<span class="success-badge px-3 py-1.5 rounded-lg font-bold">${rappel.Manufacturer}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>`;
            });
            html += `</div></div>`;
            resultsDiv.innerHTML = html;
        } else {
            resultsDiv.innerHTML = `
                <div class="glass rounded-3xl p-8 border-l-4 border-green-500 slide-up">
                    <div class="flex items-center gap-4 mb-3">
                        <i data-lucide="check-circle" class="w-10 h-10 text-green-400"></i>
                        <div>
                            <h3 class="text-3xl font-black text-green-400">✅ Aucun rappel actif</h3>
                            <p class="text-slate-400 text-lg font-semibold">VIN: ${vin}</p>
                        </div>
                    </div>
                    <p class="text-slate-200 text-lg mt-4 leading-relaxed">Ce véhicule ne présente pas de campagnes de rappel enregistrées dans les bases officielles.</p>
                </div>`;
        }
        lucide.createIcons();
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="glass rounded-3xl p-8 border-l-4 border-amber-500 slide-up">
                <div class="flex items-center gap-4 mb-3">
                    <i data-lucide="wifi-off" class="w-8 h-8 text-amber-400"></i>
                    <h3 class="text-2xl font-black text-amber-400">Erreur de connexion</h3>
                </div>
                <p class="text-slate-300 text-lg">Impossible de contacter l'API de rappels. Vérifiez votre connexion 4G/5G/WiFi.</p>
            </div>`;
        lucide.createIcons();
    }
}

// ==========================================
// 8. PRÉCONISATIONS CONSTRUCTEUR
// ==========================================
function initFiltresEntretien() {
    const marques = [...new Set(megaBase.map(v => v.marque))].sort();
    const selectMarque = document.getElementById('filter-marque');
    if (!selectMarque) return;
    
    selectMarque.innerHTML = '<option value="">🏷️ Sélectionner la Marque</option>';
    marques.forEach(m => {
        selectMarque.innerHTML += `<option value="${m}">${m}</option>`;
    });
}

function updateModeles() {
    const marque = document.getElementById('filter-marque').value;
    const selectModele = document.getElementById('filter-modele');
    const selectMoteur = document.getElementById('filter-moteur');
    
    if (!selectModele || !selectMoteur) return;
    
    selectModele.innerHTML = '<option value="">🚗 Sélectionner le Modèle</option>';
    selectMoteur.innerHTML = '<option value="">⚙️ Motorisation</option>';
    selectMoteur.disabled = true;

    if (marque) {
        const modeles = [...new Set(megaBase.filter(v => v.marque === marque).map(v => v.modele))].sort();
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
    
    if (!selectMoteur) return;
    
    selectMoteur.innerHTML = '<option value="">⚙️ Motorisation</option>';

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

    if (!vehicule || !resultsDiv) return;

    let html = `
        <div class="glass rounded-3xl p-8 border-t-4 border-cyan-500 slide-up">
            <div class="flex items-start gap-5 mb-8">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-2xl">
                    <i data-lucide="car" class="w-8 h-8 text-white"></i>
                </div>
                <div class="flex-1">
                    <h3 class="text-3xl font-black mb-2">${vehicule.marque} ${vehicule.modele}</h3>
                    <p class="text-cyan-400 font-mono text-lg mb-3 font-bold">${vehicule.motorisation} | Code: ${vehicule.codeMoteur} | ${vehicule.puissance} | ${vehicule.annee}</p>
                    ${vehicule.notes ? `<p class="text-amber-400 text-base italic font-semibold">⚠️ ${vehicule.notes}</p>` : ''}
                </div>
            </div>
            
            <div class="space-y-5">`;

    const paliers = ["15000", "20000", "25000", "30000", "40000", "50000", "60000", "75000", "80000", "90000", "100000", "120000", "125000", "160000"];
    paliers.forEach(km => {
        const operations = vehicule.entretiens[km];
        if (operations && operations.length > 0) {
            html += `
                <div class="bg-slate-800/60 rounded-2xl p-6 border-2 border-slate-700 hover:border-cyan-500/60 transition-all">
                    <div class="flex flex-col md:flex-row md:items-center gap-5">
                        <div class="km-badge text-white px-6 py-4 rounded-xl text-center min-w-[140px] text-xl">
                            ${parseInt(km).toLocaleString()} km
                        </div>
                        <ul class="flex-1 space-y-3">
                            ${operations.map(op => `
                                <li class="flex items-start gap-3 text-base text-slate-100 font-medium">
                                    <i data-lucide="check-circle" class="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0"></i>
                                    <span class="leading-relaxed">${op}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>`;
        }
    });

    if (vehicule.dtc && vehicule.dtc.length > 0) {
        html += `
            <div class="mt-8 pt-8 border-t-2 border-slate-700">
                <h4 class="font-black text-xl text-slate-200 mb-4 flex items-center gap-3">
                    <i data-lucide="alert-circle" class="w-6 h-6 text-red-400"></i>
                    Codes DTC fréquents
                </h4>
                <div class="flex flex-wrap gap-3">
                    ${vehicule.dtc.map(d => `<span class="dtc-badge px-4 py-2 rounded-xl text-sm font-mono text-white font-black">${d}</span>`).join('')}
                </div>
            </div>`;
    }

    if (vehicule.rappels && vehicule.rappels.length > 0) {
        html += `
            <div class="mt-6 pt-6 border-t-2 border-slate-700">
                <h4 class="font-black text-xl text-slate-200 mb-4 flex items-center gap-3">
                    <i data-lucide="alert-triangle" class="w-6 h-6 text-amber-400"></i>
                    Campagnes / Rappels
                </h4>
                <div class="space-y-3">
                    ${vehicule.rappels.map(r => `
                        <div class="bg-amber-900/30 border-2 border-amber-500/40 rounded-xl p-4">
                            <p class="text-amber-100 text-base font-semibold leading-relaxed">${r}</p>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    }

    html += `</div></div>`;
    resultsDiv.innerHTML = html;
    lucide.createIcons();
}

// ==========================================
// 9. RECHERCHE MEGA BASE
// ==========================================
function rechercherMegaBase() {
    const query = document.getElementById('mega-search').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('megabase-results');
    
    if (!resultsDiv) return;
    
    if (query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
    }

    const resultats = megaBase.filter(v => 
        (v.marque && v.marque.toLowerCase().includes(query)) ||
        (v.modele && v.modele.toLowerCase().includes(query)) ||
        (v.codeMoteur && v.codeMoteur.toLowerCase().includes(query)) ||
        (v.dtc && v.dtc.some(d => d.toLowerCase().includes(query))) ||
        (v.rappels && v.rappels.some(r => r.toLowerCase().includes(query)))
    ).slice(0, 25);

    if (resultats.length === 0) {
        resultsDiv.innerHTML = `<div class="text-center text-slate-500 py-12 text-lg font-semibold">Aucune correspondance trouvée.</div>`;
        return;
    }

    resultsDiv.innerHTML = resultats.map(v => `
        <div class="glass rounded-2xl p-6 card-shine cursor-pointer hover:border-cyan-500 transition-all" 
             onclick="naviguerVersVehicule('${v.marque.replace(/'/g, "\\'")}', '${v.modele.replace(/'/g, "\\'")}', '${v.codeMoteur.replace(/'/g, "\\'")}')">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <p class="font-black text-cyan-400 text-xl">${v.marque} ${v.modele}</p>
                    <p class="text-slate-300 text-base mt-2 font-semibold">${v.motorisation} (${v.codeMoteur}) • ${v.puissance}</p>
                    ${v.dtc && v.dtc.length > 0 ? `<p class="text-slate-400 text-sm mt-2">DTC: ${v.dtc.slice(0, 3).join(', ')}${v.dtc.length > 3 ? '...' : ''}</p>` : ''}
                </div>
                <i data-lucide="arrow-right" class="w-6 h-6 text-slate-500"></i>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function naviguerVersVehicule(marque, modele, codeMoteur) {
    showTab('entretien');
    
    setTimeout(() => {
        document.getElementById('filter-marque').value = marque;
        updateModeles();
        
        setTimeout(() => {
            document.getElementById('filter-modele').value = modele;
            updateMotorisations();
            
            setTimeout(() => {
                document.getElementById('filter-moteur').value = codeMoteur;
                afficherEntretien();
            }, 100);
        }, 100);
    }, 100);
}

// ==========================================
// 10. AUTHENTIFICATION SÉCURISÉE (CORRIGÉE)
// ==========================================
async function verifierAcces(event) {
    if (event) event.preventDefault();
    
    const input = document.getElementById('secure-code-input');
    const errorEl = document.getElementById('secure-error');
    
    if (!input) return;
    
    const code = input.value.trim();
    
    // Protection : rejet des valeurs autofill suspectes
    if (!code || code.toLowerCase() === 'admin' || code.length < 4) {
        if (errorEl) errorEl.classList.remove('hidden');
        input.value = '';
        showNotification('❌ Code d\'accès incorrect', 'error');
        return;
    }
    
    const hash = await hashPassword(code);
    
    if (hash === ADMIN_HASH) {
        isSecureModeActive = true;
        if (errorEl) errorEl.classList.add('hidden');
        
        const authEl = document.getElementById('secure-auth');
        const panelEl = document.getElementById('secure-panel');
        
        if (authEl) authEl.classList.add('hidden');
        if (panelEl) {
            panelEl.classList.remove('hidden');
            panelEl.classList.remove('admin-locked');
            panelEl.classList.add('admin-unlocked');
        }
        
        const sessionTime = document.getElementById('secure-session-time');
        if (sessionTime) {
            sessionTime.textContent = new Date().toLocaleTimeString('fr-FR');
        }
        
        // Session limitée à 30 minutes
        if (secureSessionTimeout) clearTimeout(secureSessionTimeout);
        secureSessionTimeout = setTimeout(() => fermerSessionSecurisee(), SESSION_DURATION);
        
        showNotification('✅ Accès déverrouillé', 'success');
        input.value = ''; // Nettoyage après succès
    } else {
        if (errorEl) errorEl.classList.remove('hidden');
        showNotification('❌ Code d\'accès incorrect', 'error');
        input.value = ''; // Nettoyage après échec
    }
}

function fermerSessionSecurisee() {
    isSecureModeActive = false;
    
    const authEl = document.getElementById('secure-auth');
    const panelEl = document.getElementById('secure-panel');
    
    if (authEl) authEl.classList.remove('hidden');
    if (panelEl) {
        panelEl.classList.add('hidden');
        panelEl.classList.add('admin-locked');
    }
    
    // Nettoyage complet
    const input = document.getElementById('secure-code-input');
    if (input) input.value = '';
    
    if (secureSessionTimeout) {
        clearTimeout(secureSessionTimeout);
        secureSessionTimeout = null;
    }
    
    showNotification('🔒 Session fermée', 'info');
}

// Compatibilité ascendante
function verifierAdmin() { verifierAcces(null); }
function deconnecterAdmin() { fermerSessionSecurisee(); }
function resetAdminForm() { resetSecureForm(); }

// ==========================================
// 11. GESTION DE LA BASE (AJOUT/IMPORT/EXPORT)
// ==========================================
function ajouterEntree(event) {
    event.preventDefault();
    
    if (!isSecureModeActive) {
        showNotification('⚠️ Accès non autorisé', 'error');
        return;
    }
    
    const form = event.target;
    
    const nouvelleEntree = {
        marque: form.marque.value.trim(),
        modele: form.modele.value.trim(),
        motorisation: "À définir",
        codeMoteur: form.codeMoteur.value.trim().toUpperCase(),
        puissance: form.puissance.value.trim(),
        annee: "À définir",
        typeCarburant: "À définir",
        entretiens: { 
            "30000": ["Vidange"], 
            "60000": ["Vidange"], 
            "90000": ["Vidange"], 
            "120000": ["Vidange"], 
            "160000": ["Vidange"] 
        },
        dtc: [],
        rappels: [],
        notes: ""
    };
    
    // Tentative de parsing des préconisations
    try {
        const precon = JSON.parse(form.preconisations.value);
        if (typeof precon === 'object' && precon !== null) {
            nouvelleEntree.entretiens = precon;
        }
    } catch(e) {
        if (form.preconisations.value.trim()) {
            nouvelleEntree.entretiens["30000"] = [form.preconisations.value.trim()];
        }
    }

    megaBase.push(nouvelleEntree);
    sauvegarderLocalStorage();
    showNotification('✅ Fiche ajoutée à la méga base', 'success');
    form.reset();
    initFiltresEntretien();
}

function reinitialiserBase() {
    if (!isSecureModeActive) {
        showNotification('⚠️ Accès non autorisé', 'error');
        return;
    }
    
    if (confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser la base locale ? Cette action est irréversible.')) {
        megaBase = [...megaBaseInitiale];
        localStorage.removeItem('kevFusion_megaBase');
        showNotification('🔄 Base réinitialisée', 'warning');
        initFiltresEntretien();
    }
}

function sauvegarderLocalStorage() {
    try {
        localStorage.setItem('kevFusion_megaBase', JSON.stringify(megaBase));
        showNotification('💾 Sauvegarde locale effectuée', 'success');
    } catch (e) {
        showNotification('❌ Erreur de sauvegarde', 'error');
        console.error('Erreur sauvegarde:', e);
    }
}

function exporterJSON() {
    try {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(megaBase, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `kev_fusion_megabase_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showNotification('📥 Export JSON téléchargé', 'success');
    } catch (e) {
        showNotification('❌ Erreur lors de l\'export', 'error');
    }
}

function importerJSON(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                fusionnerDonnees(importedData, 'import');
                sauvegarderLocalStorage();
                showNotification(`✅ Import réussi : ${megaBase.length} véhicules`, 'success');
                initFiltresEntretien();
            } else {
                showNotification('❌ Format de fichier invalide', 'error');
            }
        } catch (err) {
            showNotification('❌ Erreur lors de la lecture du fichier', 'error');
            console.error('Erreur import:', err);
        }
    };
    reader.readAsText(file);
    
    // Reset du champ fichier
    input.value = '';
}

// ==========================================
// 12. STATISTIQUES
// ==========================================
function afficherStats() {
    const statsContainer = document.getElementById('stats-container');
    const fuelStats = document.getElementById('fuel-stats');
    const syncDetails = document.getElementById('sync-details');
    
    if (!statsContainer) return;
    
    const totalVehicules = megaBase.length;
    const totalMarques = [...new Set(megaBase.map(v => v.marque))].length;
    const totalDTC = megaBase.reduce((acc, v) => acc + (v.dtc ? v.dtc.length : 0), 0);
    const totalRappels = megaBase.reduce((acc, v) => acc + (v.rappels ? v.rappels.length : 0), 0);
    
    statsContainer.innerHTML = `
        <div class="stat-card rounded-2xl p-6">
            <div class="flex items-center gap-3 mb-3">
                <i data-lucide="car" class="w-8 h-8 text-cyan-400"></i>
                <span class="text-slate-400 font-bold text-sm uppercase">Véhicules</span>
            </div>
            <p class="text-4xl font-black text-white">${totalVehicules}</p>
        </div>
        <div class="stat-card rounded-2xl p-6">
            <div class="flex items-center gap-3 mb-3">
                <i data-lucide="tag" class="w-8 h-8 text-purple-400"></i>
                <span class="text-slate-400 font-bold text-sm uppercase">Marques</span>
            </div>
            <p class="text-4xl font-black text-white">${totalMarques}</p>
        </div>
        <div class="stat-card rounded-2xl p-6">
            <div class="flex items-center gap-3 mb-3">
                <i data-lucide="alert-circle" class="w-8 h-8 text-red-400"></i>
                <span class="text-slate-400 font-bold text-sm uppercase">Codes DTC</span>
            </div>
            <p class="text-4xl font-black text-white">${totalDTC}</p>
        </div>
        <div class="stat-card rounded-2xl p-6">
            <div class="flex items-center gap-3 mb-3">
                <i data-lucide="alert-triangle" class="w-8 h-8 text-amber-400"></i>
                <span class="text-slate-400 font-bold text-sm uppercase">Rappels</span>
            </div>
            <p class="text-4xl font-black text-white">${totalRappels}</p>
        </div>
    `;
    
    if (fuelStats) {
        const carburants = {};
        megaBase.forEach(v => {
            if (v.typeCarburant) {
                carburants[v.typeCarburant] = (carburants[v.typeCarburant] || 0) + 1;
            }
        });
        
        fuelStats.innerHTML = Object.entries(carburants).map(([type, count]) => {
            const percentage = ((count / totalVehicules) * 100).toFixed(1);
            return `
                <div class="glass rounded-2xl p-5">
                    <div class="flex justify-between items-center mb-3">
                        <span class="font-bold text-lg text-white">${type}</span>
                        <span class="text-slate-400 font-semibold">${count} (${percentage}%)</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    if (syncDetails) {
        syncDetails.innerHTML = `
            <div class="glass rounded-2xl p-5">
                <div class="flex items-center justify-between mb-3">
                    <span class="font-bold text-lg text-white">Auto-Diagnostic</span>
                    <span class="font-semibold ${syncStatus.autoDiagnostic === 'success' ? 'text-green-400' : syncStatus.autoDiagnostic === 'failed' ? 'text-red-400' : 'text-slate-400'}">
                        ${syncStatus.autoDiagnostic === 'success' ? '✅ Synchronisé' : syncStatus.autoDiagnostic === 'failed' ? '❌ Échec' : '⏳ En attente'}
                    </span>
                </div>
            </div>
            <div class="glass rounded-2xl p-5">
                <div class="flex items-center justify-between mb-3">
                    <span class="font-bold text-lg text-white">My-Tech by Kevin</span>
                    <span class="font-semibold ${syncStatus.myTech === 'success' ? 'text-green-400' : syncStatus.myTech === 'failed' ? 'text-red-400' : 'text-slate-400'}">
                        ${syncStatus.myTech === 'success' ? '✅ Synchronisé' : syncStatus.myTech === 'failed' ? '❌ Échec' : '⏳ En attente'}
                    </span>
                </div>
            </div>
            ${syncStatus.lastSync ? `
                <div class="glass rounded-2xl p-5">
                    <p class="text-slate-400 text-sm font-semibold">Dernière synchronisation : ${new Date(syncStatus.lastSync).toLocaleString('fr-FR')}</p>
                </div>
            ` : ''}
        `;
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ==========================================
// 13. NOTIFICATIONS
// ==========================================
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-cyan-500'
    };
    
    notification.className = `notification ${colors[type] || colors.info} text-white px-6 py-4 rounded-2xl shadow-2xl font-bold`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';
        notification.style.transition = 'all 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// ==========================================
// 14. INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Mise à jour du statut réseau
    updateNetworkStatus();
    
    // Initialisation des filtres
    initFiltresEntretien();
    
    // Protection anti-autofill
    protegerContreAutofill();
    
    // Chargement depuis localStorage
    const saved = localStorage.getItem('kevFusion_megaBase');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                megaBase = parsed;
                console.log('✅ Base chargée depuis localStorage:', megaBase.length, 'véhicules');
            }
        } catch (e) {
            console.error('Erreur chargement localStorage:', e);
        }
    }
    
    // Synchronisation initiale si en ligne
    setTimeout(() => {
        if (navigator.onLine) {
            synchroniserBases();
        }
    }, 3000);
    
    // Synchronisation automatique toutes les 5 minutes si session active
    setInterval(() => {
        if (navigator.onLine && isSecureModeActive) {
            synchroniserBases();
        }
    }, 5 * 60 * 1000);
    
    // Nettoyage final des champs
    setTimeout(nettoyerChampsSecurises, 100);
    
    // Initialisation des icônes
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Gestion de la touche Enter sur le champ sécurisé
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.id === 'secure-code-input') {
        verifierAcces(e);
    }
});
