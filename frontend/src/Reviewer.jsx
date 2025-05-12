import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSave } from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";
const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function ReviewersDashboard() {
  const { enqueueSnackbar } = useSnackbar();
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;
  const token = localStorage.getItem("userToken");

  const fetchReviews = useCallback(async () => {
    if (!token) return;
    try {
      //const token = jwtDecode(token);
      const res = await fetch(`${baseUrl}/review/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        setReviews(data.reviews || []);
      } else {
        enqueueSnackbar(data.message || "Failed to fetch reviews", {
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar("Failed to load reviews.", { variant: "error" });
    }
  }, [enqueueSnackbar, token]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleEditReview = async (reviewId, updatedComment) => {
    try {
      const res = await fetch(`${baseUrl}/review/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: updatedComment }),
      });

      const data = await res.json();
      if (res.ok) {
        enqueueSnackbar("Review updated", { variant: "success" });
        fetchReviews();
      } else {
        enqueueSnackbar(data.message || "Failed to update", {
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar("Error updating review", { variant: "error" });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await fetch(`${baseUrl}/review/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        enqueueSnackbar("Review deleted", { variant: "success" });
        fetchReviews();
      } else {
        enqueueSnackbar("Failed to delete review", { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Something went wrong", { variant: "error" });
    }
  };

  // Pagination
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-semibold mb-6 text-center">My Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-600">No reviews yet.</p>
      ) : (
        <>
          <div className="space-y-4 max-w-3xl mx-auto">
            {paginatedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6 gap-2">
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
        </>
      )}
    </div>
  );
}

function ReviewCard({ review, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(review.comment);

  // 1️⃣ Compute initial editability & remaining time
  const createdAtMs = new Date(review.createdAt).getTime();
  const elapsedMs = Date.now() - createdAtMs;
  const threeHoursMs = 3 * 60 * 60 * 1000;
  const initialEditable = elapsedMs <= threeHoursMs;
  const remainingMs = Math.max(threeHoursMs - elapsedMs, 0);

  // 2️⃣ Make isEditable dynamic
  const [isEditable, setIsEditable] = useState(initialEditable);

  useEffect(() => {
    if (!initialEditable) return;
    // Schedule turn-off when 3h since creation passes
    const timer = setTimeout(() => {
      setIsEditable(false);
      setIsEditing(false); // also exit edit-mode if active
    }, remainingMs);

    return () => clearTimeout(timer);
  }, [initialEditable, remainingMs]);

  return (
    <div className="bg-white p-4 rounded shadow relative">
      <h3 className="text-xl font-bold capitalize">{review.listingName}</h3>
      <p className="text-sm text-gray-500 mb-1 capitalize">
        {review.user_name}
      </p>

      {isEditing ? (
        <textarea
          className="w-full border rounded p-2 mt-2"
          value={editedComment}
          onChange={(e) => setEditedComment(e.target.value)}
        />
      ) : (
        <p className="text-gray-800 mt-2">{review.comment}</p>
      )}

      {/* Only show edit/delete while within 3 hours */}
      {isEditable && (
        <div className="flex justify-between items-center mt-3">
          {isEditing ? (
            <button
              onClick={() => {
                onEdit(review.id, editedComment);
                setIsEditing(false);
              }}
              className="text-green-600 flex items-center"
            >
              <FontAwesomeIcon icon={faSave} className="mr-1" />
              Save
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 flex items-center"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-1" />
              Edit
            </button>
          )}
          <button
            onClick={() => onDelete(review.id)}
            className="text-red-600 flex items-center"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-1" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
