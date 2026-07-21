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
    specialization: "Palliative Care & Elderly Support",
    experience: "8 years exp.",
    location: "Seattle, WA",
    rating: "4.9 (42 reviews)",
    availability: "Mon – Fri",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80",
    description: "Provides daily palliative support to elderly patients in low-income community housing.",
    emoji: "👩‍⚕️",
    publicKey: "GCYRYFQXKWKPI74B23SKUZXQOKIY6CZUUS7AWDGX6MRPNKGVSEKTDAEL",
  },
  {
    id: "david-miller",
    name: "David Miller",
    role: "Volunteer Nurse",
    specialization: "Geriatric & Pediatric Nursing",
    experience: "6 years exp.",
    location: "Portland, OR",
    rating: "4.8 (31 reviews)",
    availability: "Weekends",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80",
    description: "Administers free medical checkups and basic care at local community centers.",
    emoji: "👨‍⚕️",
    publicKey: "GA6I3NHCV6MZWTUVZYACWYFAQXQXV24IE5XTTOMPWAVNHR4MZN5ROCG4",
  },
];

export function findCaregiverById(id) {
  return CAREGIVERS.find((c) => c.id === id) || null;
}
