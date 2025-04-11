import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { jwtDecode } from "jwt-decode";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function BusinessPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams(); // Get business id from route parameters
  const navigate = useNavigate();
  const location = useLocation();

  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [showClaimModal, setShowClaimModal] = useState(false);

  // Claim form state
  const [claimEmail, setClaimEmail] = useState("");
  const [claimPhone, setClaimPhone] = useState("");
  const [claimPobFile, setClaimPobFile] = useState(null);

  // Review form state (placeholder; you mentioned you'll handle the review API)

  const [reviewer, setReviewer] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 0, comment: "" });
  const [uniqueId, setUniqueId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  useEffect(() => {
    fetchBusiness();
  }, [id]);

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`${baseUrl}/business/${id}`);
      const data = await response.json();
      setBusiness(data);
      console.log("Fetched business:", data);
      setUniqueId(data.uniqueId); // Assuming uniqueId is part of the business data
      // Assuming uniqueId is part of the business data

      // If business has a uniqueId, fetch reviews as well
    } catch (error) {
      console.error("Error fetching business:", error);
    }
  };

  useEffect(() => {
    if (!uniqueId) return;
    fetch(`${baseUrl}/review/entity/${uniqueId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Reviews data:", data);
        setReviews(data.reviews || []);
      })
      .catch((err) => {
        console.error("Failed to fetch reviews:", err);
        enqueueSnackbar("Failed to fetch reviews", { variant: "error" });
      });
  }, [uniqueId, showReviewForm, enqueueSnackbar]);

  // Settings for react-slick carousel
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
  };
  // Google Sign-in & token handling
  useEffect(() => {
    // Check for token in URL parameters (from Google login redirect)
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      try {
        // Decode and validate token
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          // Handle expired token
          localStorage.removeItem("reviewerToken");
          localStorage.removeItem("reviewer");
          enqueueSnackbar("Session expired. Please sign in again.", {
            variant: "info",
          });
          // Redirect to Google login with current page as redirect target
          const currentPath = encodeURIComponent(location.pathname);
          window.location.href = `${baseUrl}/review/google?redirect=${currentPath}`;
        } else {
          // Store valid token and user data
          localStorage.setItem("reviewerToken", token);
          localStorage.setItem("reviewer", JSON.stringify(decoded));
          setReviewer(decoded);
          console.log("User authenticated:", decoded);

          // Clean URL by removing token parameter
          const cleanedUrl = location.pathname;
          window.history.replaceState({}, document.title, cleanedUrl);
        }
      } catch (error) {
        console.error("Token decode error:", error);
        enqueueSnackbar("Invalid login token", { variant: "error" });
      }
    } else {
      // Check for existing token in localStorage
      const storedToken = localStorage.getItem("reviewerToken");
      const stored = localStorage.getItem("reviewer");

      if (storedToken && stored) {
        const decoded = jwtDecode(storedToken);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("reviewerToken");
          localStorage.removeItem("reviewer");
          enqueueSnackbar(
            "Session expired. Please sign in again to write a review.",
            {
              variant: "info",
            }
          );
        } else {
          setReviewer(JSON.parse(stored));
        }
      }
    }
  }, [location, enqueueSnackbar]);

  // Claim Form Submission Handler
  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("email", claimEmail);
      formData.append("phone", claimPhone);
      if (claimPobFile) {
        formData.append("pob", claimPobFile, claimPobFile.name);
      }
      const response = await fetch(`${baseUrl}/claim/${id}`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        // Navigate to pricing page after a successful claim
        navigate("/pricing");
      } else {
        const errorData = await response.text();
        console.error("Claim error:", errorData);
      }
    } catch (error) {
      console.error("Error submitting claim:", error);
    }
  };

  const handleRating = (i) => {
    setReviewData({ ...reviewData, rating: i + 1 });
  };

  const handleReviewChange = (e) => {
    setReviewData({ ...reviewData, comment: e.target.value });
  };

  // Placeholder for the review form submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("reviewerToken");
    console.log("Submitting review with token:", token);

    if (!token) {
      enqueueSnackbar("Please login to submit your review.", {
        variant: "warning",
      });
      // Save current URL for redirect after login
      const currentUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `${baseUrl}/review/google?redirect=${currentUrl}`;
      return;
    }

    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      enqueueSnackbar("Session expired. Please login again.", {
        variant: "info",
      });
      localStorage.removeItem("reviewerToken");
      localStorage.removeItem("reviewer");
      const currentUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `${baseUrl}/review/google?redirect=${currentUrl}`;
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/review/${uniqueId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: reviewer.name,
          email: reviewer.email,
          comment: reviewData.comment,
          rating: reviewData.rating,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        enqueueSnackbar("Review submitted successfully!", {
          variant: "success",
        });
        setShowReviewForm(false);
        setReviewData({ rating: 0, comment: "" });
      } else {
        enqueueSnackbar(result.message || "Failed to submit review", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Review submission error:", error);
      enqueueSnackbar("Something went wrong", { variant: "error" });
    }
  };

  const handleGoogleLogin = () => {
    // Capture the current URL for redirect after login
    const currentUrl = encodeURIComponent(window.location.pathname);
    console.log("Redirecting to Google login with redirect:", currentUrl);
    window.location.href = `${baseUrl}/review/google?redirect=${currentUrl}`;
  };

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading business...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* HEADER / COVER SECTION */}
      <div className="bg-white rounded-lg shadow p-4 relative">
        {/* Carousel using react-slick */}
        {business.images?.length > 0 ? (
          <div className="w-full h-64 overflow-hidden bg-gray-100">
            <Slider key={business.images.length} {...sliderSettings}>
              {business.images.map((img, index) => (
                <div key={index}>
                  <img
                    src={img}
                    alt={`Slide ${index}`}
                    className="object-cover w-full h-64"
                  />
                </div>
              ))}
            </Slider>
          </div>
        ) : (
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            <p>No images available</p>
          </div>
        )}

        {/* Business Info */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold capitalize m-2">{business.name}</h1>
          <p className="text-sm text-gray-500 m-2">
            {business.category} | {business.address}, {business.city},{" "}
            {business.state}
          </p>
          <p className="text-sm text-gray-500 m-2">Email: {business.email}</p>
          <p className="text-sm text-gray-500 m-2">
            Opens at: {business.start} - {business.end}
          </p>
          <p className="text-sm text-gray-500 m-2">
            Opening days:
            {(() => {
              // If business.day is an array, use it; otherwise, split it by commas.
              let days = Array.isArray(business.day)
                ? business.day
                : typeof business.day === "string"
                ? business.day.split(",").map((d) => d.trim())
                : [];

              // Break the days array into chunks of 2.
              const chunked = [];
              for (let i = 0; i < days.length; i += 2) {
                chunked.push(days.slice(i, i + 2));
              }

              // Render each chunk on its own line.
              return chunked.map((pair, index) => (
                <span key={index}>
                  <br />
                  {pair.join(", ")}
                </span>
              ));
            })()}
          </p>

          <div className="flex items-center">
            <span className="mr-2">Rating:</span>
            {[...Array(5)].map((_, i) => (
              <FontAwesomeIcon
                key={i}
                icon={faStar}
                className={
                  i < (business.average_rating || 0)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 flex-wrap">
            {/* Left Section: Go Back */}
            <button
              onClick={() => navigate(-1)}
              className="px-4 mb-2 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Go Back
            </button>

            {/* Right Section: Write a Review and Claim */}
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  reviewer ? setShowReviewForm(true) : handleGoogleLogin()
                }
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Write a Review
              </button>
              {business.claimed ? (
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded cursor-default"
                  disabled
                >
                  Claimed
                </button>
              ) : (
                <button
                  onClick={() => setShowClaimModal(true)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Claim this Business
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DESCRIPTION SECTION */}
      {business.description && (
        <div className="bg-white rounded-lg shadow p-4 mt-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p>{business.description}</p>
        </div>
      )}

      {/* REVIEWS SECTION */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Reviews</h3>
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews
              .slice(
                (currentPage - 1) * reviewsPerPage,
                currentPage * reviewsPerPage
              )
              .map((review) => (
                <div
                  key={review.id}
                  className="bg-white shadow-md rounded-lg p-4 text-center"
                >
                  <h4 className="text-lg font-bold">{review.listingName}</h4>
                  <p className="text-gray-700">{review.user_name}</p>
                  <div className="flex justify-center my-2 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon
                        key={i}
                        icon={faStar}
                        className={
                          i < review.star_rating
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                  <p className="text-sm text-gray-500 text-right mt-2">
                    {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-3">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* --- Write a Review Modal --- */}
      {showReviewForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity duration-300"
          onClick={() => setShowReviewForm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md transform transition-all duration-300 scale-100"
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              Submit a Review
            </h2>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <input
                type="text"
                value={business.name}
                readOnly
                className="w-full p-2 border rounded bg-gray-100"
              />
              <input
                type="text"
                value={reviewer?.name || ""}
                readOnly
                className="w-full p-2 border rounded bg-gray-100"
              />

              <div className="flex justify-center space-x-2 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    onClick={() => handleRating(i)}
                    className={`text-2xl cursor-pointer ${
                      i < reviewData.rating
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <textarea
                name="comment"
                rows="4"
                placeholder="Write your review..."
                value={reviewData.comment}
                onChange={handleReviewChange}
                className="w-full border p-2 rounded"
                required
              />

              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- Claim this Business Modal --- */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-96 relative">
            <h2 className="text-xl font-bold mb-4">Claim This Business</h2>
            <form onSubmit={handleClaimSubmit}>
              <label className="block mb-2 font-semibold">Email:</label>
              <input
                type="email"
                className="border w-full p-2 mb-4"
                required
                value={claimEmail}
                onChange={(e) => setClaimEmail(e.target.value)}
              />

              <label className="block mb-2 font-semibold">Phone:</label>
              <input
                type="tel"
                className="border w-full p-2 mb-4"
                required
                value={claimPhone}
                onChange={(e) => setClaimPhone(e.target.value)}
              />

              <label className="block mb-2 font-semibold">
                Proof of Business (POB):
              </label>
              <input
                type="file"
                accept="image/*,application/pdf,application/msword,.docx"
                className="border w-full p-2 mb-4"
                onChange={(e) => setClaimPobFile(e.target.files[0])}
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
