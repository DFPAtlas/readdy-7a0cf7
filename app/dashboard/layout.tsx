import "../globals.css";
import "../lethub-theme.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans antialiased">
      {children}
    </div>
  );
}