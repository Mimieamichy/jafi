import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faBell,
  faBars,
  faTimes,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";
import { formatDistanceToNow } from "date-fns";

export default function HiringDashboard() {
  const [formData, setFormData] = useState(null);
  const [workSampleImages, setWorkSampleImages] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const [reviews, setReviews] = useState([]);
  // const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newReviewNotification, setNewReviewNotification] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serviceId, setServiceId] = useState(null);
  const [id, setId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewsPerPage, setReviewsPerPage] = useState(8);
  const [newReviewCount, setNewReviewCount] = useState(0);
  const [profileImage, setProfileImage] = useState(null);

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

          // Set the first image as profile image if available
          if (data.user.images && data.user.images.length > 0) {
            setProfileImage(data.user.images[0]);
          }
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
        console.log("Fetched reviews:", data);

        if (response.ok) {
          setReviews(data.reviews);

          // Set the first review ID if available

          const newReviews = data.reviews.filter((review) => review.isNew);

          console.log("New reviews:", newReviews);

          setNewReviewCount(newReviews.length);
          setNewReviewNotification(newReviews.length > 0);

          const totalReviews = data.reviews.length;
          setTotalPages(Math.ceil(totalReviews / reviewsPerPage));
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

  const handleNotificationClick = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/review/acknowledge/${serviceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        setNewReviewCount(0);
        setNewReviewNotification(false);
        enqueueSnackbar("Notifications acknowledged.", { variant: "success" });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error acknowledging reviews:", error);
      enqueueSnackbar("Failed to acknowledge notifications.", {
        variant: "error",
      });
    }
  };

  // Handle save functionality
  const handleSave = () => {
    if (!formData) {
      enqueueSnackbar("No data to save", { variant: "error" });
      return;
    }

    if (workSampleImages.length > 10) {
      enqueueSnackbar("Please upload no more than five images.", {
        variant: "warning",
      });
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("email", formData.email || "");
    formDataObj.append("address", formData.address || "");

    formDataObj.append("password", formData.password || "");

    formDataObj.append("description", formData.description || "");

    // Separate new images (File objects) from existing image URLs (strings)
    const newImages = [];
    const existingImages = [];
    workSampleImages.forEach((item) => {
      if (item instanceof Blob) {
        newImages.push(item);
      } else if (typeof item === "string") {
        existingImages.push(item);
      }
    });

    // Append new images (as files) with key "workSamplesNew"
    newImages.forEach((file) => {
      const fileName = file.name || "untitled";
      formDataObj.append("workSamples", file, fileName);
    });
    console.log("form data", formDataObj);

    // Append existing images (URLs) as JSON string

    fetch(`${baseUrl}/service/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formDataObj,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Update response:", data);

        if (data) {
          enqueueSnackbar("Profile updated successfully!", {
            variant: "success",
          });
        } else {
          enqueueSnackbar("Failed to update profile. Please try again.", {
            variant: "error",
          });
        }
      })
      .catch((error) => {
        enqueueSnackbar(`${error} There was an error updating your profile.`, {
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
    if (files.length + workSampleImages.length > 10) {
      enqueueSnackbar("You must upload no more than ten images.", {
        variant: "warning",
      });
      return;
    }
    // Filter image files
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    // Append new File objects
    setWorkSampleImages((prev) => [...prev, ...imageFiles]);
    setProfileImage(imageFiles[0]); // Set the first image as profile image
  };

  const removeImage = (index) => {
    setWorkSampleImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar for desktop */}
      <div
        className={`bg-gray-800 text-white w-64 p-6 hidden transition-all transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        } md:block fixed md:relative md:flex-none md:w-64 md:translate-x-0`}
      >
        <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
        <ul>
          <li
            className={`cursor-pointer mb-2 p-2 rounded ${
              activeSection === "dashboard" ? "bg-gray-700" : ""
            }`}
            onClick={() => setActiveSection("dashboard")}
          >
            My Dashboard
          </li>
          <li
            className={`cursor-pointer mb-2 p-2 rounded ${
              activeSection === "settings" ? "bg-gray-700" : ""
            }`}
            onClick={() => setActiveSection("settings")}
          >
            Settings
          </li>
          <li
            className={`cursor-pointer mb-2 p-2 rounded ${
              activeSection === "reviews" ? "bg-gray-700" : ""
            }`}
            onClick={() => {
              setActiveSection("reviews");
              handleNotificationClick;
            }}
          >
            Reviews
          </li>
          <li
            className="cursor-pointer text-red-500 p-2 rounded hover:bg-gray-700"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </li>
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        {/* Burger Menu (Mobile) */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <FontAwesomeIcon
            icon={faBars}
            className="text-black text-2xl"
            onClick={() => setIsSidebarOpen(true)}
          />
        </div>

        {/* Mobile Sidebar Content */}
        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-gray-800 bg-opacity-50">
            <div className="w-64 bg-gray-800 text-white p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Dashboard</h2>
                <FontAwesomeIcon
                  icon={faTimes}
                  className="text-white text-2xl cursor-pointer"
                  onClick={() => setIsSidebarOpen(false)}
                />
              </div>
              <ul>
                <li
                  className={`cursor-pointer mb-2 p-2 rounded ${
                    activeSection === "dashboard" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => {
                    setActiveSection("dashboard");
                    setIsSidebarOpen(false);
                  }}
                >
                  My Dashboard
                </li>
                <li
                  className={`cursor-pointer mb-2 p-2 rounded ${
                    activeSection === "settings" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => {
                    setActiveSection("settings");
                    setIsSidebarOpen(false);
                  }}
                >
                  Settings
                </li>
                <li
                  className={`cursor-pointer mb-2 p-2 rounded ${
                    activeSection === "reviews" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => {
                    setActiveSection("reviews");
                    setIsSidebarOpen(false);
                    handleNotificationClick; // Acknowledge notifications when navigating to reviews
                  }}
                >
                  Reviews
                </li>
                <li
                  className="cursor-pointer text-red-500 p-2 rounded hover:bg-gray-700"
                  onClick={() => {
                    setShowDeleteModal(true);
                    setIsSidebarOpen(false);
                  }}
                >
                  Delete Account
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Render different sections based on activeSection */}
        {activeSection === "dashboard" && (
          <div className="mt-6">
            {formData ? (
              <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Top Green Bar */}
                <div className="h-12 bg-blue-600"></div>

                <div className="p-6">
                  {/* Notification Icon */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="bg-blue-100 text-blue-600 px-3 py-1 hover:bg-blue-600 hover:text-blue-100 rounded-full text-sm font-medium">
                      {newReviewNotification ? (
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={handleNotificationClick}
                        >
                          <FontAwesomeIcon icon={faBell} className="mr-1 " />
                          <span>{newReviewCount} </span>
                        </div>
                      ) : (
                        <FontAwesomeIcon icon={faBell} />
                      )}
                    </div>
                  </div>

                  {/* Profile Image */}
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-2xl font-bold text-gray-600 capitalize">
                          {formData.name ? formData.name.charAt(0) : "?"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Name (was Alexis Hill) */}
                  <h2 className="text-center text-2xl font-bold text-gray-800 capitalize mb-1">
                    {formData.service_name || formData.name || "Service Name"}
                  </h2>

                  {/* Name (was Product Designer) */}
                  <h3 className="text-center text-lg text-gray-600 mb-2">
                    {formData.email || "Email"}
                  </h3>

                  {/* Category (was email) */}
                  <p className="text-center text-gray-500 mb-6">
                    {formData.category || "Category"}
                  </p>

                  {/* Total Reviews Button (was Diventa PRO) */}
                  <div className="bg-gray-900 text-white rounded-md py-3 px-4 flex justify-center items-center">
                    <span className="mr-2">Total Reviews</span>
                    <span className="bg-blue-600 text-white px-2 py-0.5 text-xs rounded">
                      {reviews.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading dashboard data...</p>
              </div>
            )}
          </div>
        )}

        {activeSection === "settings" && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="space-y-4">
                {/* Settings Inputs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData?.address || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Address"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData?.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Email"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>

                  <textarea
                    type="text"
                    value={formData?.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-2 border rounded resize-none h-24"
                  />
                </div>

                {/* Password Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData?.password || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="New Password"
                      className="w-full p-2 border rounded pr-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2 text-gray-500"
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEye : faEyeSlash}
                      />
                    </button>
                  </div>
                </div>

                {/* Work Samples Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Samples (Upload up to 10 images)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleWorkSampleUpload}
                    className="w-full p-2 border rounded mt-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                {/* Work Samples Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                  {workSampleImages.map((item, index) => {
                    // If item is a File object, use URL.createObjectURL; if it's a string (URL) use it directly.
                    const src =
                      typeof item === "string"
                        ? item
                        : URL.createObjectURL(item);
                    return (
                      <div key={index} className="relative">
                        <img
                          src={src}
                          alt="Preview"
                          className="w-16 h-16 rounded-md object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-0 left-0 bg-red-500 text-white rounded-full p-1 text-xs"
                          onClick={() => removeImage(index)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleSave}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg mt-4 font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === "reviews" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">All Reviews</h2>

            {/* Reviews Grid (Responsive) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    {/* Reviewer Name */}
                    <div className="flex items-center justify-center">
                      <p className="font-semibold text-lg capitalize">
                        {review.user_name}
                      </p>
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
                    <p className="mt-2 text-center text-gray-600 line-clamp-3">
                      {review.comment}
                    </p>

                    {/* Time */}
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex justify-center items-center h-64">
                  <p className="text-gray-500">No reviews yet.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {reviews.length > 0 && (
              <div className="mt-6 flex justify-center items-center space-x-4">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 hover:bg-blue-700 transition-colors"
                >
                  Previous
                </button>
                <span className="font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Delete Account?
              </h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. All your data, including reviews
                and service information, will be permanently deleted.
              </p>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="order-2 sm:order-1 bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="order-1 sm:order-2 bg-red-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Yes, Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
