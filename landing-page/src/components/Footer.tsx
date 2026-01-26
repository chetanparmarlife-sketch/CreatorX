export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-violet-600/20 rounded-full blur-3xl -mt-24 sm:-mt-48"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-16">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#c8ff00] mb-4 sm:mb-6 font-display">CreatorX</h3>
            <p className="text-gray-400 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
              CreatorX helps brands scale through authentic creator collaborations.
            </p>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">Follow Us</p>
              <div className="flex gap-2 sm:gap-3">
                {["in", "tw", "fb", "ig", "wa"].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#c8ff00] hover:text-black transition-all duration-300 text-xs sm:text-sm font-bold"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-4 sm:mb-6 font-semibold">Company</h4>
            <ul className="space-y-2 sm:space-y-4">
              {["Sign up as a creator", "Product journey", "Book a demo", "Blogs", "Privacy policy", "Terms of service"].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-[#c8ff00] transition-colors duration-300 text-xs sm:text-base">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-4 sm:mb-6 font-semibold">Case Study</h4>
            <ul className="space-y-2 sm:space-y-4">
              {["Beardo", "Brillare", "GrowFi", "Inde Wild", "Nykaa"].map((brand) => (
                <li key={brand}>
                  <a href="#" className="hover:text-[#c8ff00] transition-colors duration-300 text-xs sm:text-base">{brand}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-4 sm:mb-6 font-semibold">Download App</h4>
            <div className="space-y-3 sm:space-y-4">
              <a href="#" className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 bg-white rounded-lg sm:rounded-xl hover:bg-gray-100 transition-all duration-300 group hover:scale-105">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Download on</p>
                  <p className="text-black font-bold text-xs sm:text-base">App Store</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 bg-white rounded-lg sm:rounded-xl hover:bg-gray-100 transition-all duration-300 group hover:scale-105">
                <svg className="w-5 h-5 sm:w-7 sm:h-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594z"/>
                  <path fill="#34A853" d="M1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.112.568l11.623-11.076L1.337.924z"/>
                  <path fill="#FBBC04" d="M14.584 12.023l3.396-3.378L3.199.126A1.49 1.49 0 0 0 1.337.924l11.623 11.077 1.624-1.978z"/>
                  <path fill="#EA4335" d="M14.584 12.023L2.961 23.099a1.49 1.49 0 0 0 1.862.798L18.099 15.52l-3.515-3.497z"/>
                </svg>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">GET IT ON</p>
                  <p className="text-black font-bold text-xs sm:text-base">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 sm:pt-10 text-center">
          <p className="text-gray-500 text-xs sm:text-base">
            &copy; {new Date().getFullYear()} CreatorX Martech Pvt Ltd. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
