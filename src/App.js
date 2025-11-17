import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./compontents/Navbar";
import TopBar from "./compontents/TopBar";
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

function LayoutWrapper({ children }) {
  const location = useLocation();

  // Hide Navbar + Topbar + Footer on dashboard ONLY
  const hideLayout = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/dashboard/loan");

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
          {/* Public pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* account login */}
          <Route path="/account" element={<LoginPage />} />
          <Route path="/account/register" element={<SignupPage />} />
          <Route path="/account/verify-otp" element={<OtpVerifyPage />} />

          {/* installement router  */}
          <Route path="/installments" element={<InstallmentPlans />} />
          <Route path="/installment/:id" element={<InstallmentDetail />} />
          {/* blogs */}
          <Route path="/blog" element={<BlogsPage />} />

          {/* PropertiesPage */}
          <Route path="/properties" element={<PropertiesPage />} />
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
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;
