import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
// import AboutPage from "./pages/AboutPage";
// import ContactPage from "./pages/ContactPage";
// Add more pages as needed

function App() {
  return (
    <Router>
      <TopBar />
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* account login */}
        <Route path="/account" element={<LoginPage />} />
        <Route path="/account/register" element={<SignupPage />} />
        <Route path="/account/verify-otp" element={<OtpVerifyPage />} />

        {/* dashboard */}
        <Route path="/dashboard" element={<DashboardHomePage />} />

        

      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
