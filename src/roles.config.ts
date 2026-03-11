// roles.config.ts
export const ROLES = {
  rais: {
    label: "Boshqaruv Raisi",
    group: "superadmin",
    permissions: ["*"], // full access
  },
  rais_orinbosari: {
    label: "Rais O'rinbosari",
    group: "kuzatuvchi",
    permissions: ["view_all", "edit_all"],
  },
  boshqarma_boshi: {
    label: "Boshqarma Boshlig'i",
    group: "boshqaruvchi",
    permissions: ["view_dept", "edit_dept"],
  },
  uchastka_rahbari: { permissions: ["view_section"] },
  pto: { permissions: ["view_pto"] },
  buxgalter: { permissions: ["view_finance"] },
  iqtisod: { permissions: ["view_economics"] },
  kadr: { permissions: ["view_hr"] },
  xodim: { permissions: ["view_own"] },
};
