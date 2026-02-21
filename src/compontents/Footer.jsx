const Footer = () => {
    return (
      <>
      <footer className="bg-gray-900 text-white pt-12 sm:pt-16 pb-6 safe-area-bottom">
        <div className="container-content">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          
          {/* Logo + Description */}
          <div>
            <img
              src="/Media/Group%2033.png"
              alt="Madadgaar Logo"
              className="w-48 mb-4"
            />
            <p className="text-gray-300 leading-relaxed">
              Madadgaar Expert Partner is a trusted marketplace where finding the right solution becomes simple. Whether it's property solutions, insurance support, loans, or installment plans, we make your journey simple, reliable, and stress-free.
            </p>
          </div>
  
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/offers" className="hover:text-red-500 transition">Offers</a></li>
              <li><a href="/properties" className="hover:text-red-500 transition">Properties</a></li>
              <li><a href="/loans" className="hover:text-red-500 transition">Loans</a></li>
              <li><a href="/installments" className="hover:text-red-500 transition">Installments</a></li>
              <li><a href="/insurance" className="hover:text-red-500 transition">Insurance</a></li>
              <li><a href="/about" className="hover:text-red-500 transition">How It Works</a></li>
              <li><a href="/faq" className="hover:text-red-500 transition">FAQs</a></li>
            </ul>
          </div>
  
          {/* Our Services */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="hover:text-red-500 cursor-pointer">Travel Insurance</li>
              <li className="hover:text-red-500 cursor-pointer">Life Insurance</li>
              <li className="hover:text-red-500 cursor-pointer">House Insurance</li>
              <li className="hover:text-red-500 cursor-pointer">Car Insurance</li>
              <li className="hover:text-red-500 cursor-pointer">Family Insurance</li>
            </ul>
          </div>
  
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Get In Touch</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="mr-2">📍</span>
                <span>Gulberg III, Lahore, Pakistan</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📞</span>
                <a href="tel:+923071113330" className="hover:text-red-500">+92 307 111 333 0</a>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✉️</span>
                <a href="mailto:help.madadgaar@gmail.com" className="hover:text-red-500">help.madadgaar@gmail.com</a>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🌐</span>
                <a href="https://madadgaar.com.pk" target="_blank" rel="noopener noreferrer" className="hover:text-red-500">
                  madadgaar.com.pk
                </a>
              </li>
            </ul>
          </div>
  
        </div>
  
        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>
  
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between text-gray-400 text-sm">
          
          <p className="mb-4 md:mb-0">
            © 2024 Madadgaar Expert Partner. Designed & Developed By <span className="text-red-500">Code-XA</span>
          </p>
  
          <div className="flex space-x-3">
            <a href="/" className="hover:text-red-500">Sitemap</a>
            <span>|</span>
            <a href="/" className="hover:text-red-500">Privacy Policy</a>
            <span>|</span>
            <a href="/" className="hover:text-red-500">Terms of Use</a>
          </div>
  
        </div>
      </div>
      </footer>
      </>

    );
  };
  
  export default Footer;
  