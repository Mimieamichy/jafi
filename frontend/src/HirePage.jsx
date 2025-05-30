import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { jwtDecode } from "jwt-decode";
import { useSnackbar } from "notistack";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import {
  faStar as solidStar,
  faStarHalfAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faPhone,
  faMapMarkerAlt,
  faEnvelope,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
// in case duplicate

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function HireProfileDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  // Hire data and uniqueId
  const [hire, setHire] = useState(null);
  const [uniqueId, setUniqueId] = useState(null);

  // Reviews and pagination
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const [reviewModalImages, setReviewModalImages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Reviewer & authentication
  const [reviewer, setReviewer] = useState(null);
  const authToken = localStorage.getItem("userToken");

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 0, comment: "" });
  const [reviewImages, setReviewImages] = useState([]); // Allow max 2 images

  // Review Images Modal state (for full screen preview)
  const [reviewImageModalOpen, setReviewImageModalOpen] = useState(false);

  // For react-slick carousel in the images modal, we let slider handle navigation.
  // No need for manual prev/next handlers with slider dots and arrows.

  // Business (hire) details fetch
  useEffect(() => {
    fetch(`${baseUrl}/service/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setHire(data);
        console.log("Service data:", data);
        setUniqueId(data.uniqueId);
      })
      .catch((err) => {
        console.error("Failed to fetch service:", err);
        enqueueSnackbar("Failed to fetch hire profile", { variant: "error" });
      });
  }, [id, enqueueSnackbar]);

  // Reviews fetch (after uniqueId is set)
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

  // Google Sign-in & token handling
  useEffect(() => {
    const token = authToken;
    const user = localStorage.getItem("userData");

    if (token && user) {
      setReviewer(JSON.parse(user)); // or rename `setReviewer` to `setUser` if you prefer
    } else {
      setReviewer(null); // or setUser(null)
    }
  }, [location, authToken]);

  // Handle review rating change
  const handleRating = (i) => {
    setReviewData({ ...reviewData, rating: i + 1 });
  };
  // Handle review comment change
  const handleChange = (e) => {
    setReviewData({ ...reviewData, comment: e.target.value });
  };

  // Submit review using FormData (to include images)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    console.log("Submitting review with token:", authToken);
    if (!authToken) {
      enqueueSnackbar("Please login to submit your review.", {
        variant: "warning",
      });

      return;
    }
    const decoded = jwtDecode(authToken);
    if (decoded.exp * 1000 < Date.now()) {
      enqueueSnackbar("Session expired. Please login again.", {
        variant: "info",
      });
      localStorage.removeItem("reviewerToken");
      localStorage.removeItem("reviewer");
      navigate("/signin", { replace: true });
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
          Authorization: `Bearer ${authToken}`,
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
    } finally {
      setIsSaving(false);
    }
  };

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

  // Review Images Modal handlers using react-slick carousel

  const closeReviewImageModal = () => {
    setReviewImageModalOpen(false);
    setReviewModalImages([]);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
  };

  // For pagination of reviews
  const currentReviews = reviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  // If hire data is not yet loaded
  if (!hire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading service profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-[32rem] mt-2">
        <Slider {...sliderSettings} className="w-full h-full">
          {hire.images?.map((img, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center w-full h-full"
            >
              <img
                src={img}
                alt={`Slide ${idx}`}
                className="h-[32rem] w-full object-right-top rounded-md"
              />
            </div>
          ))}
        </Slider>
      </div>
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* HEADER / COVER SECTION */}
        <div className="bg-white rounded-lg shadow p-4 relative">
          {/* Service Info – remains unchanged */}
          <div className="mt-6 space-y-3">
            <h1 className="text-3xl font-bold capitalize">{hire.name}</h1>
            <p className="text-lg text-gray-600">{hire.category}</p>
            <p className="flex items-center text-gray-700">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="mr-2 text-red-500"
              />
              {hire.address}
            </p>
            <p className="flex items-center text-gray-700">
              <FontAwesomeIcon icon={faPhone} className="mr-2 text-blue-500" />
              {hire.phone_number}
            </p>
            <p className="flex items-center text-gray-700">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="mr-2 text-blue-500"
              />
              {hire.email}
            </p>
            <div className="flex items-center">
              <span className="mr-2">Rating:</span>
              {renderStars(hire.average_rating)}
            </div>
            <p className="bg-gray-100 p-4 rounded text-gray-800">
              {hire.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between items-center flex-wrap gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-gray-200 text-gray-800 px-5 py-2 rounded-md shadow hover:bg-gray-300 transition"
            >
              ← Go Back
            </button>
            <button
              onClick={() =>
                authToken ? setShowReviewForm(true) : navigate("/signin")
              }
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md shadow hover:bg-blue-700 transition"
            >
              <FontAwesomeIcon icon={faPen} />
              Write a Review
            </button>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Reviews</h3>
          {reviews?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  {...review}
                  onReviewerClick={(uid) => navigate(`/reveiwerPage/${uid}`)}
                  onImageClick={(images) => {
                    setReviewModalImages(images);

                    setReviewImageModalOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet.</p>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-3">
              {Array.from({ length: totalPages }).map((_, i) => (
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  value={hire.name}
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
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
                <label className="block font-medium">
                  Attach Images (Max 2)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
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
                    {isSaving ? (
                      "Processing..."
                    ) : (
                      <>
                        <span>Submit</span>
                      </>
                    )}
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

        {/* Review Images Modal using react-slick Carousel */}
        {reviewImageModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
            <div className="relative bg-white p-4 rounded-lg w-full md:max-w-3xl">
              <button
                onClick={closeReviewImageModal}
                className="absolute top-2 right-2 text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
              {reviewModalImages.length > 0 && (
                <Swiper
                  modules={[Pagination, Autoplay]}
                  spaceBetween={20}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  loop={true}
                  className="mt-4"
                >
                  {reviewModalImages.map((img, idx) => (
                    <SwiperSlide key={idx}>
                      <img
                        src={img}
                        alt={`Review image ${idx}`}
                        className="w-full md:object-cover h-[80vh] object-contain rounded-lg"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
          </div>
        )}
      </div>
    </>
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
  onReviewerClick,
  userId,
}) {
  const [expanded, setExpanded] = useState(false);
  const hasLongComment = comment?.length > 150;
  const displayedText =
    expanded || !hasLongComment ? comment : comment.slice(0, 150) + "...";

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center text-center ">
      <h4 className="text-lg font-bold capitalize ">{listingName}</h4>
      <p
        className="text-gray-700 capitalize cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onReviewerClick(userId);
        }}
      >
        {user_name}
      </p>
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
      {images && images?.length > 0 && (
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
