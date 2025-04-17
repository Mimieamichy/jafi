import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

// This inner component handles fetching and displaying replies for a review.
function ReviewReplies({ reviewId, authToken, baseUrl, enqueueSnackbar }) {
  const [replies, setReplies] = React.useState([]);

  React.useEffect(() => {
    const fetchReplies = async () => {
      try {
        const response = await fetch(`${baseUrl}/review/replies/${reviewId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        setReplies(data.replies || []);
      } catch (error) {
        console.error("Error fetching replies:", error);
        enqueueSnackbar("Error fetching replies", { variant: "error" });
      }
    };

    fetchReplies();
  }, [reviewId, authToken, baseUrl, enqueueSnackbar]);

  if (replies.length === 0) return null;
  return (
    <div className="border-l border-gray-300 pl-4 ml-4 mt-2">
      {replies.map((reply) => (
        <div key={reply.id} className="mb-2"></div>
      ))}
    </div>
  );
}

export default function ReviewsSection({
  reviews,
  authToken,
  baseUrl,
  enqueueSnackbar,
  currentPage,
  totalPages,
  handleNextPage,
  handlePreviousPage,
  replyStates,
  toggleReply,
  replyTexts,
  handleReplyChange,
  handleReplySubmit,
  cancelReply,
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">All Reviews</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Reviewer Name */}
              <div className="flex items-center justify-center">
                <Link
                  to="/review-page"
                  className="font-semibold text-lg capitalize"
                >
                  {review.user_name}
                </Link>
              </div>

              {/* Rating */}
              <div className="flex justify-center text-yellow-500 mt-2">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className={`text-xl ${
                      i < review.star_rating
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Review Comment */}
              <p className="mt-2 text-center text-gray-600 line-clamp-3">
                {review.comment}
              </p>

              {/* Time Since Posted */}
              <p className="text-sm text-gray-500 mt-2 text-center">
                {formatDistanceToNow(new Date(review.createdAt), {
                  addSuffix: true,
                })}
              </p>

              {/* Reply / Reply Editor */}
              {review.reply ? (
                <div className="border-l-2 border-gray-300 pl-4 ml-4 mt-2">
                  <p className="font-semibold text-sm">Your Reply:</p>
                  <p className="text-sm text-gray-600">{review.reply}</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => toggleReply(review.id)}
                    className="text-blue-600 hover:underline mt-2 block text-center"
                  >
                    Reply
                  </button>
                  {replyStates[review.id] && (
                    <div className="mt-2">
                      <textarea
                        className="w-full p-2 border rounded"
                        placeholder="Write your reply..."
                        value={replyTexts[review.id] || ""}
                        onChange={(e) =>
                          handleReplyChange(review.id, e.target.value)
                        }
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleReplySubmit(review.id)}
                          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
                        >
                          Submit Reply
                        </button>
                        <button
                          onClick={() => cancelReply(review.id)}
                          className="bg-gray-300 text-gray-800 px-3 py-2 rounded hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Render Review Replies */}
              <ReviewReplies
                reviewId={review.id}
                authToken={authToken}
                baseUrl={baseUrl}
                enqueueSnackbar={enqueueSnackbar}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center h-64">
            <p className="text-gray-500">No reviews yet.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {reviews.length > 0 && (
        <div className="mt-6 flex justify-center items-center space-x-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            Previous
          </button>
          <span className="font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
