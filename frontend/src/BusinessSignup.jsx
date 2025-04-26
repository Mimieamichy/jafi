import { useState, useEffect } from "react";
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
  const [standardPrice, setStandardPrice] = useState(null);
  const [premiumPrice, setPremiumPrice] = useState(null);
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
    businessType: "standard", 
    description: "",
    images: [],
    logo: null,
    countryCode: "NG", // Default country code
  });

  const standardOptions = [
    "Beauty & Salon",
    "Hospital",
    "Nightlife & Entertainment",
    "Restaurant",
  ];

  const premiumOptions = [
    "Church",
    "Communication",
    "Airplane",
    "Banking",
    "Hotel",
  ];

  //   "Automotives",
  //   "Hotels",
  //   "Healthcare",
  //   "Groceries",
  //   "Malls & Supermarkets",
  //   "Banking & FinTech",
  //   "Churches",
  //   "Aircrafts",
  //   "Nigerian Made",
  //   "Nightlife & Entertainment",
  //   "Restaurants & Cafes",
  //   "Real Estate",
  //   "Education & Training",
  //   "Fashion & Beauty",
  //   "Fitness & Wellness",
  //   "Travel & Tours",
  //   "Tech Hubs"
  // ];

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

   // ─── fetch prices once on mount ─────
   useEffect(() => {
    async function loadPrices() {
      try {
        const [stdRes, premRes] = await Promise.all([
          fetch(`${baseUrl}/admin/standardPrice`),
          fetch(`${baseUrl}/admin/premuimPrice`)
        ]);

        const stdData = await stdRes.json();
        const premData = await premRes.json();

        if (stdRes.ok) setStandardPrice(stdData.price);
        else enqueueSnackbar(stdData.message || "Could not load standard price", { variant: "error" });

        if (premRes.ok) setPremiumPrice(premData.price);
        else enqueueSnackbar(premData.message || "Could not load premium price", { variant: "error" });
      } catch (err) {
        console.error(err);
        enqueueSnackbar("Network error fetching prices", { variant: "error" });
      }
    }
    loadPrices();
  }, [enqueueSnackbar]);


  const handlebusinessTypeChange = (e) => {
    const businessType = e.target.value;
    setFormData(prev => ({
      ...prev,
      businessType,
      category: "",
    }));
  };

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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return; // no file selected
  
    // only allow images
    if (!file.type.startsWith("image/")) {
      enqueueSnackbar("Only image files are allowed for your logo.", { variant: "error" });
      return;
    }
  
    // optional size check (e.g. max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      enqueueSnackbar("Logo must be smaller than 2 MB.", { variant: "error" });
      return;
    }
  
    // all good—save it
    setFormData((prev) => ({
      ...prev,
      logo: file,
    }));
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
  
    // build FormData payload
    const formPayload = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (key === "images" && Array.isArray(val)) {
        // append each image file
        val.forEach(file => formPayload.append("images", file, file.name));
      } else if ((key === "pob" || key === "logo") && val instanceof File) {
        // append pob or logo file
        formPayload.append(key, val, val.name);
      } else {
        // append all other fields (strings, arrays, etc.)
        formPayload.append(key, val);
      }
    });
  
    try {
      const response = await fetch(`${baseUrl}/business/register`, {
        method: "POST",
        body: formPayload,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
  
      const data = await response.json();
      localStorage.setItem("busId", data.newBusiness.id);
  
      // navigate based on chosen businessType
      if (formData.businessType === "premium") {
        navigate("/premium-payment");
      } else {
        navigate("/standard-payment");
      }
    } catch (err) {
      console.error("Submission error:", err);
      enqueueSnackbar("Error registering business. Please try again.", {
        variant: "error",
      });
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
        <label htmlFor="logo" className="font-semibold">
          Business Logo:
        </label>
        <input
          type="file"
          name="logo"
          id="logo"
          accept="image/*"
          onChange={handleLogoChange}
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
        <fieldset className="flex gap-6">
          <legend className="font-semibold">Plan Type:</legend>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="businessType"
              value="standard"
              checked={formData.businessType === "standard"}
              onChange={handlebusinessTypeChange}
            />
             <span>
              Standard{" "}
              {standardPrice != null
                ? `— $${standardPrice}`
                : "(loading…)"}
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="businessType"
              value="premium"
              checked={formData.businessType === "premium"}
              onChange={handlebusinessTypeChange}
            />
            <span>
              Premium{" "}
              {premiumPrice != null
                ? `— $${premiumPrice}`
                : "(loading…)"}
            </span>
          </label>
        </fieldset>

        {/* Sub-Category */}
        <label htmlFor="category" className="font-semibold">
          {formData.businessType === "standard" ? "Standard Categories" : "Premium Categories"}:
        </label>
        <select
          id="category"
          name="category"
          className="p-2 border rounded-md w-full"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select {formData.businessType === "standard" ? "Standard" : "Premium"} Option
          </option>
          {(formData.businessType === "standard" ? standardOptions : premiumOptions).map(opt => (
            <option key={opt} value={opt}>
              {opt}
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
          {formData.businessType === "premium" ? "Proceed to Premium Payment" : "Proceed to Standard Payment"}
        </button>
      </form>
    </div>
  );
}
