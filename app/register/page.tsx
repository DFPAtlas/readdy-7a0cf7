"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const plans = {
  starter: { name: "Starter", monthly: 29, annual: 24 },
  professional: { name: "Professional", monthly: 79, annual: 66 },
  business: { name: "Business", monthly: 199, annual: 166 },
} as const;

type PlanSlug = keyof typeof plans;
type BillingCycle = "monthly" | "annual";
type RegistrationRole = "estate_agent_admin" | "landlord";

const roleOptions: Array<{ value: RegistrationRole; label: string; description: string }> = [
  { value: "estate_agent_admin", label: "Letting or estate agent", description: "Manage an agency, team and property portfolio." },
  { value: "landlord", label: "Landlord", description: "Manage your own properties and tenancies." },
];

const steps = ["Account", "Business", "Plan", "Review"];

function safePlan(value: string | null): PlanSlug {
  return value && value in plans ? value as PlanSlug : "starter";
}

function safeCycle(value: string | null): BillingCycle {
  return value === "annual" ? "annual" : "monthly";
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<RegistrationRole>("estate_agent_admin");
  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [portfolioSize, setPortfolioSize] = useState("1-5");
  const [planSlug, setPlanSlug] = useState<PlanSlug>(() => safePlan(searchParams.get("plan")));
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(() => safeCycle(searchParams.get("billing")));
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState(false);
  const [accountReady, setAccountReady] = useState(false);

  const selectedPlan = plans[planSlug];
  const displayedPrice = billingCycle === "annual" ? selectedPlan.annual : selectedPlan.monthly;

  const canContinue = useMemo(() => {
    if (step === 0) return fullName.trim().length > 1 && email.includes("@") && password.length >= 8 && password === confirmPassword;
    if (step === 1) return businessName.trim().length > 1;
    if (step === 2) return Boolean(planSlug && billingCycle);
    return agreed;
  }, [step, fullName, email, password, confirmPassword, businessName, planSlug, billingCycle, agreed]);

  const submit = async () => {
    setError("");
    if (!agreed) return setError("You must agree to the Terms of Service and Privacy Policy.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            requested_role: role,
            role,
            agency_name: businessName.trim(),
            business_phone: businessPhone.trim() || null,
            portfolio_size: portfolioSize,
            desired_plan: planSlug,
            desired_billing_cycle: billingCycle,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("The account could not be created.");

      if (!data.session) {
        setConfirmationEmail(true);
        return;
      }

      const { error: profileError } = await supabase.functions.invoke("complete-registration", {
        body: { role, full_name: fullName.trim() },
      });
      if (profileError) throw new Error(`Account created, but profile setup failed: ${profileError.message}`);

      const { data: checkout, error: checkoutError } = await supabase.functions.invoke("create-subscription-checkout", {
        body: {
          plan_slug: planSlug,
          billing_cycle: billingCycle,
          request_id: crypto.randomUUID(),
        },
      });

      if (checkoutError || !checkout?.url) {
        setAccountReady(true);
        setError(checkout?.error || checkoutError?.message || "Your account is ready, but Stripe Checkout could not be opened.");
        return;
      }

      window.location.assign(checkout.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  if (confirmationEmail) {
    return (
      <StatusCard icon="ri-mail-check-line" title="Confirm your email">
        <p>We created your LetHub account. Confirm the link sent to <strong>{email}</strong>, then sign in.</p>
        <p className="mt-2">Your subscription and free trial will not begin until you complete Stripe Checkout.</p>
        <Link href="/login" className="mt-6 inline-block w-full rounded-lg bg-[#C28A78] py-3 font-medium text-white">Go to sign in</Link>
      </StatusCard>
    );
  }

  if (accountReady) {
    return (
      <StatusCard icon="ri-user-check-line" title="Your account is ready">
        <p>Your profile was created securely, but checkout was not completed.</p>
        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <Link href={`/dashboard/billing?plan=${planSlug}&billing=${billingCycle}`} className="mt-6 inline-block w-full rounded-lg bg-[#C28A78] py-3 font-medium text-white">Continue to billing</Link>
      </StatusCard>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <Link href="/" className="font-['Pacifico'] text-3xl text-[#C28A78]">LetHub</Link>
          <h1 className="mt-4 text-2xl font-bold text-[#3A3F3A]">Create your account</h1>
          <p className="mt-1 text-sm text-[#687068]">Your plan becomes active only after secure Stripe Checkout.</p>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-2">
          {steps.map((label, index) => (
            <button key={label} type="button" onClick={() => index < step && setStep(index)} className={`rounded-full px-2 py-2 text-xs font-medium ${index === step ? "bg-[#C28A78] text-white" : index < step ? "bg-emerald-50 text-emerald-700" : "bg-white text-[#94A3B8]"}`}>
              {index + 1}. {label}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          {error && !accountReady && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          {step === 0 && (
            <div className="space-y-4">
              <Field label="Full name"><input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" className="input" /></Field>
              <Field label="Work email"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="input" /></Field>
              <Field label="Password">
                <div className="flex rounded-lg border border-[#D5D9D5]">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" className="min-w-0 flex-1 rounded-lg px-3 py-2.5 text-sm outline-none" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="px-3 text-[#687068]" aria-label="Toggle password visibility"><i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i></button>
                </div>
              </Field>
              <Field label="Confirm password"><input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" className="input" /></Field>
              {confirmPassword && password !== confirmPassword && <p className="text-xs text-red-600">Passwords do not match.</p>}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {roleOptions.map((option) => (
                  <button key={option.value} type="button" onClick={() => setRole(option.value)} className={`rounded-xl border p-4 text-left ${role === option.value ? "border-[#C28A78] bg-[#C28A78]/5" : "border-[#E2E8F0]"}`}>
                    <p className="font-semibold text-[#3A3F3A]">{option.label}</p>
                    <p className="mt-1 text-xs text-[#687068]">{option.description}</p>
                  </button>
                ))}
              </div>
              <Field label={role === "estate_agent_admin" ? "Agency name" : "Portfolio or business name"}><input value={businessName} onChange={(event) => setBusinessName(event.target.value)} className="input" /></Field>
              <Field label="Business phone (optional)"><input value={businessPhone} onChange={(event) => setBusinessPhone(event.target.value)} className="input" /></Field>
              <Field label="Approximate portfolio size">
                <select value={portfolioSize} onChange={(event) => setPortfolioSize(event.target.value)} className="input">
                  {['1-5', '6-20', '21-50', '51-200', '201-500', '500+'].map((size) => <option key={size} value={size}>{size} properties</option>)}
                </select>
              </Field>
              <p className="rounded-lg bg-[#F8FAFC] p-3 text-xs text-[#687068]">Tenant and contractor accounts are created through secure invitations from an agent or landlord.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex rounded-lg bg-[#F1F5F9] p-1">
                {(["monthly", "annual"] as BillingCycle[]).map((cycle) => (
                  <button key={cycle} type="button" onClick={() => setBillingCycle(cycle)} className={`flex-1 rounded-md py-2 text-sm font-medium capitalize ${billingCycle === cycle ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068]"}`}>{cycle}</button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {(Object.keys(plans) as PlanSlug[]).map((slug) => {
                  const item = plans[slug];
                  const price = billingCycle === "annual" ? item.annual : item.monthly;
                  return (
                    <button key={slug} type="button" onClick={() => setPlanSlug(slug)} className={`rounded-xl border p-4 text-left ${planSlug === slug ? "border-[#C28A78] bg-[#C28A78]/5" : "border-[#E2E8F0]"}`}>
                      <p className="font-semibold text-[#3A3F3A]">{item.name}</p>
                      <p className="mt-2 text-2xl font-bold text-[#3A3F3A]">£{price}</p>
                      <p className="text-xs text-[#687068]">per month{billingCycle === "annual" ? ", billed annually" : ""}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[#687068]">The final amount and trial terms are loaded from the approved Stripe Price during Checkout.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-xl bg-[#F8FAFC] p-5">
                <div className="flex justify-between"><span className="text-sm text-[#687068]">Account</span><strong className="text-sm text-[#3A3F3A]">{fullName}</strong></div>
                <div className="mt-3 flex justify-between"><span className="text-sm text-[#687068]">Business</span><strong className="text-sm text-[#3A3F3A]">{businessName}</strong></div>
                <div className="mt-3 flex justify-between"><span className="text-sm text-[#687068]">Plan requested</span><strong className="text-sm text-[#3A3F3A]">{selectedPlan.name} · £{displayedPrice}/month</strong></div>
              </div>
              <label className="flex items-start gap-3 text-sm text-[#687068]"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1" /><span>I agree to the Terms of Service and Privacy Policy. I understand that subscription access begins only when Stripe confirms Checkout.</span></label>
            </div>
          )}

          <div className="mt-7 flex items-center justify-between">
            <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0 || loading} className="rounded-lg border border-[#D5D9D5] px-5 py-2.5 text-sm font-medium text-[#687068] disabled:opacity-40">Back</button>
            {step < 3 ? (
              <button type="button" onClick={() => setStep((value) => value + 1)} disabled={!canContinue} className="rounded-lg bg-[#C28A78] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40">Continue</button>
            ) : (
              <button type="button" onClick={submit} disabled={!canContinue || loading} className="rounded-lg bg-[#C28A78] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40">{loading ? "Creating account..." : "Create account & checkout"}</button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[#687068]">Already registered? <Link href="/login" className="font-medium text-[#C28A78]">Sign in</Link></p>
      </div>
      <style jsx>{`.input{width:100%;border:1px solid #D5D9D5;border-radius:.5rem;padding:.625rem .75rem;font-size:.875rem;outline:none;background:#fff}.input:focus{border-color:#C28A78}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-[#3A3F3A]">{label}</span>{children}</label>;
}

function StatusCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FBF9F4] px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#C28A78]/10"><i className={`${icon} text-3xl text-[#C28A78]`}></i></div>
        <h1 className="mt-5 text-2xl font-bold text-[#3A3F3A]">{title}</h1>
        <div className="mt-3 text-sm leading-6 text-[#687068]">{children}</div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#FBF9F4]" />}><RegisterForm /></Suspense>;
}
