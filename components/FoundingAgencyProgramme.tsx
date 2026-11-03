import Link from "next/link";

const benefits = [
  {
    icon: "ri-lock-2-line",
    title: "Founding price locked for life",
    description: "The rate you join at stays yours for as long as you stay with LetHub.",
  },
  {
    icon: "ri-chat-3-line",
    title: "Direct line to the founder",
    description: "Speak with the person building the platform, not a support queue.",
  },
  {
    icon: "ri-database-2-line",
    title: "Free data migration from your current system",
    description: "We move your properties, tenancies and compliance records across for you, at no cost.",
  },
];

export default function FoundingAgencyProgramme() {
  return (
    <section id="founding-agency" className="w-full py-20 px-6 lg:px-12 bg-white">
      <div className="w-full">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F3F6F3] text-xs font-medium text-[#5C7A61] mb-5">
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-flag-line text-xs"></i>
            </span>
            Pre-launch programme
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3A3F3A] mb-4">Become a founding agency</h2>
          <p className="text-stone-500 leading-relaxed">
            We&rsquo;re onboarding a small group of UK letting agents before public launch. Shape the product, and lock in founding pricing for life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-[#FBF9F4] rounded-xl p-7 border border-[#D5D9D5] flex flex-col"
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#C28A78]/12 text-[#C28A78] mb-5">
                <i className={`${benefit.icon} text-xl`}></i>
              </div>
              <h3 className="text-base font-semibold text-[#3A3F3A] mb-2 leading-snug">{benefit.title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link href="/book-demo">
            <button className="bg-[#C28A78] hover:bg-[#B07A69] text-white font-medium px-8 py-3.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer">
              Apply to be a founding agency
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}