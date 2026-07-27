"use client";

const testimonials = [
  {
    id: 1,
    name: "Mark Thompson",
    role: "Director, Thompson & Partners",
    location: "London",
    text: "LetHub has cut our admin time by 60%. We used to manage properties across five spreadsheets and endless emails. Now everything is in one place and our landlords love the portal.",
    rating: 5,
    portfolio: "340 properties",
  },
  {
    id: 2,
    name: "Sarah Davies",
    role: "Property Manager, Davies Lettings",
    location: "Manchester",
    text: "The compliance alerts alone have been worth the subscription. We have not missed a single certificate expiry since switching to LetHub. Our clients trust us more because of it.",
    rating: 5,
    portfolio: "156 properties",
  },
  {
    id: 3,
    name: "James O'Connor",
    role: "CEO, O'Connor Property Management",
    location: "Bristol",
    text: "We switched from three separate tools to LetHub. The maintenance workflow is brilliant — tenants report issues, we assign contractors, and landlords approve quotes all in the same system.",
    rating: 5,
    portfolio: "420 properties",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="w-full py-20 px-6 lg:px-12 bg-white">
      <div className="w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#3A3F3A] mb-4">What Estate Agents Say</h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Trusted by UK agencies managing thousands of properties across the country.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-[#FBF9F4] rounded-xl p-6 border border-[#D5D9D5]">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <i key={i} className="ri-star-fill text-amber-400 text-sm"></i>
                ))}
              </div>
              <p className="text-sm text-stone-600 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C28A78] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#3A3F3A]">{t.name}</p>
                  <p className="text-xs text-stone-500">{t.role}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#D5D9D5] flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1">
                  <i className="ri-map-pin-line text-xs"></i>
                  {t.location}
                </span>
                <span className="font-medium text-[#C28A78]">{t.portfolio}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-stone-400 mt-8">
          * Illustrative testimonials based on typical agency experiences. Individual results may vary.
        </p>
      </div>
    </section>
  );
}