import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSave } from "@fortawesome/free-solid-svg-icons";

export default function ReviewersDashboard() {
  const [reviews, setReviews] = useState([]);
  

  // Load reviews from localStorage (replace this with API later)
  useEffect(() => {
    const storedReviews =
      JSON.parse(localStorage.getItem("businessReviews")) || [];

    setReviews(storedReviews);
  }, []);

  // Handle Review Editing
  const handleEditReview = (index, updatedComment) => {
    const updatedReviews = [...reviews];
    updatedReviews[index].comment = updatedComment;
    setReviews(updatedReviews);
    localStorage.setItem("businessReviews", JSON.stringify(updatedReviews));
  };

  // Handle Review Deletion
  const handleDeleteReview = (index) => {
    const updatedReviews = reviews.filter((_, i) => i !== index);
    setReviews(updatedReviews);
    localStorage.setItem( "businessReviews", JSON.stringify(updatedReviews));
   
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-semibold mb-4 text-center">My Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-gray-600 text-center">No reviews written yet.</p>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {reviews.map((review, index) => (
            <ReviewCard
              key={index}
              index={index}
              review={review}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Review Card Component
const ReviewCard = ({ index, review, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(review.comment);

  return (
    <div className="bg-white p-5 rounded shadow-md">
      <h3 className="text-xl font-semibold">{review.businessName}</h3>

      {isEditing ? (
        <textarea
          className="w-full border rounded p-2 mt-2"
          value={editedComment}
          onChange={(e) => setEditedComment(e.target.value)}
        />
      ) : (
        <p className="text-gray-700 mt-2">{review.comment}</p>
      )}

      <div className="flex items-center space-x-3 mt-3">
        {isEditing ? (
          <button
            className="text-green-600 flex items-center"
            onClick={() => {
              onEdit(index, editedComment);
              setIsEditing(false);
            }}
          >
            <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
          </button>
        ) : (
          <button
            className="text-blue-600 flex items-center"
            onClick={() => setIsEditing(true)}
          >
            <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit
          </button>
        )}

        <button
          className="text-red-600 flex items-center"
          onClick={() => onDelete(index)}
        >
          <FontAwesomeIcon icon={faTrash} className="mr-1" /> Delete
        </button>
      </div>
    </div>
  );
};
