import React from "react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 section-padding py-12">
      <div className="container-content max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          PRIVACY POLICY & DATA PROTECTION POLICY
        </h1>
        <p className="text-sm text-gray-600 mb-2">Madadgaar Expert Partner Platform</p>
        <p className="text-sm text-gray-500 mb-8">Effective Date: [Insert Date] · Last Updated: [Insert Date]</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Introduction</h2>
            <p>Madadgaar Expert Partner (“Madadgaar”, “we”, “our”, or “us”) is committed to protecting the privacy and personal data of all individuals and entities using our platform, including Clients (Users), Madadgaar Expert Partners (Agents), and Partner Companies. This Privacy Policy explains how we collect, use, store, share, and protect personal and business data in accordance with applicable data protection laws.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Scope of This Policy</h2>
            <p className="mb-2">This Policy applies to:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Madadgaar website and mobile applications</li>
              <li>Admin portals and partner dashboards</li>
              <li>All services, communications, and transactions conducted via the Platform</li>
            </ul>
            <p>By using the Platform, you consent to the practices described in this Policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Information We Collect</h2>
            <p className="font-medium mb-1">3.1 Personal Information</p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Full name</li>
              <li>CNIC / National ID / Passport (where required)</li>
              <li>Email address</li>
              <li>Mobile and landline numbers</li>
              <li>Residential or business address</li>
            </ul>
            <p className="font-medium mb-1">3.2 Business & Professional Information</p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Company name and registration details</li>
              <li>Trade licenses and authorizations</li>
              <li>Business address and sector information</li>
              <li>Authorized representative details</li>
            </ul>
            <p className="font-medium mb-1">3.3 Transaction & Deal Data</p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Service requests and listings</li>
              <li>Deal status, history, and activity logs</li>
              <li>Commission and payout records</li>
            </ul>
            <p className="font-medium mb-1">3.4 Technical & Usage Data</p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>IP address</li>
              <li>Device and browser information</li>
              <li>Login timestamps</li>
              <li>Usage patterns and interaction data</li>
            </ul>
            <p className="font-medium mb-1">3.5 Uploaded Content</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Property images and videos</li>
              <li>Documents, agreements, and proofs</li>
              <li>Communications and messages exchanged on the Platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Purpose of Data Collection</h2>
            <p className="mb-2">We collect and process data to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Register and verify users, agents, and partner companies</li>
              <li>Facilitate service listings and deal execution</li>
              <li>Assign leads and enable communication</li>
              <li>Process commissions and payouts</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal and regulatory obligations</li>
              <li>Improve platform functionality and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Legal Basis for Processing</h2>
            <p className="mb-2">We process personal data based on:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>User consent</li>
              <li>Contractual necessity</li>
              <li>Legal obligations</li>
              <li>Legitimate business interests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Data Sharing & Disclosure</h2>
            <p className="mb-2">Madadgaar does not sell personal data. Data may be shared only with:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Assigned agents or partner companies for service delivery</li>
              <li>Payment processors and technology service providers</li>
              <li>Regulatory authorities when legally required</li>
              <li>Internal teams for compliance, audit, and support</li>
            </ul>
            <p>All third parties are required to maintain confidentiality and data security.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Data Storage & Retention</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Data is stored on secure servers with access controls</li>
              <li>Retention is limited to the duration necessary for: Platform operations; Legal compliance; Dispute resolution</li>
              <li>Inactive or terminated accounts may have data archived or anonymized</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Data Security Measures</h2>
            <p className="mb-2">We implement reasonable safeguards including:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Role-based access control</li>
              <li>Encrypted data storage and transmission</li>
              <li>Secure document handling</li>
              <li>Activity logging and monitoring</li>
            </ul>
            <p>Despite best efforts, no system can guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. User Rights</h2>
            <p className="mb-2">Subject to applicable laws, users may:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Request access to their personal data</li>
              <li>Request correction of inaccurate information</li>
              <li>Request account deactivation</li>
              <li>Withdraw consent (subject to legal obligations)</li>
            </ul>
            <p>Requests may be submitted through official support channels.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Cookies & Tracking Technologies</h2>
            <p className="mb-2">Madadgaar may use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>Maintain user sessions</li>
              <li>Analyze platform usage</li>
              <li>Enhance user experience</li>
            </ul>
            <p>Users may manage cookie preferences through their browser settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Data Transfers</h2>
            <p>Data may be processed or stored on servers located outside your country, subject to appropriate safeguards and compliance with applicable laws.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">12. Children's Privacy</h2>
            <p>The Platform is not intended for individuals under 18 years of age. We do not knowingly collect data from minors.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">13. Policy Updates</h2>
            <p>This Policy may be updated periodically. Users will be notified of material changes. Continued use of the Platform constitutes acceptance of the updated Policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">14. Contact & Complaints</h2>
            <p>For privacy-related questions, data requests, or complaints, contact:</p>
            <p>📧 support@madadgaar.com.pk (example)</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">15. Consent & Acceptance</h2>
            <p className="mb-2">By using the Madadgaar platform, you:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Acknowledge that you have read and understood this Policy</li>
              <li>Consent to the collection, use, and processing of your data as described</li>
            </ul>
          </section>
        </div>

        <div className="mt-6 flex gap-4">
          <Link to="/terms-and-conditions" className="text-[rgb(183,36,42)] font-semibold hover:underline">← Terms & Conditions</Link>
          <Link to="/account/register" className="text-[rgb(183,36,42)] font-semibold hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
