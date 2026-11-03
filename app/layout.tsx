import type { Metadata, Viewport } from "next";
import { Manrope, Inter, Pacifico } from "next/font/google";
import "./globals.css";
import "./lethub-theme.css";
import "./fonts.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAUpdateNotice from "@/components/PWAUpdateNotice";
import CookieConsentBanner from "@/components/CookieConsentBanner";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
  display: "swap",
});

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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "https://readdy.ai/api/search-image?query=A%20simple%20elegant%20square%20app%20icon%20with%20the%20letter%20L%20in%20white%20on%20a%20dark%20forest%20green%20background%20minimal%20modern%20design%20suitable%20for%20a%20property%20management%20app%20icon%20no%20text%20just%20the%20letter%20mark&width=180&height=180&seq=lethub-apple-touch-icon&orientation=squarish",
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
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link rel="preconnect" href="https://readdy.ai" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://readdy.ai" />
        <link rel="preconnect" href="https://public.readdy.ai" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://public.readdy.ai" />
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
      <body className={`${inter.variable} ${manrope.variable} ${pacifico.variable} antialiased`}>
        {children}
        <CookieConsentBanner />
        <ServiceWorkerRegistration />
        <PWAUpdateNotice />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}