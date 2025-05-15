import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSave } from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";
import { jwtDecode } from "jwt-decode";
const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function ReviewersDashboard() {
  const { enqueueSnackbar } = useSnackbar();
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const reviewsPerPage = 3;
  const token = localStorage.getItem("userToken");
  const decodedToken = jwtDecode(token);
  console.log(decodedToken);
  

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
        setReviews(data.data || []);
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
      <div className="flex justify-end max-w-3xl mx-auto mb-4">
        <button
          onClick={() => setShowSettingsModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Open Settings
        </button>
      </div>

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
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto shadow-xl space-y-6 relative">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-2 right-2 text-red-600 font-bold text-lg"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold text-center mb-2">
              Profile Settings
            </h3>
            <Settings
              userId={decodedToken.id}
              closeModal={() => setShowSettingsModal(false)}
            />
          </div>
        </div>
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

function Settings({ userId,  }) {
  const { enqueueSnackbar } = useSnackbar();
  const [image, setImage] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("userToken");

  const handleImageUpload = async () => {
    if (!image)
      return enqueueSnackbar("Select an image", { variant: "warning" });

    const formData = new FormData();
    formData.append("profilePic", image);

    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/user/${userId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error();
      enqueueSnackbar("Profile picture updated", { variant: "success" });
    } catch {
      enqueueSnackbar("Failed to update profile picture", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!password)
      return enqueueSnackbar("Enter a new password", { variant: "warning" });

    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: password }),
      });
      if (!res.ok) throw new Error();
      enqueueSnackbar("Password updated", { variant: "success" });
      setPassword("");
    } catch {
      enqueueSnackbar("Failed to update password", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-1">Profile Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          disabled={loading}
        />
        <button
          onClick={handleImageUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2"
          disabled={loading}
        >
          Upload
        </button>
      </div>

      <div>
        <label className="block font-medium mb-1">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full rounded"
          disabled={loading}
        />
        <button
          onClick={handlePasswordUpdate}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-2"
          disabled={loading}
        >
          Update Password
        </button>
      </div>
    </div>
  );
}
