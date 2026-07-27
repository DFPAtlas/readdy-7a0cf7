import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import "./lethub-theme.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

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
      <body className="antialiased">
        {children}
        <ServiceWorkerRegistration />
        <PWAInstallPrompt />
        <Script
          id="readdy-assistant-widget"
          src="https://readdy.ai/api/public/assistant/widget?projectId=90d3594f-7864-4a96-baba-4aa52410b5b2"
          strategy="afterInteractive"
          {...({
            mode: "hybrid",
            "voice-show-transcript": "true",
            theme: "light",
            size: "compact",
            "accent-color": "#14B8A6",
            "button-base-color": "#000000",
            "button-accent-color": "#FFFFFF",
          } as Record<string, string>)}
        />
      </body>
    </html>
  );
}