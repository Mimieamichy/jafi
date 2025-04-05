import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faCamera,
  faBell,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function HiringDashboard() {
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [workSampleImages, setWorkSampleImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const userId = "user123"; // Example user ID - replace with actual user ID
  const entityId = "ser_1"; // Example service entity ID

  // Fetch service overview and reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user service overview
        const response = await fetch(`${baseUrl}/service/user/${userId}`);
        const data = await response.json();
        setFormData(data);
        setProfileImage(data.profileImage || null);
        setWorkSampleImages(data.workSamples || []);

        // Fetch reviews for the service
        const reviewResponse = await fetch(`${baseUrl}/review/entity/${entityId}`);
        const reviewData = await reviewResponse.json();
        setReviews(reviewData.reviews || []);

        // Fetch notifications (new reviews)
        const notificationResponse = await fetch(`${baseUrl}/notification/${userId}`);
        const notificationData = await notificationResponse.json();
        setNotificationCount(notificationData.count); // Count of new notifications
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [userId, entityId]);

  // Handle review reply
  const handleReply = (reviewId) => {
    const reply = prompt("Write your reply to this review:");
    if (reply) {
      fetch(`${baseUrl}/review/reply/${reviewId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reply }),
      })
        .then((response) => response.json())
        .then(() => {
          setNotificationCount(notificationCount + 1); // Increase notification count
          alert("Reply sent successfully!");
        })
        .catch((error) => console.error("Error sending reply:", error));
    }
  };

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

  // Sidebar Section
  const Sidebar = () => (
    <div className="flex flex-col items-start space-y-6 py-4 px-6 bg-gray-200 w-full md:w-1/4 min-h-screen">
      <button
        onClick={handleEditToggle}
        className="flex items-center text-blue-500 hover:text-blue-700"
      >
        <FontAwesomeIcon icon={faEdit} className="mr-2" />
        {isEditing ? "Cancel Edit" : "Edit Profile"}
      </button>
      <button
        onClick={() => navigate(`/hire/${entityId}`)}
        className="flex items-center text-blue-500 hover:text-blue-700"
      >
        <FontAwesomeIcon icon={faEye} className="mr-2" />
        View Service
      </button>
      <div className="flex items-center text-blue-500 hover:text-blue-700">
        <FontAwesomeIcon icon={faBell} className="mr-2" />
        Notifications ({notificationCount})
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <div className="flex-grow bg-gray-100 p-6">
        {/* Profile Section */}
        {formData ? (
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
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

              {/* Category Field */}
              <label className="block">
                <span className="font-semibold">Category:</span>
                <p className="bg-gray-200 p-2 rounded mt-2">
                  {formData.category}
                </p>
              </label>

              {/* Work Samples */}
              {isEditing && (
                <label className="block">
                  <span className="font-semibold">Upload Work Samples (5 images required):</span>
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
          </div>
        ) : (
          <p className="text-center">No user data found. Please sign up.</p>
        )}
      </div>
    </div>
  );
}
