import Link from "next/link";

const userTypes = [
  {
    role: "Landlords",
    icon: "ri-home-4-line",
    features: [
      "View portfolio and rental income",
      "Track maintenance and repairs",
      "Access documents and compliance certificates",
      "Communicate with agents",
    ],
    color: "bg-[#8A9FB0]",
  },
  {
    role: "Tenants",
    icon: "ri-user-3-line",
    features: [
      "Report maintenance issues with photos",
      "Track repair progress",
      "Access tenancy documents",
      "Message your landlord or agent",
    ],
    color: "bg-[#7A9A7E]",
  },
  {
    role: "Contractors",
    icon: "ri-hammer-line",
    features: [
      "View and manage assigned jobs",
      "Submit quotes and invoices",
      "Track work orders and schedules",
      "Get instant job notifications",
    ],
    color: "bg-[#D4A85C]",
  },
  {
    role: "Estate Agents",
    icon: "ri-building-4-line",
    features: [
      "Full dashboard with property alerts",
      "Manage compliance and documents",
      "Approve quotes and track spending",
      "Push notifications for urgent items",
    ],
    color: "bg-[#C28A78]",
  },
];

export default function MobileAppSection() {
  return (
    <section className="w-full py-20 px-6 lg:px-12 bg-[#3A3F3A]">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#7A9A7E] bg-[#7A9A7E]/10 px-4 py-1.5 rounded-full mb-4">
            <i className="ri-smartphone-line"></i>
            Progressive Web App
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Property management in your pocket
          </h2>
          <p className="text-stone-400 max-w-2xl mx-auto">
            Access LetHub from any device. No app store required. Install on your home screen for instant access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {userTypes.map((user) => (
            <div key={user.role} className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className={`w-12 h-12 ${user.color} rounded-xl flex items-center justify-center mb-4`}>
                <i className={`${user.icon} text-white text-xl`}></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">{user.role}</h3>
              <ul className="space-y-2">
                {user.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-stone-400">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-check-line text-[#7A9A7E] text-sm"></i>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/mobile"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7A9A7E] text-white rounded-xl font-semibold text-sm hover:bg-[#6A8A6E] transition-colors whitespace-nowrap"
          >
            <i className="ri-smartphone-line text-lg"></i>
            Try Mobile App
          </Link>
          <div className="flex items-center gap-4 text-sm text-stone-400">
            <span className="flex items-center gap-1.5">
              <i className="ri-check-line text-[#7A9A7E]"></i>
              Installable
            </span>
            <span className="flex items-center gap-1.5">
              <i className="ri-check-line text-[#7A9A7E]"></i>
              Offline Ready
            </span>
            <span className="flex items-center gap-1.5">
              <i className="ri-check-line text-[#7A9A7E]"></i>
              Push Notifications
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}