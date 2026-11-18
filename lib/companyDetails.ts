// The legal entity behind LetHub, used on the Privacy, Terms, GDPR and Cookie
// pages. Fill these in with the real details before launch.
// `npm run check:launch` fails while any value is still a placeholder.

export const COMPANY = {
  legalName: "[Company legal name]",
  companyNumber: "[Company number]",
  registeredOffice: "[Registered office address]",
  icoRegistration: "[ICO registration number]",
  legalPagesLastUpdated: "[Date]",
} as const;

export function isPlaceholder(value: string): boolean {
  return /^\[.*\]$/.test(value.trim());
}
