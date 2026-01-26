export default function ContactForm() {
  return (
    <section className="py-20 bg-[#c8ff00]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="bg-gradient-to-br from-violet-400 to-purple-500 rounded-3xl p-8 lg:p-12">
            <p className="text-violet-200 text-sm mb-8">CreatorX</p>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Join 1000+ brands already working with us.
            </h3>
            <div className="relative">
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">3X</span>
                <span className="text-white text-sm ml-1">ROAS</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl lg:text-3xl font-bold text-black mb-4">
              Choose the power that fits you best
            </h3>
            <p className="text-gray-700 mb-2">Good things happen to those who wait.</p>
            <p className="text-gray-700 mb-6">Great things happen to those who connect.</p>
            <p className="text-gray-600 mb-8 text-sm">
              With our UGC creation platform for brands, you get effortless access to authentic creators who help elevate your content strategy.
            </p>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="text"
                placeholder="Enter your company"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-500">
                <option>Company size</option>
                <option>1-10</option>
                <option>11-50</option>
                <option>51-200</option>
                <option>200+</option>
              </select>
              <input
                type="text"
                placeholder="Enter your website/business page"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <div className="flex">
                <select className="px-3 py-3 bg-white border border-gray-200 rounded-l-xl focus:outline-none text-gray-600">
                  <option>IN ▼</option>
                </select>
                <input
                  type="tel"
                  placeholder="+91"
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 border-l-0 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Get Started
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
