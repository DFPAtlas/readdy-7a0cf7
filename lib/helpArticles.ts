// Help-centre articles. Each one describes the product as it actually works at
// launch; update the article in the same change as any UI it describes.

export type HelpBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "list"; items: string[] }
  | { type: "note"; text: string };

export interface HelpArticle {
  slug: string;
  category: HelpCategoryId;
  title: string;
  summary: string;
  updated: string; // ISO date
  body: HelpBlock[];
  related?: string[];
}

export type HelpCategoryId = "getting-started" | "tenancies" | "rent" | "portals" | "compliance" | "account";

export const HELP_CATEGORIES: { id: HelpCategoryId; title: string; icon: string }[] = [
  { id: "getting-started", title: "Getting started", icon: "ri-rocket-line" },
  { id: "tenancies", title: "Tenancies and the Renters' Rights Act", icon: "ri-scales-3-line" },
  { id: "rent", title: "Rent and arrears", icon: "ri-coins-line" },
  { id: "portals", title: "Landlord and tenant portals", icon: "ri-macbook-line" },
  { id: "compliance", title: "Compliance and maintenance", icon: "ri-shield-check-line" },
  { id: "account", title: "Account, billing and your data", icon: "ri-settings-3-line" },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "getting-started",
    category: "getting-started",
    title: "Getting started with LetHub",
    summary: "Create your agency account and work through the setup checklist, from agency profile to your first portal invite.",
    updated: "2026-11-18",
    body: [
      { type: "p", text: "This guide takes you from a new account to a working portfolio. Most agencies finish it in under an hour, or in a few minutes if you import from a spreadsheet." },
      { type: "h2", text: "1. Create your account" },
      { type: "steps", items: [
        "Go to lethub.uk and choose Start free trial.",
        "Enter your name, work email and a password of at least 8 characters.",
        "Choose Letting or estate agent, and enter your agency name.",
        "Pick a plan and monthly or annual billing, accept the terms, and complete the secure Stripe checkout. You add a card, but it isn't charged until your 14-day free trial ends.",
      ] },
      { type: "h2", text: "2. Work through the setup checklist" },
      { type: "p", text: "After you sign in for the first time, LetHub opens the setup checklist (Dashboard → Setup). Each step can be skipped and revisited later. The steps are:" },
      { type: "list", items: [
        "Agency profile: your trading name, address and contact details. These appear on emails sent to landlords and tenants.",
        "Portfolio import: bring in properties, landlords, tenants and tenancies from a spreadsheet, or skip to add them by hand.",
        "Landlords, properties, tenants and tenancies: check what was imported, or add records one at a time.",
        "Owner and tenant portals: invite landlords and tenants to their own sign-in.",
        "Compliance setup: record gas safety, EICR, EPC and deposit certificates so LetHub can warn you before they expire.",
      ] },
      { type: "h2", text: "3. Find your way around" },
      { type: "p", text: "The left-hand menu groups the main areas: Portfolio and Properties, Tenancies, Rent Collection and Arrears, Maintenance, Compliance, Inspections, Documents and Messages. Settings (bottom of the menu) holds your agency profile, notification preferences, billing and data export." },
      { type: "note", text: "LetHub is a tool to help you run your agency. It doesn't give legal advice; check anything you're unsure about with a solicitor or your professional body." },
    ],
    related: ["importing-your-portfolio", "creating-a-tenancy-renters-rights-act", "inviting-landlords-and-tenants"],
  },
  {
    slug: "adding-your-team",
    category: "getting-started",
    title: "Adding your team",
    summary: "Invite colleagues to your agency's LetHub account and choose what they can do.",
    updated: "2026-11-19",
    body: [
      { type: "p", text: "Agency administrators can invite colleagues from Settings → Team. How many people you can add depends on your plan; the Team page shows how many seats are used." },
      { type: "h2", text: "Invite someone" },
      { type: "steps", items: [
        "Go to Settings → Team.",
        "Enter their work email and, if you like, their name.",
        "Choose a role. Agents can manage properties, tenancies, rent, maintenance and compliance. Administrators can also manage billing, settings and the team.",
        "Choose Send invitation. They get an email with a link that works once and lasts 7 days.",
      ] },
      { type: "p", text: "When they open the link they set a password and land straight in your agency's dashboard. If they already have a LetHub login with that email, they sign in first and then accept." },
      { type: "h2", text: "Pending invitations" },
      { type: "list", items: [
        "Invitations that haven't been accepted appear under Pending invitations, and count towards your seats.",
        "Choose Cancel invite to withdraw one, for example if you used the wrong email. The link stops working straight away.",
        "If an invitation expires, send a new one.",
      ] },
      { type: "note", text: "To remove someone from your team, email support@lethub.uk from an administrator's address." },
    ],
    related: ["getting-started", "billing-and-your-subscription"],
  },
  {
    slug: "importing-your-portfolio",
    category: "getting-started",
    title: "Importing your portfolio from a spreadsheet",
    summary: "Bring properties, landlords, tenants, tenancies and more into LetHub from CSV or Excel files.",
    updated: "2026-11-18",
    body: [
      { type: "p", text: "If you're moving from another system or a spreadsheet, the importer saves you typing. Go to Dashboard → Import (or the Portfolio import step of the setup checklist)." },
      { type: "h2", text: "What you can import" },
      { type: "list", items: [
        "Properties, landlords, tenants and tenancies (CSV or Excel .xlsx)",
        "Compliance records and maintenance history (CSV or .xlsx)",
        "Contractors (CSV or .xlsx)",
        "Rent records and document details (CSV only)",
        "A complete portfolio in one batch",
      ] },
      { type: "p", text: "Import in this order if you're doing it in separate files: landlords, then properties, then tenants, then tenancies. Each file can then link to records that already exist." },
      { type: "h2", text: "The five steps" },
      { type: "steps", items: [
        "Upload: pick the data type and upload your file. Choose Download template if you'd like a file with the right column headings.",
        "Match fields: LetHub suggests which of your columns match its fields. Check each one, and set any column you don't need to be ignored.",
        "Validate: LetHub checks every row and lists problems, such as a missing postcode or a date it can't read. Fix them in your file and upload again, or carry on and skip those rows.",
        "Review: see how many records will be created before anything is saved.",
        "Import: LetHub creates the records and shows a results summary, including any rows it skipped and why.",
      ] },
      { type: "h2", text: "Tips" },
      { type: "list", items: [
        "Dates work best as DD/MM/YYYY.",
        "Rent should be the monthly amount, as a number without the £ sign.",
        "Tenancies in England that were assured shorthold tenancies became assured periodic tenancies on 1 May 2026. LetHub records live English tenancies as periodic whatever the file says. See Creating a tenancy under the Renters' Rights Act.",
        "You can see previous imports under Import history on the import page.",
      ] },
      { type: "note", text: "Large or messy files? Email support@lethub.uk and we'll help you prepare them." },
    ],
    related: ["getting-started", "creating-a-tenancy-renters-rights-act"],
  },
  {
    slug: "creating-a-tenancy-renters-rights-act",
    category: "tenancies",
    title: "Creating a tenancy under the Renters' Rights Act",
    summary: "How LetHub sets the tenancy type from the property's nation, and why English tenancies have no end date.",
    updated: "2026-11-18",
    body: [
      { type: "p", text: "From 1 May 2026, new private tenancies in England are assured periodic tenancies. Fixed terms and Section 21 'no fault' notices no longer apply to them, and existing assured shorthold tenancies converted to periodic tenancies on that date. LetHub follows these rules automatically." },
      { type: "h2", text: "Create the tenancy" },
      { type: "steps", items: [
        "Go to Tenancies and choose Create Tenancy (or open a property and create it from there).",
        "Pick the property and the tenant. Add the landlord (owner) if it isn't already linked to the property.",
        "Enter the start date, the monthly rent and the deposit.",
        "Check the tenancy-type panel. LetHub shows which regime applies, based on the nation the property is in.",
        "Choose Create Tenancy.",
      ] },
      { type: "h2", text: "How the tenancy type is decided" },
      { type: "list", items: [
        "England: assured periodic tenancy (Renters' Rights Act). There's no end date, so the end date field is switched off.",
        "Wales: occupation contract under the Renting Homes (Wales) Act 2016.",
        "Scotland: private residential tenancy. These are open-ended and have no end date.",
        "Northern Ireland: private tenancy under the Private Tenancies (Northern Ireland) Order 2006. You can choose a fixed term or periodic.",
      ] },
      { type: "p", text: "The type is also checked on our server when the tenancy is saved, so it can't be set to the wrong regime by mistake." },
      { type: "h2", text: "Things to check yourself" },
      { type: "list", items: [
        "Rent in advance: for tenancies in England you generally can't ask for more than one month's rent before the tenancy starts.",
        "Deposits must still be protected in a government-approved scheme and the prescribed information given.",
        "Written terms: tenants must be given a written statement of terms. For tenancies that existed before 1 May 2026, the government's information sheet had to be given by 31 May 2026.",
        "Ending a tenancy: landlords now need a Section 8 ground and the right notice period. See our guide to Section 8 grounds and notice periods.",
      ] },
      { type: "note", text: "This is a summary to help you use LetHub, not legal advice. See GOV.UK's guidance for landlords, or speak to a solicitor about a specific tenancy." },
    ],
    related: ["renters-rights-act-what-changed", "section-8-grounds-and-notice-periods", "rent-reminders-and-arrears"],
  },
  {
    slug: "inviting-landlords-and-tenants",
    category: "portals",
    title: "Inviting landlords and tenants to their portals",
    summary: "Send a secure invite so landlords can see their properties and tenants can report repairs.",
    updated: "2026-11-18",
    body: [
      { type: "p", text: "Landlords and tenants each get their own sign-in. Landlords see their properties, rent, maintenance and documents. Tenants see their tenancy, can report repairs and can message your team. They can only see records linked to them." },
      { type: "h2", text: "Send an invite" },
      { type: "steps", items: [
        "Go to Portal Setup and choose Invite.",
        "Pick the portal type: owner (landlord) or tenant.",
        "Pick the person. Only landlords and tenants with an email address on their record appear in the list.",
        "Add a short personal message if you like, then confirm.",
      ] },
      { type: "p", text: "You can also invite someone from their tenancy page. LetHub emails them a link that works once and expires after 7 days. When they open it they set up their sign-in, and their portal is ready." },
      { type: "h2", text: "If the invite doesn't arrive" },
      { type: "list", items: [
        "Ask them to check spam or junk folders for an email from LetHub.",
        "Check the email address on their landlord or tenant record.",
        "If 7 days have passed, send a new invite from Portal Setup. The old link stops working.",
      ] },
      { type: "h2", text: "What tenants can do" },
      { type: "list", items: [
        "See their tenancy details, rent and documents you've shared",
        "Report a repair, which arrives in your Maintenance list",
        "Read notices you send them, such as inspection and gas safety visits",
        "Download their data from the Your data link",
      ] },
    ],
    related: ["getting-started", "logging-maintenance-jobs"],
  },
  {
    slug: "rent-reminders-and-arrears",
    category: "rent",
    title: "Recording rent, sending receipts and chasing arrears",
    summary: "Record payments, send automatic receipts and send arrears reminders by email.",
    updated: "2026-11-18",
    body: [
      { type: "h2", text: "Record a payment" },
      { type: "steps", items: [
        "Go to Rent Collection and choose Record Payment.",
        "Pick the tenant, then enter the amount, date and payment method.",
        "Save. If the tenant has an email address, LetHub emails them a receipt automatically.",
      ] },
      { type: "h2", text: "Chase arrears" },
      { type: "p", text: "The Arrears page lists tenancies with overdue rent and when each tenant was last reminded." },
      { type: "steps", items: [
        "Use the bell icon on a row to remind one tenant, or Send Reminders to message several at once.",
        "Edit the suggested message so it fits your agency's tone. Keep it factual and offer a way to talk.",
        "Send. The reminder goes by email from your agency and is recorded against the tenancy.",
      ] },
      { type: "note", text: "LetHub doesn't currently send texts. Reminders are sent by email only." },
      { type: "h2", text: "If arrears continue" },
      { type: "p", text: "Under the Renters' Rights Act the mandatory rent-arrears ground (ground 8) needs at least three months' rent to be owed, both when notice is served and at the hearing, and needs four weeks' notice. LetHub's arrears totals help you see where a tenancy stands, but check the position with a solicitor before you serve notice." },
    ],
    related: ["creating-a-tenancy-renters-rights-act", "section-8-grounds-and-notice-periods"],
  },
  {
    slug: "logging-maintenance-jobs",
    category: "compliance",
    title: "Logging maintenance jobs and tracking compliance",
    summary: "Record repairs, receive tenant repair reports and keep certificates up to date.",
    updated: "2026-11-18",
    body: [
      { type: "h2", text: "Maintenance" },
      { type: "steps", items: [
        "Go to Maintenance and choose New Job.",
        "Pick the property, describe the problem and set a priority.",
        "Choose Log Job. The job moves through stages, from reported to completed, and shows who needs to act next.",
      ] },
      { type: "p", text: "Repairs reported by tenants in their portal appear in the same list, so nothing gets lost in email." },
      { type: "h2", text: "Compliance" },
      { type: "steps", items: [
        "Go to Compliance and choose Add Compliance Record.",
        "Pick the property and the certificate type, such as gas safety (CP12), EICR, EPC or deposit protection.",
        "Enter the issue and expiry dates and upload the certificate.",
      ] },
      { type: "p", text: "LetHub shows each property's status on the compliance dashboard and notifies you as expiry dates approach. You can choose how you're notified under Settings → Notifications." },
    ],
    related: ["inviting-landlords-and-tenants"],
  },
  {
    slug: "billing-and-your-subscription",
    category: "account",
    title: "Billing and your subscription",
    summary: "Choose a plan, update your card, download invoices or cancel.",
    updated: "2026-11-18",
    body: [
      { type: "p", text: "Billing is handled by Stripe. Go to Settings → Billing to see your plan, your trial status and your usage." },
      { type: "h2", text: "Choose or change a plan" },
      { type: "steps", items: [
        "On the Billing page, pick monthly or annual billing.",
        "Choose the plan you want. You'll go to a secure Stripe checkout page.",
        "Once you've paid you'll return to LetHub and the plan applies straight away.",
      ] },
      { type: "h2", text: "Update your card, get invoices or cancel" },
      { type: "p", text: "Choose Manage in Stripe on the Billing page. From Stripe's billing portal you can update your payment method, download past invoices, switch plans or cancel. When you cancel, your plan stays active until the end of the period you've paid for." },
      { type: "h2", text: "If a payment fails" },
      { type: "p", text: "Stripe retries the payment and emails you. Update your card in the billing portal to avoid interruption. If a subscription lapses, your account becomes read-only: you can still sign in and export your data, but you can't add or change records until you resubscribe." },
      { type: "p", text: "Full details are in our Subscription terms." },
    ],
    related: ["exporting-or-deleting-your-data"],
  },
  {
    slug: "exporting-or-deleting-your-data",
    category: "account",
    title: "Exporting or deleting your data",
    summary: "Download a copy of everything you can access, or ask us to close your account.",
    updated: "2026-11-18",
    body: [
      { type: "h2", text: "Download your data" },
      { type: "steps", items: [
        "Agency users: go to Settings → Your data. Landlords and tenants: choose Your data at the top of your portal.",
        "Choose Download my data.",
        "LetHub builds a single JSON file of every record you can access and downloads it to your device.",
      ] },
      { type: "p", text: "Agency administrators get their agency's whole portfolio. Landlords and tenants get the records linked to them. Uploaded files such as certificates and photos are listed by name but not included in the file. Ask us if you need copies of those." },
      { type: "h2", text: "Close your account" },
      { type: "steps", items: [
        "On the same page, choose Request account deletion.",
        "Tell us anything we should know, such as whether your whole agency is closing.",
        "Type DELETE to confirm and send the request.",
      ] },
      { type: "p", text: "We confirm by email and complete the request within one month. Some records, such as invoices, may have to be kept for longer by law; we'll tell you if that applies. Download your data first if you need a copy." },
    ],
    related: ["billing-and-your-subscription"],
  },
];

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}
