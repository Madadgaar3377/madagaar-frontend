"use client";

import React, { useState, useEffect, useRef } from "react";
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

  // Popup Modal States
  const [selectedJobForDetails, setSelectedJobForDetails] = useState(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  // Application Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    currentCity: "Lahore",
    experienceYears: "1-2 Years",
    currentSalary: "",
    expectedSalary: "",
    noticePeriod: "Immediate",
    portfolioUrl: "",
    coverLetter: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  const fileInputRef = useRef(null);

  const pakCities = [
    "Lahore",
    "Karachi",
    "Islamabad",
    "Rawalpindi",
    "Faisalabad",
    "Multan",
    "Peshawar",
    "Quetta",
    "Sialkot",
    "Gujranwala",
    "Remote (Any City)",
    "Other",
  ];

  const experienceOptions = [
    "Fresh / Entry Level",
    "Less than 1 Year",
    "1-2 Years",
    "2-4 Years",
    "4-6 Years",
    "6+ Years",
    "Executive / Lead",
  ];

  const noticePeriodOptions = [
    "Immediate (Available now)",
    "15 Days",
    "1 Month",
    "2 Months",
    "More than 2 Months",
  ];

  useEffect(() => {
    fetchJobs();
  }, [selectedDept, selectedJobType]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        ...(selectedDept !== "All" && { department: selectedDept }),
        ...(selectedJobType !== "All" && { jobType: selectedJobType }),
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

  const openApplyModal = (job) => {
    setSelectedJobForApply(job);
    setSelectedJobForDetails(null);
    setSubmissionSuccess(null);
    setFileError("");
    setSelectedFile(null);
  };

  const openDetailsModal = (job) => {
    setSelectedJobForDetails(job);
  };

  const closeAllModals = () => {
    setSelectedJobForDetails(null);
    setSelectedJobForApply(null);
    setSubmissionSuccess(null);
    setFileError("");
    setSelectedFile(null);
  };

  const validateAndSetFile = (file) => {
    setFileError("");
    if (!file) return;

    const allowedExtensions = ["pdf", "doc", "docx"];
    const ext = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setFileError("Only PDF, DOC, or DOCX documents are accepted as resumes.");
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError("Resume file size must be less than 10MB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError("Please upload your CV / Resume before submitting.");
      return;
    }

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.currentCity.trim()) {
      alert("Please fill in all required fields (Name, Email, Phone, and City).");
      return;
    }

    const phoneClean = formData.phone.replace(/[\s-]/g, "");
    if (phoneClean.length < 10) {
      alert("Please enter a valid phone number (e.g. 03001234567).");
      return;
    }

    setIsSubmitting(true);
    setFileError("");

    try {
      const data = new FormData();
      data.append("jobId", selectedJobForApply?.jobId || "GENERAL");
      data.append("fullName", formData.fullName.trim());
      data.append("email", formData.email.trim().toLowerCase());
      data.append("phone", formData.phone.trim());
      data.append("whatsapp", formData.whatsapp.trim());
      data.append("currentCity", formData.currentCity.trim());
      data.append("experienceYears", formData.experienceYears);
      data.append("currentSalary", formData.currentSalary.trim());
      data.append("expectedSalary", formData.expectedSalary.trim());
      data.append("noticePeriod", formData.noticePeriod);
      data.append("portfolioUrl", formData.portfolioUrl.trim());
      data.append("coverLetter", formData.coverLetter.trim());
      data.append("resume", selectedFile);

      const res = await fetch(`${backendBaseUrl}/career/apply`, {
        method: "POST",
        body: data,
      });

      const resData = await res.json();
      if (resData.success) {
        setSubmissionSuccess({
          applicationId: resData.data?.applicationId || "SUBMITTED",
          jobTitle: selectedJobForApply?.title || "Career Position",
          candidateName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        });
      } else {
        alert(resData.message || "Failed to submit application. Please check your details.");
      }
    } catch (err) {
      console.error(err);
      alert("Connection failed. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <AnimatedSection animation="fadeInUp" delay={0} className="w-full">
        <section className="w-full bg-gray-50 section-padding">
          <div className="container-content page-hero">
            <div className="page-hero-col flex justify-center lg:order-first">
              <img
                src="/Media/Aboutscreen/about-h4-1.png"
                alt="Careers at Madadgaar - Join our team in Pakistan"
                loading="lazy"
                className="rounded-xl sm:rounded-2xl shadow-lg page-media object-cover max-h-[360px]"
              />
            </div>

            <div className="page-hero-col space-y-3 sm:space-y-4 lg:space-y-6">
              <button
                type="button"
                className="bg-white rounded-pill shadow-lg pt-2 pb-2 pr-3 pl-3 text-xs sm:text-sm rounded-xl font-semibold"
                style={{ color: "rgb(183, 36, 42)" }}
              >
                Careers at Madadgaar
              </button>
              <h1 className="text-responsive-lg font-bold text-gray-900 leading-tight">
                Join Our Mission | Build Pakistan's Leading Services Platform
              </h1>
              <p className="text-gray-700 text-responsive-sm leading-relaxed">
                Madadgaar is growing rapidly! We are looking for talented, passionate individuals across Pakistan to help us simplify property solutions, loans, installment plans, and insurance. Work with an energetic team, accelerate your career, and create real impact.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#openings"
                  className="btn-primary px-5 py-2.5 text-sm sm:text-base rounded-full font-semibold inline-flex items-center gap-2"
                >
                  View Open Positions ↓
                </a>
                <button
                  type="button"
                  onClick={() =>
                    openApplyModal({
                      jobId: "GENERAL",
                      title: "General / Open Application",
                      department: "General Talent Pool",
                      location: "Pakistan (Lahore / Remote)",
                    })
                  }
                  className="px-5 py-2.5 rounded-full text-sm font-semibold bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 transition shadow-sm"
                >
                  Submit Open CV
                </button>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Why Work With Us Section */}
      <AnimatedSection animation="fadeInUp" delay={80} className="w-full">
        <section className="w-full bg-gradient-to-br from-gray-50 to-white section-padding">
          <div className="container-content">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-responsive-2xl font-bold text-gray-900 mb-3">
                Why Build Your Career at Madadgaar?
              </h2>
              <p className="text-gray-600 text-responsive-base max-w-3xl mx-auto">
                We believe great companies are built by empowered people. Here is what you can look forward to as part of our team:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                <div
                  className="size-16 rounded-full mx-auto flex items-center justify-center text-white text-3xl mb-4"
                  style={{ backgroundColor: "rgb(183, 36, 42)" }}
                >
                  🚀
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Accelerated Growth</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Fast-track career advancement, mentorship from industry leaders, and exposure to cutting-edge technology.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                <div
                  className="size-16 rounded-full mx-auto flex items-center justify-center text-white text-3xl mb-4"
                  style={{ backgroundColor: "rgb(183, 36, 42)" }}
                >
                  💰
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Competitive Packages</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Market-leading salaries, performance bonuses, annual appraisals, and transparent incentive schemes.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                <div
                  className="size-16 rounded-full mx-auto flex items-center justify-center text-white text-3xl mb-4"
                  style={{ backgroundColor: "rgb(183, 36, 42)" }}
                >
                  🏥
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Health & Wellness</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Comprehensive medical coverage for you and your family, paid leaves, and supportive wellness programs.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                <div
                  className="size-16 rounded-full mx-auto flex items-center justify-center text-white text-3xl mb-4"
                  style={{ backgroundColor: "rgb(183, 36, 42)" }}
                >
                  ⚡
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Modern Culture</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Collaborative atmosphere, daily office refreshments, regular celebrations, and flexible workplace policies.
                </p>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Live Openings Section */}
      <section id="openings" className="w-full bg-white section-padding">
        <div className="container-content">
          <div className="text-center mb-8">
            <h2 className="text-responsive-2xl font-bold text-gray-900 mb-2">
              Current Open Positions
            </h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              Explore open roles across all departments. Click <strong>Apply Now</strong> to submit your CV in seconds.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 mb-8 space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by job title or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-sm transition"
              >
                Search
              </button>
            </form>

            {/* Department Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-200">
              <button
                onClick={() => setSelectedDept("All")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  selectedDept === "All"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                All Departments ({jobs.length})
              </button>

              {departments.map((dept) => (
                <button
                  key={dept.name}
                  onClick={() => setSelectedDept(dept.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                    selectedDept === dept.name
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span>{dept.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      selectedDept === dept.name
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {dept.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Job Listings Cards */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto" />
              <p className="mt-3 text-sm text-gray-500">Loading vacancies...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-md mx-auto">
              <p className="text-sm font-semibold">{error}</p>
              <button
                onClick={fetchJobs}
                className="mt-3 px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200 max-w-xl mx-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Openings Found</h3>
              <p className="text-sm text-gray-500 mb-5">
                No active postings match your current filter. You can submit an open application directly.
              </p>
              <button
                type="button"
                onClick={() =>
                  openApplyModal({
                    jobId: "GENERAL",
                    title: "General / Open Application",
                    department: "General Talent Pool",
                    location: "Pakistan",
                  })
                }
                className="btn-primary px-5 py-2.5 text-sm rounded-full font-semibold"
              >
                Submit Open Application
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job._id || job.jobId}
                  className={`bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${
                    job.featured
                      ? "border-red-300 ring-1 ring-red-100 shadow-md"
                      : "border-gray-200 shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-800">
                        {job.department}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {job.jobType}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                      {job.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-gray-600 mb-5">
                      <div className="flex items-center gap-1.5">
                        <span>📍</span>
                        <span>{job.location} ({job.workplaceType || "On-site"})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>💼</span>
                        <span>Experience: {job.experienceLevel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                        <span>💰</span>
                        <span>{job.salaryRange || "Market Competitive"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => openDetailsModal(job)}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition text-center"
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={() => openApplyModal(job)}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition shadow-sm text-center"
                    >
                      Apply Now →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================= */}
      {/* POPUP MODAL 1: JOB DETAILS MODAL */}
      {/* ======================================================= */}
      <AnimatePresence>
        {selectedJobForDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeAllModals}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold transition"
              >
                ✕
              </button>

              {/* Modal Header */}
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-700">
                  {selectedJobForDetails.department}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                  {selectedJobForDetails.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 mt-2">
                  <span>📍 {selectedJobForDetails.location}</span>
                  <span>•</span>
                  <span>💼 {selectedJobForDetails.jobType} ({selectedJobForDetails.workplaceType || "On-site"})</span>
                  <span>•</span>
                  <span>🎯 {selectedJobForDetails.experienceLevel}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Role Overview
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedJobForDetails.description}
                </p>
              </div>

              {/* Responsibilities */}
              {selectedJobForDetails.responsibilities && selectedJobForDetails.responsibilities.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Responsibilities
                  </h3>
                  <ul className="space-y-2">
                    {selectedJobForDetails.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-red-600 font-bold text-xs mt-0.5">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {selectedJobForDetails.requirements && selectedJobForDetails.requirements.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Requirements & Qualifications
                  </h3>
                  <ul className="space-y-2">
                    {selectedJobForDetails.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-red-600 font-bold text-xs mt-0.5">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {selectedJobForDetails.benefits && selectedJobForDetails.benefits.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Benefits & Perks
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedJobForDetails.benefits.map((b, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-gray-50 text-xs text-gray-800 font-medium flex items-center gap-2">
                        <span>🎁</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => openApplyModal(selectedJobForDetails)}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md transition"
                >
                  Apply for this Position →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================= */}
      {/* POPUP MODAL 2: APPLY FOR JOB POPUP MODAL */}
      {/* ======================================================= */}
      <AnimatePresence>
        {selectedJobForApply && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeAllModals}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold transition"
              >
                ✕
              </button>

              {submissionSuccess ? (
                /* Success Confirmation State Inside Popup */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-inner">
                    ✓
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Application Submitted!
                  </h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    Thank you, <strong>{submissionSuccess.candidateName}</strong>. Your CV has been successfully uploaded for <strong>{submissionSuccess.jobTitle}</strong>.
                  </p>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 max-w-sm mx-auto text-left space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Application ID:</span>
                      <span className="font-mono font-bold text-red-600">{submissionSuccess.applicationId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email Confirmation:</span>
                      <span className="font-medium text-gray-800">{submissionSuccess.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">SMS Alert to:</span>
                      <span className="font-medium text-gray-800">{submissionSuccess.phone}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Our talent acquisition team will review your application and update your status promptly.
                  </p>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={closeAllModals}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm shadow-md transition"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Application Form */
                <form onSubmit={handleApplySubmit} className="space-y-5">
                  <div className="pb-3 border-b border-gray-100">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-700">
                      Apply Online
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                      {selectedJobForApply.title}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedJobForApply.department} • {selectedJobForApply.location || "Lahore, Pakistan"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Muhammad Ali"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="0300 1234567"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Current City <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.currentCity}
                        onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                      >
                        {pakCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Total Experience
                      </label>
                      <select
                        value={formData.experienceYears}
                        onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                      >
                        {experienceOptions.map((exp) => (
                          <option key={exp} value={exp}>
                            {exp}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Expected Salary (PKR / month)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 80,000"
                        value={formData.expectedSalary}
                        onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Notice Period
                      </label>
                      <select
                        value={formData.noticePeriod}
                        onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                      >
                        {noticePeriodOptions.map((np) => (
                          <option key={np} value={np}>
                            {np}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Portfolio / LinkedIn Profile Link
                      </label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={formData.portfolioUrl}
                        onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                      />
                    </div>

                    {/* CV Upload Box */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Attach CV / Resume (PDF, DOCX) <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                      />

                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-5 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors ${
                          selectedFile
                            ? "border-emerald-500 bg-emerald-50/40"
                            : fileError
                            ? "border-red-400 bg-red-50/40"
                            : "border-gray-300 hover:border-red-500 bg-gray-50"
                        }`}
                      >
                        {selectedFile ? (
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                              PDF
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold text-gray-900 truncate max-w-xs">
                                {selectedFile.name}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                              }}
                              className="text-red-600 font-bold ml-2 text-xs hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span className="text-xl block mb-1">📄</span>
                            <p className="text-xs font-semibold text-gray-800">
                              Click to choose CV or drag & drop file here
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Supports PDF or DOCX up to 10MB
                            </p>
                          </div>
                        )}
                      </div>

                      {fileError && (
                        <p className="text-xs font-semibold text-red-600 mt-1">{fileError}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Short Cover Note (Optional)
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Why are you a great fit for this position?"
                        value={formData.coverLetter}
                        onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Uploading CV & Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                      🔒 Your CV is saved securely on server disk storage. Confirmation will be sent to your email & phone.
                    </p>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
