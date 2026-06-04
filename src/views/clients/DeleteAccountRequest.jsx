import React from "react";
import SEO from "../../components/SEO";

export default function DeleteAccountRequest() {
  return (
    <>
      <SEO
        title="Madadgaar Expert — Account Deletion Request"
        description="Public instructions for requesting account deletion for Madadgaar Expert users."
      />

      <div className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-bold text-[#D32F2F] sm:text-3xl">
              Madadgaar Expert — Account Deletion Request
            </h1>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-[#D32F2F]">
                How to Delete Your Account
              </h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-gray-700">
                <li>Open the Madadgaar Expert app</li>
                <li>Sign in to your account</li>
                <li>Go to Dashboard -&gt; Delete Account</li>
                <li>Type DELETE and confirm your request</li>
              </ol>
              <p className="mt-4 text-gray-700">
                Or contact:{" "}
                <a
                  href="mailto:support@madadgaar.com.pk"
                  className="font-medium text-[#D32F2F] underline underline-offset-2"
                >
                  support@madadgaar.com.pk
                </a>
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-[#D32F2F]">
                What Data Gets Deleted
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
                <li>Profile details (name, email, phone, CNIC)</li>
                <li>Authentication and session data</li>
                <li>All dashboard and account data</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-[#D32F2F]">
                What Data May Be Retained
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
                <li>Minimal records required for legal and regulatory compliance</li>
                <li>Audit logs for fraud prevention and security</li>
                <li>Retention period: up to 90 days unless law requires longer</li>
              </ul>
            </section>

            <footer className="mt-10 border-t border-gray-200 pt-5 text-sm text-gray-500">
              Last updated April 30, 2026
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
