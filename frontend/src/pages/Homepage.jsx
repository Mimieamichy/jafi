import About from "./About";
import FeaturedListings from "./FeaturedListing";
import HeroSection from "./Hero";
import CustomerReviews from "./Reviews";
import Services from "./Service";
import { ReviewsProvider } from "../context/reviewContext";

export default function Homepage() {
  return (
    <div>
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
