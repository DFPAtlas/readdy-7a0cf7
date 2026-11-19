import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Accessibility Statement | LetHub",
  description: "How accessible LetHub is, known issues we're fixing, and how to get help or report a problem.",
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <LegalPage
      title="Accessibility statement"
      icon="ri-accessibility-line"
      intro={
        <>
          We want everyone who uses LetHub, including agents, landlords, tenants and contractors, to be able to do so easily.
          This statement covers the lethub.uk website, the LetHub dashboard and the landlord, tenant and contractor portals.
        </>
      }
    >
      <LegalSection heading="Our goal">
        <p>
          We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. You should be able to:
        </p>
        <LegalList
          items={[
            "zoom to 200% without content becoming unusable;",
            "use the main tasks with a keyboard alone;",
            "use a screen reader on the sign-in pages and the tenant and landlord portals;",
            "turn off animations using your device's reduced-motion setting.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="How accessible LetHub is today">
        <p>
          LetHub is partially compliant with WCAG 2.2 AA. We have not yet had a full independent audit. Issues we know about and
          are fixing:
        </p>
        <LegalList
          items={[
            "Some icon-only buttons in the dashboard don't yet have text labels for screen readers.",
            "Some status badges rely on colour as well as text, and a few colour combinations may not meet contrast requirements.",
            "Some charts in the dashboard don't yet have a text or table alternative.",
            "Uploaded documents such as PDFs are provided by agents and may not be accessible.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="Getting information in another format">
        <p>
          If you need something on LetHub in a different format, such as large print, an accessible PDF or a plain-text email,
          or you&apos;re a tenant who needs help using the portal, email{" "}
          <a href="mailto:support@lethub.uk" className="text-[#C28A78] underline">support@lethub.uk</a>. We&apos;ll reply within
          five working days. If you rent through a letting agent, you can also ask your agent directly.
        </p>
      </LegalSection>

      <LegalSection heading="Reporting a problem">
        <p>
          If you find an accessibility problem that isn&apos;t listed here, please tell us at{" "}
          <a href="mailto:support@lethub.uk" className="text-[#C28A78] underline">support@lethub.uk</a>. Tell us the page and
          what you were trying to do, and we&apos;ll respond within five working days.
        </p>
      </LegalSection>

      <LegalSection heading="Reviewing this statement">
        <p>We will review this statement after an accessibility audit, and at least once a year.</p>
      </LegalSection>
    </LegalPage>
  );
}
