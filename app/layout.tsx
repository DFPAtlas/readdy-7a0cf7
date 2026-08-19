import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./lethub-theme.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import CookieConsentBanner from "@/components/CookieConsentBanner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#C28A78",
};

export const metadata: Metadata = {
  title: "LetHub | Property Management Platform",
  description: "The UK's most powerful property management platform — for agents, landlords, tenants & contractors. Install our PWA for the best mobile experience.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LetHub",
  },
  manifest: "/manifest.json",
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
    <html lang="en" suppressHydrationWarning={true}>
      <head>
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
        <PWAInstallPrompt />
      </body>
    </html>
  );
}