import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function BusinessSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    category: "",
    address: "",
    phone: "",
    password: "",
    confirmPassword: "",
    openingTime: "",
    closingTime: "",
    openingDays: [],
    description: "",
    socialLinks: { facebook: "", linkedin: "", twitter: "" },
    image: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const categories = [
    "Automotives",
    "Hotels",
    "Healthcare",
    "Groceries",
    "Malls & Supermarkets",
    "Banking & FinTech",
    "Churches",
    "Aircrafts",
    "Nigerian Made",
    "Nightlife & Entertainment",
  ];

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDaysChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      openingDays: checked
        ? [...prev.openingDays, value]
        : prev.openingDays.filter((day) => day !== value),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed!");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB!");
      return;
    }

    setFormData({ ...formData, image: file });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Business Signup Data:", formData);
    navigate("/pricing"); // Redirect to pricing page
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-black">
        Business Listing Signup
      </h2>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          type="text"
          name="companyName"
          placeholder="Company/Product Name"
          className="p-2 border rounded-md capitalize"
          value={formData.companyName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Location Address"
          className="p-2 border rounded-md"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          className="p-2 border rounded-md"
          value={formData.phone}
          onChange={handleChange}
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
        <select
          name="category"
          className="p-2 border rounded-md"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select Category
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Opening Days Selection */}
        <fieldset className="border p-2 rounded-md">
          <legend className="text-black font-semibold">
            Select Opening Days:
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {daysOfWeek.map((day) => (
              <label key={day} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={day}
                  checked={formData.openingDays.includes(day)}
                  onChange={handleDaysChange}
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-black">Opening Time</span>
          <input
            type="time"
            name="openingTime"
            className="p-2 border rounded-md w-full"
            value={formData.openingTime}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block">
          <span className="text-black">Closing Time</span>
          <input
            type="time"
            name="closingTime"
            className="p-2 border rounded-md w-full"
            value={formData.closingTime}
            onChange={handleChange}
            required
          />
        </label>

        <textarea
          name="description"
          placeholder="Description of Product"
          className="p-2 border rounded-md"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <input
          type="url"
          name="facebook"
          placeholder="Facebook Link"
          className="p-2 border rounded-md"
          value={formData.socialLinks.facebook}
          onChange={handleChange}
        />
        <input
          type="url"
          name="linkedin"
          placeholder="LinkedIn Link"
          className="p-2 border rounded-md"
          value={formData.socialLinks.linkedin}
          onChange={handleChange}
        />
        <input
          type="url"
          name="twitter"
          placeholder="Twitter/X Link"
          className="p-2 border rounded-md"
          value={formData.socialLinks.twitter}
          onChange={handleChange}
        />

        <label className="block">
          <span className="text-black">Upload Business Image (Max: 5MB)</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded mt-1"
            required
          />
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-lg"
        >
           Next (Choose Plan)
        </button>
      </form>
    </div>
  );
}
