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

// Policy choices used on the Subscription Terms and Data Processing Agreement
// pages. These are sensible defaults, not legal requirements: confirm them.
export const POLICY = {
  /** Days a cancelled account stays available (read-only) for export before deletion. */
  retentionAfterCancellationDays: 90,
  /** Days' notice given before adding or replacing a sub-processor. */
  subProcessorNoticeDays: 30,
  /** Maximum hours to notify a customer of a personal data breach affecting their data. */
  breachNotificationHours: 48,
} as const;

/**
 * Set to true only after a solicitor has reviewed the Privacy, Terms, GDPR,
 * Cookie, DPA, Subscription Terms and Acceptable Use pages.
 * `npm run check:launch` fails while this is false.
 */
export const LEGAL_PAGES_REVIEWED = false;

export function isPlaceholder(value: string): boolean {
  return /^\[.*\]$/.test(value.trim());
}
