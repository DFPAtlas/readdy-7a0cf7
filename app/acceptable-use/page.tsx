import type { Metadata } from "next";
import Link from "next/link";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Acceptable Use Policy | LetHub",
  description: "What you may and may not do with LetHub, including its portals, messaging and file uploads.",
  alternates: { canonical: "/acceptable-use" },
};

export default function AcceptableUsePage() {
  return (
    <LegalPage
      title="Acceptable use policy"
      icon="ri-scales-3-line"
      intro={
        <>
          LetHub is shared by letting agents, landlords, tenants and contractors. This policy explains what isn&apos;t allowed,
          so the platform stays safe and lawful for everyone. It forms part of our{" "}
          <Link href="/terms" className="text-[#C28A78] underline">Terms of Service</Link> and applies to every user of every
          account, including people invited to a portal.
        </>
      }
    >
      <LegalSection heading="1. Lawful lettings">
        <p>You must not use LetHub to:</p>
        <LegalList
          items={[
            "break housing, consumer or equality law, including discriminating against prospective tenants in ways the law prohibits, such as because they receive benefits or have children;",
            "invite or accept rental bids above the advertised rent, or otherwise run lettings in a way the Renters' Rights Act 2025 prohibits;",
            "serve notices, demands or documents you know to be invalid or misleading, or harass tenants or try to evict them unlawfully;",
            "take holding deposits, deposits or rent in advance above the limits the law allows.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="2. Personal data">
        <LegalList
          items={[
            "Only add personal data you have a lawful basis to hold, and only about people connected to your lettings.",
            "Don't use contact details in LetHub for unsolicited marketing.",
            "Don't upload special category data (for example health information) or criminal records unless you have a clear legal basis and need to.",
            "Don't share portal invitations or sign-in codes with anyone other than the intended person.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="3. Messages and uploads">
        <p>Don&apos;t send or upload anything that:</p>
        <LegalList
          items={[
            "is abusive, threatening, harassing or discriminatory;",
            "contains malware, or links designed to trick people into revealing information;",
            "infringes someone else's copyright or other rights;",
            "is unrelated to managing lettings, such as bulk marketing or personal file storage.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="4. Security and fair use">
        <LegalList
          items={[
            "Don't try to access accounts, records or parts of LetHub you haven't been given access to, or probe, scan or test our security without written permission. To report a vulnerability, email security@lethub.uk.",
            "Don't overload the service, scrape it, or use automated tools other than our published API within its limits.",
            "Don't resell, sublicense or share access to LetHub outside your organisation unless your plan allows it.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="5. What happens if this policy is broken">
        <p>
          We may remove content, suspend a user or portal invitation, or suspend an account where we reasonably believe this
          policy has been broken, proportionate to the problem. Where we can, we&apos;ll tell the account owner first and give
          them a chance to put things right. We may report unlawful activity to the relevant authorities.
        </p>
        <p>
          To report misuse, email <a href="mailto:support@lethub.uk" className="text-[#C28A78] underline">support@lethub.uk</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
