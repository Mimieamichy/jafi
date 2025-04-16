import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import BlueSpiralLoader from "./BlueSpiralLoader";


// Lazy-load components
const Navbar = lazy(() => import("./NavBar"));
const Homepage = lazy(() => import("./pages/Homepage"));
const HiringSignup = lazy(() => import("./HiringSignup"));
const BusinessSignup = lazy(() => import("./BusinessSignup"));
const PaginatedReviews = lazy(() => import("./ReviewsPage"));
const Footer = lazy(() => import("./pages/Footer"));
const ReviewsProvider = lazy(() =>
  import("./context/reviewContext").then((module) => ({
    default: module.ReviewsProvider,
  }))
);
const SignupModal = lazy(() => import("./SignupModal"));
const SignIn = lazy(() => import("./SignInPage"));
const Pricing = lazy(() => import("./Pricing"));
const HiringPayment = lazy(() => import("./HirePayment"));
const HiringDashboard = lazy(() => import("./HiringDashboard"));
const HireProfileCard = lazy(() => import("./HireProfileCard"));
const BusinessDashboard = lazy(() => import("./BusinessDashboard"));
const BusinessPage = lazy(() => import("./BusinessPage"));
const BusinessProfileCard = lazy(() => import("./BusinessProfileCard"));
const ReviewersDashboard = lazy(() => import("./Reviewer"));
const AdminDashboard = lazy(() => import("./Admindashboard"));

const PaymentSuccess = lazy(() => import("./PaymentSuccess"));
const NotFound = lazy(() => import("./NotFound"));
const HireProfileDetails = lazy(() => import("./HirePage"));
const AllListings = lazy(() => import("./AllListings"));
const ForgotPassword = lazy(() => import("./ForgotPassword"));
const ResetPassword = lazy(() => import("./ResetPassword"));

export default function App() {
  return (
    <Router>
      <Suspense fallback={<BlueSpiralLoader />}>
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
                <Route path="/all-listing" element={<AllListings />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/business/:id" element={<BusinessPage />} />
                <Route path="/hire/:id" element={<HireProfileDetails />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </ReviewsProvider>
          <Footer />
        </div>
      </Suspense>
    </Router>
  );
}
