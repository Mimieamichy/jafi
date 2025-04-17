import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { jwtDecode } from "jwt-decode";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar,  faGlobe } from "@fortawesome/free-solid-svg-icons";
import {
  faStar as solidStar,
  faStarHalfAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  faTiktok,
  faWhatsapp,
  faInstagram,
  faLinkedin,
  faXTwitter
} from "@fortawesome/free-brands-svg-icons";

import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function BusinessPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewer, setReviewer] = useState(null);

  // Claim modal state
  const [showClaimModal, setShowClaimModal] = useState(false);
 const [formData, setFormData] = useState({
  email: "",
  phone: "",
  pob:null
 })

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 0, comment: "" });
  // Review images state for form uploads (max 2)
  const [reviewImages, setReviewImages] = useState([]);
  const [uniqueId, setUniqueId] = useState(null);

  // Pagination for reviews
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  // Review Images Modal state (for full-size preview)
  const [reviewImageModalOpen, setReviewImageModalOpen] = useState(false);
  const [reviewModalImages, setReviewModalImages] = useState([]);
  const [reviewModalIndex, setReviewModalIndex] = useState(0);
  
  // Settings for business images carousel (header section)
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
  };

  // Fetch business information
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch(`${baseUrl}/business/${id}`);
        const data = await response.json();
        setBusiness(data);
        console.log("Fetched business:", data);
        setUniqueId(data.uniqueId);
      } catch (error) {
        console.error("Error fetching business:", error);
      }
    };
    fetchBusiness();
  }, [id]);

  const renderStars = (rating) => {
    const numericRating = parseFloat(rating);
    if (isNaN(numericRating)) {
      console.error("Invalid star rating:", rating);
      return null;
    }

    // Calculate full stars (integer part)
    const fullStars = Math.floor(numericRating);
    // If the rating is not exactly an integer, we display one half star.
    const hasHalfStar = numericRating - fullStars !== 0;
    // Total stars must always be 5.
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    console.log(
      "Parsed Rating:",
      numericRating,
      "Full:",
      fullStars,
      "Has Half:",
      hasHalfStar,
      "Empty:",
      emptyStars
    );

    return (
      <div className="flex justify-center space-x-1 text-yellow-400 mt-1">
        {Array.from({ length: fullStars }).map((_, idx) => (
          <FontAwesomeIcon icon={solidStar} key={`full-${idx}`} />
        ))}
        {hasHalfStar && <FontAwesomeIcon icon={faStarHalfAlt} />}
        {Array.from({ length: emptyStars }).map((_, idx) => (
          <FontAwesomeIcon icon={regularStar} key={`empty-${idx}`} />
        ))}
      </div>
    );
  };

  // Fetch reviews after uniqueId is available
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

  // Google sign-in & token handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
          localStorage.removeItem("reviewerToken");
          localStorage.removeItem("reviewer");
          enqueueSnackbar("Session expired. Please sign in again.", {
            variant: "info",
          });
          const currentPath = encodeURIComponent(location.pathname);
          window.location.href = `${baseUrl}/review/google?redirect=${currentPath}`;
        } else {
          localStorage.setItem("reviewerToken", token);
          localStorage.setItem("reviewer", JSON.stringify(decoded));
          setReviewer(decoded);
          console.log("User authenticated:", decoded);
          const cleanedUrl = location.pathname;
          window.history.replaceState({}, document.title, cleanedUrl);
        }
      } catch (error) {
        console.error("Token decode error:", error);
        enqueueSnackbar("Invalid login token", { variant: "error" });
      }
    } else {
      const storedToken = localStorage.getItem("reviewerToken");
      const stored = localStorage.getItem("reviewer");
      if (storedToken && stored) {
        const decoded = jwtDecode(storedToken);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("reviewerToken");
          localStorage.removeItem("reviewer");
          enqueueSnackbar(
            "Session expired. Please sign in again to write a review.",
            { variant: "info" }
          );
        } else {
          setReviewer(JSON.parse(stored));
        }
      }
    }
  }, [location, enqueueSnackbar]);

  const handleClaimChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // update pob when user picks a file
  const handleClaimFileChange = e => {
    const file = e.target.files[0] || null;
    setFormData(prev => ({ ...prev, pob: file }));
  };


  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      if (formData.pob instanceof File) {
        data.append('pob', formData.pob, formData.pob.name);
      }

      
      const response = await fetch(`${baseUrl}/claim/${id}`, {
        method: "POST",
        body: data,
      });
      if (response.ok) {
        navigate("/pricing");
        console.log("response", response);
        
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

  // Review form: Allow up to 2 images

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("reviewerToken");
    console.log("Submitting review with token:", token);
    if (!token) {
      enqueueSnackbar("Please login to submit your review.", {
        variant: "warning",
      });
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
      const formDataObj = new FormData();
      formDataObj.append("name", reviewer.name);
      formDataObj.append("email", reviewer.email);
      formDataObj.append("comment", reviewData.comment);
      formDataObj.append("rating", reviewData.rating);
      reviewImages.forEach((file) => {
        formDataObj.append("reviewImages", file, file.name);
      });
      const res = await fetch(`${baseUrl}/review/${uniqueId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      });
      const result = await res.json();
      if (res.ok) {
        enqueueSnackbar("Review submitted successfully!", {
          variant: "success",
        });
        setShowReviewForm(false);
        setReviewData({ rating: 0, comment: "" });
        setReviewImages([]);
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
    const currentUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `${baseUrl}/review/google?redirect=${currentUrl}`;
  };

  // Review Images Modal handlers

  const closeReviewImageModal = () => {
    setReviewImageModalOpen(false);
    setReviewModalImages([]);
    setReviewModalIndex(0);
  };

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading ...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* HEADER / COVER SECTION */}
      <div className="bg-white rounded-lg shadow p-4 relative">
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

        {/* Business Info - remains unchanged */}
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
              let days = Array.isArray(business.day)
                ? business.day
                : typeof business.day === "string"
                ? business.day.split(",").map((d) => d.trim())
                : [];
              const chunked = [];
              for (let i = 0; i < days.length; i += 2) {
                chunked.push(days.slice(i, i + 2));
              }
              return chunked.map((pair, idx) => (
                <span key={idx}>
                  <br />
                  {pair.join(", ")}
                </span>
              ));
            })()}
          </p>
          <div className="flex items-center">
            <span className="mr-2">Rating:</span>
            {renderStars(business.average_rating)}
          </div>
          <div className="mt-4 m-2 flex space-x-4">
            {business?.whatsApp && (
              <a
                href={business.whatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-600/20"
              >
                <FontAwesomeIcon icon={faWhatsapp} size="lg" />
              </a>
            )}
            {business?.x && (
              <a
                href={business.x}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-black/20"
              >
                <FontAwesomeIcon icon={faXTwitter} size="lg" />
              </a>
            )}
            {business?.instagram && (
              <a
                href={business.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-500/20"
              >
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </a>
            )}
            {business?.linkedIn && (
              <a
                href={business.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-700/20"
              >
                <FontAwesomeIcon icon={faLinkedin} size="lg" />
              </a>
            )}
            {business?.tiktok && (
              <a
                href={business.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-700/20"
              >
                <FontAwesomeIcon icon={faTiktok} size="lg" />
              </a>
            )}
            {business?.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-700/20"
              >
                <FontAwesomeIcon icon={faGlobe} size="lg" />
              </a>
            )}
          </div>
          <div className="flex justify-between items-center mt-4 flex-wrap gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-300 md:text-base text-sm text-gray-700 rounded hover:bg-gray-400"
            >
              Go Back
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  reviewer ? setShowReviewForm(true) : handleGoogleLogin()
                }
                className="px-4 py-2 bg-blue-600 md:text-base text-sm text-white rounded hover:bg-blue-700"
              >
                Write a Review
              </button>
              {business.claimed ? (
                <button
                  className="px-4 py-2 bg-green-500 md:text-base text-sm text-white rounded cursor-default"
                  disabled
                >
                  Claimed
                </button>
              ) : (
                <button
                  onClick={() => setShowClaimModal(true)}
                  className="px-4 py-2 bg-yellow-500 md:text-base text-sm text-white rounded hover:bg-yellow-600"
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
                <ReviewCard
                  key={review.id}
                  {...review}
                  onImageClick={(images, idx) => {
                    setReviewModalImages(images);
                    setReviewModalIndex(idx);
                    setReviewImageModalOpen(true);
                  }}
                />
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

      {/* Write a Review Modal */}
      {showReviewForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={() => {
            setShowReviewForm(false);
            setReviewImages([]);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
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
              <label className="block font-medium">Attach Images (Max 2)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                required
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (reviewImages.length + files.length > 2) {
                    enqueueSnackbar("You can only upload up to 2 images.", {
                      variant: "warning",
                    });
                    return;
                  }
                  setReviewImages((prev) => [...prev, ...files]);
                }}
                className="w-full p-2 border rounded"
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                {reviewImages.map((file, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Review img ${idx}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setReviewImages((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewImages([]);
                  }}
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
                name="email"
                value={formData.email}
                onChange={handleClaimChange}
              />

              <label className="block mb-2 font-semibold">Phone:</label>
              <input
                type="tel"
                name="phone"
                className="border w-full p-2 mb-4"
                required
                value={formData.phone}
                onChange={handleClaimChange}
              />

              <label className="block mb-2 font-semibold">
                Proof of Business (POB):
              </label>
              <input
                name="pob"
                type="file"
               
                accept="image/*,application/pdf,application/msword,.docx"
                className="border w-full p-2 mb-4"
                onChange={handleClaimFileChange}
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4   py-2 bg-gray-300 rounded"
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

      {/* Review Images Modal */}
      {/* Review Images Modal using react-slick Carousel */}
      {reviewImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="relative bg-white p-4 rounded-lg w-full md:max-w-3xl">
            <button
              onClick={closeReviewImageModal}
              className="absolute top-1 right-2 text-gray-900 text-2xl font-bold"
            >
              &times;
            </button>
            {reviewModalImages.length > 0 && (
              <Slider
                dots={true}
                infinite={true}
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
                arrows={true}
                autoplay={true}
                className="mt-4"
              >
                {reviewModalImages.map((img, idx) => (
                  <div key={idx}>
                    <img
                      src={img}
                      alt={`Review image ${idx}`}
                      className="w-full md:object-cover h-[80vh] object-contain rounded-lg"
                    />
                  </div>
                ))}
              </Slider>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewCard({
  listingName,
  user_name,
  star_rating,
  comment,
  createdAt,
  images,
  onImageClick,
}) {
  const [expanded, setExpanded] = useState(false);
  const hasLongComment = comment?.length > 150;
  const displayedText =
    expanded || !hasLongComment ? comment : comment.slice(0, 150) + "...";

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center text-center ">
      <h4 className="text-lg font-bold capitalize">{listingName}</h4>
      <p className="text-gray-700 capitalize">{user_name}</p>
      <div className="flex justify-center my-2 text-yellow-500">
        {[...Array(5)].map((_, i) => (
          <FontAwesomeIcon
            key={i}
            icon={faStar}
            className={i < star_rating ? "text-yellow-500" : "text-gray-300"}
          />
        ))}
      </div>
      <p className="text-gray-600 mb-2">{displayedText}</p>
      {hasLongComment && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((prev) => !prev);
          }}
          className="text-blue-600 text-sm font-medium hover:underline mb-2"
        >
          {expanded ? "Show Less" : "Read More"}
        </button>
      )}
      {images && images.length > 0 && (
        <img
          src={images[0]}
          alt="Review thumbnail"
          className="mt-4 w-full h-40 object-cover rounded cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onImageClick(images, 0);
          }}
        />
      )}
      <p className="text-sm text-gray-500 text-right mt-2 w-full">
        {new Date(createdAt).toLocaleString()}
      </p>
    </div>
  );
}
