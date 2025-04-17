import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { africanCountries } from "./data/africanCountries";
const baseUrl = import.meta.env.VITE_BACKEND_URL;
import { useSnackbar } from "notistack";

export default function BusinessSignup() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    address: "",
    phone_number1: "",
    start: "",
    end: "",
    pob: null,
    city: "",
    state: "",
    day: [],
    description: "",
    images: [],
    countryCode: "NG", // Default country code
  });

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
    "Restaurants & Cafes",
    "Real Estate",
    "Education & Training",
    "Fashion & Beauty",
    "Fitness & Wellness",
    "Travel & Tours",
    "Tech Hubs"
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

  const [phoneError, setPhoneError] = useState("");

  // Create options for react-select from africanCountries
  const countryOptions = africanCountries.map((country) => ({
    value: country.code,
    // We keep the country object as well so it can be used in formatting
    country,
  }));

  // Custom format to display flag and country code using the flag API
  const formatOptionLabel = ({ value, country }) => (
    <div className="flex items-center">
      <img
        src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
        alt={country.name}
        className="mr-2 w-6"
      />
      <span>{value}</span>
    </div>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDaysChange = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      day: checked
        ? [...prev.day, value]
        : prev.day.filter((day) => day !== value),
    }));
    console.log(formData.day);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 5) {
      alert("You can upload a maximum of 5 images!");
      return;
    }

    // Validate file type and size, then store file objects directly
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

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handlePobChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected pob file:", file.name, "with type:", file.type);
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        enqueueSnackbar(
          "Only image or PDF files are allowed for Proof of Business.",
          { variant: "error" }
        ); // Show error message
        return;
      }
      setFormData((prev) => ({
        ...prev,
        pob: file,
      }));
    }
  };

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, phone_number1: value }));

    // Validate the phone number using the current country code
    if (!isValidPhoneNumber(value, formData.countryCode)) {
      setPhoneError("Invalid phone number.");
    } else {
      setPhoneError("");
    }
  };

  // Using react-select, update the countryCode in formData
  const handleCountrySelect = (selectedOption) => {
    const selectedCode = selectedOption.value;
    setFormData((prev) => ({ ...prev, countryCode: selectedCode }));

    // Re-validate phone number when country changes
    if (!isValidPhoneNumber(formData.phone_number1, selectedCode)) {
      setPhoneError("Invalid phone number.");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formPayload = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "images") {
        formData.images.forEach((file) => {
          // Append each file along with its filename
          formPayload.append("images", file, file.name);
        });
      } else if (key === "pob" && formData.pob) {
        // Append the file for pob with its original filename
        formPayload.append("pob", formData.pob, formData.pob.name);
      } else {
        formPayload.append(key, formData[key]);
      }
    });
  
    try {
      const response = await fetch(`${baseUrl}/business/register`, {
        method: "POST",
        body: formPayload,
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Business successfully registered:", data);
        const busId = data.newBusiness.id;
        console.log(busId);
        
        localStorage.setItem("busId", busId);
        navigate("/pricing");
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
  
        enqueueSnackbar(
          "There was an error registering your business. Please try again.",
          { variant: "error" }
        );
      }
    } catch (error) {
      console.error("Network error:", error);
      enqueueSnackbar(
        "There was a network error. Please check your connection.",
        { variant: "error" }
      );
    }
  };
  
  return (
    <div className="max-w-lg w-full mx-auto mt-10 p-4 sm:p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-black text-center">
        Business Listing Signup
      </h2>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        {/* Business Name */}
        <label htmlFor="name" className="font-semibold">
          Business Name:
        </label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Business Name"
          className="p-2 border rounded-md w-full capitalize"
          value={formData.name}
          onChange={handleChange}
          required
        />

        {/* Email */}
        <label htmlFor="email" className="font-semibold">
          Email:
        </label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Email"
          className="p-2 border rounded-md w-full"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* Address */}
        <label htmlFor="address" className="font-semibold">
          Address:
        </label>
        <input
          type="text"
          name="address"
          id="address"
          placeholder="Location Address"
          className="p-2 border rounded-md w-full"
          value={formData.address}
          onChange={handleChange}
          required
        />

        {/* City */}
        <label htmlFor="city" className="font-semibold">
          City:
        </label>
        <input
          type="text"
          name="city"
          id="city"
          placeholder="City"
          className="p-2 border rounded-md w-full"
          value={formData.city}
          onChange={handleChange}
          required
        />

        {/* State */}
        <label htmlFor="state" className="font-semibold">
          State:
        </label>
        <input
          type="text"
          name="state"
          id="state"
          placeholder="State"
          className="p-2 border rounded-md w-full"
          value={formData.state}
          onChange={handleChange}
          required
        />

        {/* Proof of Business */}
        <label htmlFor="pob" className="font-semibold">
          Proof of Business:
        </label>
        <input
          type="file"
          name="pob"
          id="pob"
          accept="image/*, application/*"
          onChange={handlePobChange}
          className="w-full p-2 border rounded mt-1"
          required
        />

        {/* Phone Number & Country */}
        <label htmlFor="phone_number1" className="font-semibold">
          Phone Number:
        </label>
        <div className="flex gap-2">
          <div className="w-1/4">
            <Select
              value={countryOptions.find(
                (opt) => opt.value === formData.countryCode
              )}
              onChange={handleCountrySelect}
              options={countryOptions}
              formatOptionLabel={formatOptionLabel}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
          <input
            type="tel"
            name="phone_number1"
            id="phone_number1"
            placeholder="Phone Number"
            className="p-2 border rounded-md w-3/4"
            value={formData.phone_number1}
            onChange={handlePhoneChange}
            required
          />
        </div>
        {phoneError && <div style={{ color: "red" }}>{phoneError}</div>}

        {/* Category */}
        <label htmlFor="category" className="font-semibold">
          Category:
        </label>
        <select
          name="category"
          id="category"
          className="p-2 border rounded-md w-full"
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

        {/* Opening Days */}
        <fieldset className="border p-2 rounded-md">
          <legend className="font-semibold text-black">Opening Days:</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {daysOfWeek.map((day) => (
              <label key={day} className="flex items-center space-x-2">
                <input
                  name="day"
                  type="checkbox"
                  value={day}
                  checked={formData.day.includes(day)}
                  onChange={handleDaysChange}
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Business Hours */}
        <label className="font-semibold">Business Hours:</label>
        <div className="flex gap-3">
          <div className="flex flex-col w-1/2">
            <label htmlFor="start" className="text-sm">
              Opening Time:
            </label>
            <input
              type="time"
              name="start"
              id="start"
              className="p-2 border rounded-md"
              value={formData.start}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col w-1/2">
            <label htmlFor="end" className="text-sm">
              Closing Time:
            </label>
            <input
              type="time"
              name="end"
              id="end"
              className="p-2 border rounded-md"
              value={formData.end}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Description */}
        <label htmlFor="description" className="font-semibold">
          Description:
        </label>
        <textarea
          name="description"
          id="description"
          placeholder="Description of Product"
          className="p-2 border rounded-md w-full"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          required
        />

        {/* Image Upload */}
        <label htmlFor="images" className="font-semibold">
          Upload Images:
        </label>
        <input
          type="file"
          name="images"
          id="images"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="w-full p-2 border rounded mt-1"
        />

        {/* Image Preview */}
        {formData.images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {formData.images.map((file, index) => (
              <div
                key={index}
                className="relative w-24 h-24 border rounded-md overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  onClick={() => removeImage(index)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-lg cursor-pointer w-full text-center"
        >
          Next (Choose Plan)
        </button>
      </form>
    </div>
  );
}
