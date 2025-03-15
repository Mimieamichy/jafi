import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const categories = [
  "Auto Repair",
  "Contractor",
  "Electrician",
  "Heating and Air Conditioning",
  "Fumigation & Home Cleaning",
  "Landscaping",
  "Movers",
  "Painters",
  "Plumbers",
  "Pest Control",
  "Roofers",
];

export default function HiringSignup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    jobImage: null,
    workSamples: null,
    address: "",
    category: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle single image upload with validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPEG, JPG, and PNG images are allowed.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be 5MB or less.");
        return;
      }

      setFormData({ ...formData, jobImage: file });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Signup Successful! (Static Data Used for Now)");
    setOtpSent(true);
  };
  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      localStorage.setItem("hiringSignupData", JSON.stringify(formData));
      navigate("/hiring-payment");
    } else {
      alert("Invalid OTP. Please enter a valid 6-digit code.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Hiring Signup</h2>
      {!otpSent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-2 border rounded capitalize"
            required
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-2 border rounded"
            required
          />

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number / WhatsApp"
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
              className="absolute right-3 top-2 text-gray-500"
            >
              {showPassword ? (
                <FontAwesomeIcon icon={faEye} />
              ) : (
                <FontAwesomeIcon icon={faEyeSlash} />
              )}
            </button>
          </div>

          {/* Confirm Password Input with Show/Hide */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full p-2 border rounded-md pr-10"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2 text-gray-500"
            >
              {showConfirmPassword ? (
                <FontAwesomeIcon icon={faEye} />
              ) : (
                <FontAwesomeIcon icon={faEyeSlash} />
              )}
            </button>
          </div>

          <label className="block">
            <span>
              Upload an image of you working (Max: 5MB, JPG/PNG only):
            </span>
            <input
              type="file"
              name="jobImage"
              accept="image/jpeg, image/png, image/jpg"
              onChange={handleFileChange}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </label>

          <label className="block">
            <span>Upload images of jobs you've done:</span>
            <input
              type="file"
              name="workSamples"
              accept="image/jpeg, image/png, image/jpg"
              onChange={handleFileChange}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </label>

          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Location Address"
            className="w-full p-2 border rounded"
            required
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="" disabled>
              Select a Category
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-lg"
          >
            Proceed to Payment
          </button>
        </form>
      ) : (
        <div className="text-center">
          <p className="text-black">Enter OTP sent to your phone</p>
          <input
            type="text"
            className="p-2 border rounded-md w-full text-center"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            onClick={handleVerifyOtp}
            className="mt-3 bg-blue-600 text-white py-2 w-full rounded-lg"
          >
            Verify OTP
          </button>
        </div>
      )}
    </div>
  );
}
