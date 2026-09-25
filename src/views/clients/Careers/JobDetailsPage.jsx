"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { backendBaseUrl } from "../../../constants/apiUrl";
import AnimatedSection from "../../../components/AnimatedSection";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params?.id || "";

  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Popup Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Form State
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
    if (idOrSlug) {
      if (idOrSlug === "general-application") {
        setJob({
          jobId: "GENERAL",
          title: "General / Open Application",
          department: "Talent Acquisition Pool",
          jobType: "Full-time",
          workplaceType: "Hybrid",
          location: "Lahore / Remote, Pakistan",
          experienceLevel: "All Experience Levels",
          salaryRange: "Market Competitive",
          description:
            "Don't see an exact opening for your skillset? We are continuously hiring motivated candidates across Pakistan. Submit your CV directly to our HR talent pool.",
          requirements: [
            "Passion for high-impact marketplace technologies and customer solutions.",
            "Strong work ethic, integrity, and proactive problem-solving attitude.",
            "Relevant educational background or professional experience in your domain.",
          ],
          responsibilities: [
            "Contribute to Madadgaar's core products, partner ecosystem, or operational excellence.",
            "Work closely with cross-functional teams to build scalable solutions.",
          ],
          benefits: [
            "Market leading compensation packages.",
            "Comprehensive medical coverage for employee & family.",
            "Dynamic work culture, office catering, and flexible hours.",
          ],
          skills: ["Adaptability", "Collaboration", "Critical Thinking"],
        });
        setLoading(false);
      } else {
        fetchJobDetails();
      }
    }
  }, [idOrSlug]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${backendBaseUrl}/career/jobs/${idOrSlug}`);
      const data = await res.json();
      if (data.success && data.data?.job) {
        setJob(data.data.job);
        setRelatedJobs(data.data.relatedJobs || []);
      } else {
        setError(data.message || "Job posting not found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch job details from the server.");
    } finally {
      setLoading(false);
    }
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
      data.append("jobId", job?.jobId || "GENERAL");
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
          jobTitle: job?.title || "Career Position",
          candidateName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        });
      } else {
        alert(resData.message || "Failed to submit application.");
      }
    } catch (err) {
      console.error(err);
      alert("Server connection failed. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading vacancy details...</p>
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="container-content max-w-lg mx-auto text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Position Not Found</h2>
          <p className="text-sm text-gray-600 mb-6">{error || "This vacancy has expired or was removed."}</p>
          <Link
            href="/careers"
            className="btn-primary px-5 py-2.5 text-sm rounded-full font-semibold"
          >
            ← View All Openings
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-28 pb-20">
      {/* Breadcrumb */}
      <div className="container-content mb-6">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
          <Link href="/" className="hover:text-red-600">Home</Link>
          <span>/</span>
          <Link href="/careers" className="hover:text-red-600">Careers</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{job.title}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container-content grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="bg-red-50 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                style={{ color: "rgb(183, 36, 42)" }}
              >
                {job.department}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                {job.jobType} • {job.workplaceType || "On-site"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600 pt-2 border-t border-gray-100">
              <span>📍 {job.location}</span>
              <span>•</span>
              <span>💼 Experience: {job.experienceLevel}</span>
              <span>•</span>
              <span className="font-semibold text-gray-800">💰 {job.salaryRange || "Market Competitive"}</span>
            </div>
          </div>

          {/* Overview */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100">
              Role Overview
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100">
                Key Responsibilities
              </h2>
              <ul className="space-y-2.5">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm sm:text-base text-gray-700">
                    <span className="text-red-600 font-bold text-xs mt-1">•</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100">
                Requirements & Qualifications
              </h2>
              <ul className="space-y-2.5">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm sm:text-base text-gray-700">
                    <span className="text-red-600 font-bold text-xs mt-1">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100">
                What We Offer (Perks & Benefits)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {job.benefits.map((b, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 text-xs sm:text-sm text-gray-800 font-medium flex items-center gap-2">
                    <span>🎁</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Summary & Action Card */}
        <div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-28 space-y-5">
            <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
              Job Summary
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-gray-400 block font-medium">Department</span>
                <span className="font-bold text-gray-900">{job.department}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Job Type</span>
                <span className="font-bold text-gray-900">{job.jobType} ({job.workplaceType || "On-site"})</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Location</span>
                <span className="font-bold text-gray-900">{job.location}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Experience</span>
                <span className="font-bold text-gray-900">{job.experienceLevel}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Salary</span>
                <span className="font-bold text-gray-900">{job.salaryRange || "Market Competitive"}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubmissionSuccess(null);
                setIsApplyModalOpen(true);
              }}
              className="btn-primary w-full py-3 rounded-xl font-bold text-sm shadow-md"
            >
              Apply for this Role →
            </button>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">
                  More in {job.department}
                </h4>
                <div className="space-y-2">
                  {relatedJobs.map((rel) => (
                    <Link
                      key={rel.jobId}
                      href={`/careers/${rel.slug || rel.jobId}`}
                      className="block p-2.5 rounded-xl bg-gray-50 hover:bg-red-50 border border-gray-100 transition"
                    >
                      <span className="font-bold text-gray-900 text-xs block">{rel.title}</span>
                      <span className="text-[11px] text-gray-500 mt-0.5 block">{rel.location}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* APPLY POPUP MODAL */}
      {/* ======================================================= */}
      <AnimatePresence>
        {isApplyModalOpen && (
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
                onClick={() => setIsApplyModalOpen(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold transition"
              >
                ✕
              </button>

              {submissionSuccess ? (
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

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => setIsApplyModalOpen(false)}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm shadow-md transition"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-5">
                  <div className="pb-3 border-b border-gray-100">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-700">
                      Apply Online
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                      {job.title}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {job.department} • {job.location}
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
                        placeholder="e.g. 85,000"
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

                    {/* CV Upload */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Attach Resume / CV (PDF, DOCX) <span className="text-red-500">*</span>
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
                        placeholder="Tell us why you are a great fit..."
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
    </main>
  );
}
