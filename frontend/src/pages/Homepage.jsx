import About from "../About";
import HeroSection from "./Hero";
import CustomerReviews from "./Reviews";
import Services from "./Service";


export default function Homepage() {
  return (
    <div>
     <HeroSection />
     <CustomerReviews />
     <About />
     <Services />
    </div>
  );
}
