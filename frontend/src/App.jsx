import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./NavBar";
import Homepage from "./pages/Homepage";
import AuthForm from "../Auth";
import PaginatedReviews from "./ReviewsPage";
import Footer from "./pages/Footer";
import RecentListings from "./RecentListings";
import { ReviewsProvider } from "./context/reviewContext";
import BusinessListing from "./BusinessListing";

export default function App() {
  return (
    <Router>
      <Navbar />
      <ReviewsProvider>
        <div className="pt-9">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/auth" element={<AuthForm />} />
            <Route path="/review-page" element={<PaginatedReviews />} />
            <Route path="/recent-listings" element={<RecentListings />} />
            <Route path="/list-business" element={<BusinessListing />} />
          </Routes>
          <div id="contact">
            {" "}
            <Footer />
          </div>
        </div>
      </ReviewsProvider>
    </Router>
  );
}

