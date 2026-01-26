const platforms = [
  {
    title: "Influencer campaigns",
    description: "From reels & stories to shorts & carousels — get engaging social media content created in just a few clicks! Collaborate with every type of influencer and UGC creator to produce impactful content for your brand.",
    icon: "📱",
  },
  {
    title: "UGC content",
    description: "Need amazing content for your growth and performance marketing campaigns? Look no more! Access a wide range of creators ready to deliver fresh, authentic content tailored to your goals.",
    icon: "🎬",
  },
  {
    title: "Partnership Ads",
    description: "It is super-easy to find creators who can produce unique content formats like podcasts, reviews, and voiceovers with our seamless workflows designed for speed and quality.",
    icon: "🤝",
  },
];

export default function Platform() {
  return (
    <section id="platforms" className="py-24 bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#c8ff00] mb-6">
            One platform to get anything you want
          </h2>
          <p className="text-xl text-white/80 max-w-3xl">
            Our product workflows support all your influencer requirements. Seamless campaign execution starts here! With our advanced UGC platform, you can easily manage creators, campaigns, and high-quality content from one place.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {platforms.map((platform, index) => (
            <div
              key={index}
              className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 card-hover relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="text-5xl mb-6">{platform.icon}</div>
                <h3 className="text-2xl font-bold text-[#c8ff00] mb-4">{platform.title}</h3>
                <p className="text-white/80 leading-relaxed mb-8">{platform.description}</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-white/10 rounded-xl overflow-hidden group-hover:bg-white/20 transition-colors duration-300">
                      <div className="w-full h-full bg-gradient-to-br from-pink-400/30 to-purple-500/30"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
