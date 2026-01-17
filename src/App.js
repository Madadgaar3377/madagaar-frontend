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
import InstallmentPlans from "./pages/clients/Installment/InstallementPage.jsx";
import BlogsPage from "./pages/clients/blogs/Blogs.jsx";
import PropertiesPage from "./pages/clients/Properties/properties.jsx";
import PropertyDetails from "./pages/clients/Properties/PropertyDetails.jsx";

import InstallmentDetail from "./pages/clients/Installment/installmentoverview.jsx";
import CompareProducts from "./pages/clients/CompareProduct/CompareProducts.jsx";
import LoansPage from "./pages/clients/Loans/clientPageLoan.jsx";
import LoanDetails from "./pages/clients/Loans/LoanDeailtsById.jsx";
import NotFound from "./pages/404Page.jsx";
import ForgotPassword from "./Accounts/forgotpassword.jsx";
import ResetPassword from "./Accounts/NewPassword.jsx";


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
          {/* blogs */}
          <Route path="/blog" element={<BlogsPage />} />


          {/* PropertiesPage */}
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/property/:id" element={<PropertyDetails />} />


          {/* user panel routes */}

         
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;
