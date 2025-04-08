import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { formatDistanceToNow } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faBell,
  faBars,
  faTimes,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
// Import useParams and useLocation

import { jwtDecode } from "jwt-decode";

export default function HiringDashboard() {
  const [formData, setFormData] = useState(null);
  const [workSampleImages, setWorkSampleImages] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newReviewNotification, setNewReviewNotification] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serviceId, setServiceId] = useState(null);
  const [id, setId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewsPerPage, setReviewsPerPage] = useState(8);

  const { enqueueSnackbar } = useSnackbar();

  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  // Parse query string
  const authToken = localStorage.getItem("userToken");
  const decodedToken = jwtDecode(authToken);
  const userId = decodedToken.id;

  useEffect(() => {
    if (!authToken) {
      enqueueSnackbar("You need to be logged in to view this page.", {
        variant: "info",
      });
      return;
    }

    // Fetch service data
    fetch(`${baseUrl}/service/user/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Service data:", data);
        if (data) {
          setFormData(data.user); // Set all the data correctly
          setWorkSampleImages(data.user.images || []); // Set images from data
          setServiceId(data.user.uniqueId);
          setId(data.user.id); // Set the ID from the data
        }
      });

    // Fetch reviews
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/review/entity/${serviceId}?page=${currentPage}&limit=${reviewsPerPage}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched reviews:", data); // Log the fetched reviews for debugging

        if (response.ok) {
          setReviews(data.reviews);
          const newReviews = data.reviews.filter((review) => review.isNew);
          if (newReviews.length > 0) setNewReviewNotification(true);

          const totalReviews = data.reviews.length;
          setTotalPages(Math.ceil(totalReviews / reviewsPerPage)); // Assuming totalCount is in the response
        } else {
          enqueueSnackbar("Failed to fetch reviews.", { variant: "error" });
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        enqueueSnackbar("An error occurred while fetching reviews.", {
          variant: "error",
        });
      }
    };

    fetchReviews();
  }, [
    authToken,
    enqueueSnackbar,
    baseUrl,
    id,
    serviceId,
    userId,
    currentPage,
    reviewsPerPage,
  ]);

  

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setReviewsPerPage(4); // Set to 4 reviews per page for mobile
      } else {
        setReviewsPerPage(8); // Set to 8 reviews per page for desktop
      }
    };

    handleResize(); // Call initially to set the right reviews per page
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle save functionality
  const handleSave = () => {
    if (workSampleImages.length > 5) {
      enqueueSnackbar("Please upload exactly five images.", {
        variant: "warning",
      });
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name || "");
    formDataObj.append("email", formData.email || "");
    formDataObj.append("phone", formData.phone_number || "");
    formDataObj.append("address", formData.address || "");
    formDataObj.append("category", formData.category || "");

    // Append work sample images
    workSampleImages.forEach((file, index) => {
      formDataObj.append(`workSampleImage_${index}`, file);
    });

    // PUT request to update service details
    fetch(`${baseUrl}/service/${id}`, {
      method: "PUT",
      headers: {
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
          setIsEditing(false);
        } else {
          enqueueSnackbar("Failed to update profile. Please try again.", {
            variant: "error",
          });
        }
      })
      .catch((error) => {
        enqueueSnackbar(`${error}, There was an error updating your profile.`, {
          variant: "error",
        });
      });
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    if (serviceId) {
      fetch(`${baseUrl}/service/${serviceId}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            enqueueSnackbar("Account deleted successfully!", {
              variant: "success",
            });
            setActiveSection("dashboard"); // Reset to dashboard or redirect
          } else {
            enqueueSnackbar("Failed to delete the account. Please try again.", {
              variant: "error",
            });
          }
        })
        .catch((error) => {
          enqueueSnackbar(`${error} There was an error deleting the account.`, {
            variant: "error",
          });
        });
    } else {
      enqueueSnackbar("Service ID not found.", { variant: "info" });
    }
    setShowDeleteModal(false);
  };

  // Handle file upload
  const handleWorkSampleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      enqueueSnackbar("You must upload no more than five images.", {
        variant: "warning",
      });
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
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
            Settings
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
          <div className="md:hidden m-3 fixed top-0 left-0 w-64 bg-gray-800 text-white p-6">
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
          <div className="min-h-screen p-6">
            <h2 className="text-2xl font-bold mb-4">All Reviews</h2>

            {/* Reviews Grid (Responsive) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {reviews.map((review, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                  {/* Reviewer Name */}
                  <div className="flex items-center justify-center">
                    <p className="font-semibold text-lg">{review.user_name}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex justify-center text-yellow-500 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon
                        key={i}
                        icon={faStar}
                        className={`text-xl ${
                          i < review.star_rating
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Comment */}
                  <p className="mt-2 text-center text-gray-600">
                    {review.comment}
                  </p>

                  {/* Time */}
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-center items-center space-x-4">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="bg-gray-500 text-white p-2 rounded-md disabled:opacity-50"
              >
                Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="bg-gray-500 text-white p-2 rounded-md disabled:opacity-50"
              >
                Next
              </button>
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
