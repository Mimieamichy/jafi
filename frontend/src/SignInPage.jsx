import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulating a user role (In real login, fetch from API)
    const userData = {
      email: formData.email,
      userRole: "Business owner" // Change this based on actual user role
    };

    // Save to localStorage
    localStorage.setItem("userRole", userData.userRole);
    localStorage.setItem("userData", JSON.stringify(userData));
    

    console.log("User logged in as:", userData.userRole);
    alert("Sign In Successful! (Static Data Used for Now)");

    // Navigate to Dashboard
    navigate("/bus-dashboard");
    
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email/Phone Input */}
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email or Phone Number"
          className="w-full p-2 border rounded"
          required
        />

        {/* Password Input with Show/Hide */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            className="w-full p-2 border rounded-md pr-10"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-gray-500 cursor-pointer"
          >
            {showPassword ? (
              <FontAwesomeIcon icon={faEye} />
            ) : (
              <FontAwesomeIcon icon={faEyeSlash} />
            )}
          </button>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-lg cursor-pointer"
        >
          Sign In
        </button>

        {/* Forgot Password & Sign Up Link */}
        <div className="text-center mt-3">
          <Link
            to="/forgot-password"
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
}
