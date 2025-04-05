import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faBell,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useParams, useLocation } from "react-router-dom"; // Import useParams and useLocation
import queryString from "query-string";

export default function HiringDashboard() {
  const [formData, setFormData] = useState(null);
  const [workSampleImages, setWorkSampleImages] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newReviewNotification, setNewReviewNotification] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard"); // Tracks the active section
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile sidebar
  const [serviceId, setServiceId] = useState(null); // Assuming you have a serviceId to delete
  const { enqueueSnackbar } = useSnackbar();
  const baseUrl = import.meta.env.VITE_BACKEND_URL; // Replace with your base URL

  useEffect(() => {
    const userId = "userId"; // Get the user ID dynamically

    // Fetch service data
    fetch(`${baseUrl}/service/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData(data);
        setWorkSampleImages(data.workSamples || []);
        setServiceId(data.serviceId); 
      });

    // Fetch reviews
    fetch(`${baseUrl}/review/entity/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews);
        // Check for new reviews
        const newReviews = data.reviews.filter((review) => review.isNew);
        if (newReviews.length > 0) setNewReviewNotification(true);
      });
  }, []);
  const { userId } = useParams();

  // Get query parameters (including the token) from the URL using useLocation()
  const location = useLocation();
  const queryParams = queryString.parse(location.search); // Parse query string
  const authToken = queryParams.token; // Extract the token from query parameters

  // Ensure that the authToken exists
  if (!authToken) {
    enqueueSnackbar("You need to be logged in to update your profile.", {
      variant: "info",
    });

    return;
  }

  const handleSave = () => {
    // Get the auth token from localStorage (or sessionStorage)

    // Validate that all necessary fields are filled in (optional)
    if (workSampleImages.length > 5) {
      enqueueSnackbar("Please upload exactly five images.", {
        variant: "warning",
      });
      return;
    }

    // Prepare the updated data
    const formDataObj = new FormData();

    // Append regular fields (like name, email, etc.)
    formDataObj.append("name", formData.name);
    formDataObj.append("email", formData.email);
    formDataObj.append("phone", formData.phone);
    formDataObj.append("address", formData.address);
    formDataObj.append("category", formData.category);

    // Append images (work samples) to the form data
    workSampleImages.forEach((file, index) => {
      formDataObj.append(`workSampleImage_${index}`, file); // Adding image files to the FormData
    });

    fetch(`${baseUrl}/service/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: formDataObj,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          enqueueSnackbar("Profile updated successfully!", {
            variant: "success",
          });

          setIsEditing(false); // Hide the edit mode
          // Optionally, you can update the form data with the new values returned from the API
        } else {
          enqueueSnackbar("Failed to update profile. Please try again.", {
            variant: "error",
          });
        }
      })
      .catch((error) => {
        console.error("Error updating profile:", error);

        enqueueSnackbar("There was an error updating your profile.", {
          variant: "error",
        });
      });
  };

  const handleDeleteAccount = () => {
    if (serviceId) {
      // Make the DELETE request to delete the account
      fetch(`${baseUrl}/service/${serviceId}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            enqueueSnackbar("Account deleted successfully!", {
              variant: "success",
            });
            setActiveSection("dashboard"); // Redirect to the dashboard or reset the UI
          } else {
            enqueueSnackbar("Failed to delete the account. Please try again.", {
              variant: "error",
            });
          }
        })
        .catch((error) => {
          console.error("Error deleting account:", error);

          enqueueSnackbar("There was an error deleting the account.", {
            variant: "error",
          });
        });
    } else {
      enqueueSnackbar("Service ID not found.", { variant: "info" });
    }
    setShowDeleteModal(false); // Close the delete modal
  };

  const handleWorkSampleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      enqueueSnackbar("You must upload not more than five images.", {
        variant: "warning",
      });
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length > 5) {
      enqueueSnackbar("You must upload not more than five images.", {
        variant: "warning",
      });
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
    <div className="min-h-screen flex">
      {/* Sidebar for desktop */}
      <div
        className={`bg-gray-800 text-white w-64 p-6 hidden transition-all transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        } md:block fixed md:relative  md:flex-none md:w-64 md:translate-x-0`}
      >
        <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
        <ul>
          <li
            className="cursor-pointer mb-2"
            onClick={() => setActiveSection("dashboard")}
          >
            My Dashboard
          </li>
          <li
            className="cursor-pointer mb-2"
            onClick={() => setActiveSection("settings")}
          >
            Settingss
          </li>
          <li
            className="cursor-pointer mb-2"
            onClick={() => setActiveSection("reviews")}
          >
            Reviews
          </li>
          <li
            className="cursor-pointer text-red-500"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </li>
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        {/* Burger Menu (Mobile) */}
        <div className="md:hidden flex justify-between items-center">
          {/* Burger Icon */}
          <FontAwesomeIcon
            icon={faBars}
            className="text-black text-2xl"
            onClick={() => setIsSidebarOpen(true)}
          />
          {newReviewNotification && (
            <div className="relative">
              <FontAwesomeIcon icon={faBell} className="text-red-500" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </div>
          )}
        </div>

        {/* Notification Bell (Desktop) */}
        <div className="hidden md:block absolute top-4 right-4">
          {newReviewNotification && (
            <div className="relative">
              <FontAwesomeIcon icon={faBell} className="text-red-500" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </div>
          )}
        </div>

        {/* Mobile Sidebar Content */}
        {isSidebarOpen && (
          <div className="md:hidden fixed top-0 left-0 w-64 bg-gray-800 text-white p-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
            <ul>
              <li
                className="cursor-pointer mb-2"
                onClick={() => {
                  setActiveSection("dashboard");
                  setIsSidebarOpen(false);
                }}
              >
                My Dashboard
              </li>
              <li
                className="cursor-pointer mb-2"
                onClick={() => {
                  setActiveSection("settings");
                  setIsSidebarOpen(false);
                }}
              >
                Settings
              </li>
              <li
                className="cursor-pointer mb-2"
                onClick={() => {
                  setActiveSection("reviews");
                  setIsSidebarOpen(false);
                }}
              >
                Reviews
              </li>
              <li
                className="cursor-pointer text-red-500"
                onClick={() => {
                  setShowDeleteModal(true);
                  setIsSidebarOpen(false);
                }}
              >
                Delete Account
              </li>
            </ul>

            <FontAwesomeIcon
              icon={faTimes}
              className="absolute top-4 right-4 text-white text-2xl"
              onClick={() => setIsSidebarOpen(false)}
            />
          </div>
        )}

        {/* Render different sections based on activeSection */}
        {activeSection === "dashboard" && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold">My Dashboard</h2>
            {formData ? (
              <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                <div className="space-y-4">
                  <p>
                    <strong>Name:</strong> {formData.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.email}
                  </p>
                  <p>
                    <strong>Category:</strong> {formData.category}
                  </p>
                </div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        )}

        {activeSection === "settings" && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <div className="space-y-4">
              {/* Settings Inputs */}
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Address"
                className="w-full p-2 border rounded"
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Email"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Phone"
                className="w-full p-2 border rounded"
              />

              {/* Password Fields */}
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="New Password"
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

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm Password"
                    className="w-full p-2 border rounded pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-2 text-gray-500"
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEye : faEyeSlash}
                    />
                  </button>
                </div>
              </div>
              {/* Work Samples Upload */}
              <div className="mt-4">
                <label className="block">
                  Work Samples (5 images required)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleWorkSampleUpload}
                  className="w-full p-2 border rounded mt-2"
                />
              </div>

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

              <button
                onClick={handleSave}
                className="bg-blue-500 text-white p-2 rounded-lg mt-4"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeSection === "reviews" && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold">Reviews</h2>
            <div>
              {reviews.length === 0 ? (
                <p>No reviews yet</p>
              ) : (
                reviews.map((review, index) => (
                  <div key={index} className="bg-gray-100 p-4 rounded-lg mt-2">
                    <p>
                      <strong>{review.userName}</strong>: {review.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">
                Are you sure you want to delete your account?
              </h3>
              <div className="space-x-4">
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-500 text-white p-2 rounded-lg"
                >
                  Yes, Delete Account
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-500 text-white p-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
