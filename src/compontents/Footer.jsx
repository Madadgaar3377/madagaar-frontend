import Link from 'next/link';
import { motion } from "framer-motion";

const footerLinks = [
  { to: "/download-app", label: "Download App" },
  { to: "/offers", label: "Offers" },
  { to: "/properties", label: "Properties" },
  { to: "/loans", label: "Loans" },
  { to: "/installments", label: "Installments" },
  { to: "/insurance", label: "Insurance" },
  { to: "/about", label: "How It Works" },
  { to: "/faq", label: "FAQs" },
];

const container = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 * i },
  }),
};

const item = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-10 sm:pt-14 lg:pt-16 pb-6 safe-area-bottom">
      <div className="container-content">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Logo + Description */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="min-w-0"
          >
            <Link href="/" className="inline-block focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
              <img
                src="/Media/Group%2033.png"
                alt="Madadgaar Logo"
                className="w-40 sm:w-48 mb-4 h-auto"
              />
            </Link>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-sm">
              Madadgaar Expert Partner is a trusted marketplace where finding the right solution becomes simple. Whether it's property solutions, insurance support, loans, or installment plans, we make your journey simple, reliable, and stress-free.
            </p>
            <Link
              href="/download-app"
              className="inline-flex items-center gap-2 mt-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
              </svg>
              Download Madadgaar App
            </Link>
            <a
              href="https://www.pinstack.cc/product/madadgaar-expert-partner-property-insurance-loans-installment-plans-in-pak"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              <img
                src="https://www.pinstack.cc/api/badge/madadgaar-expert-partner-property-insurance-loans-installment-plans-in-pak?theme=light"
                alt="Featured on Pinstack  Madadgaar Expert Partner - Property, Insurance, Loans & Installment Plans in Pak"
                className="h-auto max-w-[220px] w-full"
              />
            </a>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
            className="min-w-0"
          >
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              {footerLinks.map((link, i) => (
                <motion.li key={link.to} variants={item}>
                  <Link
                    href={link.to}
                    className="inline-block py-1.5 text-sm sm:text-base hover:text-primary transition-colors duration-200 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Our Services */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
            className="min-w-0"
          >
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-white">Our Services</h3>
            <ul className="space-y-2 text-gray-300">
              {["Travel Insurance", "Life Insurance", "House Insurance", "Car Insurance", "Family Insurance"].map((label, i) => (
                <motion.li key={label} variants={item} className="text-sm sm:text-base">
                  <span className="py-1.5 inline-block hover:text-primary transition-colors duration-200">{label}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4 }}
            className="min-w-0"
          >
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-white">Get In Touch</h3>
            <ul className="space-y-3 text-gray-300 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <span className="shrink-0" aria-hidden>📍</span>
                <span>Gulberg III, Lahore, Pakistan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0" aria-hidden>📞</span>
                <a href="tel:+923071113330" className="hover:text-primary transition-colors focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">+92 307 111 333 0</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0" aria-hidden>✉️</span>
                <a href="mailto:support@madadgaar.com.pk" className="hover:text-primary transition-colors break-all focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">support@madadgaar.com.pk</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0" aria-hidden>🌐</span>
                <a href="https://madadgaar.com.pk" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
                  madadgaar.com.pk
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="border-t border-gray-700 mt-8 sm:mt-10 pt-6" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-400 text-xs sm:text-sm">
          <p className="text-center sm:text-left order-2 sm:order-1">
            © 2024 Madadgaar Expert Partner. Designed & Developed By <span className="text-primary">Code-XA</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 order-1 sm:order-2">
            <Link href="/" className="py-2 px-1 hover:text-primary transition-colors focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">Sitemap</Link>
            <span className="text-gray-600" aria-hidden>|</span>
            <Link href="/privacy-policy" className="py-2 px-1 hover:text-primary transition-colors focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">Privacy Policy</Link>
            <span className="text-gray-600" aria-hidden>|</span>
            <Link href="/terms-and-conditions" className="py-2 px-1 hover:text-primary transition-colors focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
  
