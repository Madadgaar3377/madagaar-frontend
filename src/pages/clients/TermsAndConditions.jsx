import React from "react";
import { Link } from "react-router-dom";
import AnimatedSection from "../../components/AnimatedSection";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 section-padding py-12">
      <div className="container-content max-w-3xl mx-auto">
        <AnimatedSection animation="fadeInUp" delay={0} className="w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          TERMS & CONDITIONS
        </h1>
        <p className="text-sm text-gray-600 mb-2">Madadgaar Expert Partner Platform</p>
        <p className="text-sm text-gray-500 mb-8">Effective Date: [Insert Date] · Last Updated: [Insert Date]</p>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 sm:p-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Introduction</h2>
            <p className="mb-2">Madadgaar Expert Partner (“Madadgaar”, “Platform”, “We”, “Us”) operates a digital commission-based marketplace that connects Clients (End Users), Madadgaar Expert Partners (Agents), and Partner Companies offering services in:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Property & Real Estate</li>
              <li>Installment Products</li>
              <li>Financial & Loan Services</li>
              <li>Insurance & Insurance Claim Services</li>
            </ul>
            <p>By accessing, registering, or using the Platform, you agree to be legally bound by these Terms & Conditions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Definitions</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Platform:</strong> Madadgaar website, mobile application, and related systems</li>
              <li><strong>User / Client:</strong> Any individual requesting services</li>
              <li><strong>Agent / Expert Partner:</strong> An individual registered to assist users and earn commission</li>
              <li><strong>Partner Company:</strong> A legally registered business entity listing services or products</li>
              <li><strong>Deal:</strong> A transaction initiated through the Platform</li>
              <li><strong>Commission:</strong> Payment earned by Agents upon successful deal completion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Eligibility</h2>
            <p className="font-medium mb-1">3.1 General Eligibility</p>
            <p className="mb-2">You must:</p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Be legally capable of entering a binding agreement</li>
              <li>Provide accurate and truthful information</li>
              <li>Comply with applicable laws and regulations</li>
            </ul>
            <p className="font-medium mb-1">3.2 Partner Company Eligibility</p>
            <p className="mb-1">Only:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Legally registered companies, or</li>
              <li>Duly authorized professionals</li>
            </ul>
            <p>operating in Property, Financial, Installment, or Insurance sectors may register as Partner Companies. Madadgaar reserves the right to approve, reject, or suspend any registration.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Platform Role & Limitation of Liability</h2>
            <p className="mb-2">Madadgaar acts solely as a facilitation and marketplace platform. Madadgaar:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Does not own, sell, lease, finance, or insure any product or property</li>
              <li>Is not a party to transactions between Users, Agents, or Companies</li>
              <li>Does not guarantee approvals, pricing, timelines, or outcomes</li>
            </ul>
            <p>All transactions are conducted directly between Users and Partner Companies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Account Registration & Verification</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Registration information must be accurate and current</li>
              <li>KYC, business registration, licenses, and authorizations may be required</li>
              <li>Accounts remain inactive until Admin approval (where applicable)</li>
              <li>Sharing accounts or credentials is strictly prohibited</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Roles & Responsibilities</h2>
            <p className="font-medium mb-1">6.1 Partner Companies</p>
            <p className="mb-1">Partner Companies agree to:</p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Provide lawful and accurate listings</li>
              <li>Maintain updated pricing and availability</li>
              <li>Handle service delivery, documentation, and approvals</li>
              <li>Resolve disputes directly with users</li>
              <li>Ensure agents acting on their behalf are authorized</li>
            </ul>
            <p className="font-medium mb-1">6.2 Agents (Expert Partners)</p>
            <p className="mb-1">Agents agree to:</p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Act professionally and ethically</li>
              <li>Not misrepresent pricing, ownership, or authority</li>
              <li>Follow deal lifecycle and platform rules</li>
              <li>Protect user data and confidentiality</li>
              <li>Earn commission only after verified deal completion</li>
            </ul>
            <p className="font-medium mb-1">6.3 Users (Clients)</p>
            <p className="mb-1">Users agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide correct information and documents</li>
              <li>Understand that approvals are subject to company policies</li>
              <li>Interact respectfully with agents and companies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Listings & Content</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All listings must be accurate, lawful, and non-misleading</li>
              <li>Madadgaar may edit, suspend, or remove listings at its discretion</li>
              <li>Uploading false, duplicate, or unauthorized content is prohibited</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Deal Lifecycle & Verification</h2>
            <p className="mb-2">Deals follow a structured lifecycle:</p>
            <p className="font-mono font-medium mb-2">REQUESTED → ASSIGNED → IN PROGRESS → VERIFIED → CLOSED → PAID</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Commission is locked at VERIFIED</li>
              <li>Commission becomes payable only after PAID</li>
              <li>Admin may intervene in disputes or exceptions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Commission & Payments</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Commission structures are defined by Partner Companies and approved by Admin</li>
              <li>Madadgaar does not guarantee commission payment</li>
              <li>Payouts are subject to: Verification; Minimum thresholds; Dispute resolution</li>
              <li>Fraudulent activity results in forfeiture of commission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Data Protection & Privacy</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Personal and business data is collected for platform operations</li>
              <li>Data is handled according to the Privacy & Data Protection Policy</li>
              <li>Madadgaar does not sell user data</li>
              <li>Limited data sharing occurs only for service delivery and compliance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Prohibited Activities</h2>
            <p className="mb-1">Users, Agents, and Companies must not:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Submit fake or misleading leads</li>
              <li>Circumvent platform workflows</li>
              <li>Conduct off-platform transactions to avoid commission</li>
              <li>Abuse users, agents, or companies</li>
              <li>Violate applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">12. Suspension & Termination</h2>
            <p className="mb-1">Madadgaar may suspend or terminate accounts for:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Policy violations</li>
              <li>Fraud or misuse</li>
              <li>Legal or regulatory risk</li>
              <li>Repeated complaints or disputes</li>
            </ul>
            <p>Termination does not waive outstanding obligations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">13. Dispute Management</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Disputes should first be resolved between involved parties</li>
              <li>Madadgaar may mediate but is not obligated to arbitrate</li>
              <li>Admin decisions regarding platform enforcement are final</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">14. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All platform content, branding, and systems belong to Madadgaar</li>
              <li>Users may not copy, reverse-engineer, or misuse platform assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">15. Modifications</h2>
            <p>Madadgaar may update these Terms at any time. Continued use of the Platform constitutes acceptance of revised Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">16. Governing Law & Jurisdiction</h2>
            <p>These Terms are governed by the laws of Pakistan (Or applicable jurisdiction where services are offered)</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">17. Contact Information</h2>
            <p>For legal or support inquiries:</p>
            <p>📧 support@madadgaar.com.pk (example)</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">18. Acceptance</h2>
            <p className="mb-1">By registering or using the Platform, you confirm that you have:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Read and understood these Terms & Conditions</li>
              <li>Agreed to comply with all policies</li>
              <li>Accepted the legal obligations herein</li>
            </ul>
          </section>
        </div>

        <div className="mt-6 flex gap-4">
          <Link to="/account/register" className="text-[rgb(183,36,42)] font-semibold hover:underline">← Back to Sign up</Link>
          <Link to="/privacy-policy" className="text-[rgb(183,36,42)] font-semibold hover:underline">Privacy Policy →</Link>
        </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
