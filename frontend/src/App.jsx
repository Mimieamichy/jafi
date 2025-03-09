import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./NavBar";
import Homepage from "./pages/Homepage";

/*import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";*/

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
       {/* <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />*/}
      </Routes>
    </Router>
  );
}
