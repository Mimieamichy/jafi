import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { africanCountries } from "./data/africanCountries";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useSnackbar } from "notistack";

const countryOptions = africanCountries.map((country) => ({
  value: country.dial_code,
  label: `${country.code} (${country.dial_code})`,
  flag: `https://flagcdn.com/w40/${country.code.toLowerCase()}.png`,
}));

const formatOptionLabel = (option) => (
  <div className="flex items-center gap-2 ">
    <img src={option.flag} alt="" className="w-5 h-4 object-cover rounded-sm" />
    <span>{option.label}</span>
  </div>
);
const baseUrl = import.meta.env.VITE_BACKEND_URL;

const categories = [
  "Auto Repair",
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
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    service: "",
    name: "",
    email: "",
    phone: "",
    workSamples: [],
    address: "",
    category: "",
    countryCode: "+234",
    otp: "",
    description: "",
    customCategory: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();
  let rawPhone = formData.phone.trim();
  if (rawPhone.startsWith("0")) {
    rawPhone = rawPhone.slice(1);
  }

  const fullPhoneNumber = `${formData.countryCode}${rawPhone}`;

  // handleChange function to update form data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Convert images to base64 instead of using createObjectURL

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (formData.workSamples.length + files.length > 5) {
      enqueueSnackbar("You can upload a maximum of 5 images!", {
        variant: "warning",
      });
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        enqueueSnackbar("Only image files are allowed!", {
          variant: "warning",
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar("Image must be less than 5MB!", { variant: "warning" });
        return false;
      }
      return true;
    });

    setFormData((prev) => ({
      ...prev,
      workSamples: [...prev.workSamples, ...validFiles], // Use File objects instead of base64
    }));
  };

  // Remove image from the work samples array
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      workSamples: prev.workSamples.filter((_, i) => i !== index),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (formData.workSamples.length < 3) {
      enqueueSnackbar("Please select at least two images.", {
        variant: "warning",
      });
      return;
    }
    e.preventDefault();
    setIsSaving(true);

    if (!isValidPhoneNumber(fullPhoneNumber)) {
      enqueueSnackbar("Invalid phone number!", { variant: "warning" });
      return;
    }

    // Prepare FormData for file upload
    const data = new FormData();

    data.append("service", formData.service);
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", fullPhoneNumber);
    data.append("address", formData.address);
    data.append("otp", formData.otp);
    data.append(
      "category",
      formData.category === "Other"
        ? formData.customCategory
        : formData.category
    );
    data.append("description", formData.description);

    // Append images
    formData.workSamples.forEach((image) => {
      data.append(`workSamples`, image);
    });

    try {
      const response = await fetch(`${baseUrl}/service/register`, {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      console.log("Result:", result);

      if (response.ok) {
        enqueueSnackbar(
          "Signup Successful! Proceeding to OTP verification...",
          { variant: "success" }
        );
        setOtpSent(true);
      } else {
        enqueueSnackbar(`Error: ${result.error}`, { variant: "error" });
      }
      const serviceId = result.newService.id;
      localStorage.setItem("serviceId", serviceId);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    setIsSaving(true);
    if (otp.length !== 6) {
      enqueueSnackbar("Invalid OTP. Please enter a valid 6-digit code.", {
        variant: "warning",
      });
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/service/verify-service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp,
          phone: fullPhoneNumber,
        }),
      });

      console.log("OTP Verification Data:", formData.otp);
      const result = await response.json();
      console.log("OTP Verification Result:", result);

      if (response.ok) {
        enqueueSnackbar("OTP Verified Successfully!", { variant: "success" });

        navigate("/hiring-payment"); // Redirect after successful verification
      } else {
        enqueueSnackbar(`Verification Failed: ${result.error}`, {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);

      enqueueSnackbar("Something went wrong. Please try again.", {
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Hiring Signup</h2>
      {!otpSent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="service"
            value={formData.sercive}
            onChange={handleChange}
            placeholder="Service Name"
            className="w-full p-2 border rounded capitalize"
            required
          />
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

          <div className="flex gap-2">
            <div className="w-1/3">
              <Select
                options={countryOptions}
                formatOptionLabel={formatOptionLabel}
                onChange={(selected) =>
                  setFormData({
                    ...formData,
                    countryCode: selected?.value || "+234",
                  })
                }
                defaultValue={countryOptions.find(
                  (opt) => opt.value === formData.countryCode
                )}
              />
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className="w-[100%] p-2 border rounded"
              required
            />
          </div>

          <label className="block">
            <span className="block mb-1 font-medium">
              Describe your service
            </span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Briefly describe the service you offer..."
              className="w-full p-2 border rounded resize-none h-24"
              required
            />
          </label>

          <label className="block">
            <span>Upload up to 5 images of jobs you've done:</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.workSamples.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(img)}
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
            <option value="Other">Other</option>
          </select>
          {formData.category === "Other" && (
            <input
              type="text"
              name="customCategory"
              value={formData.customCategory}
              onChange={handleChange}
              placeholder="Enter your category"
              className="w-full p-2 border rounded mt-2 capitalize"
              required
            />
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-lg"
          >
            {isSaving ? (
              "Processing..."
            ) : (
              <>
                <span>Verify Phone Number</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <p className="text-black">Enter OTP sent to your phone</p>
          <input
            name="otp"
            type="text"
            className="p-2 border rounded-md w-full text-center"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            onClick={handleVerifyOtp}
            className="mt-3 bg-blue-600 text-white py-2 w-full rounded-lg"
          >
            {isSaving ? (
              "Processing..."
            ) : (
              <>
                <span>Verify OTP</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
