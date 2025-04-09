import { useState } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      enqueueSnackbar("Please enter your email address", {
        variant: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/user/forget-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      console.log("Response from server:", result); // Log the response for debugging

      if (response.ok) {
       ; // Set success message
        enqueueSnackbar("Password reset link sent to your email.", {
          variant: "success",
        });
        navigate("/"); 
        // Optionally redirect to the SignIn page or elsewhere after a timeout
      } else {
        
        enqueueSnackbar(result.message || "Error sending email", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error sending password reset email:", error);
     
      enqueueSnackbar("An error occurred. Please try again later.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-900 text-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-4 text-center">Forgot Password</h2>

      {/* Display message after email submission */}
    

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Enter your email"
          className="w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400"
          required
        />
        <button
          type="submit"
          className={`w-full ${
            loading ? "bg-gray-400" : "bg-blue-600"
          } text-white p-3 rounded-lg cursor-pointer hover:bg-blue-700`}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
