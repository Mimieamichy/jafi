// src/components/ReviewerPersonalPage.jsx
import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function ReviewerPersonalPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // pull reviewer info from localStorage
  const reviewer = JSON.parse(localStorage.getItem("reviewer") || "{}");

  useEffect(() => {
    async function fetchReviews() {
      const token = localStorage.getItem("reviewerToken");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${baseUrl}/review/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setReviews(data.reviews || []);
        else enqueueSnackbar(data.message || "Failed to load reviews", {
          variant: "error",
        });
      } catch (err) {
        enqueueSnackbar(err, "Network error fetching reviews", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [enqueueSnackbar]);

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* — Profile Header — */}
      <div className="bg-white p-6 flex flex-col items-center md:flex-row md:items-center md:space-x-6">
        <img
          src={reviewer.picture || "/default-avatar.png"}
          alt={reviewer.name || "Reviewer"}
          className="w-28 h-28 rounded-full mt-10 object-cover mb-4 md:mb-0"
        />
        <div>
          <h1 className="text-3xl font-semibold">{reviewer.name}</h1>
          {reviewer.email && (
            <p className="text-gray-600">{reviewer.email}</p>
          )}
        </div>
      </div>

      {/* — All Reviews Header — */}
      <h2 className="text-4xl font-bold text-center mt-8 mb-6 capitalize">
        All {reviewer.name} Reviews
      </h2>

      {/* — Loading / Empty states — */}
      {loading ? (
        <p className="text-center text-gray-600">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-600">No reviews yet.</p>
      ) : (
        <div className="max-w-6xl mx-auto px-4 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const { listingName, user_name, star_rating, comment, images, createdAt } =
    review;

  const isLong = comment?.length > 150;
  const displayText = expanded || !isLong
    ? comment
    : comment.slice(0, 150) + "...";

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
      {/* Listing Title */}
      <h3 className="text-xl font-semibold text-center mb-1">
        {listingName}
      </h3>

      {/* Reviewer Name (optional—you can remove if redundant) */}
      <p className="text-gray-700 text-center mb-3 capitalize">
        {user_name}
      </p>

      {/* Star Rating */}
      <div className="flex justify-center space-x-1 text-yellow-400 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <FontAwesomeIcon
            key={i}
            icon={i < star_rating ? solidStar : regularStar}
          />
        ))}
      </div>

      {/* Comment */}
      <p className="text-gray-800 mb-2 text-center">{displayText}</p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-blue-600 text-sm font-medium mb-4"
        >
          {expanded ? "Show Less" : "Read More"}
        </button>
      )}

      {/* Optional Image Preview */}
      {images?.length > 0 && (
        <img
          src={images[0]}
          alt="Review"
          className="w-full h-32 object-cover rounded mb-4"
        />
      )}

      {/* Date */}
      {createdAt && (
        <p className="text-gray-500 text-xs mt-auto text-right">
          {new Date(createdAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
