const pressLogos = [
  "Outlook", "The Economic Times", "Forbes", "mint", "THE HINDU",
  "QUARTZ", "moneycontrol", "Fort"
];

const investors = [
  { name: "Pulkit Jain", role: "Co-founder, Vedantu" },
  { name: "Varun Alagh", role: "Co-founder, Mamaearth" },
  { name: "Krafton", role: "Krafton" },
  { name: "Peer Capital", role: "Peer Capital" },
  { name: "Niraj Singh", role: "Founder & CEO, Spinny" },
];

export default function Press() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <p className="text-gray-600 mb-6">We&apos;ve been featured in</p>
          <div className="flex flex-wrap items-center gap-8">
            {pressLogos.map((logo, index) => (
              <span key={index} className="text-lg font-bold text-gray-400">{logo}</span>
            ))}
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-black">
            Investor spotlight
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {investors.map((investor, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
              <h4 className="font-semibold text-gray-900">{investor.name}</h4>
              <p className="text-sm text-gray-500">{investor.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
