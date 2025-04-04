import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./NavBar";
import Homepage from "./pages/Homepage";
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
import ReviewersDashboard from "./Reviewer";
import AdminDashboard from "./Admindashboard";
import PaymentSuccess from "./PaymentSuccess";
import NotFound from "./NotFound";
import HireProfileDetails from "./HirePage";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <ReviewsProvider>
          {/* Main content should grow to push the footer down */}
          <div className="flex-grow pt-9 mt-10">
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
              <Route path="/reviewer" element={<ReviewersDashboard />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route
                path="/business/:businessName"
                element={<BusinessPage />}
              />
              <Route path="/hire/:id" element={<HireProfileDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </ReviewsProvider>

        {/* Footer always at bottom */}
        <Footer />
      </div>
    </Router>
  );
}
