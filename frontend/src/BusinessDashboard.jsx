import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSignOutAlt,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faLinkedin,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { useNavigate } from "react-router-dom";

export default function BusinessDashboard() {
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  //const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("businessSignupData"));
    if (storedData && typeof storedData === "object") {
      setFormData({
        ...storedData,
        socialLinks: storedData.socialLinks || {},
        images: storedData.images || [],
        openingDays: storedData.openingDays || [],
      });
    }
    /*const storedReviews =
      JSON.parse(localStorage.getItem("businessReviews")) || [];
    setReviews(storedReviews);*/
  }, []);

  const handleEditClick = () => {
    setEditData({ ...formData });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },
    }));
  };

  const handleDaysChange = (e) => {
    const { value, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      openingDays: checked
        ? [...prev.openingDays, value]
        : prev.openingDays.filter((day) => day !== value),
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];

    // Check if all files are valid images
    if (!files.every((file) => validImageTypes.includes(file.type))) {
      setErrorMessage("Only JPG, PNG, and GIF images are allowed.");
      return;
    }

    // Check if exactly 5 images are uploaded
    if (files.length !== 5) {
      setErrorMessage("You must upload exactly 5 images.");
      return;
    }

    // Convert files to URLs for preview
    const imageUrls = files.map((file) => URL.createObjectURL(file));

    setEditData((prev) => ({
      ...prev,
      images: imageUrls,
    }));

    setErrorMessage("");
  };

  const handleSave = () => {
    if (editData.images.length !== 5) {
      setErrorMessage("You must upload exactly 5 images before saving.");
      return;
    }

    localStorage.setItem("businessSignupData", JSON.stringify(editData));
    setFormData(editData);
    setIsEditing(false);
  };

  const handleSignOut = () => {
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-200 shadow-md rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-black">Business Dashboard</h2>
        <div className="flex gap-4">
          {!isEditing && (
            <button onClick={handleEditClick} className="text-blue-500">
              <FontAwesomeIcon icon={faEdit} size="lg" /> Edit
            </button>
          )}
          <button onClick={handleSignOut} className="text-red-500">
            <FontAwesomeIcon icon={faSignOutAlt} size="lg" /> SignOut
          </button>
        </div>
      </div>

      {/* Business Details (Read-Only) */}
      {!isEditing && formData && (
        <div className="space-y-4">
          <p>
            <strong>Business Name:</strong> {formData.companyName}
          </p>
          <p>
            <strong>Email:</strong> {formData.email}
          </p>
          <p>
            <strong>Location:</strong> {formData.address}
          </p>
          <p>
            <strong>Category:</strong> {formData.category}
          </p>
          <p>
            <strong>Description:</strong> {formData.description}
          </p>
          <p>
            <strong>Phone:</strong> {formData.phone}
          </p>
          <p>
            <strong>Opening Days:</strong>{" "}
            {formData.openingDays?.join(", ") || "Not specified"}
          </p>
          <p>
            <strong>Opening Time:</strong>{" "}
            {formData.openingTime || "Not specified"}
          </p>
          <p>
            <strong>Closing Time:</strong>{" "}
            {formData.closingTime || "Not specified"}
          </p>
          <p>
            <strong>Social Media:</strong>
          </p>
          <ul className=" pl-5">
            <li>
              <strong>
                {" "}
                <FontAwesomeIcon icon={faFacebook} />:
              </strong>{" "}
              {formData.socialLinks?.facebook || "Not provided"}
            </li>
            <li>
              <strong>
                {" "}
                <FontAwesomeIcon icon={faLinkedin} />:
              </strong>{" "}
              {formData.socialLinks?.linkedin || "Not provided"}
            </li>
            <li>
              <strong>
                <FontAwesomeIcon icon={faXTwitter} />:
              </strong>{" "}
              {formData.socialLinks?.twitter || "Not provided"}
            </li>
            <li>
              <strong>
                <FontAwesomeIcon icon={faGlobe} />:
              </strong>{" "}
              {formData.socialLinks?.website || "Not provided"}
            </li>
          </ul>
          <p>
            <strong>Business Images:</strong>
          </p>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {formData.images?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Business ${index}`}
                className="w-20 h-20 object-cover rounded border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Edit Details</h3>

          <label className="block mt-2">Phone Number:</label>
          <input
            type="text"
            name="phone"
            value={editData.phone || ""}
            onChange={handleEditChange}
            className="w-full p-2 border rounded-md"
          />

          <label className="block mt-2">Address:</label>
          <input
            type="text"
            name="address"
            value={editData.address || ""}
            onChange={handleEditChange}
            className="w-full p-2 border rounded-md"
          />

          <label className="block mt-2">Product Description:</label>
          <textarea
            name="description"
            value={editData.description || ""}
            onChange={handleEditChange}
            className="w-full p-2 border rounded-md"
            rows="3"
          />

          <label className="block mt-2">Opening Days:</label>
          <div className="flex flex-wrap gap-2">
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day) => (
              <label key={day} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={day}
                  checked={editData.openingDays?.includes(day)}
                  onChange={handleDaysChange}
                />
                {day}
              </label>
            ))}
          </div>

          <label className="block mt-2">Opening Time:</label>
          <input
            type="time"
            name="openingTime"
            value={editData.openingTime || ""}
            onChange={handleEditChange}
            className="w-full p-2 border rounded-md"
          />

          <label className="block mt-2">Closing Time:</label>
          <input
            type="time"
            name="closingTime"
            value={editData.closingTime || ""}
            onChange={handleEditChange}
            className="w-full p-2 border rounded-md"
          />

          <label className="block mt-2">Social Media Links:</label>
          <input
            type="text"
            name="facebook"
            value={editData.socialLinks?.facebook || ""}
            onChange={handleSocialLinkChange}
            placeholder="Facebook URL"
            className="w-full p-2 border rounded-md"
          />
          <input
            type="text"
            name="linkedin"
            value={editData.socialLinks?.linkedin || ""}
            onChange={handleSocialLinkChange}
            placeholder="LinkedIn URL"
            className="w-full p-2 border rounded-md"
          />
          <input
            type="text"
            name="twitter"
            value={editData.socialLinks?.twitter || ""}
            onChange={handleSocialLinkChange}
            placeholder="X (Twitter) URL"
            className="w-full p-2 border rounded-md"
          />

          <label className="block mt-2">Upload 5 Images:</label>
          <input
            type="file"
            multiple
            accept="image/jpeg, image/png, image/jpg, image/gif"
            onChange={handleImageUpload}
            className="w-full p-2 border rounded mt-2"
          />
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          <button
            onClick={handleSave}
            className="bg-green-500 text-white py-2 px-4 mt-3 rounded-lg"
          >
            Save Changes
          </button>
        </div>
      )}
      {/* Reviews Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        {/*reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="p-3 border rounded-md mt-2">
              <p>
                <strong>{review.name}:</strong> {review.comment}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )*/}
        <p className="text-gray-500">No reviews yet.</p>
      </div>
    </div>
  );
}
