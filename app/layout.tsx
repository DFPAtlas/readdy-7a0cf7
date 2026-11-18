import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./lethub-theme.css";
import "./fonts.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAUpdateNotice from "@/components/PWAUpdateNotice";
import CookieConsentBanner from "@/components/CookieConsentBanner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#C28A78",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://lethub.uk"),
  title: "LetHub | Property Management for UK Letting Agents",
  description: "Property management software for UK letting agents and landlords: tenancies, rent, arrears, maintenance and compliance, built for the Renters' Rights Act.",
  openGraph: {
    type: "website",
    siteName: "LetHub",
    locale: "en_GB",
    url: "https://lethub.uk",
    title: "LetHub | Property Management for UK Letting Agents",
    description: "Tenancies, rent, arrears, maintenance and compliance in one place, built for the Renters' Rights Act.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LetHub",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  applicationName: "LetHub",
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link
          rel="preload"
          href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.5.0/remixicon.min.css"
          as="style"
        />
        <style>{`
          @keyframes slide-up {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slide-up {
            animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
      </head>
      <body className="antialiased">
        {children}
        <CookieConsentBanner />
        <ServiceWorkerRegistration />
        <PWAUpdateNotice />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}