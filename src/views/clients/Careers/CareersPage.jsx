"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { backendBaseUrl } from "../../../constants/apiUrl";
import AnimatedSection from "../../../components/AnimatedSection";

export default function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [selectedWorkplace, setSelectedWorkplace] = useState("All");

  const jobTypes = ["All", "Full-time", "Part-time", "Remote", "Hybrid", "Internship"];
  const workplaces = ["All", "On-site", "Remote", "Hybrid"];

  useEffect(() => {
    fetchJobs();
  }, [selectedDept, selectedJobType, selectedWorkplace]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        ...(selectedDept !== "All" && { department: selectedDept }),
        ...(selectedJobType !== "All" && { jobType: selectedJobType }),
        ...(selectedWorkplace !== "All" && { workplaceType: selectedWorkplace }),
        ...(search && { search }),
        limit: "50",
      });

      const res = await fetch(`${backendBaseUrl}/career/jobs?${query}`);
      const data = await res.json();
      if (data.success && data.data) {
        setJobs(data.data.jobs || []);
        if (data.data.departments) {
          setDepartments(data.data.departments);
        }
      } else {
        setError(data.message || "Unable to load open positions.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const benefitsList = [
    {
      icon: "🚀",
      title: "Fast-Track Career Growth",
      desc: "Work on high-impact fintech, insurance, and real estate solutions shaping Pakistan's economy.",
    },
    {
      icon: "💎",
      title: "Market Competitive Pay",
      desc: "We reward talent with top-tier compensation packages, periodic appraisals, and performance bonuses.",
    },
    {
      icon: "🏥",
      title: "Comprehensive Healthcare",
      desc: "Full medical coverage for you and your family to keep you healthy, protected, and supported.",
    },
    {
      icon: "⚡",
      title: "Modern & Agile Culture",
      desc: "Work in a supportive, collaborative, and forward-thinking environment where your voice counts.",
    },
    {
      icon: "☕",
      title: "Office Perks & Meals",
      desc: "Daily catered meals, unlimited premium tea & coffee, snacks, games, and team retreat outings.",
    },
    {
      icon: "📚",
      title: "Learning & Development",
      desc: "Annual allowance for technical certifications, leadership workshops, and conference sponsorships.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#fcfcfd] pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e53935_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Decorative Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/25 rounded-full blur-3xl pointer-events-none" />

        <div className="container-content relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white/10 text-primary-200 border border-white/10 backdrop-blur-md mb-6">
              ✨ We are hiring top talent across Pakistan!
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Build the Future of <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-orange-400">
                Services in Pakistan
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Join our mission to revolutionize property solutions, installment plans, loans, and insurance for millions of people across the country.
            </p>
          </motion.div>

          {/* Search Box in Hero */}
          <motion.form
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl"
          >
            <div className="relative flex-1">
              <svg
                className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search job title, skills, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-transparent text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition shadow-md shrink-0"
            >
              Find Openings
            </button>
          </motion.form>

          {/* Quick Metrics */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl sm:text-3xl font-bold text-white">{jobs.length}+</div>
              <div className="text-xs text-gray-400 mt-1">Open Positions</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl sm:text-3xl font-bold text-white">8+</div>
              <div className="text-xs text-gray-400 mt-1">Departments</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl sm:text-3xl font-bold text-white">Lahore & Remote</div>
              <div className="text-xs text-gray-400 mt-1">Work Modes</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl sm:text-3xl font-bold text-white">4.8 / 5.0</div>
              <div className="text-xs text-gray-400 mt-1">Team Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Madadgaar - Benefits */}
      <section className="container-content py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full">
            Life at Madadgaar
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-3">
            Why You’ll Love Working With Us
          </h2>
          <p className="text-gray-600 mt-3 text-sm sm:text-base">
            We are building an inclusive, energetic, and reward-driven culture where passionate individuals thrive and make a tangible difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefitsList.map((item, idx) => (
            <AnimatedSection key={idx} delay={idx * 0.08}>
              <div className="h-full p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/80 shadow-soft hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Job Openings Section */}
      <section id="openings" className="container-content py-8 sm:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full">
              Current Vacancies
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
              Explore Open Roles
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Find the perfect role that matches your expertise, ambition, and career aspirations.
            </p>
          </div>

          <div className="text-sm font-semibold text-gray-500">
            Showing <span className="text-gray-900 font-bold">{jobs.length}</span> positions
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-sm mb-8 space-y-4">
          {/* Department Chips */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2.5">
              Filter by Department:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDept("All")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  selectedDept === "All"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                All Departments
              </button>

              {departments.map((dept) => (
                <button
                  key={dept.name}
                  onClick={() => setSelectedDept(dept.name)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                    selectedDept === dept.name
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <span>{dept.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                      selectedDept === dept.name
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {dept.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Job Type:</span>
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {jobTypes.map((t) => (
                  <option key={t} value={t}>
                    {t === "All" ? "All Types" : t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Workplace:</span>
              <select
                value={selectedWorkplace}
                onChange={(e) => setSelectedWorkplace(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {workplaces.map((w) => (
                  <option key={w} value={w}>
                    {w === "All" ? "All Environments" : w}
                  </option>
                ))}
              </select>
            </div>

            {(selectedDept !== "All" || selectedJobType !== "All" || selectedWorkplace !== "All" || search) && (
              <button
                onClick={() => {
                  setSelectedDept("All");
                  setSelectedJobType("All");
                  setSelectedWorkplace("All");
                  setSearch("");
                }}
                className="text-xs text-red-600 hover:text-red-700 font-semibold ml-auto"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
            <p className="mt-4 text-sm text-gray-500">Fetching latest openings...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl max-w-md mx-auto text-red-700">
            <p className="font-semibold text-sm mb-3">{error}</p>
            <button
              onClick={fetchJobs}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🔍
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Matching Openings Found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              We could not find any active vacancies matching your selected filters. Try broadening your criteria or submit a general application below.
            </p>
            <Link
              href="/careers/general-application"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition"
            >
              Submit Open Application
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobs.map((job, idx) => (
              <motion.div
                key={job._id || job.jobId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className={`p-6 rounded-2xl bg-white border transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col justify-between ${
                  job.featured
                    ? "border-red-300 ring-1 ring-red-100"
                    : "border-gray-200/90 shadow-soft"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-200">
                      {job.department}
                    </span>
                    {job.featured && (
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-red-100 text-red-700 rounded-full">
                        🔥 Featured
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {job.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-6">
                    <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                      📍 {job.location}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                      💼 {job.jobType} ({job.workplaceType || "On-site"})
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                      🎯 {job.experienceLevel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-[11px] text-gray-400 block font-medium">Salary</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      {job.salaryRange || "Market Competitive"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/careers/${job.slug || job.jobId}`}
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/careers/${job.slug || job.jobId}#apply`}
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition shadow-sm"
                    >
                      Apply Now →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* General Application Banner */}
      <section className="container-content mt-16 sm:mt-24">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden shadow-2xl border border-gray-800">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950/60 border border-red-800/60 px-3 py-1 rounded-full">
              Don't see your specific role?
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-4 leading-tight">
              Send us an Open Application
            </h2>
            <p className="text-gray-300 text-sm sm:text-base mt-3 leading-relaxed">
              We are constantly growing and eager to connect with exceptional engineers, marketers, sales leaders, and operators across Pakistan. Submit your CV directly to our talent pool.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/careers/general-application"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-md transition"
              >
                Submit Open Application →
              </Link>
              <a
                href="mailto:careers@madadgaar.com.pk"
                className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold rounded-xl text-sm transition"
              >
                Email HR directly
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
