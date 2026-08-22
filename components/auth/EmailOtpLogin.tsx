"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const COOLDOWN_SECONDS = 60;

interface EmailOtpLoginProps {
  onVerified: (userId: string) => Promise<string | null>;
  primary?: string;
  primaryHover?: string;
  emailPlaceholder?: string;
  submitLabel?: string;
  codeLength?: number;
}

function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  return `${local[0]}•••••${domain}`;
}

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function EmailOtpLogin({
  onVerified,
  primary = "#C28A78",
  primaryHover = "#B07A69",
  emailPlaceholder = "you@company.com",
  submitLabel = "Send login code",
  codeLength = 8,
}: EmailOtpLoginProps) {
  const [email, setEmail] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [stage, setStage] = useState<"email" | "otp">("email");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyLock = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown > 0]);

  const sendOtp = useCallback(async (targetEmail: string, isResend: boolean) => {
    if (isResend) setResending(true);
    else setSending(true);
    setError("");
    setInfo("");

    const normalized = targetEmail.trim().toLowerCase();

    const { error: sendError } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { shouldCreateUser: false },
    });

    if (sendError) {
      console.error(
        "LetHub OTP request failed:",
        sendError.code,
        sendError.status,
        sendError.message
      );

      const msg = (sendError.message || "").toLowerCase();
      const code = (sendError.code || "").toLowerCase();
      if (code === "otp_disabled") {
        setError("Email sign-in is enabled, but the OTP method is not. Open Email provider settings and turn on 'OTP' as a sign-in method.");
      } else if (msg.includes("rate") || msg.includes("too many") || msg.includes("limit")) {
        setError("Too many attempts. Please wait before requesting another code.");
      } else if (msg.includes("network") || msg.includes("fetch") || msg.includes("failed to fetch")) {
        setError("We couldn't reach the server. Please check your connection and try again.");
      } else {
        setError("We couldn't send a login code. Please check your details or try again.");
      }

      if (isResend) setResending(false);
      else setSending(false);
      return;
    }

    setOtpEmail(normalized);
    setStage("otp");
    setOtp("");
    setInfo("If this email is associated with a LetHub account, a login code has been sent.");
    setCooldown(COOLDOWN_SECONDS);
    if (isResend) setResending(false);
    else setSending(false);
  }, []);

  const verifyOtp = useCallback(
    async (code: string) => {
      if (verifyLock.current) return;
      verifyLock.current = true;
      setVerifying(true);
      setError("");

      try {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          email: otpEmail,
          token: code,
          type: "email",
        });

        if (verifyError) {
          const msg = (verifyError.message || "").toLowerCase();
          if (msg.includes("rate") || msg.includes("too many") || msg.includes("limit")) {
            setError("Too many attempts. Please wait before requesting another code.");
          } else if (msg.includes("network") || msg.includes("fetch") || msg.includes("failed to fetch")) {
            setError("We couldn't reach the server. Please check your connection and try again.");
          } else {
            setError("The code is incorrect or has expired. Please request a new code.");
          }
          setOtp("");
          return;
        }

        const user = data.user ?? data.session?.user ?? null;
        if (!user) {
          setError("We couldn't complete sign in. Please try again.");
          setOtp("");
          return;
        }

        const result = await onVerified(user.id);
        if (result) {
          setError(result);
          setOtp("");
        }
      } finally {
        verifyLock.current = false;
        setVerifying(false);
      }
    },
    [otpEmail, onVerified]
  );

  useEffect(() => {
    if (stage === "otp" && otp.length === codeLength && !verifyLock.current) {
      verifyOtp(otp);
    }
  }, [otp, stage, verifyOtp]);

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setError("Please enter your email address.");
      return;
    }
    if (!isEmailValid(normalized)) {
      setError("Please enter a valid email address.");
      return;
    }
    void sendOtp(normalized, false);
  };

  const handleResend = () => {
    if (cooldown > 0 || resending) return;
    void sendOtp(otpEmail, true);
  };

  const handleChangeEmail = () => {
    setStage("email");
    setOtp("");
    setOtpEmail("");
    setError("");
    setInfo("");
    setCooldown(0);
    setVerifying(false);
    verifyLock.current = false;
  };

  const handleInputChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const chars = prev.split("");
      chars[index] = digit || "";
      return chars.join("").slice(0, codeLength);
    });
    if (digit && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const hasValue = !!otp[index];
      if (hasValue) {
        setOtp((prev) => {
          const chars = prev.split("");
          chars[index] = "";
          return chars.join("").slice(0, codeLength);
        });
      } else if (index > 0) {
        setOtp((prev) => {
          const chars = prev.split("");
          chars[index - 1] = "";
          return chars.join("").slice(0, codeLength);
        });
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, codeLength);
    if (!pasted) return;
    setOtp(pasted);
    inputRefs.current[Math.min(pasted.length, codeLength) - 1]?.focus();
  };

  const handleVerifyClick = () => {
    if (otp.length !== codeLength || verifying) return;
    void verifyOtp(otp);
  };

  const primaryBtnStyle: React.CSSProperties = {
    backgroundColor: primary,
  };

  const primaryBtnHoverStyle: React.CSSProperties = {
    backgroundColor: primaryHover,
  };

  if (stage === "otp") {
    return (
      <div>
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-[#3A3F3A]">Check your email</h2>
          <p className="text-sm text-[#687068] mt-1">
            We&apos;ve sent a {codeLength}-digit login code to <strong className="text-[#3A3F3A]">{maskEmail(otpEmail)}</strong>
          </p>
        </div>

        {info && (
          <div className="mb-4 p-3 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-sm text-[#16A34A]">
            {info}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#3A3F3A] mb-2 text-center">
              Enter your code
            </label>
            <div className="flex justify-center gap-1.5 sm:gap-3" role="group" aria-label={`${codeLength}-digit login code`}>
              {Array.from({ length: codeLength }).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  value={otp[index] ?? ""}
                  onChange={(event) => handleInputChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  aria-label={`Digit ${index + 1}`}
                  className="w-9 h-12 sm:w-11 sm:h-14 text-center text-lg font-semibold text-[#3A3F3A] border border-[#D5D9D5] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C28A78] focus:border-[#C28A78] transition-shadow"
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#DC2626]" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleVerifyClick}
            disabled={otp.length !== codeLength || verifying}
            className="w-full text-white text-sm font-medium py-3 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
            style={primaryBtnStyle}
            onMouseEnter={(e) => {
              if (otp.length === codeLength && !verifying) e.currentTarget.style.backgroundColor = primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = primary;
            }}
          >
            {verifying ? "Verifying..." : "Verify & Sign In"}
          </button>

          <div className="text-center space-y-2">
            <p className="text-sm text-[#687068]">Didn&apos;t receive it?</p>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resending}
                className="text-sm font-medium hover:underline disabled:opacity-50 disabled:hover:no-underline whitespace-nowrap"
                style={{ color: primary }}
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? "Sending..." : "Resend code"}
              </button>
              <span className="text-[#D5D9D5]">·</span>
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-sm font-medium text-[#687068] hover:text-[#3A3F3A] whitespace-nowrap"
              >
                Change email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSend} className="space-y-4" noValidate>
      {error && (
        <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#DC2626]" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="otp-email" className="block text-sm font-medium text-[#3A3F3A] mb-1.5">
          Email address
        </label>
        <div className="flex items-center gap-2 px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white focus-within:border-[#C28A78] focus-within:ring-1 focus-within:ring-[#C28A78]">
          <i className="ri-mail-line text-[#94A3B8] text-sm"></i>
          <input
            id="otp-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={emailPlaceholder}
            autoComplete="email"
            className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="w-full text-white text-sm font-medium py-3 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
        style={primaryBtnStyle}
        onMouseEnter={(e) => {
          if (!sending) e.currentTarget.style.backgroundColor = primaryHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = primary;
        }}
      >
        {sending ? "Sending..." : submitLabel}
      </button>
    </form>
  );
}