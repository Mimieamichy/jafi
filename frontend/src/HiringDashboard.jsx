import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";

// Import the modular components
import DashboardSection from "./UserHireDashboard";
import SettingsSection from "./UserHireSettings";
import ReviewsSection from "./UserHireReview";

export default function HiringDashboard() {
  const { enqueueSnackbar } = useSnackbar();
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  // Global states
  const [formData, setFormData] = useState(null);
  const [workSampleImages, setWorkSampleImages] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [reviews, setReviews] = useState([]);
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
  const [replyStates, setReplyStates] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Get and decode auth token
  const authToken = localStorage.getItem("userToken");

  const decodedToken = jwtDecode(authToken);
  const userId = decodedToken.id;

  // Reply-related handlers used in ReviewsSection
  const toggleReply = (reviewId) => {
    setReplyStates((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  const handleReplyChange = (reviewId, value) => {
    setReplyTexts((prev) => ({ ...prev, [reviewId]: value }));
  };

  const handleReplySubmit = async (reviewId) => {
    const replyText = replyTexts[reviewId];
    if (!replyText) {
      enqueueSnackbar("Reply cannot be empty.", { variant: "warning" });
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/user/reply/${reviewId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ reply: replyText }),
      });
      const data = await response.json();
      if (response.ok) {
        enqueueSnackbar("Reply submitted successfully!", {
          variant: "success",
        });
        // Optionally clear the reply text and close the reply area
        setReplyTexts((prev) => ({ ...prev, [reviewId]: "" }));
        setReplyStates((prev) => ({ ...prev, [reviewId]: false }));
      } else {
        enqueueSnackbar(data.message || "Failed to submit reply.", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      enqueueSnackbar("An error occurred while submitting your reply.", {
        variant: "error",
      });
    }
  };

  const cancelReply = (reviewId) => {
    setReplyTexts((prev) => ({ ...prev, [reviewId]: "" }));
    setReplyStates((prev) => ({ ...prev, [reviewId]: false }));
  };

  // Fetch service data and reviews
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
          setFormData(data);
          setWorkSampleImages(data.images || []);
          setServiceId(data.uniqueId);
          setId(data.id);
          if (data.images && data.images.length > 0) {
            setProfileImage(data.images[0]);
          }
        }
      })
      .catch((error) =>
        enqueueSnackbar(error, "Error fetching service data.", {
          variant: "error",
        })
      );

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
        if (response.ok) {
          setReviews(data.reviews);
          const newReviews = data.reviews.filter((review) => review.isNew);
          setNewReviewCount(newReviews.length);
          setNewReviewNotification(newReviews.length > 0);
          // Use the total reviews if provided or calculate it
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
    // Only fetch reviews after serviceId is available
    if (serviceId) {
      fetchReviews();
    }
  }, [
    authToken,
    baseUrl,
    userId,
    serviceId,
    currentPage,
    reviewsPerPage,
    enqueueSnackbar,
  ]);

  // Adjust reviews per page on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setReviewsPerPage(4);
      } else {
        setReviewsPerPage(8);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Notification acknowledgement
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
        enqueueSnackbar("Notifications acknowledged.", {
          variant: "success",
        });
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error acknowledging reviews:", error);
      enqueueSnackbar("Failed to acknowledge notifications.", {
        variant: "error",
      });
    }
  };

  // Save changes (update profile)
  const handleSave = () => {
    setIsSaving(true);
    if (!formData) {
      enqueueSnackbar("No data to save", { variant: "error" });
      return;
    }

    if (workSampleImages.length > 10) {
      enqueueSnackbar("Please upload no more than ten images.", {
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
    workSampleImages.forEach((item) => {
      if (item instanceof File) {
        // new upload
        formDataObj.append("workSamples", item, item.name);
      } else if (typeof item === "string") {
        // existing URL
        formDataObj.append("workSamples", item);
      }
    });

    fetch(`${baseUrl}/service/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formDataObj,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Profile updated successfully:", data);
        if (data) {
          enqueueSnackbar("Profile updated successfully!", {
            variant: "success",
          });

          window.location.reload();
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
      })
      .finally(() => {
        // runs whether success or failure
        setIsSaving(false);
      });
  };

  // Delete account handler
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
            setActiveSection("dashboard");
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

  // Handle work sample uploads
  const handleWorkSampleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + workSampleImages.length > 10) {
      enqueueSnackbar("You must upload no more than ten images.", {
        variant: "warning",
      });
      return;
    }
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    setWorkSampleImages((prev) => [...prev, ...imageFiles]);
    setProfileImage(imageFiles[0]); // Set first image as profile image
  };

  const removeImage = (index) => {
    setWorkSampleImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Pagination handlers for reviews
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

  return (
    <div className="min-h-screen flex">
      {/* Sidebar for desktop */}
      <div
        className={`bg-gray-900 text-white w-64 p-6 hidden md:block fixed md:relative md:flex-none`}
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
              if (newReviewNotification) handleNotificationClick();
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

      {/* Main content area */}
      <div className="flex-1 p-6">
        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <FontAwesomeIcon
            icon={faBars}
            className="text-black text-2xl"
            onClick={() => setIsSidebarOpen(true)}
          />
        </div>
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
                    if (newReviewNotification) handleNotificationClick();
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

        {/* Render active section */}
        {activeSection === "dashboard" && (
          <DashboardSection
            formData={formData}
            profileImage={profileImage}
            reviewsCount={reviews.length}
            newReviewNotification={newReviewNotification}
            newReviewCount={newReviewCount}
            handleNotificationClick={handleNotificationClick}
          />
        )}

        {activeSection === "settings" && (
          <SettingsSection
            formData={formData}
            setFormData={setFormData}
            workSampleImages={workSampleImages}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleWorkSampleUpload={handleWorkSampleUpload}
            removeImage={removeImage}
            handleSave={handleSave}
            isSaving={isSaving}
          />
        )}

        {activeSection === "reviews" && (
          <ReviewsSection
            reviews={reviews}
            authToken={authToken}
            baseUrl={baseUrl}
            enqueueSnackbar={enqueueSnackbar}
            currentPage={currentPage}
            totalPages={totalPages}
            handleNextPage={handleNextPage}
            handlePreviousPage={handlePreviousPage}
            replyStates={replyStates}
            toggleReply={toggleReply}
            replyTexts={replyTexts}
            handleReplyChange={handleReplyChange}
            handleReplySubmit={handleReplySubmit}
            cancelReply={cancelReply}
          />
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
