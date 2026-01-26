const platforms = [
  {
    title: "Influencer campaigns",
    description: "From reels & stories to shorts & carousels — get engaging social media content created in just a few clicks! Collaborate with every type of influencer and UGC creator to produce impactful content for your brand.",
  },
  {
    title: "UGC content",
    description: "Need amazing content for your growth and performance marketing campaigns? Look no more! Access a wide range of creators ready to deliver fresh, authentic content tailored to your goals.",
  },
  {
    title: "Partnership Ads",
    description: "It is super-easy to find creators who can produce unique content formats like podcasts, reviews, and voiceovers with our seamless workflows designed for speed and quality.",
  },
];

export default function Platform() {
  return (
    <section id="platforms" className="py-20 bg-[#7c3aed]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#c8ff00] mb-4">
            One platform to get anything you want
          </h2>
          <p className="text-lg text-white/80 max-w-3xl">
            Our product workflows support all your influencer requirements. Seamless campaign execution starts here! With our advanced UGC platform, you can easily manage creators, campaigns, and high-quality content from one place.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {platforms.map((platform, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
            >
              <h3 className="text-xl font-bold text-[#c8ff00] mb-4">{platform.title}</h3>
              <p className="text-white/80 leading-relaxed mb-6">{platform.description}</p>
              <div className="aspect-video bg-white/5 rounded-xl flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
