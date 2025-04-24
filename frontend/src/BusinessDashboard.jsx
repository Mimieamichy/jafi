import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";
import DashboardSection from "./UserBusDashboard";
import SettingsSection from "./UserBusSettings";
import ReviewsSection from "./UserBusReviews";

export default function BusinessDashboard() {
  const { enqueueSnackbar } = useSnackbar();

  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const [formData, setFormData] = useState(null);
  const [busNewImages, setBusNewImages] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const [reviews, setReviews] = useState([]);
  // const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newReviewNotification, setNewReviewNotification] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [busId, setBusId] = useState(null);
  const [id, setId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewsPerPage, setReviewsPerPage] = useState(8);
  const [newReviewCount, setNewReviewCount] = useState(0);
  const [profileImage, setProfileImage] = useState(null);

  // Parse query string
  const authToken = localStorage.getItem("userToken");
  console.log("token", authToken);

  const decodedToken = jwtDecode(authToken);
  const userId = decodedToken.id;

  const [replyStates, setReplyStates] = useState({});
  const [replyTexts, setReplyTexts] = useState({});

  

  const toggleReply = (reviewId) => {
    setReplyStates((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  const handleReplyChange = (reviewId, value) => {
    setReplyTexts((prev) => ({
      ...prev,
      [reviewId]: value,
    }));
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
        // Update only the review with the matching id:
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === reviewId ? { ...review, reply: replyText } : review
          )
        );
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
  useEffect(() => {
    if (!authToken) {
      enqueueSnackbar("You need to be logged in to view this page.", {
        variant: "info",
      });
      return;
    }

    // Fetch service data
    fetch(`${baseUrl}/business/user/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("business data:", data);
        if (data) {
          
          setFormData(data?.user?.businesses.id); // Set all the data correctly
          setBusNewImages(data.user.images || []); // Set images from data
          setBusId(data.user.uniqueId);
          setId(data.user.id);
          console.log("Business:", data);

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
          `${baseUrl}/review/entity/${busId}?page=${currentPage}&limit=${reviewsPerPage}`,
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
    busId,
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
      const response = await fetch(`${baseUrl}/review/acknowledge/${busId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

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


  // Helper function to convert a URL to a File object
  const urlToFile = async (url, fileName, mimeType) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], fileName, { type: mimeType });
  };

  const handleSave = async () => {
    if (!formData) {
      enqueueSnackbar("No data to save", { variant: "error" });
      return;
    }

    if (busNewImages.length > 10) {
      enqueueSnackbar("Please upload no more than ten images.", {
        variant: "warning",
      });
      return;
    }

    // Create a new FormData object
    const formDataBus = new FormData();
    formDataBus.append("email", formData.email || "");
    formDataBus.append("address", formData.address || "");
    formDataBus.append("city", formData.city || "");
    formDataBus.append("start", formData.start || "");
    formDataBus.append("end", formData.end || "");
    formDataBus.append("state", formData.state || "");
    formDataBus.append("whatsApp", formData.whatsApp || "");
    formDataBus.append("x", formData.x || "");
    formDataBus.append("instagram", formData.instagram || "");
    formDataBus.append("website", formData.website || "");
    formDataBus.append("linkedIn", formData.linkedIn || "");
    formDataBus.append("tiktok", formData.tiktok || "");
    formDataBus.append("phone_number1", formData.phone_number1 || "");
    formDataBus.append("phone_number2", formData.phone_number2 || "");
    formDataBus.append("password", formData.password || "");
    formDataBus.append("description", formData.description || "");

    // Separate new images (already File objects) and existing image URLs (strings)
    const newImages = [];
    const existingImageUrls = [];
    busNewImages.forEach((item) => {
      if (item instanceof Blob) {
        newImages.push(item);
      } else if (typeof item === "string") {
        existingImageUrls.push(item);
      }
    });

    // Append new images to FormData
    newImages.forEach((file) => {
      const fileName = file.name || "untitled";
      formDataBus.append("images", file, fileName);
    });

    // Convert each existing image URL to a File object and append
    try {
      const convertedFiles = await Promise.all(
        existingImageUrls.map(async (url, index) => {
          // You can adjust the default file name and MIME type as needed;
          // here we assume JPEG (you might detect MIME type based on URL or your data).
          return await urlToFile(
            url,
            `existing_image_${index}.jpg`,
            "image/jpeg"
          );
        })
      );
      convertedFiles.forEach((file) => {
        if (file) {
          formDataBus.append("images", file, file.name);
        }
      });
    } catch (error) {
      console.error("Error converting image URLs:", error);
      enqueueSnackbar("Error processing images.", { variant: "error" });
      return;
    }

    // (Optional) Log the FormData contents for debugging.
    for (let [key, value] of formDataBus.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await fetch(`${baseUrl}/business/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          // Do not set the Content-Type header; let the browser set it for FormData.
        },
        body: formDataBus,
      });

      const data = await response.json();
      console.log("Update response:", data);

      if (data) {
        enqueueSnackbar("Profile updated successfully!", {
          variant: "success",
        });
        // Optionally clear out busNewImages if you want to reset them after update:
        // setBusNewImages([]);
        window.location.reload(); // Reload the page to reflect changes
      } else {
        enqueueSnackbar("Failed to update profile. Please try again.", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar(`${error} There was an error updating your profile.`, {
        variant: "error",
      });
    }
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    if (busId) {
      fetch(`${baseUrl}/service/${busId}`, {
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
      enqueueSnackbar("Business ID not found.", { variant: "info" });
    }
    setShowDeleteModal(false);
  };

  // Handle file upload
  const handleWorkSampleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + busNewImages.length > 10) {
      enqueueSnackbar("You must upload no more than ten images.", {
        variant: "warning",
      });
      return;
    }
    // Filter image files
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    // Append new File objects
    setBusNewImages((prev) => [...prev, ...imageFiles]);
    setProfileImage(imageFiles[0]); // Set the first image as profile image
  };

  const removeImage = (index) => {
    setBusNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div
        className={`bg-gray-900 text-white w-64 p-6 hidden md:block fixed md:relative`}
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

      {/* Main content */}
      <div className="flex-1 p-6">
        {/* Mobile nav */}
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

        {/* Modular Sections */}
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
            busNewImages={busNewImages}
            handleWorkSampleUpload={handleWorkSampleUpload}
            removeImage={removeImage}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleSave={handleSave}
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
                This action cannot be undone. All your data will be permanently
                deleted.
              </p>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="order-2 sm:order-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="order-1 sm:order-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
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
