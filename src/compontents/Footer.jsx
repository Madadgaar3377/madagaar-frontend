const Footer = () => {
    return (
      <footer  className=" bg-gray-900 text-white pt-16 pb-6 px-6 md:px-20">
        
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Logo + Description */}
          <div>
            <img
              src="/Media/Group%2033.png"
              alt="Madadgaar Logo"
              className="w-48 mb-4"
            />
            <p className="text-gray-300 leading-relaxed">
              There are many variations of passages of Lorem Ipsum available,
              but the majority have suffered alteration in some form working insurigo
            </p>
          </div>
  
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="hover:text-red-500 cursor-pointer">Insurance</li>
              <li className="hover:text-red-500 cursor-pointer">Properties</li>
              <li className="hover:text-red-500 cursor-pointer">Loans</li>
              <li className="hover:text-red-500 cursor-pointer">Installment</li>
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
              <li>Gulberg III, Lahore, Pakistan</li>
              <li>+92 307 1113330</li>
              <li>help.madadgaar@gmail.com</li>
              <li className="hover:text-red-500 cursor-pointer">
                More Information
              </li>
              <li className="hover:text-red-500 cursor-pointer">
                Family Insurance
              </li>
            </ul>
          </div>
  
        </div>
  
        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>
  
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between text-gray-400 text-sm">
          
          <p className="mb-4 md:mb-0">
            © 2024 Madadgaar Expert Partner. Designed By <span className="text-red-500">My Digital Pixels</span>
          </p>
  
          <div className="flex space-x-3">
            <a href="/" className="hover:text-red-500">Sitemap</a>
            <span>|</span>
            <a href="/" className="hover:text-red-500">Privacy Policy</a>
            <span>|</span>
            <a href="/" className="hover:text-red-500">Terms of Use</a>
          </div>
  
        </div>
  
      </footer>
    );
  };
  
  export default Footer;
  