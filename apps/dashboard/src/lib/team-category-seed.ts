import {
  CATEGORIES,
  getTaxRateForCategory,
  getTaxTypeForCountry,
} from "@midday/categories";

export type CreateTeamCategorySeedParent = {
  name: string;
  slug: string;
  color?: string | null;
  system?: boolean;
  excluded?: boolean;
  taxRate?: number | null;
  taxType?: string | null;
  children?: CreateTeamCategorySeedParent[];
};

/** Same tax/category seed as Midday `team.create` tRPC (AP-62) for Rust POST /team/create. */
export function buildCreateTeamCategorySeed(
  countryCode?: string | null,
): CreateTeamCategorySeedParent[] {
  return CATEGORIES.map((parent) => {
    const taxRate = getTaxRateForCategory(countryCode, parent.slug);
    const taxType = getTaxTypeForCountry(countryCode);
    return {
      name: parent.name,
      slug: parent.slug,
      color: parent.color,
      system: parent.system,
      excluded: parent.excluded,
      taxRate: taxRate > 0 ? taxRate : null,
      taxType: taxRate > 0 ? taxType : null,
      children: parent.children.map((child) => {
        const childTaxRate = getTaxRateForCategory(countryCode, child.slug);
        return {
          name: child.name,
          slug: child.slug,
          color: child.color,
          system: child.system,
          excluded: child.excluded,
          taxRate: childTaxRate > 0 ? childTaxRate : null,
          taxType: childTaxRate > 0 ? taxType : null,
        };
      }),
    };
  });
}
