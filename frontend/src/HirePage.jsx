import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Slider from "react-slick";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faPhone,
  faMapMarkerAlt,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function HireProfileDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [hire, setHire] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewer, setReviewer] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 0, comment: "" });
  const [reviews, setReviews] = useState([]);

  // Fetch hire profile
  useEffect(() => {
    fetch(`${baseUrl}/service/${id}`)
      .then((res) => res.json())
      .then((data) => setHire(data.service || null))
      .catch(() =>
        enqueueSnackbar("Failed to fetch hire profile", { variant: "error" })
      );
  }, [id, enqueueSnackbar]);

  // Fetch reviews
  useEffect(() => {
    fetch(`${baseUrl}/review/${id}`)
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() =>
        enqueueSnackbar("Failed to fetch reviews", { variant: "error" })
      );
  }, [id, showReviewForm, enqueueSnackbar]);

  // Handle token from redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        localStorage.setItem("reviewerToken", token);
        localStorage.setItem("reviewer", JSON.stringify(decoded));
        setReviewer(decoded);
        setShowReviewForm(true);
      } catch {
        enqueueSnackbar("Invalid login token", { variant: "error" });
      }
    } else {
      const saved = localStorage.getItem("reviewer");
      if (saved) setReviewer(JSON.parse(saved));
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

    try {
      const res = await fetch(`${baseUrl}/review/${id}`, {
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
    window.location.href = `${baseUrl}/auth/google`;
  };

  if (!hire) return <p className="text-center p-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
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
        {hire.workSamples.map((img, i) => (
          <div
            key={i}
            className="w-full h-64 bg-gray-100 flex items-center justify-center"
          >
            <img
              src={img}
              alt={`Work sample ${i + 1}`}
              className="w-full h-64 object-cover rounded"
            />
          </div>
        ))}
      </Slider>

      {/* Info */}
      <div className="mt-6 space-y-3">
        <h1 className="text-3xl font-bold capitalize">{hire.service}</h1>
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
          {hire.phone}
        </p>

        <div className="flex items-center">
          <span className="mr-2">Rating:</span>
          {[...Array(5)].map((_, i) => (
            <FontAwesomeIcon
              key={i}
              icon={faStar}
              className={
                i < (hire.averageRating || 0)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }
            />
          ))}
          <span className="ml-2 text-sm text-gray-500">
            ({hire.averageRating?.toFixed(1) || "0.0"})
          </span>
        </div>

        <p className="bg-gray-100 p-4 rounded text-gray-800">
          {hire.description}
        </p>
      </div>

      {/* Floating Button */}
      <button
        onClick={() =>
          reviewer ? setShowReviewForm(true) : handleGoogleLogin()
        }
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
      >
        <FontAwesomeIcon icon={faPen} className="mr-2" /> Write a Review
      </button>

      {/* Review Form */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4"
          >
            <h2 className="text-xl font-bold text-center">Submit a Review</h2>
            <input
              type="text"
              value={hire.service}
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
                    i < reviewData.rating ? "text-yellow-500" : "text-gray-300"
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
      )}

      {/* Reviews Section */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4">Reviews</h3>
        {reviews.length > 0 ? (
          reviews.map((review, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded mb-3 shadow">
              <p className="font-bold text-gray-800">{review.name}</p>
              <div className="flex space-x-1 text-yellow-500">
                {[...Array(5)].map((_, j) => (
                  <FontAwesomeIcon
                    key={j}
                    icon={faStar}
                    className={
                      j < review.rating ? "text-yellow-500" : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <p className="mt-1 text-gray-700">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
