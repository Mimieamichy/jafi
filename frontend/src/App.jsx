import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./NavBar";
import Homepage from "./pages/Homepage";
import SignupPage from "./SignupPage";
import HiringSignup from "./HiringSignup";
import BusinessSignup from "./BusinessSignup";
import PaginatedReviews from "./ReviewsPage";
import Footer from "./pages/Footer";
import { ReviewsProvider } from "./context/reviewContext";
import SignupModal from "./SignupModal";
import SignIn from "./SignInPage";
import Pricing from "./Pricing";
import HiringPayment from "./HirePayment";
import HiringDashboard from "./HiringDashboard";
import HireProfileCard from "./HireProfileCard";
import BusinessDashboard from "./BusinessDashboard";
import BusinessPage from "./BusinessPage";
import BusinessProfileCard from "./BusinessProfileCard";

export default function App() {
  return (
    <Router>
      <Navbar />
      <ReviewsProvider>
        <div className="pt-9 mt-10">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/hiring-signup" element={<HiringSignup />} />
            <Route path="/business-signup" element={<BusinessSignup />} />
            <Route path="/review-page" element={<PaginatedReviews />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignupModal />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/hiring-payment" element={<HiringPayment />} />
            <Route path="/hiring-dashboard" element={<HiringDashboard />} />
            <Route path="/hire-profile" element={<HireProfileCard />} />
            <Route path="/bus-dashboard" element={<BusinessDashboard />} />
            <Route path="/bus-profile" element={<BusinessProfileCard />} />
            <Route path="/business/:businessName" element={<BusinessPage />} />
          </Routes>
          <div id="contact" className="bottom-0 mt-26 sm:mt-0">
            {" "}
            <Footer />
          </div>
        </div>
      </ReviewsProvider>
    </Router>
  );
}
