"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import SEO from '../../components/SEO';
import teamMembers from '../../constants/teamMembers';

const TeamMemberDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const [expandedRole, setExpandedRole] = useState(null);

  const toggleRole = (index) => {
    setExpandedRole(expandedRole === index ? null : index);
  };
  
  // Find the team member by ID
  const member = teamMembers.find(m => m.id === parseInt(id));

  // If member not found, show 404
  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Team Member Not Found</h1>
          <p className="text-gray-600 mb-6">The team member you're looking for doesn't exist.</p>
          <button type="button"
            onClick={() => router.push('/about')}
            className="px-6 py-3 rounded-full text-white font-medium"
            style={{ backgroundColor: "rgb(183, 36, 42)" }}
          >
            Back to Team
          </button>
        </div>
      </div>
    );
  }

  // Create structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": member.name,
    "jobTitle": member.designation,
    "worksFor": {
      "@type": "Organization",
      "name": "Madadgaar Expert Partner",
      "url": "https://madadgaar.com.pk"
    },
    "email": member.email,
    "telephone": member.phone,
    "description": member.bio,
    "image": `https://madadgaar.com.pk${member.image}`,
    "sameAs": Object.values(member.socialLinks || {}).filter(Boolean),
    "knowsAbout": member.skills || [],
    "hasOccupation": {
      "@type": "Occupation",
      "name": member.designation,
      "responsibilities": member.roles ? member.roles.map(role => role.title) : [],
      "skills": member.skills || []
    }
  };

  return (
    <>
      <SEO
        title={`${member.name} - ${member.title} | Madadgaar Expert Partner`}
        description={`Meet ${member.name}, ${member.designation} at Madadgaar Expert Partner. ${member.bio.substring(0, 155)}...`}
        keywords={`${member.name}, ${member.title}, Madadgaar team, ${member.designation}, Pakistan marketplace team${member.skills ? ', ' + member.skills.join(', ') : ''}`}
        canonicalUrl={`https://madadgaar.com.pk/team/${member.id}`}
        ogImage={`https://madadgaar.com.pk${member.image}`}
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-red-600 transition">Home</Link>
              <span>/</span>
              <Link href="/about" className="hover:text-red-600 transition">About</Link>
              <span>/</span>
              <Link href="/about#team" className="hover:text-red-600 transition">Team</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{member.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <div className={`bg-gradient-to-br ${member.color} py-12 sm:py-16 lg:py-20`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="size-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full bg-white shadow-2xl overflow-hidden border-8 border-white/20">
                    {member.image && !member.image.includes('man') && !member.image.includes('Agent') ? (
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
                    <div className={`${member.image && !member.image.includes('man') && !member.image.includes('Agent') ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-8xl`}>
                      {member.icon}
                    </div>
                  </div>
                  {/* Status Badge */}
                  <div className="absolute bottom-4 right-4 bg-green-500 size-6 rounded-full border-4 border-white shadow-lg"></div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-white text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">{member.name}</h1>
                <p className="text-xl sm:text-2xl lg:text-3xl font-light mb-4 opacity-95">{member.designation}</p>
                {member.bio && (
                  <p className="text-base sm:text-lg opacity-90 max-w-2xl mb-6">{member.bio}</p>
                )}
                
                {/* Quick Contact */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="px-6 py-3 bg-white text-gray-900 rounded-full font-medium hover:shadow-lg transition flex items-center gap-2"
                    >
                      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Email
                    </a>
                  )}
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-medium hover:bg-white/30 transition flex items-center gap-2"
                    >
                      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call Now
                    </a>
                  )}
                </div>

                {/* Social Links */}
                {member.socialLinks && (
                  <div className="flex justify-center lg:justify-start gap-3">
                    {member.socialLinks.linkedin && (
                      <a
                        href={member.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="size-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition"
                        aria-label="LinkedIn"
                      >
                        <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </a>
                    )}
                    {member.socialLinks.instagram && (
                      <a
                        href={member.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="size-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition"
                        aria-label="Instagram"
                      >
                        <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.3.95a1.05 1.05 0 1 1-2.1 0a1.05 1.05 0 0 1 2.1 0z"/>
                        </svg>
                      </a>
                    )}
                    {member.socialLinks.twitter && (
                      <a
                        href={member.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="size-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition"
                        aria-label="Twitter"
                      >
                        <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                        </svg>
                      </a>
                    )}
                    {member.socialLinks.facebook && (
                      <a
                        href={member.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="size-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition"
                        aria-label="Facebook"
                      >
                        <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {member.socialLinks.github && (
                      <a
                        href={member.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="size-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition"
                        aria-label="GitHub"
                      >
                        <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <span className="w-1.5 sm:w-2 h-6 sm:h-8 rounded-full" style={{ backgroundColor: "rgb(183, 36, 42)" }}></span>
                  <span>About {member.name.split(' ')[0]}</span>
                </h2>
                <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed">
                  {member.bio}
                </p>
              </div>

              {/* Role & Responsibilities - Accordion Style */}
              <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <span className="w-1.5 sm:w-2 h-6 sm:h-8 rounded-full" style={{ backgroundColor: "rgb(183, 36, 42)" }}></span>
                  <span>Role & Responsibilities</span>
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  {member.roles && member.roles.length > 0 ? (
                    member.roles.map((role, index) => (
                      <div 
                        key={index} 
                        className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-red-300"
                      >
                        {/* Accordion Header - Always Visible */}
                        <button type="button"
                          onClick={() => toggleRole(index)}
                          className="w-full flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                          aria-expanded={expandedRole === index}
                          aria-controls={`role-content-${index}`}
                        >
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div 
                              className="size-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0" 
                              style={{ backgroundColor: "rgba(183, 36, 42, 0.1)" }}
                            >
                              {role.icon}
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg text-left truncate sm:whitespace-normal">
                              {role.title}
                            </h3>
                          </div>
                          <svg
                            className={`size-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform duration-300 ${
                              expandedRole === index ? 'rotate-180' : 'rotate-0'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ color: "rgb(183, 36, 42)" }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Accordion Content - Expandable */}
                        <div
                          id={`role-content-${index}`}
                          className={`transition-all duration-300 ease-in-out ${
                            expandedRole === index 
                              ? 'max-h-96 opacity-100' 
                              : 'max-h-0 opacity-0'
                          } overflow-hidden`}
                        >
                          <div className="p-3 sm:p-4 bg-white border-t border-gray-100">
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                              {role.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      {/* Default roles for members without specific roles */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <button type="button"
                          onClick={() => toggleRole(0)}
                          className="w-full flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            <div className="size-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl" style={{ backgroundColor: "rgba(183, 36, 42, 0.1)" }}>
                              🎯
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg text-left">Strategic Leadership</h3>
                          </div>
                          <svg className={`size-5 sm:w-6 sm:h-6 transition-transform ${expandedRole === 0 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgb(183, 36, 42)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className={`transition-all duration-300 ${expandedRole === 0 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                          <div className="p-3 sm:p-4 bg-white border-t">
                            <p className="text-gray-700 text-sm sm:text-base">Leading strategic initiatives and driving organizational growth</p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <button type="button"
                          onClick={() => toggleRole(1)}
                          className="w-full flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            <div className="size-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl" style={{ backgroundColor: "rgba(183, 36, 42, 0.1)" }}>
                              👥
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg text-left">Team Management</h3>
                          </div>
                          <svg className={`size-5 sm:w-6 sm:h-6 transition-transform ${expandedRole === 1 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgb(183, 36, 42)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className={`transition-all duration-300 ${expandedRole === 1 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                          <div className="p-3 sm:p-4 bg-white border-t">
                            <p className="text-gray-700 text-sm sm:text-base">Building and mentoring high-performing teams</p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <button type="button"
                          onClick={() => toggleRole(2)}
                          className="w-full flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            <div className="size-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl" style={{ backgroundColor: "rgba(183, 36, 42, 0.1)" }}>
                              💡
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg text-left">Innovation</h3>
                          </div>
                          <svg className={`size-5 sm:w-6 sm:h-6 transition-transform ${expandedRole === 2 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgb(183, 36, 42)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className={`transition-all duration-300 ${expandedRole === 2 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                          <div className="p-3 sm:p-4 bg-white border-t">
                            <p className="text-gray-700 text-sm sm:text-base">Driving innovation and implementing cutting-edge solutions</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Skills & Expertise */}
              {member.skills && member.skills.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 lg:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <span className="w-1.5 sm:w-2 h-6 sm:h-8 rounded-full" style={{ backgroundColor: "rgb(183, 36, 42)" }}></span>
                    <span>Skills & Expertise</span>
                  </h2>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {member.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Contact Information</h3>
                <div className="space-y-3 sm:space-y-4">
                  {member.email && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="size-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(183, 36, 42, 0.1)", color: "rgb(183, 36, 42)" }}>
                        <svg className="size-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <a href={`mailto:${member.email}`} className="text-xs sm:text-sm text-gray-900 hover:text-red-600 break-all block">
                          {member.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="size-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(183, 36, 42, 0.1)", color: "rgb(183, 36, 42)" }}>
                        <svg className="size-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <a href={`tel:${member.phone}`} className="text-xs sm:text-sm text-gray-900 hover:text-red-600 block">
                          {member.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              {member.socialLinks && (
                <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Connect on Social Media</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {member.socialLinks.linkedin && (
                      <a
                        href={member.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[80px] sm:min-w-[100px] flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
                      >
                        <div className="size-8 sm:w-10 sm:h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                          <svg className="size-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-gray-700">LinkedIn</span>
                      </a>
                    )}
                    {member.socialLinks.instagram && (
                      <a
                        href={member.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[80px] sm:min-w-[100px] flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition"
                      >
                        <div className="size-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white">
                          <svg className="size-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.3.95a1.05 1.05 0 1 1-2.1 0a1.05 1.05 0 0 1 2.1 0z"/>
                          </svg>
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-gray-700">Instagram</span>
                      </a>
                    )}
                    {member.socialLinks.facebook && (
                      <a
                        href={member.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[80px] sm:min-w-[100px] flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
                      >
                        <div className="size-8 sm:w-10 sm:h-10 rounded-lg bg-blue-800 flex items-center justify-center text-white">
                          <svg className="size-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-gray-700">Facebook</span>
                      </a>
                    )}
                    {member.socialLinks.github && (
                      <a
                        href={member.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[80px] sm:min-w-[100px] flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <div className="size-8 sm:w-10 sm:h-10 rounded-lg bg-gray-800 flex items-center justify-center text-white">
                          <svg className="size-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-gray-700">GitHub</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link href="/about" className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition text-sm">
                    <svg className="size-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs sm:text-sm">About Madadgaar</span>
                  </Link>
                  <Link href="/about#team" className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition text-sm">
                    <svg className="size-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs sm:text-sm">Meet the Team</span>
                  </Link>
                  <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition text-sm">
                    <svg className="size-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs sm:text-sm">Back to Home</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meet Other Team Members */}
        <div className="bg-gray-100 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
              Meet Other Team Members
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {teamMembers.filter(m => m.id !== member.id).map((otherMember) => (
                <Link
                  key={otherMember.id}
                  href={`/team/${otherMember.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  <div className={`h-24 sm:h-28 lg:h-32 bg-gradient-to-br ${otherMember.color} flex items-center justify-center`}>
                    <div className="size-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full bg-white flex items-center justify-center text-3xl sm:text-3xl lg:text-4xl">
                      {otherMember.icon}
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 lg:p-4 text-center">
                    <h3 className="font-bold text-gray-900 mb-1 text-xs sm:text-sm lg:text-base line-clamp-2">{otherMember.name}</h3>
                    <p className="text-[10px] sm:text-xs lg:text-sm line-clamp-2" style={{ color: "rgb(183, 36, 42)" }}>{otherMember.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamMemberDetail;
