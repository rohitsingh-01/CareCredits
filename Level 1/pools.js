// AUTO-SYNCED SNAPSHOT — DO NOT EDIT DIRECTLY. Source of truth: repo root. Run 'npm run sync-belt-folders' after changing root files.

/**
 * pools.js — Multi-Pool Manager for CareCredits.
 * Level 4 (Green Belt) — Milestone 5.
 *
 * Manages dynamic registry of CareFundPool contract instances on Stellar Testnet.
 * Provides active pool selection, local storage persistence, and pool metadata lookup.
 */

(function (window) {
  const STORAGE_KEY = 'carecredits_active_pool_id';

  const DEFAULT_POOLS = [
    {
      id: 'CDSBFPVCUE6V7HAEMUYY5RSOXV34TIC5EKJZMBEG3J3XKXIERA2EV6CN',
      title: '💙 Primary Family Support Pool',
      caregiver: 'GCX7XQS7HUZRPZIUK4GLXN2WXJKEXPUFRLH7LOKPOSZ6ZCARIYZ5GGMV',
      caregiverName: 'Sarah Jenkins, RN',
      organization: 'St. Jude Community Hospice',
      goalXlm: 50.0,
      description: 'Community pool funding home hospice care and daily medical supplies for elderly patients.',
    },
    {
      id: 'CDYIHXTJFHHL4RFDEDIJ4CA2LTTYDQXAPIKJ4KRRQYJYFGCPJZHE4224',
      title: '🌿 Hospice Caregiver Relief Fund',
      caregiver: 'GA3IGBR6O2K44PQLP4W5J7Y7H8J8K9K0L1M2N3O4P5Q6R7S8T9U0VWXYZ',
      caregiverName: 'Marcus Vance',
      organization: 'Grace Elderly Care',
      goalXlm: 100.0,
      description: 'Dedicated fund providing respite care stipends and specialized mobility equipment.',
    },
    {
      id: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
      title: '👶 Pediatric Emergency Care Pool',
      caregiver: 'GBDTF5W4E4E63B2HHD6T7Y8U9I0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C',
      caregiverName: 'Dr. Elena Rostova',
      organization: 'Hope Children’s Health Trust',
      goalXlm: 75.0,
      description: 'Emergency micro-funding for pediatric prescription co-pays and travel grants.',
    },
  ];

  let poolsList = [...DEFAULT_POOLS];
  let activePoolId = DEFAULT_POOLS[0].id;

  function loadStoredActivePool() {
    try {
      const storedId = localStorage.getItem(STORAGE_KEY);
      if (storedId && poolsList.some(p => p.id === storedId)) {
        activePoolId = storedId;
      }
    } catch (_) {}
  }

  function saveActivePool(id) {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (_) {}
  }

  function getAllPools() {
    return poolsList;
  }

  function getActivePool() {
    loadStoredActivePool();
    return poolsList.find(p => p.id === activePoolId) || poolsList[0];
  }

  function setActivePool(id) {
    const found = poolsList.find(p => p.id === id);
    if (!found) return false;
    activePoolId = id;
    saveActivePool(id);
    return true;
  }

  function addPool(poolObj) {
    if (!poolObj || !poolObj.id) return false;
    if (!poolsList.some(p => p.id === poolObj.id)) {
      poolsList.push(poolObj);
    }
    return true;
  }

  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    poolsList = [...DEFAULT_POOLS];
    activePoolId = DEFAULT_POOLS[0].id;
  }

  const CarePools = {
    getAllPools,
    getActivePool,
    setActivePool,
    addPool,
    reset,
  };

  window.CarePools = CarePools;
  loadStoredActivePool();
})(window);
