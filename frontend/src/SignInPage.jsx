import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useSnackbar } from "notistack";
import { jwtDecode } from "jwt-decode";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function SignIn() {
  const { enqueueSnackbar } = useSnackbar(); // Use Snackbar for notifications
  const navigate = useNavigate();
  const location = useLocation(); // To get the 'redirect' URL parameter
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

    try {
      // Attempt login with email and password for listing
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

      const token = loginData.token;
      localStorage.setItem("userToken", token);

      const decodedToken = jwtDecode(token);
      const role = decodedToken.role;
      localStorage.setItem("userRole", role);
      localStorage.setItem("userData", JSON.stringify(decodedToken));
      enqueueSnackbar("Login Successful!", { variant: "success" });

      // const params = new URLSearchParam

      if (role === "business") {
        navigate("/bus-dashboard");
      }
     else if (role === "superadmin") {
        navigate("/admin");
      }
     else if (role === "admin") {
        navigate("/admin-page");
      }
      else if (role === "service") {
        navigate("/hiring-dashboard");
      }
    } catch (error) {
      console.error("Login or role fetch error:", error);
      setError(
        error.message || "An error occurred during login. Please try again."
      );
      enqueueSnackbar(
        error.message || "An error occurred during login. Please try again.",
        { variant: "error" }
      ); // Error Notification
    }
  };

  const handleGoogleLogin = () => {
    // FIX: Use a simpler approach to handle redirects
    // Get the intended redirect destination after login
    const params = new URLSearchParams(location.search);
    const redirectPath = params.get("redirect") || "/"; // Default to home if no redirect specified

    // Create the Google auth URL with proper redirect parameter
    // This fixes the encoding issue that was causing the TokenError
    window.location.href = `${baseUrl}/review/google?redirect=${encodeURIComponent(
      redirectPath
    )}`;
  };

  return (
    <div className="max-w-md mx-auto my-5 p-6 bg-gray-900 text-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-4 text-center">Sign In</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
          className="w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400"
          required
        />

        {/* Password Input */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            {showPassword ? (
              <FontAwesomeIcon icon={faEye} />
            ) : (
              <FontAwesomeIcon icon={faEyeSlash} />
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg cursor-pointer hover:bg-blue-700"
        >
          Login
        </button>
      </form>

      {/* Forgot Password Link */}
      <div className="text-center mt-4">
        <Link
          to="/forgot-password"
          className="text-gray-400 hover:text-white text-sm"
        >
          Forgot Password?
        </Link>
      </div>

      {/* Or Sign in as Reviewer */}
      <div className="mt-4 text-center text-gray-400">
        <p className="capitalize">or sign in as reviewer</p>
      </div>

      {/* Sign In with Google */}
      <div className="mt-4 text-center">
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-gray-800 text-white p-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-700"
        >
          <FontAwesomeIcon icon={faGoogle} />
          <span>with Google</span>
        </button>
      </div>
    </div>
  );
}
