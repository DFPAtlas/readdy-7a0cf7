// Third parties that process personal data on LetHub's behalf.
// Shown on /gdpr and /dpa. Keep in step with the services actually in use.

export interface SubProcessor {
  name: string;
  purpose: string;
  location: string;
}

export const SUB_PROCESSORS: SubProcessor[] = [
  { name: "Supabase", purpose: "Database, file storage, authentication and server functions", location: "United Kingdom (London, AWS eu-west-2)" },
  { name: "Vercel", purpose: "Website and application hosting", location: "United States, with global edge network" },
  { name: "Stripe", purpose: "Subscription billing and card payments", location: "United States and Ireland" },
  { name: "Resend", purpose: "Transactional email (sign-in codes, invitations, reminders, receipts)", location: "United States" },
];
