export default function Newsletter() {
  return (
    <section className="py-12 bg-black border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <span className="text-white font-medium whitespace-nowrap">Subscribe to our newsletter</span>
          <div className="flex-1 flex w-full">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-l-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
            />
            <button className="px-6 py-3 bg-white text-black font-medium rounded-r-xl hover:bg-gray-100 transition-colors">
              Submit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
