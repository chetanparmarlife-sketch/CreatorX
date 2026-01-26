export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to amplify your brand?
        </h2>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Join 1,000+ brands already using CreatorX to connect with the perfect creators for their campaigns.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/brand-signup"
            className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-full hover:bg-gray-50 hover:shadow-xl transition-all text-lg"
          >
            Get Started Free
          </a>
          <a
            href="/book-demo"
            className="px-8 py-4 bg-transparent text-white font-semibold rounded-full border-2 border-white/50 hover:bg-white/10 transition-all text-lg"
          >
            Schedule a Demo
          </a>
        </div>

        <p className="mt-8 text-white/60 text-sm">
          No credit card required • Free to start • Cancel anytime
        </p>
      </div>
    </section>
  );
}
