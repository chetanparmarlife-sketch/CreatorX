export default function Hero() {
  return (
    <section className="hero-gradient pt-24 pb-16 lg:pt-32 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-indigo-700">1000+ Active Creators</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Amplify Your Brand with{" "}
              <span className="gradient-text">CreatorX</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              Connect with verified influencers and UGC creators in minutes. Launch campaigns, track performance, and grow your brand effortlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <a
                href="/brand-signup"
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-indigo-500/30 transition-all text-lg"
              >
                Start Free Campaign
              </a>
              <a
                href="/book-demo"
                className="px-8 py-4 bg-white text-gray-800 font-semibold rounded-full border-2 border-gray-200 hover:border-indigo-300 hover:bg-gray-50 transition-all text-lg"
              >
                Book a Demo
              </a>
            </div>

            <p className="text-sm text-gray-500">No credit card required</p>
          </div>

          <div className="flex-1 relative">
            <div className="relative w-full max-w-lg mx-auto">
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
              <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-700"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
              
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Campaign Live!</h3>
                    <p className="text-sm text-gray-500">12 creators matched</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Sarah M.</p>
                        <p className="text-xs text-gray-500">125K followers</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Content Ready</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Alex K.</p>
                        <p className="text-xs text-gray-500">89K followers</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">In Progress</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Priya R.</p>
                        <p className="text-xs text-gray-500">210K followers</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">Applied</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
