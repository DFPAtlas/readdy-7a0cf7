"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import { supabase } from "@/lib/supabaseClient"

const planNames: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  business: "Business",
}

const roles = [
  { value: "landlord", label: "Landlord" },
  { value: "tenant", label: "Tenant" },
  { value: "contractor", label: "Contractor" },
]

const businessTypes = [
  { value: "estate_agent", label: "Estate Agent / Letting Agent" },
  { value: "property_manager", label: "Property Manager" },
  { value: "independent_landlord", label: "Independent Landlord" },
  { value: "property_developer", label: "Property Developer" },
  { value: "other", label: "Other" },
]

const portfolioSizes = [
  { value: "1-5", label: "1–5 properties" },
  { value: "6-20", label: "6–20 properties" },
  { value: "21-50", label: "21–50 properties" },
  { value: "51-200", label: "51–200 properties" },
  { value: "201-500", label: "201–500 properties" },
  { value: "500+", label: "500+ properties" },
]

const steps = [
  { id: "account", label: "Account", num: 1 },
  { id: "agency", label: "Agency", num: 2 },
  { id: "plan", label: "Plan", num: 3 },
  { id: "review", label: "Review", num: 4 },
]

function RegisterForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedPlan = searchParams.get("plan") || "starter"
  const billingCycle = searchParams.get("billing") || "monthly"
  const planName = planNames[selectedPlan] || "Starter"

  const [step, setStep] = useState(0)

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [role, setRole] = useState("landlord")
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)

  const [agencyName, setAgencyName] = useState("")
  const [businessType, setBusinessType] = useState("estate_agent")
  const [businessTypeOpen, setBusinessTypeOpen] = useState(false)
  const [portfolioSize, setPortfolioSize] = useState("1-5")
  const [portfolioSizeOpen, setPortfolioSizeOpen] = useState(false)
  const [businessPhone, setBusinessPhone] = useState("")

  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const planPrice = selectedPlan === "starter" ? 29 : selectedPlan === "professional" ? 79 : 199
  const annualPrice = selectedPlan === "starter" ? 24 : selectedPlan === "professional" ? 66 : 166
  const displayPrice = billingCycle === "annual" ? annualPrice : planPrice
  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 14)
  const trialEndStr = trialEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  const firstChargeDate = new Date(trialEnd)
  firstChargeDate.setDate(firstChargeDate.getDate() + 1)
  const firstChargeStr = firstChargeDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const canGoNext = () => {
    if (step === 0) return form.fullName.trim() && form.email.trim() && form.password.length >= 8 && form.confirmPassword.length >= 8
    if (step === 1) return agencyName.trim()
    if (step === 2) return true
    if (step === 3) return agreed
    return false
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1)
    }
  }

  const handleSubmit = async () => {
    setError("")
    setFieldErrors({})

    const errs: Record<string, string> = {}
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match"
    }
    if (!agreed) {
      errs.agreed = "You must agree to the Terms of Service and Privacy Policy"
    }
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      return
    }

    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          role,
          agency_name: agencyName,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const userId = authData.user?.id
    if (!userId) {
      setError("Account created but unable to set up subscription. Please contact support.")
      setLoading(false)
      return
    }

    if (!authData.session) {
      setNeedsConfirmation(true)
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: form.fullName,
        role,
        email: form.email,
        account_type: role === "landlord" ? "owner" : "agency",
      })

    if (profileError) {
      setError("Account created but profile setup failed: " + profileError.message)
      setLoading(false)
      return
    }

    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 14)

    const { data: existingSub } = await supabase
      .from("account_subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    let subError = null
    if (existingSub) {
      const { error } = await supabase
        .from("account_subscriptions")
        .update({
          plan_slug: selectedPlan,
          status: "trialing",
          trial_started_at: new Date().toISOString(),
          trial_ends_at: trialEndDate.toISOString(),
          billing_cycle: billingCycle,
        })
        .eq("id", existingSub.id)
      subError = error
    } else {
      const { error } = await supabase
        .from("account_subscriptions")
        .insert({
          user_id: userId,
          plan_slug: selectedPlan,
          status: "trialing",
          trial_started_at: new Date().toISOString(),
          trial_ends_at: trialEndDate.toISOString(),
          billing_cycle: billingCycle,
        })
      subError = error
    }

    if (subError) {
      setError("Account created but subscription setup failed: " + subError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push("/dashboard/setup")
    }, 2000)
  }

  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4] py-8">
        <div className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-[#C28A78]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-mail-check-line text-[#C28A78] text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-[#3A3F3A] mb-2">Almost there!</h1>
          <p className="text-sm text-[#687068] mb-1">
            Your account was created. Please check <span className="font-medium text-[#3A3F3A]">{form.email}</span> and confirm your email to activate your account.
          </p>
          <p className="text-sm text-[#687068] mb-6">
            Once confirmed, sign in to access your dashboard.
          </p>
          <div className="bg-[#FEF9F0] border border-[#F5E6C8] rounded-xl px-4 py-3 mb-6 text-left">
            <p className="text-xs text-[#8A6D3B]">
              <i className="ri-information-line mr-1"></i>
              Didn&apos;t get the email or the link isn&apos;t working? Contact your platform administrator to have your account confirmed manually.
            </p>
          </div>
          <Link href="/login" className="inline-block w-full bg-[#C28A78] hover:bg-[#B07A69] text-white font-medium py-3 rounded-lg transition-colors whitespace-nowrap">
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4] py-8">
        <div className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-[#7A9A7E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-[#7A9A7E] text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-[#3A3F3A] mb-2">Account created!</h1>
          <p className="text-sm text-[#687068] mb-1">Your 14-day {planName} trial is now active.</p>
          <p className="text-sm text-[#687068]">Redirecting to setup...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4] py-8">
      <div className="w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <Link href="/" className="font-['Pacifico'] text-3xl text-[#C28A78] inline-block">
            LetHub
          </Link>
          <h1 className="text-2xl font-bold text-[#3A3F3A] mt-4">Create your account</h1>
          <p className="text-sm text-[#687068] mt-1">Start managing properties with LetHub</p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => { if (idx < step) setStep(idx) }}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  idx === step ? "bg-[#C28A78] text-white" : idx < step ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F1F5F9] text-[#94A3B8]"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  idx === step ? "bg-white/20 text-white" : idx < step ? "bg-[#10B981] text-white" : "bg-[#E2E8F0] text-[#94A3B8]"
                }`}>
                  {idx < step ? <i className="ri-check-line text-[10px]"></i> : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {idx < steps.length - 1 && <div className={`w-6 h-px flex-shrink-0 ${idx < step ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`}></div>}
            </div>
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#DC2626] mb-4">
            {error}
          </div>
        )}

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Full name</label>
              <div className="flex items-center gap-2 px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white focus-within:border-[#C28A78] focus-within:ring-1 focus-within:ring-[#C28A78]">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-user-line text-[#94A3B8] text-sm"></i>
                </div>
                <input
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Work email</label>
              <div className="flex items-center gap-2 px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white focus-within:border-[#C28A78] focus-within:ring-1 focus-within:ring-[#C28A78]">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-mail-line text-[#94A3B8] text-sm"></i>
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Password</label>
              <div className="flex items-center gap-2 px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white focus-within:border-[#C28A78] focus-within:ring-1 focus-within:ring-[#C28A78]">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-lock-line text-[#94A3B8] text-sm"></i>
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-5 h-5 flex items-center justify-center"
                >
                  <i className={showPassword ? "ri-eye-off-line text-[#94A3B8] text-sm" : "ri-eye-line text-[#94A3B8] text-sm"}></i>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Confirm password</label>
              <div className="flex items-center gap-2 px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white focus-within:border-[#C28A78] focus-within:ring-1 focus-within:ring-[#C28A78]">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-lock-line text-[#94A3B8] text-sm"></i>
                </div>
                <input
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                  required
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="flex items-center gap-2 bg-[#C28A78] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#B07A69] transition-colors whitespace-nowrap disabled:opacity-50"
              >
                Continue
                <i className="ri-arrow-right-line text-sm"></i>
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-[#C28A78]/5 border border-[#C28A78]/20 rounded-xl px-4 py-3">
              <p className="text-xs text-[#687068]">
                <i className="ri-information-line mr-1 text-[#C28A78]"></i>
                This information helps us tailor your LetHub experience. You can change these details later in settings.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Agency name *</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="e.g. Oakwood Lettings"
                className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Business type</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBusinessTypeOpen(!businessTypeOpen)}
                  className="flex items-center justify-between w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A]"
                >
                  <span>{businessTypes.find((b) => b.value === businessType)?.label}</span>
                  <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                </button>
                {businessTypeOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20">
                    {businessTypes.map((b) => (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() => { setBusinessType(b.value); setBusinessTypeOpen(false) }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] first:rounded-t-lg last:rounded-b-lg"
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Approximate portfolio size</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPortfolioSizeOpen(!portfolioSizeOpen)}
                  className="flex items-center justify-between w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A]"
                >
                  <span>{portfolioSizes.find((p) => p.value === portfolioSize)?.label}</span>
                  <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                </button>
                {portfolioSizeOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20">
                    {portfolioSizes.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => { setPortfolioSize(p.value); setPortfolioSizeOpen(false) }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] first:rounded-t-lg last:rounded-b-lg"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Business phone (optional)</label>
              <input
                type="text"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                placeholder="e.g. 020 7946 0000"
                className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Select your role</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center justify-between w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A]"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-user-settings-line text-[#94A3B8] text-sm"></i>
                    </div>
                    {roles.find((r) => r.value === role)?.label}
                  </span>
                  <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                </button>
                {roleDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => { setRole(r.value); setRoleDropdownOpen(false) }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] first:rounded-t-lg last:rounded-b-lg"
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F1F5F9] transition-colors">
                <i className="ri-arrow-left-line text-sm"></i>
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="flex items-center gap-2 bg-[#C28A78] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#B07A69] transition-colors whitespace-nowrap disabled:opacity-50"
              >
                Continue
                <i className="ri-arrow-right-line text-sm"></i>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-[#C28A78]/5 border border-[#C28A78]/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <i className="ri-sparkling-line text-[#C28A78] text-sm"></i>
                <p className="text-sm font-semibold text-[#C28A78]">
                  You are starting a 14-day free trial of {planName}
                </p>
              </div>
              <p className="text-xs text-[#687068] ml-6">
                No credit card required. Cancel anytime.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
              <h3 className="font-semibold text-[#3A3F3A] mb-3">{planName} Plan</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-[#3A3F3A]">£{displayPrice}</span>
                <span className="text-sm text-[#687068]">/ month</span>
              </div>
              <p className="text-xs text-[#687068] mb-4">
                {billingCycle === "annual" ? "Billed annually (£" + (displayPrice * 12) + "/yr)" : "Billed monthly"}
              </p>
              <div className="space-y-2">
                {[
                  "Unlimited properties" + (selectedPlan === "starter" ? " (up to 5)" : selectedPlan === "professional" ? " (up to 25)" : ""),
                  "Team members" + (selectedPlan === "starter" ? " (up to 2)" : selectedPlan === "professional" ? " (up to 5)" : " (up to 15)"),
                  "Compliance tracking",
                  "Tenant & owner portals",
                  selectedPlan === "starter" ? "Basic reporting" : selectedPlan === "professional" ? "Full reporting & quotes" : "Advanced analytics & API access",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <i className="ri-check-line text-[#10B981] text-xs"></i>
                    <span className="text-xs text-[#475569]">{feat}</span>
                  </div>
                ))}
              </div>
              <Link href="/pricing" className="inline-block mt-4 text-xs text-[#C28A78] font-medium hover:underline">
                Compare all features
              </Link>
            </div>

            <div className="bg-[#F8FAFC] rounded-xl border border-[#D5D9D5] p-4 space-y-2">
              <h4 className="text-sm font-medium text-[#3A3F3A]">Billing summary</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#687068]">Trial period</span>
                <span className="text-[#3A3F3A] font-medium">14 days</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#687068]">Trial ends</span>
                <span className="text-[#3A3F3A] font-medium">{trialEndStr}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#687068]">First charge</span>
                <span className="text-[#3A3F3A] font-medium">{firstChargeStr}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-medium pt-1 border-t border-[#D5D9D5]">
                <span className="text-[#3A3F3A]">Monthly after trial</span>
                <span className="text-[#3A3F3A]">£{displayPrice}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F1F5F9] transition-colors">
                <i className="ri-arrow-left-line text-sm"></i>
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-[#C28A78] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#B07A69] transition-colors whitespace-nowrap"
              >
                Review & create
                <i className="ri-arrow-right-line text-sm"></i>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[#3A3F3A]">Review your account</h3>

            <div className="bg-white rounded-xl border border-[#D5D9D5] divide-y divide-[#D5D9D5]">
              <div className="p-4">
                <h4 className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Account</h4>
                <div className="space-y-1">
                  <p className="text-sm text-[#3A3F3A]"><span className="text-[#687068]">Name:</span> {form.fullName}</p>
                  <p className="text-sm text-[#3A3F3A]"><span className="text-[#687068]">Email:</span> {form.email}</p>
                  <p className="text-sm text-[#3A3F3A]"><span className="text-[#687068]">Role:</span> {roles.find((r) => r.value === role)?.label}</p>
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Agency</h4>
                <div className="space-y-1">
                  <p className="text-sm text-[#3A3F3A]"><span className="text-[#687068]">Agency:</span> {agencyName}</p>
                  <p className="text-sm text-[#3A3F3A]"><span className="text-[#687068]">Type:</span> {businessTypes.find((b) => b.value === businessType)?.label}</p>
                  <p className="text-sm text-[#3A3F3A]"><span className="text-[#687068]">Portfolio:</span> {portfolioSizes.find((p) => p.value === portfolioSize)?.label}</p>
                  {businessPhone && <p className="text-sm text-[#3A3F3A]"><span className="text-[#687068]">Phone:</span> {businessPhone}</p>}
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Plan</h4>
                <div className="space-y-1">
                  <p className="text-sm text-[#3A3F3A]"><span className="text-[#687068]">Plan:</span> {planName}</p>
                  <p className="text-sm text-[#3A3F3A]"><span className="text-[#687068]">Billing:</span> {billingCycle === "annual" ? "Annual" : "Monthly"} · £{displayPrice}/mo</p>
                  <p className="text-sm text-[#3A3F3A]"><span className="text-[#687068]">Trial:</span> 14 days · Ends {trialEndStr}</p>
                  <p className="text-sm text-[#3A3F3A]"><span className="text-[#687068]">First charge:</span> £{displayPrice} on {firstChargeStr}</p>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-[#687068] cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                className="w-4 h-4 mt-0.5 rounded border-[#D5D9D5] text-[#C28A78] focus:ring-[#C28A78]"
              />
              <span>
                I agree to the{" "}
                <Link href="/" className="text-[#C28A78] font-medium hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/" className="text-[#C28A78] font-medium hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {fieldErrors.agreed && (
              <p className="text-xs text-[#DC2626]">{fieldErrors.agreed}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F1F5F9] transition-colors">
                <i className="ri-arrow-left-line text-sm"></i>
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-[#C28A78] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#B07A69] transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
                <i className="ri-check-line text-sm"></i>
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-[#687068] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#C28A78] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4]">
        <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}