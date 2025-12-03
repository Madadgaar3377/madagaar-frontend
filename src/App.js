import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./compontents/Navbar";
// import TopBar from "./compontents/TopBar";
import Footer from "./compontents/Footer";

// Pages
import HomePage from "./pages/clients/HomePages";
import AboutPage from "./pages/clients/About";
import LoginPage from "./Accounts/LoginPage";
import SignupPage from "./Accounts/SignupPages";
import OtpVerifyPage from "./Accounts/OtpVerifications";
import DashboardHomePage from "./pages/clients/Dashboard/Dashboars.jsx";

import ProtectedRoute from "./ProtectedRoute";
import InstallmentPlans from "./pages/clients/Installment/InstallementPage.jsx";
import BlogsPage from "./pages/clients/blogs/Blogs.jsx";
import PropertiesPage from "./pages/clients/Properties/properties.jsx";
import Loans from "./pages/clients/Loans/Loans.jsx";
import InstallmentDetail from "./pages/clients/Installment/installmentoverview.jsx";
import InstallmentApplicationForm from "./pages/clients/Installment/Apply-Installements.jsx";
import InstallmentApplicationsPage from "./pages/clients/Installment/AllRequest.jsx";
import ManageInstallmentsPage from "./pages/clients/Installment/Update-Status.jsx";
import UpdateInstallmentPlan from "./pages/clients/Installment/UpdateInstallementsPlan.jsx";
import CreateInstallmentPlan from "./pages/clients/Installment/Create-Installments.jsx";
import CompareProducts from "./pages/clients/CompareProduct/CompareProducts.jsx";
import LoansPage from "./pages/clients/Loans/clientPageLoan.jsx";
import LoanDetails from "./pages/clients/Loans/LoanDeailtsById.jsx";
import NotFound from "./pages/404Page.jsx";
import AdminCreateLoan from "./pages/clients/Loans/CreateLoanPlan.jsx";
import LoanApplicationPage from "./pages/clients/Loans/loanApply.jsx";
import AdminLoanForms from "./pages/clients/Loans/DeleteLoanPlan.jsx";
import InsuranceInfo from "./pages/clients/Insurance/insurance";
import InsuranceApply from "./pages/clients/Insurance/apply-insurance.jsx";
import ForgotPassword from "./Accounts/forgotpassword.jsx";
import ResetPassword from "./Accounts/NewPassword.jsx";
import InsuranceRequests from "./pages/clients/Insurance/getAllRequest.jsx";
import ProfilePage from "./pages/clients/ClientDashboard/Profile-panel.jsx";
import UserLoanRequests from "./pages/clients/ClientDashboard/loanApply.jsx";
import MyInsuranceRequests from "./pages/clients/ClientDashboard/insuranceApply.jsx";
import AdminInstallment from "./pages/clients/Installment/AllPlan.jsx";


function LayoutWrapper({ children }) {
  const location = useLocation();

  // Hide Navbar + Topbar + Footer on dashboard ONLY
  const hideLayout = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/dashboard/Installments/create") || location.pathname.startsWith("/dashboard/Installments/update") ||location.pathname.startsWith("/dashboard/*")||location.pathname.startsWith("/client/dashboard")||location.pathname.startsWith("/client/loans")||location.pathname.startsWith("/client/insurance");

  return (
    <>
      {/* {!hideLayout && <TopBar />} */}
      {!hideLayout && <Navbar />}

      {children}

      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  

  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          <Route path="*" element={<NotFound />} />
          {/* Public pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/loans/:id" element={<LoanDetails />} />
          <Route path="/loan/apply/planId/:id" element={<LoanApplicationPage />} />

          {/* account login */}
          <Route path="/account" element={<LoginPage />} />
          <Route path="/account/register" element={<SignupPage />} />
          <Route path="/account/verify-otp" element={<OtpVerifyPage />} />
          <Route path="/account/forgot" element={<ForgotPassword />} />
          <Route path="/account/reset" element={<ResetPassword />} />

          {/* installement router  */}
          <Route path="/installments" element={<InstallmentPlans />} />
          <Route path="/installment/:id" element={<InstallmentDetail />} />
          <Route path="/installment/product/CompareProduct/:id" element={<CompareProducts />} />
          <Route path="installment/get-now/:id" element={<InstallmentApplicationForm />} />
          {/* blogs */}
          <Route path="/blog" element={<BlogsPage />} />
          <Route path="/insurance" element={<InsuranceInfo />} />
          <Route path="/apply-insurance" element={<InsuranceApply />} />

          {/* PropertiesPage */}
          <Route path="/properties" element={<PropertiesPage />} />


          {/* user panel routes */}

          <Route
            path="/client/dashboard"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/loans"
            element={
              <ProtectedRoute>
                <UserLoanRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/insurance"
            element={
              <ProtectedRoute>
                <MyInsuranceRequests />
              </ProtectedRoute>
            }
          />
          {/* dashboard protected */}


          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/loan"
            element={
              <ProtectedRoute>
                <Loans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/loan/update/delete"
            element={
              <ProtectedRoute>
                <AdminLoanForms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/loan/create"
            element={
              <ProtectedRoute>
                <AdminCreateLoan />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/insurance/get-quote"
            element={
              <ProtectedRoute>
                <InsuranceRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/Installments"
            element={
              <ProtectedRoute>
                <InstallmentApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/Installments/all"
            element={
              <ProtectedRoute>
                <AdminInstallment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/Installments/create"
            element={
              <ProtectedRoute>
                <CreateInstallmentPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/Installments/update/:id"
            element={
              <ProtectedRoute>
                <UpdateInstallmentPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/Installments/status"
            element={
              <ProtectedRoute>
                <ManageInstallmentsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;
