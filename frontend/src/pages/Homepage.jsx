import About from "./About";
import FeaturedListings from "./FeaturedListing";
import Footer from "./Footer";
import HeroSection from "./Hero";
import CustomerReviews from "./Reviews";
import Services from "./Service";

export default function Homepage() {
  return (
    <div>
      <div>
        <HeroSection />
      </div>
      <div>
        <CustomerReviews />
      </div>
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
      <div id="contact">
        {" "}
        <Footer />
      </div>
    </div>
  );
}
