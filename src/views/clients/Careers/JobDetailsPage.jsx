"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { backendBaseUrl } from "../../../constants/apiUrl";
import { Toast, useToast } from "../../../components/Toast";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params?.id || "";

  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const formRef = useRef(null);

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
            "Don't see a vacancy matching your specific domain or skillset? We are constantly expanding across Pakistan in Engineering, Sales, Customer Support, Marketing, Operations, and Finance. Submit your CV directly to our HR database.",
          requirements: [
            "Passion for high-impact marketplace technologies and solving customer problems.",
            "Strong work ethic, integrity, and proactive problem-solving attitude.",
            "Relevant educational background or professional experience in your domain.",
          ],
          responsibilities: [
            "Contribute to Madadgaar's core products, partner ecosystem, or operational excellence.",
            "Work closely with multi-disciplinary squads to build scalable features and services.",
          ],
          benefits: [
            "Market leading compensation packages.",
            "Medical insurance for employee and immediate dependents.",
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
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

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError("Please upload your CV / Resume before submitting.");
      return;
    }

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.currentCity.trim()) {
      alert("Please fill in all required fields (Name, Email, Phone, and City).");
      return;
    }

    // Phone validation
    const phoneClean = formData.phone.replace(/[\s-]/g, "");
    if (phoneClean.length < 10) {
      alert("Please enter a valid phone number (e.g. 03001234567 or +923001234567).");
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
        alert(resData.message || "Failed to submit application. Please check your details.");
      }
    } catch (err) {
      console.error(err);
      alert("Server connection failed. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToApply = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fcfcfd] pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading vacancy details...</p>
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="min-h-screen bg-[#fcfcfd] pt-32 pb-20">
        <div className="container-content max-w-lg mx-auto text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 text-2xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vacancy Not Found</h2>
          <p className="text-sm text-gray-600 mb-6">{error || "This job posting has expired or been removed."}</p>
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl text-sm shadow-md hover:bg-red-700 transition"
          >
            ← Browse All Openings
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfcfd] pt-28 pb-24">
      {/* Breadcrumbs */}
      <div className="container-content mb-6">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
          <Link href="/" className="hover:text-red-600">Home</Link>
          <span>/</span>
          <Link href="/careers" className="hover:text-red-600">Careers</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">
            {job.title}
          </span>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="container-content mb-10">
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-950 text-white relative overflow-hidden shadow-xl border border-gray-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-primary-200 border border-white/10 backdrop-blur-md">
                  {job.department}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-300">
                  {job.jobType} • {job.workplaceType || "On-site"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {job.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-300">
                <span className="flex items-center gap-1.5">
                  📍 {job.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  💼 Exp: {job.experienceLevel}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  💰 {job.salaryRange || "Market Competitive"}
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={scrollToApply}
                className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm sm:text-base shadow-lg hover:shadow-red-600/30 transition-all duration-200"
              >
                Apply for this Position ↓
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-content grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Description & Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
              <span className="w-2 h-6 bg-red-600 rounded-full inline-block" />
              Role Overview
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                <span className="w-2 h-6 bg-red-600 rounded-full inline-block" />
                Key Responsibilities
              </h2>
              <ul className="space-y-3">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-red-50 text-red-600 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                      ✓
                    </span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                <span className="w-2 h-6 bg-red-600 rounded-full inline-block" />
                Requirements & Qualifications
              </h2>
              <ul className="space-y-3">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-red-50 text-red-600 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                      •
                    </span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                <span className="w-2 h-6 bg-red-600 rounded-full inline-block" />
                What We Offer (Perks & Benefits)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {job.benefits.map((ben, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs sm:text-sm text-gray-800 font-medium flex items-center gap-2.5">
                    <span className="text-base">🎁</span>
                    <span>{ben}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200/80 shadow-soft">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Key Skills & Competencies</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* Application Form Section */}
          {/* ======================================================= */}
          <div ref={formRef} id="apply" className="p-6 sm:p-10 rounded-3xl bg-white border border-gray-200/90 shadow-xl scroll-mt-28">
            {submissionSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-5"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-4xl shadow-inner animate-bounce">
                  🎉
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    Application Submitted
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
                    Thank You, {submissionSuccess.candidateName}!
                  </h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto mt-2 leading-relaxed">
                    Your application for <strong className="text-gray-900">{submissionSuccess.jobTitle}</strong> has been successfully received along with your CV.
                  </p>
                </div>

                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 max-w-md mx-auto text-left space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Application Reference ID:</span>
                    <span className="font-mono font-bold text-red-600 text-sm">
                      {submissionSuccess.applicationId}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Confirmation Sent To:</span>
                    <span className="font-semibold text-gray-800">{submissionSuccess.email}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">SMS Alert Number:</span>
                    <span className="font-semibold text-gray-800">{submissionSuccess.phone}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Our talent acquisition team will review your qualifications and reach out via Email & SMS regarding next steps.
                </p>

                <div className="pt-4 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/careers"
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm shadow-md transition"
                  >
                    Browse More Openings
                  </Link>
                  <Link
                    href="/"
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition"
                  >
                    Return to Homepage
                  </Link>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full">
                    Direct Application
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
                    Apply for this Role
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    No account required. Fill in your details and attach your CV below.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Muhammad Ali Khan"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. yourname@example.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      We'll send status & interview updates here.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                      Phone Number (Mobile) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 0300 1234567"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      We'll send SMS alerts for quick interview updates.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                      WhatsApp Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 0300 1234567"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                      Current City <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.currentCity}
                      onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {pakCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                      Total Experience Level
                    </label>
                    <select
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {experienceOptions.map((exp) => (
                        <option key={exp} value={exp}>
                          {exp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                      Notice Period
                    </label>
                    <select
                      value={formData.noticePeriod}
                      onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {noticePeriodOptions.map((np) => (
                        <option key={np} value={np}>
                          {np}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                      Current Salary (PKR / month)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 70,000 / month"
                      value={formData.currentSalary}
                      onChange={(e) => setFormData({ ...formData, currentSalary: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                      Expected Salary (PKR / month)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 95,000 / month"
                      value={formData.expectedSalary}
                      onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                      LinkedIn / Portfolio / GitHub Profile URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile or https://github.com/..."
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                  </div>

                  {/* CV / Resume File Upload */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                      Upload Resume / CV (PDF, DOCX) <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />

                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors ${
                        selectedFile
                          ? "border-emerald-500 bg-emerald-50/40"
                          : fileError
                          ? "border-red-400 bg-red-50/40"
                          : "border-gray-300 hover:border-red-500 bg-gray-50/75"
                      }`}
                    >
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            PDF
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-gray-900 truncate max-w-xs sm:max-w-md">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for submission
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                            }}
                            className="p-1 text-red-600 hover:text-red-800 font-bold ml-2 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-2 text-xl">
                            📄
                          </div>
                          <p className="text-sm font-semibold text-gray-800">
                            Click to browse or drag & drop your CV here
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Supports PDF, DOC, DOCX up to 10MB
                          </p>
                        </div>
                      )}
                    </div>

                    {fileError && (
                      <p className="text-xs font-semibold text-red-600 mt-1.5">{fileError}</p>
                    )}
                  </div>

                  {/* Cover Note */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                      Cover Note / Why do you want to join Madadgaar?
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Briefly tell us about your experience and why you are excited for this opportunity..."
                      value={formData.coverLetter}
                      onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white leading-relaxed"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm sm:text-base shadow-lg hover:shadow-red-600/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading CV & Submitting Application...
                      </>
                    ) : (
                      "Submit Job Application →"
                    )}
                  </button>
                  <p className="text-[11px] text-gray-400 text-center mt-2.5">
                    🔒 Your personal data and CV are stored securely on our dedicated server and never shared with third parties.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Job Metadata Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-soft sticky top-28 space-y-6">
            <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
              Job Summary
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <span className="text-gray-400 block font-medium">Department</span>
                <span className="font-bold text-gray-900">{job.department}</span>
              </div>

              <div>
                <span className="text-gray-400 block font-medium">Employment Type</span>
                <span className="font-bold text-gray-900">
                  {job.jobType} ({job.workplaceType || "On-site"})
                </span>
              </div>

              <div>
                <span className="text-gray-400 block font-medium">Location</span>
                <span className="font-bold text-gray-900">{job.location}</span>
              </div>

              <div>
                <span className="text-gray-400 block font-medium">Experience Level</span>
                <span className="font-bold text-gray-900">{job.experienceLevel}</span>
              </div>

              <div>
                <span className="text-gray-400 block font-medium">Compensation</span>
                <span className="font-bold text-gray-900">
                  {job.salaryRange || "Market Competitive"}
                </span>
              </div>

              {job.deadline && (
                <div>
                  <span className="text-gray-400 block font-medium">Application Deadline</span>
                  <span className="font-bold text-red-600">
                    {new Date(job.deadline).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={scrollToApply}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-md transition"
            >
              Apply Now
            </button>

            {/* Related openings */}
            {relatedJobs.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Other Openings in {job.department}
                </h4>
                <div className="space-y-2.5">
                  {relatedJobs.map((rel) => (
                    <Link
                      key={rel.jobId}
                      href={`/careers/${rel.slug || rel.jobId}`}
                      className="block p-3 rounded-xl bg-gray-50 hover:bg-red-50 hover:border-red-200 border border-gray-100 transition group"
                    >
                      <span className="font-bold text-gray-900 text-xs group-hover:text-red-600 block">
                        {rel.title}
                      </span>
                      <span className="text-[11px] text-gray-500 mt-0.5 block">
                        {rel.location} • {rel.jobType}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
