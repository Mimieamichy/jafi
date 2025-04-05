import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Slider from "react-slick";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faPhone,
  faMapMarkerAlt,
  faEnvelope,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

// ... import statements remain unchanged

export default function HireProfileDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [hire, setHire] = useState(null);
  const [uniqueId, setUniqueId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewer, setReviewer] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 0, comment: "" });
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;

  // Fetch hire
  useEffect(() => {
    fetch(`${baseUrl}/service/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setHire(data);
        console.log(data);
        setUniqueId(data.uniqueId);
      })
      .catch(() =>
        enqueueSnackbar("Failed to fetch hire profile", { variant: "error" })
      );
  }, [id, enqueueSnackbar]);

  // Fetch reviews
  useEffect(() => {
    if (!uniqueId) return;
    fetch(`${baseUrl}/review/entity/${uniqueId}`)
      .then((res) => res.json())
      .then((data) => console.log(data) || setReviews(data.reviews || []))

      .catch(() =>
        enqueueSnackbar("Failed to fetch reviews", { variant: "error" })
      );
  }, [uniqueId, showReviewForm, enqueueSnackbar]);

  // Google Sign-in & token handling
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const redirect = params.get("redirect") || location.pathname;
    // default to current page

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
          window.location.href = `${baseUrl}/review/google?redirect=${redirect}`;
          
        } else {
          localStorage.setItem("reviewerToken", token);
          localStorage.setItem("reviewer", JSON.stringify(decoded));
          setReviewer(decoded);

          // Remove token + redirect param from URL
          const cleanedUrl = location.pathname;
          window.history.replaceState({}, document.title, cleanedUrl);
          window.location.reload();
        }
      } catch {
        enqueueSnackbar("Invalid login token", { variant: "error" });
      }
    } else {
      const stored = localStorage.getItem("reviewer");
      if (stored) setReviewer(JSON.parse(stored));
    }
  }, [location, enqueueSnackbar]);

  const handleRating = (i) => {
    setReviewData({ ...reviewData, rating: i + 1 });
  };

  const handleChange = (e) => {
    setReviewData({ ...reviewData, comment: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("reviewerToken");
    if (!token) {
      enqueueSnackbar("Please login to submit your review.", {
        variant: "warning",
      });
      window.location.href = `${baseUrl}/review/google`;
      return;
    }

    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      enqueueSnackbar("Session expired. Please login again.", {
        variant: "info",
      });
      localStorage.removeItem("reviewerToken");
      localStorage.removeItem("reviewer");
      window.location.href = `${baseUrl}/review/google`;
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
    } catch {
      enqueueSnackbar("Something went wrong", { variant: "error" });
    }
  };

  const handleGoogleLogin = () => {
    // Frontend - Capture the current URL before redirecting to Google login
    const currentUrl = window.location.href;

    // Send the current URL as a query parameter
    window.location.href = `${baseUrl}/review/google?redirect=${encodeURIComponent(
      currentUrl
    )}`;
  };

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  if (!hire) return <p className="text-center p-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      {/* Carousel */}
      <Slider
        dots
        infinite
        speed={500}
        slidesToShow={1}
        slidesToScroll={1}
        autoplay
        arrows
      >
        {hire.images?.map((img, i) => (
          <div
            key={i}
            className="w-full h-64 bg-gray-100 flex items-center justify-center"
          >
            <img
              src={img}
              alt={`Work sample ${i + 1}`}
              className="w-full h-64  rounded"
            />
          </div>
        ))}
      </Slider>

      {/* Info */}
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
          <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-blue-500" />
          {hire.email}
        </p>

        <div className="flex items-center">
          <span className="mr-2">Rating:</span>
          {[...Array(5)].map((_, i) => (
            <FontAwesomeIcon
              key={i}
              icon={faStar}
              className={
                i < (hire.average_rating || 0)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }
            />
          ))}
        </div>

        <p className="bg-gray-100 p-4 rounded text-gray-800">
          {hire.description}
        </p>
      </div>

      {/* Write a Review Button */}
      <div className="mt-8 flex justify-between items-center flex-wrap gap-4">
        {/* Go Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-gray-200 text-gray-800 px-5 py-2 rounded-md shadow hover:bg-gray-300 transition"
        >
          ← Go Back
        </button>

        {/* Write a Review Button */}
        <button
          onClick={() =>
            reviewer ? setShowReviewForm(true) : handleGoogleLogin()
          }
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md shadow hover:bg-blue-700 transition"
        >
          <FontAwesomeIcon icon={faPen} />
          Write a Review
        </button>
      </div>

      {/* Modal with dimmed background, transition and click-outside close */}
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

      {/* Review List */}
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
                  <p className="text-gray-700">{review.user?.name}</p>
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
    </div>
  );
}


