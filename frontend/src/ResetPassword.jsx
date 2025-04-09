import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function ResetPassword() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetToken = params.get("token");
    setToken(resetToken);

    if (!resetToken) {
      enqueueSnackbar("Invalid or expired reset link", { variant: "error" });
      navigate("/signin");
    }
  }, [location, enqueueSnackbar, navigate]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === "newPassword") {
      setNewPassword(value);
    } else {
      setConfirmPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "warning" });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/user/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        enqueueSnackbar("Password successfully reset", { variant: "success" });
        navigate("/signin");
      } else {
        enqueueSnackbar(result.message || "Error resetting password", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("An error occurred. Please try again later.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-900 text-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-4 text-center">Reset Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          name="newPassword"
          value={newPassword}
          onChange={handlePasswordChange}
          placeholder="Enter new password"
          className="w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400"
          required
        />

        <input
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handlePasswordChange}
          placeholder="Confirm new password"
          className="w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400"
          required
        />

        <button
          type="submit"
          className={`w-full ${loading ? "bg-gray-400" : "bg-blue-600"} text-white p-3 rounded-lg cursor-pointer hover:bg-blue-700`}
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
