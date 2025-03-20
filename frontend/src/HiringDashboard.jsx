import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSignOutAlt,
  faCamera,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function HiringDashboard() {
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [workSampleImages, setWorkSampleImages] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("hiringSignupData"));
    if (storedData) {
      setFormData({ ...storedData, workSamples: storedData.workSamples || [] });
      setProfileImage(localStorage.getItem("profileImage") || null);
      setWorkSampleImages(storedData.workSamples || []);
    }
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (workSampleImages.length !== 5) {
      alert("Please upload exactly five images.");
      return;
    }
    localStorage.setItem(
      "hiringSignupData",
      JSON.stringify({ ...formData, workSamples: workSampleImages })
    );
    if (profileImage) {
      localStorage.setItem("profileImage", profileImage);
    }
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleSignOut = () => {
    navigate("/");
  };

  const handleWorkSampleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length !== 5) {
      alert("You must upload exactly five images.");
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== 5) {
      alert("All uploaded files must be images.");
      return;
    }

    const readers = imageFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((imageURLs) => {
      setWorkSampleImages(imageURLs);
    });
  };

  return (
    <div className={`min-h-screen p-6`}>
      {/* Top Right Buttons */}
      <div className="flex justify-end space-x-4 mb-6 mt-10">
        <button
          onClick={handleEditToggle}
          className="text-blue-500 cursor-pointer"
        >
          <FontAwesomeIcon icon={faEdit} /> {isEditing ? "Cancel" : "Edit"}
        </button>

        <button onClick={handleSignOut} className="text-red-500 cursor-pointer">
          <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
        </button>
      </div>

      {/* Profile Section */}
      {formData ? (
        <div className="max-w-lg mx-auto bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Your Profile</h2>

          {/* Profile Image */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative w-24 h-24">
              <img
                src={profileImage || "https://via.placeholder.com/100"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full cursor-pointer">
                  <FontAwesomeIcon icon={faCamera} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.type.startsWith("image/")) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setProfileImage(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-3">
            <label className="block">
              <span className="font-semibold">Full Name:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="capitalize">{formData.name}</p>
              )}
            </label>

            <label className="block">
              <span className="font-semibold">Email:</span>
              <p>{formData.email}</p>
            </label>

            <label className="block">
              <span className="font-semibold">Phone:</span>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p>{formData.phone}</p>
              )}
            </label>

            <label className="block">
              <span className="font-semibold">Location Address:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p>{formData.address}</p>
              )}
            </label>

            {/* Read-Only Category Field */}
            <label className="block">
              <span className="font-semibold">Category:</span>
              <p className="bg-gray-200 p-2 rounded mt-2">
                {formData.category}
              </p>
            </label>

            {/* Work Samples Upload */}
            {isEditing && (
              <label className="block">
                <span className="font-semibold">
                  Upload Work Samples (5 images required):
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleWorkSampleUpload}
                  className="w-full p-2 border rounded mt-2"
                />
              </label>
            )}

            {/* Work Samples Preview */}
            <div className="grid grid-cols-5 gap-2 mt-2">
              {workSampleImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Work Sample ${index + 1}`}
                  className="w-20 h-20 object-cover rounded border"
                />
              ))}
            </div>

            {/* Password Field (Editable Only) */}
            {isEditing && (
              <label className="block">
                <span className="font-semibold">New Password:</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full p-2 border rounded pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-gray-500"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </button>
                </div>
              </label>
            )}
          </div>

          {/* Save Button */}
          {isEditing && (
            <button
              onClick={handleSave}
              className="w-full mt-4 bg-blue-500 text-white p-2 rounded-lg cursor-pointer"
            >
              Save Changes
            </button>
          )}
        </div>
      ) : (
        <p className="text-center">No user data found. Please sign up.</p>
      )}
    </div>
  );
}
