import "../globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#C28A78",
};

export const metadata = {
  title: "LetHub Mobile",
  description: "LetHub Property Management on the go — install for full-screen app experience",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LetHub",
  },
};

export default function MobileRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans antialiased bg-[#F8FAFC]">
      {children}
      <ServiceWorkerRegistration />
      <PWAInstallPrompt />
    </div>
  );
}