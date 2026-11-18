-- LetHub Migration 015: Renters' Rights Act possession grounds (England)
-- Forward-only, idempotent. Verify the live migration ledger before applying
-- (see supabase/SCHEMA_AUTHORITY.md). Next migration after this must be 016.
--
-- Purpose:
--   Seed the full set of Schedule 2 Housing Act 1988 grounds for possession,
--   as amended by the Renters' Rights Act 2025 (in force for private assured
--   tenancies in England from 1 May 2026). Previously only grounds 1, 1A and 8
--   were present.
--
-- Notice periods follow the table in s.8(4AA) Housing Act 1988 (inserted by
-- s.3 Renters' Rights Act 2025). The schema stores weeks, so statutory
-- "months" are stored as 4 weeks per month; the possession workflow must
-- calculate the actual expiry date in calendar months from the date of
-- service. Grounds 7A and 14 have no minimum notice period (stored as 0).
--
-- Grounds that need "prior notice" in the tenancy agreement or written
-- statement (1B, 2ZA-2ZD, 4, 5-5H, 6A, 18) are flagged in the name so the UI
-- can warn agents.
--
-- This list must be reviewed by a housing solicitor before it is relied on in
-- the product. RLS on public.possession_grounds is unchanged.

BEGIN;

INSERT INTO public.possession_grounds (code, name, is_mandatory, notice_weeks, requires_evidence, nation) VALUES
  -- Mandatory grounds (Part 1)
  ('GROUND_1',   'Occupation by landlord or family',                               true, 16, true, 'england'),
  ('GROUND_1A',  'Sale of the property',                                           true, 16, true, 'england'),
  ('GROUND_1B',  'Sale under rent-to-buy agreement (prior notice required)',       true, 16, true, 'england'),
  ('GROUND_2',   'Sale by mortgage lender',                                        true, 16, true, 'england'),
  ('GROUND_2ZA', 'Superior lease ends (prior notice required)',                    true, 16, true, 'england'),
  ('GROUND_2ZB', 'Fixed-term superior lease ends (prior notice required)',         true, 16, true, 'england'),
  ('GROUND_2ZC', 'Possession by superior landlord (prior notice required)',        true, 16, true, 'england'),
  ('GROUND_2ZD', 'Possession by superior landlord, fixed term (prior notice required)', true, 16, true, 'england'),
  ('GROUND_4',   'Student accommodation (prior notice required)',                  true, 2,  true, 'england'),
  ('GROUND_4A',  'Property let to students, needed for new students',              true, 16, true, 'england'),
  ('GROUND_5',   'Minister of religion (prior notice required)',                   true, 8,  true, 'england'),
  ('GROUND_5A',  'Occupation by agricultural worker (prior notice required)',      true, 8,  true, 'england'),
  ('GROUND_5B',  'Occupation by person meeting employment requirements (prior notice required)', true, 8, true, 'england'),
  ('GROUND_5C',  'End of employment by landlord (prior notice required)',          true, 8,  true, 'england'),
  ('GROUND_5D',  'End of employment requirements (prior notice required)',         true, 8,  true, 'england'),
  ('GROUND_5E',  'Occupation as supported accommodation (prior notice required)',  true, 4,  true, 'england'),
  ('GROUND_5F',  'Dwelling occupied as supported accommodation (prior notice required)', true, 4, true, 'england'),
  ('GROUND_5G',  'Tenancy granted under homelessness duty (prior notice required)', true, 4, true, 'england'),
  ('GROUND_5H',  'Stepping-stone accommodation (prior notice required)',           true, 8,  true, 'england'),
  ('GROUND_6',   'Property required for redevelopment',                            true, 16, true, 'england'),
  ('GROUND_6A',  'Decant accommodation (prior notice required)',                   true, 16, true, 'england'),
  ('GROUND_6B',  'Compliance with enforcement action',                             true, 16, true, 'england'),
  ('GROUND_7',   'Death of the tenant',                                            true, 8,  true, 'england'),
  ('GROUND_7A',  'Serious antisocial behaviour (conviction or order)',             true, 0,  true, 'england'),
  ('GROUND_7B',  'Tenant does not have a right to rent',                           true, 2,  true, 'england'),
  ('GROUND_8',   'Serious rent arrears (at least 3 months or 13 weeks)',           true, 4,  true, 'england'),
  -- Discretionary grounds (Part 2)
  ('GROUND_9',   'Suitable alternative accommodation available',                   false, 8, true, 'england'),
  ('GROUND_10',  'Some rent arrears',                                              false, 4, true, 'england'),
  ('GROUND_11',  'Persistent delay in paying rent',                                false, 4, true, 'england'),
  ('GROUND_12',  'Breach of a tenancy obligation',                                 false, 2, true, 'england'),
  ('GROUND_13',  'Deterioration of the property',                                  false, 2, true, 'england'),
  ('GROUND_14',  'Nuisance, annoyance or illegal use',                             false, 0, true, 'england'),
  ('GROUND_14ZA','Conviction for an offence during a riot',                        false, 2, true, 'england'),
  ('GROUND_14A', 'Domestic abuse (social landlords)',                              false, 2, true, 'england'),
  ('GROUND_15',  'Deterioration of furniture',                                     false, 2, true, 'england'),
  ('GROUND_17',  'Tenancy granted because of a false statement',                   false, 2, true, 'england'),
  ('GROUND_18',  'Supported accommodation: tenant refuses to engage with support (prior notice required)', false, 4, true, 'england')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  is_mandatory = EXCLUDED.is_mandatory,
  notice_weeks = EXCLUDED.notice_weeks,
  requires_evidence = EXCLUDED.requires_evidence,
  nation = EXCLUDED.nation;

COMMIT;
