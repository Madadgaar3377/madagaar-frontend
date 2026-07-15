"use client";

import React, { useState } from 'react';
import OptimizedImage from './OptimizedImage';

/**
 * TeamMemberCard Component
 * Displays team member information with contact button
 */
const TeamMemberCard = ({ member }) => {
  const [imageError, setImageError] = useState(false);
  const contactEmail = member.email || 'support@madadgaar.com.pk';
  const subject = `Inquiry for ${member.name} - ${member.title}`;
  const body = `Dear ${member.name},\n\nI would like to get in touch with you regarding...\n\nBest regards`;
  const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const placeholderIcons = ['/Media/man 1.png', '/Media/man 2.png', '/Media/man 3.png', '/Media/Agent-1.png'];
  const showPhoto = member.image && !placeholderIcons.includes(member.image) && !imageError;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg interactive-card card-hover-lift group">
      {/* Image  square frame, face anchored top, fills card on mobile & desktop */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        {showPhoto ? (
          <OptimizedImage
            src={member.image}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
            className="object-cover object-top"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${member.color} flex items-center justify-center`}>
            <div className="size-24 sm:size-28 lg:size-32 rounded-full bg-white flex items-center justify-center text-5xl sm:text-6xl shadow-lg">
              {member.icon}
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3 sm:p-4 lg:p-6 text-center">
        <h3 className="text-sm sm:text-base lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2">{member.name}</h3>
        <p className="text-[10px] sm:text-xs lg:text-sm mb-2 sm:mb-3 line-clamp-2" style={{ color: "rgb(183, 36, 42)" }}>
          {member.title}
        </p>
        <p className="text-[9px] sm:text-[10px] lg:text-xs text-gray-600 mb-3 sm:mb-4 line-clamp-1">
          {member.designation}
        </p>
        
        {/* Contact Button */}
        <a
          href={mailtoLink}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs sm:text-sm lg:text-base font-semibold py-2 px-4 sm:py-2.5 sm:px-5 lg:py-3 lg:px-6 rounded-lg btn-smooth shadow-md"
        >
          <svg 
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            />
          </svg>
          Contact Us
        </a>
        
        {/* Social Links */}
        {member.socialLinks && (
          <div className="flex justify-center gap-1.5 sm:gap-2 lg:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
            {member.socialLinks.linkedin && (
              <a
                href={member.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="size-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            )}
            {member.socialLinks.instagram && (
              <a
                href={member.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="size-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition transform hover:scale-110"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.3.95a1.05 1.05 0 1 1-2.1 0a1.05 1.05 0 0 1 2.1 0z"/>
                </svg>
              </a>
            )}
            {member.socialLinks.facebook && (
              <a
                href={member.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="size-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-blue-800 flex items-center justify-center text-white hover:bg-blue-900 transition transform hover:scale-110"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
            {member.socialLinks.github && (
              <a
                href={member.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="size-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-900 transition transform hover:scale-110"
                aria-label="GitHub"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMemberCard;
