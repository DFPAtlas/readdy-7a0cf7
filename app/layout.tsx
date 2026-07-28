import type { Metadata, Viewport } from "next";
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
      </body>
    </html>
  );
}