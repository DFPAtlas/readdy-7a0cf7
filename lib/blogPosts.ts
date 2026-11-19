import type { HelpBlock } from "@/lib/helpArticles";

// Guides published on /blog. Each post lists its sources; re-check them and
// update `updated` whenever the law or government guidance changes.

export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  published: string; // ISO date
  updated: string; // ISO date
  readingMinutes: number;
  body: HelpBlock[];
  sources: { title: string; url: string }[];
}

const NOT_LEGAL_ADVICE =
  "This guide is general information for letting agents in England, correct as of the date shown. It isn't legal advice. Check GOV.UK and take advice from a solicitor before acting on a specific case.";

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "renters-rights-act-what-changed",
    title: "The Renters' Rights Act: what changed on 1 May 2026",
    summary: "A plain-English recap of the first phase of the Act for letting agents in England, and what it means for day-to-day management.",
    published: "2026-11-18",
    updated: "2026-11-18",
    readingMinutes: 6,
    body: [
      { type: "note", text: NOT_LEGAL_ADVICE },
      { type: "p", text: "The Renters' Rights Act 2025 became law on 27 October 2025. Its first phase, covering tenancy reform, came into force in England on 1 May 2026. Six months on, these are the changes that matter most for letting agents." },
      { type: "h2", text: "Every tenancy is now periodic" },
      { type: "p", text: "Assured shorthold tenancies converted to assured periodic tenancies on 1 May 2026, and new private tenancies start as periodic tenancies with no fixed end date. Tenants can leave at any time by giving two months' notice." },
      { type: "h2", text: "Section 21 is gone" },
      { type: "p", text: "Landlords can no longer end a tenancy without giving a reason. Possession now needs a ground under Section 8 of the Housing Act 1988, and many notice periods are longer than before. Our guide to Section 8 grounds and notice periods covers the most common ones." },
      { type: "h2", text: "Written information for tenants" },
      { type: "p", text: "Tenants who start a tenancy on or after 1 May 2026 must be given certain written information, usually in the tenancy agreement. For tenancies that already existed and had a written agreement, landlords didn't need a new agreement, but had to give tenants the government's Renters' Rights Act Information Sheet by 31 May 2026. Councils have said failing to do so can lead to a fine of up to £7,000, so check your records if you took on management of a property after that date." },
      { type: "h2", text: "Rent: increases, bidding and rent in advance" },
      { type: "list", items: [
        "Rent review clauses no longer work. Rent can only go up once a year, using a Section 13 notice that gives at least two months' notice of the new rent.",
        "Tenants can challenge an increase they think is above market rent. For now challenges go to the First-tier Tribunal. The government announced in September 2026 that HMRC's Valuation Office will take over these decisions, but no start date has been set.",
        "You must publish an asking rent and can't invite or accept offers above it.",
        "You can't ask for more than one month's rent in advance, and only after the tenancy agreement has been signed and before the tenancy starts.",
      ] },
      { type: "h2", text: "Discrimination and pets" },
      { type: "p", text: "Blanket bans on letting to people who receive benefits or have children are now unlawful. Tenants can also ask to keep a pet, and the landlord can only refuse for a reasonable reason, such as a superior lease that forbids pets." },
      { type: "h2", text: "What comes next" },
      { type: "list", items: [
        "The landlord database, called Register your rental property, opens on 15 December 2026, region by region. See our guide to registration dates.",
        "Membership of a new private rented sector landlord ombudsman is expected to become mandatory in 2028.",
        "Awaab's Law and the Decent Homes Standard for private rented homes are still subject to consultation, with dates to be confirmed.",
      ] },
      { type: "h2", text: "How LetHub handles it" },
      { type: "p", text: "LetHub records new tenancies in England as assured periodic tenancies automatically, and keeps rent, arrears and compliance history in one place so you can see where each tenancy stands." },
    ],
    sources: [
      { title: "Renters' Rights Act: an overview for landlords (GOV.UK)", url: "https://www.gov.uk/guidance/renters-rights-act-an-overview-for-landlords" },
      { title: "Renters' Rights Act overview for tenants (GOV.UK)", url: "https://www.gov.uk/guidance/renters-rights-act-overview-for-tenants" },
      { title: "Implementing the Renters' Rights Act 2025: roadmap (GOV.UK, PDF)", url: "https://assets.publishing.service.gov.uk/media/6915beb8bc34c86ce4e6e730/Implementing_Renters_Rights_Act_2025_-_roadmap.pdf" },
      { title: "Stronger protections and greater confidence for renters (GOV.UK press release)", url: "https://www.gov.uk/government/news/stronger-protections-and-greater-confidence-for-renters" },
      { title: "Renters' Rights Act: information for landlords and letting agents (Woking Borough Council)", url: "https://www.woking.gov.uk/housing/private-rented-housing/renters-rights-act-information-landlords-letting-agents" },
    ],
  },
  {
    slug: "section-8-grounds-and-notice-periods",
    title: "Section 8 grounds and notice periods after the Renters' Rights Act",
    summary: "With Section 21 abolished, Section 8 is the only route to possession in England. Here are the grounds agents use most and the notice each needs.",
    published: "2026-11-18",
    updated: "2026-11-18",
    readingMinutes: 5,
    body: [
      { type: "note", text: NOT_LEGAL_ADVICE },
      { type: "p", text: "Since 1 May 2026, a landlord in England who wants a tenant to leave must serve notice under Section 8 of the Housing Act 1988, relying on one or more grounds in Schedule 2. The Act added new grounds, changed some existing ones and lengthened many notice periods." },
      { type: "h2", text: "Mandatory and discretionary grounds" },
      { type: "p", text: "If a mandatory ground is proved, the court must make a possession order. For a discretionary ground, the court also has to decide that it's reasonable to do so. Either way, the ground has to be proved; the court won't make an order just because notice was served." },
      { type: "h2", text: "The grounds agents meet most often" },
      { type: "list", items: [
        "Ground 1 (landlord or close family moving in): mandatory, four months' notice, and can't be used to end a tenancy in its first 12 months.",
        "Ground 1A (selling the property): new and mandatory, four months' notice, with the same 12-month protection.",
        "Ground 6 (redevelopment): four months' notice.",
        "Ground 8 (serious rent arrears): mandatory, four weeks' notice. At least three months' rent (or 13 weeks' rent if paid weekly or fortnightly) must be owed both when notice is served and at the hearing. Arrears caused by delays in Universal Credit payments don't count towards the threshold.",
        "Ground 10 (some rent arrears) and Ground 11 (persistent late payment): discretionary, four weeks' notice.",
      ] },
      { type: "p", text: "Under the old rules Ground 8 needed two months' arrears and two weeks' notice. In practice a tenant may now be around four months in arrears before a claim can be issued, so it pays to act on arrears early and keep clear records." },
      { type: "h2", text: "Getting the notice right" },
      { type: "list", items: [
        "Use the current prescribed form and the right notice period for every ground you rely on.",
        "Serve every joint tenant, and keep proof of service such as a certificate of posting.",
        "Once the landlord database is live in your region, registration becomes a precondition for relying on most possession grounds. Make sure your landlords register on time.",
      ] },
      { type: "h2", text: "How LetHub helps" },
      { type: "p", text: "LetHub keeps each tenancy's rent and arrears history in one place and when each tenant was last reminded, so the figures and records you need before serving a Ground 8, 10 or 11 notice are easy to find." },
    ],
    sources: [
      { title: "Section 8 notices: a guide for landlords in England (NRLA)", url: "https://www.nrla.org.uk/resources/ending-your-tenancy/section-8-notice" },
      { title: "A new era for possession under the Renters' Rights Act (Trowers & Hamlins)", url: "https://www.trowers.com/insights/a-new-era-for-possession-under-the-renters-rights-act" },
      { title: "Grounds for possession under the Renters' Rights Act 2025 (Cornerstone Barristers)", url: "https://cornerstonebarristers.com/grounds-for-possession-under-the-renters-rights-act-2025/" },
      { title: "Section 8 notices: a complete guide (Osbornes Law)", url: "https://osborneslaw.com/blog/section-8-notices/" },
      { title: "Renters' Rights Act update: landlord registration and rent challenges (Forsters)", url: "https://www.forsters.co.uk/p/102o0mh/renters-rights-act-update-landlord-registration-scheme-and-rent-challenge-refor" },
    ],
  },
  {
    slug: "register-your-rental-property-dates",
    title: "Register your rental property: dates for every region",
    summary: "The landlord database opens on 15 December 2026. Here's when each region's three-month window opens and closes, and what agents should do now.",
    published: "2026-11-18",
    updated: "2026-11-18",
    readingMinutes: 4,
    body: [
      { type: "note", text: NOT_LEGAL_ADVICE },
      { type: "p", text: "The Act's private rented sector database has a public name: Register your rental property. Landlords who let homes in England on assured or regulated tenancies must register themselves and each property, and pay a fee of £65 per property each year. During the rollout the first fee is pro-rated." },
      { type: "h2", text: "Deadlines go by where the property is" },
      { type: "p", text: "The requirement starts one region at a time, on the 15th of each month, and each region then has three months to register. The deadline depends on where the property is, not where the landlord lives. Landlords can register properties in any region from 15 December 2026." },
      { type: "list", items: [
        "West Midlands: opens 15 December 2026, deadline 14 March 2027",
        "East of England: opens 15 January 2027, deadline 14 April 2027",
        "East Midlands: opens 15 February 2027, deadline 14 May 2027",
        "South East: opens 15 March 2027, deadline 14 June 2027",
        "Yorkshire and the Humber: opens 15 April 2027, deadline 14 July 2027",
        "North West: opens 15 May 2027, deadline 14 August 2027",
        "North East: opens 15 June 2027, deadline 14 September 2027",
        "London: opens 15 July 2027, deadline 14 October 2027",
        "South West: opens 15 August 2027, deadline 14 November 2027",
      ] },
      { type: "h2", text: "Why it matters" },
      { type: "list", items: [
        "After a region's deadline, marketing or letting an unregistered property can lead to a financial penalty.",
        "Registration numbers will need to appear on adverts.",
        "Registration becomes a precondition for relying on most possession grounds.",
      ] },
      { type: "h2", text: "What agents should do now" },
      { type: "steps", items: [
        "Group your managed properties by region and note each deadline.",
        "Tell each landlord their deadline. The registration duty sits with the landlord, but GOV.UK has guidance on how agents can help.",
        "Collect what registration asks for: landlord details, property details, tenancy details and compliance information such as gas, electrical and EPC certificates.",
        "Plan for the annual renewal and fee.",
      ] },
      { type: "h2", text: "Also announced" },
      { type: "p", text: "Alongside the registration dates, the government said HMRC's Valuation Office will take over initial decisions on rent increase challenges from the First-tier Tribunal. No date has been set, so for now challenges still go to the tribunal. Mandatory membership of the new landlord ombudsman is expected in 2028." },
      { type: "h2", text: "How LetHub helps" },
      { type: "p", text: "LetHub already holds the property, tenancy and certificate details registration asks for. Keep compliance records up to date in LetHub and you'll have everything ready when your landlords' regions open." },
    ],
    sources: [
      { title: "Register your rental property service: guidance for landlords (GOV.UK)", url: "https://www.gov.uk/guidance/register-your-rental-property-service-guidance-for-landlords" },
      { title: "Register your rental property service: guidance for letting agents and property managers (GOV.UK)", url: "https://www.gov.uk/guidance/register-your-rental-property-service-guidance-for-letting-agents-and-property-managers" },
      { title: "Stronger protections and greater confidence for renters (GOV.UK press release)", url: "https://www.gov.uk/government/news/stronger-protections-and-greater-confidence-for-renters" },
      { title: "Register Your Rental Property Service (NRLA)", url: "https://www.nrla.org.uk/resources/renters-rights/landlord-database-register-your-rental-property-service" },
      { title: "RRA phase 2: register your rental property service (Bevan Brittan)", url: "https://www.bevanbrittan.com/insights/articles/2026/rra-phase-2-register-your-rental-property-service-and-update-on-rent-increase-challenges/" },
      { title: "Government launches private rental registration service (Landlord Today)", url: "https://www.landlordtoday.co.uk/breaking-news/2026/09/government-launches-private-rental-registration-service/" },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
