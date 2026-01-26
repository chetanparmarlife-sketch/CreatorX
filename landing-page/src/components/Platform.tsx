const platforms = [
  {
    title: "Influencer Campaigns",
    description: "From reels & stories to shorts & carousels — get engaging social media content created in just a few clicks! Collaborate with every type of influencer.",
    features: ["Instagram Reels", "YouTube Shorts", "Stories & Carousels", "TikTok Videos"],
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "UGC Content",
    description: "Need amazing content for your growth and performance marketing campaigns? Access a wide range of creators ready to deliver fresh, authentic content.",
    features: ["Product Reviews", "Unboxing Videos", "Testimonials", "Lifestyle Content"],
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Partnership Ads",
    description: "Find creators who can produce unique content formats like podcasts, reviews, and voiceovers with our seamless workflows designed for speed and quality.",
    features: ["Podcast Features", "Brand Collabs", "Sponsored Posts", "Whitelisted Ads"],
    gradient: "from-amber-500 to-orange-500",
  },
];

export default function Platform() {
  return (
    <section id="platforms" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">One Platform</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
            Get anything you want from one platform
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Our product workflows support all your influencer requirements. Seamless campaign execution starts here!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {platforms.map((platform, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 overflow-hidden card-hover"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${platform.gradient}`}></div>
              
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center mb-6`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">{platform.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{platform.description}</p>

              <ul className="space-y-3">
                {platform.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${platform.gradient} flex items-center justify-center`}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
