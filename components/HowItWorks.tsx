"use client";

const steps = [
  {
    icon: "ri-add-circle-line",
    title: "Set Up Your Agency",
    description: "Create your agency account, add your team members, and configure your brand. Set up permissions for each role.",
  },
  {
    icon: "ri-upload-cloud-line",
    title: "Import Your Portfolio",
    description: "Upload properties, landlords, and tenants via CSV or enter manually. Link everything together for seamless tracking.",
  },
  {
    icon: "ri-settings-3-line",
    title: "Automate Workflows",
    description: "Configure automated maintenance routing, compliance reminders, and tenant communications. Set rules and let LetHub run.",
  },
  {
    icon: "ri-bar-chart-2-line",
    title: "Track & Report",
    description: "Monitor KPIs, generate compliance reports, track revenue, and gain insights into your portfolio performance.",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full py-20 px-6 lg:px-12 bg-[#FBF9F4]">
      <div className="w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#3A3F3A] mb-4">How LetHub Works</h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Get your agency up and running on LetHub in under an hour. From onboarding to daily operations — everything is designed for simplicity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              <div className="w-16 h-16 bg-[#C28A78] rounded-2xl flex items-center justify-center mx-auto mb-5">
                <i className={`${step.icon} text-white text-xl`}></i>
              </div>
              <div className="w-8 h-8 bg-[#C28A78] rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold text-white">
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold text-[#3A3F3A] mb-2">{step.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}