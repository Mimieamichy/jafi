import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
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
    workSamples: [],
    address: "",
    category: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("hiringSignupData"));
    if (storedData) {
      setFormData({ ...storedData, workSamples: storedData.workSamples || [] });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Convert images to base64 instead of using createObjectURL
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (formData.workSamples.length + files.length > 5) {
      alert("You can upload a maximum of 5 images!");
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed!");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB!");
        return false;
      }
      return true;
    });

    const promises = validFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
      });
    });

    Promise.all(promises).then((base64Images) => {
      setFormData((prev) => ({
        ...prev,
        workSamples: [...prev.workSamples, ...base64Images],
      }));
    });
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      workSamples: prev.workSamples.filter((_, i) => i !== index),
    }));
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

          <label className="block">
            <span>Upload up to 5 images of jobs you've done:</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.workSamples.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt="Preview"
                  className="w-16 h-16 rounded-md object-cover"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                  onClick={() => removeImage(index)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))}
          </div>

          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Full Location Address"
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
