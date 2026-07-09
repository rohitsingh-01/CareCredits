/**
 * caregivers.js — Shared caregiver directory data.
 * CareCredits — Level 3 (Orange Belt)
 *
 * Single source of truth used by both index.html (renders the
 * directory cards) and wallet.html (looks up a caregiver's display
 * name when arriving via a "Select" link with a `?care=<id>` param).
 */

export const REGISTRY_CONTRACT_ID = "CBHFP5CZ7JMWIBL4CT4HCSIWWEACQQOQJPPN3YWXCIJOMVNYISXU24U7";

export const CAREGIVERS = [
  {
    id: "sarah-jenkins",
    name: "Sarah Jenkins",
    role: "Hospice Caregiver",
    description: "Provides daily palliative support to elderly patients in low-income community housing.",
    emoji: "👩‍⚕️",
    publicKey: "GCYRYFQXKWKPI74B23SKUZXQOKIY6CZUUS7AWDGX6MRPNKGVSEKTDAEL",
  },
  {
    id: "david-miller",
    name: "David Miller",
    role: "Volunteer Nurse",
    description: "Administers free medical checkups and basic care at local community centers.",
    emoji: "👨‍⚕️",
    publicKey: "GA6I3NHCV6MZWTUVZYACWYFAQXQXV24IE5XTTOMPWAVNHR4MZN5ROCG4",
  },
];

export function findCaregiverById(id) {
  return CAREGIVERS.find((c) => c.id === id) || null;
}
