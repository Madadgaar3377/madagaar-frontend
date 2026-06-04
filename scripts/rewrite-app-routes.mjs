import fs from "fs";
import path from "path";

const base = "src/app";
const routes = {
  "page.js": "../views/clients/HomePages",
  "about/page.js": "../../views/clients/About",
  "download-app/page.js": "../../views/clients/DownloadAppPage",
  "offers/page.js": "../../views/clients/Offers",
  "delete-account/page.js": "../../views/clients/DeleteAccountRequest",
  "loans/page.js": "../../views/clients/Loans/clientPageLoan",
  "loans/[id]/page.js": "../../../views/clients/Loans/LoanDeailtsById",
  "loans/[id]/apply/page.js": "../../../../views/clients/Loans/ApplyLoan",
  "account/page.js": "../../Accounts/LoginPage",
  "auth/success/page.js": "../../../Accounts/GoogleAuthSuccess",
  "account/register/page.js": "../../../Accounts/SignupPages",
  "account/verify-otp/page.js": "../../../Accounts/OtpVerifications",
  "account/forgot/page.js": "../../../Accounts/forgotpassword",
  "account/reset/page.js": "../../../Accounts/NewPassword",
  "dashboard/page.js": "../../views/clients/Dashboard/UserDashboard",
  "dashboard/profile/page.js": "../../../views/clients/Dashboard/DashboardProfile",
  "dashboard/security/page.js": "../../../views/clients/Dashboard/DashboardSecurity",
  "dashboard/delete-account/page.js": "../../../views/clients/Dashboard/DashboardDeleteAccount",
  "installments/page.js": "../../views/clients/Installment/InstallementPage",
  "installment/[id]/page.js": "../../../views/clients/Installment/installmentoverview",
  "installment/[id]/apply/page.js": "../../../../views/clients/Installment/ApplyInstallment",
  "installment/product/CompareProduct/[id]/page.js":
    "../../../../../views/clients/CompareProduct/CompareProducts",
  "blog/page.js": "../../views/clients/blogs/Blogs",
  "blog/[slug]/page.js": "../../../views/clients/blogs/BlogDetail",
  "insurance/page.js": "../../views/clients/Insurance/insurance",
  "insurance/[id]/page.js": "../../../views/clients/Insurance/InsurancePlanDetails",
  "insurance/[id]/apply/page.js": "../../../../views/clients/Insurance/ApplyInsurance",
  "submit-claim/page.js": "../../views/clients/Insurance/SubmitClaim",
  "properties/page.js": "../../views/clients/Properties/properties",
  "property/[id]/page.js": "../../../views/clients/Properties/PropertyDetails",
  "property/[id]/apply/page.js": "../../../../views/clients/Properties/ApplyProperty",
  "contact/page.js": "../../views/clients/Contact/ContactForm",
  "faq/page.js": "../../views/clients/FAQ",
  "terms-and-conditions/page.js": "../../views/clients/TermsAndConditions",
  "privacy-policy/page.js": "../../views/clients/PrivacyPolicy",
};

for (const [rel, importPath] of Object.entries(routes)) {
  const filePath = path.join(base, rel);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const content = `'use client';\n\nimport Page from '${importPath}';\nexport default Page;\n`;
  fs.writeFileSync(filePath, content, { encoding: "utf8" });
  console.log("Wrote:", filePath);
}

fs.writeFileSync(
  path.join(base, "not-found.js"),
  `'use client';\n\nimport NotFound from '../views/404Page';\nexport default NotFound;\n`,
  { encoding: "utf8" }
);
console.log("Wrote not-found.js");
