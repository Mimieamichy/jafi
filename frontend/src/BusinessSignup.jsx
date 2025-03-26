import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function BusinessSignup() {
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    category: "",
    address: "",
    phone: "",
    openingTime: "",
    closingTime: "",
    openingDays: [],
    description: "",
    socialLinks: { facebook: "", linkedin: "", twitter: "", website: "" },
    images: [],
    
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

  useEffect(() => {
     
    const storedData = JSON.parse(localStorage.getItem("businessSignupData"));
    if (storedData && typeof storedData === "object") {
      setFormData({
        ...storedData,
        socialLinks: storedData.socialLinks || {},
        images: storedData.images || [],
        openingDays: storedData.openingDays || [],
      });
    } else {
      console.log("No businessSignupData found in localStorage");
    }
  }, []);
  const handleSocialLinksChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },
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
      openingDays: checked
        ? [...prev.openingDays, value]
        : prev.openingDays.filter((day) => day !== value),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (formData.images.length + files.length > 5) {
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

    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    Promise.all(validFiles.map((file) => convertToBase64(file))).then(
      (base64Images) => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...base64Images],
        }));
      }
    );
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Business Signup Data:", formData);
    localStorage.setItem("businessSignupData", JSON.stringify(formData)); // Save data to localStorage
    navigate("/pricing");
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
          placeholder="Business Name"
          className="p-2 border rounded-md capitalize"
          value={formData.companyName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="p-2 border rounded-md"
          value={formData.email}
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
          type="tel"
          name="phone"
          placeholder="123-456-7890"
          maxlength="12"
          className="p-2 border rounded-md"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        {/* Social Media Links */}
        <input
          type="text"
          name="facebook"
          placeholder="Facebook Link"
          className="p-2 border rounded-md"
          value={formData.socialLinks.facebook}
          onChange={handleSocialLinksChange}
        />
        <input
          type="text"
          name="linkedin"
          placeholder="LinkedIn Link"
          className="p-2 border rounded-md"
          value={formData.socialLinks.linkedin}
          onChange={handleSocialLinksChange}
        />
        <input
          type="text"
          name="twitter"
          placeholder="Twitter (X) Link"
          className="p-2 border rounded-md"
          value={formData.socialLinks.twitter}
          onChange={handleSocialLinksChange}
        />
        <input
          type="text"
          name="website"
          placeholder="Website Link"
          className="p-2 border rounded-md"
          value={formData.socialLinks.website}
          onChange={handleSocialLinksChange}
        />

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

        <fieldset className="border p-2 rounded-md">
          <legend className="text-black font-semibold">Opening Days:</legend>
          <div className="grid grid-cols-2 gap-2">
            {daysOfWeek.map((day) => (
              <label key={day} className="block">
                <input
                  type="checkbox"
                  value={day}
                  checked={formData.openingDays.includes(day)}
                  onChange={handleDaysChange}
                />
                {day}
              </label>
            ))}{" "}
          </div>
        </fieldset>

        <input
          type="time"
          name="openingTime"
          value={formData.openingTime}
          className="p-2 border rounded-md w-full"
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="closingTime"
          className="p-2 border rounded-md w-full"
          value={formData.closingTime}
          onChange={handleChange}
          required
        />

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
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="w-full p-2 border rounded mt-1"
        />

        {/* IMAGE PREVIEW SECTION */}
        {formData.images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {formData.images.map((img, index) => (
              <div
                key={index}
                className="relative w-24 h-24 border rounded-md overflow-hidden"
              >
                <img
                  src={img}
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
          className="bg-blue-600 text-white py-2 rounded-lg cursor-pointer"
        >
          Next (Choose Plan)
        </button>
      </form>
    </div>
  );
}
