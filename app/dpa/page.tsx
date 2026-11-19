import type { Metadata } from "next";
import Link from "next/link";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { COMPANY, POLICY } from "@/lib/companyDetails";
import { SUB_PROCESSORS } from "@/lib/subProcessors";

export const metadata: Metadata = {
  title: "Data Processing Agreement | LetHub",
  description:
    "How LetHub processes tenant, landlord and contractor personal data on behalf of letting agents, as required by Article 28 UK GDPR, including our sub-processors.",
  alternates: { canonical: "/dpa" },
};

export default function DpaPage() {
  return (
    <LegalPage
      title="Data Processing Agreement"
      icon="ri-shield-user-line"
      intro={
        <>
          When a letting agency or landlord uses LetHub, they decide what personal data about their landlords, tenants and
          contractors goes into the platform. They are the <strong>controller</strong> of that data and we process it for them
          as their <strong>processor</strong>. This agreement sets out the terms required by Article 28 of the UK GDPR. It forms
          part of our <Link href="/terms" className="text-[#C28A78] underline">Terms of Service</Link> and applies automatically
          to every customer account.
        </>
      }
    >
      <LegalSection heading="1. Parties">
        <p>
          The <strong>Customer</strong> (the agency, landlord or organisation holding a LetHub account) is the controller.{" "}
          {COMPANY.legalName}, a company registered in England and Wales (Company No. {COMPANY.companyNumber}), registered office{" "}
          {COMPANY.registeredOffice} (<strong>LetHub</strong>), is the processor. Where LetHub processes personal data for its own
          purposes, such as billing its customers or running its website, it is a controller and our{" "}
          <Link href="/privacy" className="text-[#C28A78] underline">Privacy Policy</Link> applies instead.
        </p>
      </LegalSection>

      <LegalSection heading="2. Details of the processing">
        <LegalList
          items={[
            <><strong>Subject matter and purpose:</strong> providing the LetHub property management platform, including storing records, sending messages and notifications the Customer initiates, generating documents, and hosting landlord, tenant and contractor portals.</>,
            <><strong>Duration:</strong> for as long as the Customer has an account, plus the deletion period in section 9.</>,
            <><strong>Nature of processing:</strong> collection, storage, organisation, retrieval, display, transmission by email, and deletion.</>,
            <><strong>Categories of data subjects:</strong> the Customer&apos;s staff; landlords and property owners; tenants, occupiers and guarantors; contractors; and other contacts the Customer records.</>,
            <><strong>Types of personal data:</strong> names and contact details; property addresses; tenancy details; rent, deposit and payment records; arrears and possession case records; maintenance and inspection records, including photos; compliance documents; right-to-rent check records; messages; and portal sign-in details.</>,
            <><strong>Special category and criminal offence data:</strong> LetHub is not designed to hold these. The Customer is responsible for having a lawful basis and an appropriate policy document if it chooses to record them.</>,
          ]}
        />
      </LegalSection>

      <LegalSection heading="3. Our obligations as processor">
        <p>LetHub will:</p>
        <LegalList
          items={[
            "process the personal data only on the Customer's documented instructions, which are given through the Customer's use and configuration of the platform and through these terms, unless UK law requires otherwise (in which case we will tell the Customer first unless the law prohibits it);",
            "tell the Customer promptly if we believe an instruction breaches data protection law;",
            "ensure everyone authorised to access the personal data is bound by confidentiality;",
            "take the security measures described in section 5;",
            "only use sub-processors as described in section 6;",
            "help the Customer, taking into account the nature of the processing, to respond to requests from people exercising their data protection rights;",
            "help the Customer meet its obligations on security, breach notification, data protection impact assessments and prior consultation with the Information Commissioner;",
            "delete or return the personal data at the end of the service, as described in section 9; and",
            "make available the information needed to demonstrate compliance with Article 28, and allow for and contribute to reasonable audits, as described in section 8.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="4. Customer obligations">
        <p>
          The Customer is responsible for having a lawful basis for the personal data it puts into LetHub, giving people the
          privacy information they are entitled to, keeping the data accurate, and deciding how long records are kept to meet its
          own legal obligations (for example tax, anti-money-laundering, deposit protection and housing law requirements).
        </p>
      </LegalSection>

      <LegalSection heading="5. Security">
        <LegalList
          items={[
            "Data is encrypted in transit (TLS) and at rest.",
            "Database access is restricted by row-level security, so each account can only reach its own records and the portals it has granted.",
            "Staff sign in with one-time email codes; platform administrator access is limited and logged.",
            "Dependencies are checked for known vulnerabilities on every code change.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="6. Sub-processors">
        <p>
          The Customer gives general authorisation for LetHub to use the sub-processors listed below. We impose data protection
          obligations on each sub-processor that are no less protective than these terms, and we remain responsible for their
          performance.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="text-left py-2 px-3 font-semibold text-[#3A3F3A]">Sub-processor</th>
                <th className="text-left py-2 px-3 font-semibold text-[#3A3F3A]">Purpose</th>
                <th className="text-left py-2 px-3 font-semibold text-[#3A3F3A]">Location</th>
              </tr>
            </thead>
            <tbody>
              {SUB_PROCESSORS.map((sp) => (
                <tr key={sp.name} className="border-b border-[#E2E8F0]">
                  <td className="py-2 px-3 font-medium">{sp.name}</td>
                  <td className="py-2 px-3">{sp.purpose}</td>
                  <td className="py-2 px-3">{sp.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          We will give at least {POLICY.subProcessorNoticeDays} days&apos; notice by email before adding or replacing a
          sub-processor. If the Customer objects on reasonable data protection grounds and we cannot resolve the objection, the
          Customer may end its subscription and receive a pro-rata refund of any prepaid fees for the remaining period.
        </p>
      </LegalSection>

      <LegalSection heading="7. International transfers">
        <p>
          The LetHub database and file storage are hosted in the United Kingdom. Where a sub-processor processes personal data
          outside the UK, the transfer is covered by UK adequacy regulations or by appropriate safeguards in that provider&apos;s
          data processing terms, such as the UK International Data Transfer Agreement or the UK Addendum to the EU Standard
          Contractual Clauses.
        </p>
      </LegalSection>

      <LegalSection heading="8. Personal data breaches and audits">
        <p>
          If we become aware of a personal data breach affecting the Customer&apos;s data, we will notify the Customer without
          undue delay and in any event within {POLICY.breachNotificationHours} hours, with the information we have at the time,
          so the Customer can meet its own reporting obligations.
        </p>
        <p>
          On reasonable written request (no more than once a year unless there has been a breach or a regulator requires it), we
          will provide the information needed to demonstrate compliance with these terms, such as completed security
          questionnaires and our sub-processors&apos; certifications.
        </p>
      </LegalSection>

      <LegalSection heading="9. End of service">
        <p>
          When a subscription ends, the account becomes read-only for {POLICY.retentionAfterCancellationDays} days so the Customer
          can export its data from <strong>Settings &rarr; Your data</strong> (or the <strong>Your data</strong> link in the landlord and tenant portals). After that period we delete the personal data,
          including from active systems, and it ages out of backups on our provider&apos;s normal backup cycle, unless UK law
          requires us to keep it. The Customer can ask us to delete its data sooner.
        </p>
      </LegalSection>

      <LegalSection heading="10. Contact">
        <p>
          Data protection questions: <a href="mailto:privacy@lethub.uk" className="text-[#C28A78] underline">privacy@lethub.uk</a>
          <br />
          Post: Data Protection, {COMPANY.legalName}, {COMPANY.registeredOffice}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
