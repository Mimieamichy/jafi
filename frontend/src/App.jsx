import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./NavBar";
import Homepage from "./pages/Homepage";
import AuthForm from "../Auth";



export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-9"> 
      <Routes >
        <Route path="/" element={<Homepage />} />
        <Route path="/auth" element={<AuthForm />} />
      </Routes>
      </div>
    </Router>
  );
}
