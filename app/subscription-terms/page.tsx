import type { Metadata } from "next";
import Link from "next/link";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { COMPANY, POLICY } from "@/lib/companyDetails";

export const metadata: Metadata = {
  title: "Subscription and Cancellation Terms | LetHub",
  description: "How LetHub plans, free trials, billing, renewals, cancellations and refunds work.",
  alternates: { canonical: "/subscription-terms" },
};

export default function SubscriptionTermsPage() {
  return (
    <LegalPage
      title="Subscription and cancellation terms"
      icon="ri-bank-card-line"
      intro={
        <>
          How paying for LetHub works: plans, free trials, renewals, cancelling and refunds. These terms form part of our{" "}
          <Link href="/terms" className="text-[#C28A78] underline">Terms of Service</Link>. Current prices are on our{" "}
          <Link href="/pricing" className="text-[#C28A78] underline">pricing page</Link>.
        </>
      }
    >
      <LegalSection heading="1. Plans">
        <p>
          Each plan has limits on the number of properties and team members, and some features are only included in higher
          plans. You can see your plan, usage and limits at any time in <strong>Settings &rarr; Billing</strong>. If you reach a
          limit, you can upgrade or remove records to stay within it; we won&apos;t delete data because you hit a limit.
        </p>
      </LegalSection>

      <LegalSection heading="2. Free trial">
        <LegalList
          items={[
            "All plans include a 14-day free trial for new customers. Each organisation can have one free trial. You add a payment card at checkout to start it.",
            "You won't be charged during the trial. If you don't cancel before it ends, your subscription starts automatically and you'll be charged for the plan and billing period you chose.",
            "You can cancel during the trial from Settings → Billing and you won't be charged.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="3. Billing and renewal">
        <LegalList
          items={[
            "Subscriptions are billed in advance, monthly or annually, by card through our payment provider, Stripe. We never see or store your full card number.",
            "Your subscription renews automatically at the end of each billing period until you cancel.",
            "Any VAT due is shown at checkout and on your invoices. Invoices are available from the billing portal.",
            "We'll give you at least 30 days' notice by email before a price change affects your subscription. The new price applies from your next renewal after the notice period, and you can cancel before then.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="4. Changing plan">
        <p>
          You can upgrade at any time and the change takes effect straight away; Stripe charges or credits the difference for
          the rest of the billing period. Downgrades take effect at the end of the current billing period.
        </p>
      </LegalSection>

      <LegalSection heading="5. Failed payments">
        <p>
          If a payment fails, Stripe retries it and we email the account owner. Your account stays fully usable while we try to
          collect payment. If payment still can&apos;t be collected, your subscription is cancelled and the account becomes
          read-only, as described in section 6.
        </p>
      </LegalSection>

      <LegalSection heading="6. Cancelling">
        <LegalList
          items={[
            "You can cancel at any time from Settings → Billing. Cancellation takes effect at the end of the billing period you've paid for, and you keep full access until then.",
            `After that, your account becomes read-only for ${POLICY.retentionAfterCancellationDays} days. You can still sign in and export your data from Settings → Your data, and you can restart your subscription.`,
            `After ${POLICY.retentionAfterCancellationDays} days we delete your account data, as set out in our Data Processing Agreement. Tenants, landlords and contractors you invited lose portal access when your account is closed.`,
          ]}
        />
      </LegalSection>

      <LegalSection heading="7. Refunds">
        <p>
          Fees already paid aren&apos;t refundable for part-used billing periods, except where these terms say otherwise (for
          example, if you end your subscription because of a sub-processor change you&apos;ve objected to), where we have
          materially failed to provide the service, or where the law requires a refund.
        </p>
        <p>
          <strong>If you are a consumer</strong> (for example, a private landlord subscribing for your own lettings rather than
          as a business), you have a legal right to cancel within 14 days of starting a paid subscription. If you ask for the
          service to start during that period, we may deduct an amount for the service you have used. To cancel, email{" "}
          <a href="mailto:support@lethub.uk" className="text-[#C28A78] underline">support@lethub.uk</a>.
        </p>
      </LegalSection>

      <LegalSection heading="8. Contact">
        <p>
          Billing questions: <a href="mailto:support@lethub.uk" className="text-[#C28A78] underline">support@lethub.uk</a>
          <br />
          {COMPANY.legalName}, {COMPANY.registeredOffice}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
