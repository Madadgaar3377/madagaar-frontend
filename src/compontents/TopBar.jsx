import React from "react";
import { Mail, Phone, MessageCircle } from "lucide-react"; // lightweight icon set

const TopBar = () => {
  return (
    <div className="w-full bg-gray-900 text-gray-200 py-3 px-16 flex flex-col sm:flex-row justify-between items-center text-sm">
      {/* Left Side - Email */}
      <div className="flex items-center space-x-2">
        <Mail size={16} className="text-gray-400" />
        <a
          href="mailto:help.madadgaar@gmail.com"
          className="hover:text-white transition-colors text-gray-200 font-bold"
        >
          help.madadgaar@gmail.com
        </a>
      </div>

      {/* Right Side - Phone / WhatsApp */}
      <div className="flex items-center space-x-4 mt-2 sm:mt-0">
        <div className="flex items-center space-x-2">
          <Phone size={16} className="text-gray-400" />
          <a
            href="tel:+923071113330"
            className="hover:text-white transition-colors font-bold"
          >
            +92 307 1113330
          </a>
        </div>

        <div className="flex items-center space-x-2">
          <MessageCircle size={16} className="text-green-500" />
          <a
            href="https://wa.me/923071113330"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white green-500 transition-colors font-bold"
          >
           +92 307 1113330
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
