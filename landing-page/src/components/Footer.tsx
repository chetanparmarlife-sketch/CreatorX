export default function Footer() {
  return (
    <footer className="bg-black text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-bold text-[#c8ff00] mb-4">CreatorX</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              CreatorX helps brands scale through authentic creator collaborations on our powerful UGC creator platform.
            </p>
            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Follow Us</p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="/creator-signup" className="hover:text-white transition-colors">Sign up as a creator</a></li>
              <li><a href="/product-journey" className="hover:text-white transition-colors">CreatorX product journey</a></li>
              <li><a href="/creators" className="hover:text-white transition-colors">Creators catalogue</a></li>
              <li><a href="/book-demo" className="hover:text-white transition-colors">Book a demo</a></li>
              <li><a href="/blogs" className="hover:text-white transition-colors">Blogs & case studies</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of service</a></li>
              <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Case Study</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Beardo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Brillare</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GrowFi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Inde Wild</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Nykaa</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Download Our Creator App</h4>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Download on the</p>
                  <p className="text-black font-semibold">App Store</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594z"/>
                  <path fill="#34A853" d="M1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.112.568l11.623-11.076L1.337.924z"/>
                  <path fill="#FBBC04" d="M14.584 12.023l3.396-3.378L3.199.126A1.49 1.49 0 0 0 1.337.924l11.623 11.077 1.624-1.978z"/>
                  <path fill="#EA4335" d="M14.584 12.023L2.961 23.099a1.49 1.49 0 0 0 1.862.798L18.099 15.52l-3.515-3.497z"/>
                </svg>
                <div>
                  <p className="text-xs text-gray-500">GET IT ON</p>
                  <p className="text-black font-semibold">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} CreatorX Martech Pvt Ltd. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
