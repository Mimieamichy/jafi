import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import About from "./About";
import FeaturedListings from "./FeaturedListing";
import HeroSection from "./Hero";
import CustomerReviews from "./Reviews";
import Services from "./Service";
import { ReviewsProvider } from "../context/reviewContext";

export default function Homepage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);
  return (
    <div >
      <div>
        <HeroSection />
      </div>
      <ReviewsProvider> 
      <div>
        <CustomerReviews />
      </div>
      </ReviewsProvider>
      <div>
        <FeaturedListings />
      </div>
      <div id="about">
        <About />
      </div>
      <div id="services">
        {" "}
        <Services />
      </div>

    </div>
  );
}
