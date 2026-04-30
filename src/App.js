import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

import Navbar from "./compontents/Navbar";
import Footer from "./compontents/Footer";
import ScrollToTop from "./components/ScrollToTop";
import WhatsAppButton from "./components/WhatsAppButton";
import useAdSenseRouteRefresh from "./hooks/useAdSenseRouteRefresh";

// Pages
import HomePage from "./pages/clients/HomePages";
import AboutPage from "./pages/clients/About";
import LoginPage from "./Accounts/LoginPage";
import SignupPage from "./Accounts/SignupPages";
import OtpVerifyPage from "./Accounts/OtpVerifications";
import GoogleAuthSuccess from "./Accounts/GoogleAuthSuccess";
import InstallmentPlans from "./pages/clients/Installment/InstallementPage.jsx";
import BlogsPage from "./pages/clients/blogs/Blogs.jsx";
import BlogDetail from "./pages/clients/blogs/BlogDetail.jsx";
import PropertiesPage from "./pages/clients/Properties/properties.jsx";
import PropertyDetails from "./pages/clients/Properties/PropertyDetails.jsx";
import ApplyProperty from "./pages/clients/Properties/ApplyProperty.jsx";
import ContactForm from "./pages/clients/Contact/ContactForm.jsx";
import FAQPage from "./pages/clients/FAQ.jsx";

import InstallmentDetail from "./pages/clients/Installment/installmentoverview.jsx";
import ApplyInstallment from "./pages/clients/Installment/ApplyInstallment.jsx";
import CompareProducts from "./pages/clients/CompareProduct/CompareProducts.jsx";
import LoansPage from "./pages/clients/Loans/clientPageLoan.jsx";
import LoanDetails from "./pages/clients/Loans/LoanDeailtsById.jsx";
import ApplyLoan from "./pages/clients/Loans/ApplyLoan.jsx";
import InsurancePage from "./pages/clients/Insurance/insurance.jsx";
import InsurancePlanDetails from "./pages/clients/Insurance/InsurancePlanDetails.jsx";
import ApplyInsurance from "./pages/clients/Insurance/ApplyInsurance.jsx";
import SubmitClaim from "./pages/clients/Insurance/SubmitClaim.jsx";
// import TeamMemberDetail from "./pages/clients/TeamMemberDetail.jsx"; // Phase 1: Disabled team detail pages
import UserDashboard from "./pages/clients/Dashboard/UserDashboard.jsx";
import DashboardProfile from "./pages/clients/Dashboard/DashboardProfile.jsx";
import DashboardSecurity from "./pages/clients/Dashboard/DashboardSecurity.jsx";
import DashboardDeleteAccount from "./pages/clients/Dashboard/DashboardDeleteAccount.jsx";
import NotFound from "./pages/404Page.jsx";
import ForgotPassword from "./Accounts/forgotpassword.jsx";
import ResetPassword from "./Accounts/NewPassword.jsx";
import TermsAndConditions from "./pages/clients/TermsAndConditions.jsx";
import PrivacyPolicy from "./pages/clients/PrivacyPolicy.jsx";
import OffersPage from "./pages/clients/Offers.jsx";


function LayoutWrapper({ children }) {
  const location = useLocation();
  useAdSenseRouteRefresh();

  // Hide Navbar + Footer on dashboard ONLY
  const hideLayout = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/dashboard/Installments/create") || location.pathname.startsWith("/dashboard/Installments/update") || location.pathname.startsWith("/dashboard/*") || location.pathname.startsWith("/client/dashboard") || location.pathname.startsWith("/client/loans") || location.pathname.startsWith("/client/insurance");

  return (
    <>
      {!hideLayout && <Navbar />}

      {/* Toaster: under navbar when layout visible, near top when navbar hidden (e.g. dashboard) */}
      <Toaster
        position="top-center"
        toastOptions={{ duration: 4000 }}
        containerStyle={{ top: hideLayout ? "1rem" : "5.5rem" }}
      />

      {/* Spacer for fixed navbar so content is not hidden under it */}
      <main className={!hideLayout ? "min-h-screen pt-[5.25rem] sm:pt-[5.5rem] overflow-x-hidden" : "overflow-x-hidden"}>
        <div key={location.pathname} className="route-transition-enter">
          {children}
        </div>
      </main>

      {!hideLayout && <Footer />}
      {!hideLayout && <WhatsAppButton />}
    </>
  );
}

function App() {
  

  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <LayoutWrapper>
          <Routes>
            <Route path="*" element={<NotFound />} />
            {/* Public pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/offers" element={<OffersPage />} />
            {/* Phase 1: Team detail route disabled - contact via email only */}
            {/* <Route path="/team/:id" element={<TeamMemberDetail />} /> */}
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/loans/:id" element={<LoanDetails />} />
            <Route path="/loans/:id/apply" element={<ApplyLoan />} />

            {/* account login */}
            <Route path="/account" element={<LoginPage />} />
            <Route path="/auth/success" element={<GoogleAuthSuccess />} />
            <Route path="/account/register" element={<SignupPage />} />
            <Route path="/account/verify-otp" element={<OtpVerifyPage />} />
            <Route path="/account/forgot" element={<ForgotPassword />} />
            <Route path="/account/reset" element={<ResetPassword />} />

            {/* User Dashboard */}
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/dashboard/profile" element={<DashboardProfile />} />
            <Route path="/dashboard/security" element={<DashboardSecurity />} />
            <Route path="/dashboard/delete-account" element={<DashboardDeleteAccount />} />

            {/* installement router  */}
            <Route path="/installments" element={<InstallmentPlans />} />
            <Route path="/installment/:id" element={<InstallmentDetail />} />
            <Route path="/installment/:id/apply" element={<ApplyInstallment />} />
            <Route path="/installment/product/CompareProduct/:id" element={<CompareProducts />} />
            {/* blogs */}
            <Route path="/blog" element={<BlogsPage />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />

            {/* Insurance */}
            <Route path="/insurance" element={<InsurancePage />} />
            <Route path="/insurance/:id" element={<InsurancePlanDetails />} />
            <Route path="/insurance/:id/apply" element={<ApplyInsurance />} />
            <Route path="/submit-claim" element={<SubmitClaim />} />

            {/* PropertiesPage */}
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/property/:id/apply" element={<ApplyProperty />} />

            {/* Contact */}
            <Route path="/contact" element={<ContactForm />} />
            
            {/* FAQ */}
            <Route path="/faq" element={<FAQPage />} />

            {/* Terms & Privacy */}
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* user panel routes */}

           
          </Routes>
        </LayoutWrapper>
      </Router>
    </HelmetProvider>
  );
}

export default App;
