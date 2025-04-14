import { useState, useEffect } from "react";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [newReview, setNewReview] = useState({
    name: "",
    rating: "",
    comment: "",
    companyName: "",
  });

  // Load reviews from localStorage on mount
  useEffect(() => {
    const storedReviews = JSON.parse(localStorage.getItem("businessReviews")) || [];
    setReviews(storedReviews);
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };

  // Handle adding a new review
  const handleAddReview = (e) => {
    e.preventDefault();
    if (
      !newReview.name ||
      !newReview.rating ||
      !newReview.comment ||
      !newReview.companyName
    ) {
      alert("All fields are required!");
      return;
    }

    const updatedReviews = [...reviews, { id: Date.now(), ...newReview }];
    setReviews(updatedReviews);
    localStorage.setItem("businessReviews", JSON.stringify(updatedReviews));

    // Reset form & close modal
    setNewReview({
      name: "",
      rating: "",
      comment: "",
      companyName: "",
    });
    setShowModal(false);
  };

  // Handle deleting a review
  const handleDeleteReview = (id) => {
    const updatedReviews = reviews.filter((review) => review.id !== id);
    setReviews(updatedReviews);
    localStorage.setItem("businessReviews", JSON.stringify(updatedReviews));
  };

  // Handle viewing a review
  const handleViewReview = (review) => {
    setSelectedReview(review);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Reviews</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Write a Review
        </button>
      </div>

      {/* Reviews Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Reviewer Name</th>
              <th className="border p-2">Rating</th>
              <th className="border p-2">Business Reviewed</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  No reviews yet.
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id} className="border-t">
                  <td className="border p-2">{review.name}</td>
                  <td className="border p-2">⭐ {review.rating}</td>
                  <td className="border p-2">{review.companyName}</td>
                  <td className="border p-2 flex space-x-2">
                    <button
                      onClick={() => handleViewReview(review)}
                      className="px-2 py-1 bg-green-500 text-white rounded"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-bold mb-4">Write a Review</h3>
            <form onSubmit={handleAddReview} className="space-y-3">
              <input
                type="text"
                name="reviewerName"
                placeholder="Your Name"
                value={newReview.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="rating"
                placeholder="Rating (1-5)"
                value={newReview.rating}
                onChange={handleChange}
                min="1"
                max="5"
                className="w-full p-2 border rounded"
              />
              <textarea
                name="reviewText"
                placeholder="Write your review..."
                value={newReview.comment}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="businessName"
                placeholder="Business Name"
                value={newReview.companyName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-bold mb-2">Review Details</h3>
            <p>
              <strong>Name:</strong> {selectedReview.name}
            </p>
            <p>
              <strong>Rating:</strong> ⭐ {selectedReview.rating}
            </p>
            <p>
              <strong>Business:</strong> {selectedReview.companyName}
            </p>
            <p className="mb-4">
              <strong>Review:</strong> {selectedReview.comment}
            </p>
            <button
              onClick={() => setSelectedReview(null)}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
