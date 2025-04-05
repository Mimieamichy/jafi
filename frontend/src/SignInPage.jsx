import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // Added error state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // First, try logging in the user (email/password login for business or service users)
    try {
      const loginResponse = await fetch(`${baseUrl}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || "Login failed");
      }

      // If login is successful, fetch the user role using the user email (email as ID)
      const roleResponse = await fetch(
        `${baseUrl}/user/role/${formData.email}`
      );
      const roleData = await roleResponse.json();

      if (!roleResponse.ok) {
        throw new Error(roleData.message || "Failed to fetch user role");
      }

      // Save user data and role in localStorage
      localStorage.setItem("userRole", roleData.role); // Assuming the role is returned as "role"
      localStorage.setItem("userData", JSON.stringify(loginData)); // Save the full login data

      alert("Login Successful!");
      const params = new URLSearchParams(location.search);
      const redirect = params.get("redirect") || location.pathname;

      // Navigate based on the role
      if (roleData.role === "reviewer") {
        window.location.href = `${baseUrl}/review/google?redirect=${redirect}` // Redirect to Google OAuth for reviewer
      } else if (roleData.role === "business") {
        navigate("/bus-dashboard");
      } else if (roleData.role === "service") {
        navigate("/service-dashboard");
      }
    } catch (error) {
      console.error("Login or role fetch error:", error);
      setError(
        error.message || "An error occurred during login. Please try again."
      );
    }
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

        {/* Error Message */}
        {error && <p className="text-red-500 mt-4">{error}</p>}

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
