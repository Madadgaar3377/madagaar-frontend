import React from 'react';
import { Link } from 'react-router-dom';

/**
 * TeamMemberCard Component
 * Displays team member information with hover effects and links to detail page
 */
const TeamMemberCard = ({ member, showDetails = false }) => {
  const CardWrapper = showDetails ? Link : 'div';
  const cardProps = showDetails ? { to: `/team/${member.id}` } : {};

  return (
    <CardWrapper 
      {...cardProps}
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer block group"
    >
      {/* Image Section */}
      <div className={`h-48 bg-gradient-to-br ${member.color} flex items-center justify-center relative overflow-hidden`}>
        {member.image && member.image !== '/Media/man 1.png' && member.image !== '/Media/man 2.png' && member.image !== '/Media/man 3.png' && member.image !== '/Media/Agent-1.png' ? (
          <img 
            src={member.image} 
            alt={member.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`${member.image && member.image !== '/Media/man 1.png' && member.image !== '/Media/man 2.png' && member.image !== '/Media/man 3.png' && member.image !== '/Media/Agent-1.png' ? 'hidden' : 'flex'} w-32 h-32 rounded-full bg-white items-center justify-center text-6xl shadow-lg`}>
          {member.icon}
        </div>
        
        {/* Hover Overlay */}
        {showDetails && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-semibold">
              View Profile
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3 sm:p-4 lg:p-6 text-center">
        <h3 className="text-sm sm:text-base lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2">{member.name}</h3>
        <p className="text-[10px] sm:text-xs lg:text-sm mb-2 sm:mb-3 line-clamp-2" style={{ color: "rgb(183, 36, 42)" }}>
          {member.title}
        </p>
        
        {/* Social Links */}
        {member.socialLinks && (
          <div className="flex justify-center gap-1.5 sm:gap-2 lg:gap-3 mt-2 sm:mt-3 lg:mt-4">
            {member.socialLinks.linkedin && (
              <a
                href={member.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition"
                onClick={(e) => e.stopPropagation()}
                aria-label="LinkedIn"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            )}
            {member.socialLinks.instagram && (
              <a
                href={member.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-sky-500 flex items-center justify-center text-white hover:bg-sky-600 transition"
                onClick={(e) => e.stopPropagation()}
                aria-label="Instagram"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.3.95a1.05 1.05 0 1 1-2.1 0a1.05 1.05 0 0 1 2.1 0z"/>
                </svg>
              </a>
            )}
            {member.socialLinks.facebook && (
              <a
                href={member.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-blue-800 flex items-center justify-center text-white hover:bg-blue-900 transition"
                onClick={(e) => e.stopPropagation()}
                aria-label="Facebook"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
            {member.socialLinks.github && (
              <a
                href={member.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-900 transition"
                onClick={(e) => e.stopPropagation()}
                aria-label="GitHub"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </CardWrapper>
  );
};

export default TeamMemberCard;
