// Which statutory tenancy regime applies to a residential letting.
//
// England: Phase 1 of the Renters' Rights Act 2025 commenced on 1 May 2026.
// Assured shorthold tenancies and section 21 were abolished; new and existing
// private tenancies are assured periodic tenancies. A fixed term can no longer
// be granted. The legacy AST regime is only used for historical tenancies that
// ended before commencement (e.g. when importing past records).
//
// Wales, Scotland and Northern Ireland keep their own regimes.
//
// Keep supabase/functions/create-tenancy/index.ts in step with this file.

export type Nation = "england" | "wales" | "scotland" | "northern_ireland";

export type TenancyRegime =
  | "assured_periodic_rra"
  | "ast_legacy"
  | "occupation_contract_wales"
  | "prt_scotland"
  | "ni_private_tenancy";

export const RRA_COMMENCEMENT_DATE = "2026-05-01";

export interface RegimeRule {
  regime: TenancyRegime;
  /** True when the regime does not allow a fixed end date. */
  periodicOnly: boolean;
  label: string;
  explanation: string;
}

export function regimeForTenancy(nation: string | null | undefined, endDate?: string | null): RegimeRule {
  switch (nation) {
    case "wales":
      return {
        regime: "occupation_contract_wales",
        periodicOnly: false,
        label: "Occupation contract (Wales)",
        explanation: "Renting Homes (Wales) Act 2016 standard occupation contract.",
      };
    case "scotland":
      return {
        regime: "prt_scotland",
        periodicOnly: true,
        label: "Private residential tenancy (Scotland)",
        explanation: "Scottish private residential tenancies are open-ended and have no fixed end date.",
      };
    case "northern_ireland":
      return {
        regime: "ni_private_tenancy",
        periodicOnly: false,
        label: "Private tenancy (Northern Ireland)",
        explanation: "Private Tenancies (Northern Ireland) Order 2006.",
      };
    case "england":
    default:
      if (endDate && endDate < RRA_COMMENCEMENT_DATE) {
        return {
          regime: "ast_legacy",
          periodicOnly: false,
          label: "Assured shorthold tenancy (ended before 1 May 2026)",
          explanation: "Historical record of a tenancy that ended before the Renters' Rights Act commenced.",
        };
      }
      return {
        regime: "assured_periodic_rra",
        periodicOnly: true,
        label: "Assured periodic tenancy (Renters' Rights Act)",
        explanation:
          "Since 1 May 2026 private tenancies in England are assured periodic tenancies with no fixed end date. Possession requires a Section 8 ground.",
      };
  }
}

export const REGIME_LABELS: Record<TenancyRegime, string> = {
  assured_periodic_rra: "Assured periodic tenancy (Renters' Rights Act)",
  ast_legacy: "Assured shorthold tenancy (pre-May 2026)",
  occupation_contract_wales: "Occupation contract (Wales)",
  prt_scotland: "Private residential tenancy (Scotland)",
  ni_private_tenancy: "Private tenancy (Northern Ireland)",
};
