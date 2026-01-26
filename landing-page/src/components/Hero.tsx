export default function Hero() {
  const creatorImages = [
    { bg: "from-emerald-400 to-teal-500" },
    { bg: "from-pink-400 to-rose-500" },
    { bg: "from-violet-400 to-purple-500" },
    { bg: "from-amber-400 to-orange-500" },
    { bg: "from-cyan-400 to-blue-500" },
    { bg: "from-lime-400 to-green-500" },
  ];

  return (
    <section className="bg-black pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">✦</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Get ready to{" "}
            <span className="gradient-text">Amplify</span>
            {" "}your brand
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 mb-8">
            Match with creators in minutes
          </p>

          <a
            href="/signup"
            className="inline-block px-8 py-4 bg-[#c8ff00] text-black font-semibold rounded-full hover:bg-[#b8ef00] transition-all text-lg mb-4"
          >
            Sign up for free
          </a>

          <p className="text-sm text-gray-500">No credit card required</p>
        </div>

        <div className="flex justify-center gap-4 overflow-hidden pb-8">
          {creatorImages.map((creator, index) => (
            <div
              key={index}
              className={`w-32 h-48 sm:w-40 sm:h-56 rounded-2xl bg-gradient-to-br ${creator.bg} flex-shrink-0 shadow-xl transform hover:scale-105 transition-transform`}
            >
              <div className="w-full h-full rounded-2xl bg-gradient-to-t from-black/40 to-transparent flex items-end p-3">
                <div className="w-full">
                  <div className="h-2 bg-white/30 rounded mb-1"></div>
                  <div className="h-2 bg-white/20 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
