import { useState, useEffect } from "react";
import { useReviews } from "./context/reviewContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const REVIEWS_PER_PAGE = 6;

const ReviewCard = ({ name, companyName, rating, comment }) => (
  <div className="bg-white p-6 rounded-lg shadow-md text-center">
    <h3 className="text-lg font-semibold text-black capitalize">{companyName}</h3>
    <p className="text-gray-700 capitalize">{name}</p>
    <div className="flex justify-center text-yellow-500 mt-2">
      {[...Array(5)].map((_, i) => (
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={`text-xl ${
            i < rating ? "text-yellow-500" : "text-gray-300"
          }`}
        />
      ))}
    </div>
    <p className="text-gray-600 mt-3">
      {comment.length > 25 ? comment.substring(0, 25) + "..." : comment}
    </p>
  </div>
);

export default function PaginatedReviews() {
  const { reviews } = useReviews(); // Get reviews from context
  const [allReviews, setAllReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Get localStorage reviews
    const storedReviews =
      JSON.parse(localStorage.getItem("businessReviews")) || [];

    // Merge context reviews with localStorage reviews
    setAllReviews([...reviews, ...storedReviews]);
  }, [reviews]);

  const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);
  const indexOfLastReview = currentPage * REVIEWS_PER_PAGE;
  const indexOfFirstReview = indexOfLastReview - REVIEWS_PER_PAGE;
  const currentReviews = allReviews.slice(
    indexOfFirstReview,
    indexOfLastReview
  );

  return (
    <section className="bg-gray-100 py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">All Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentReviews.map((review, index) => (
            <ReviewCard key={index} {...review} />
          ))}
        </div>
        <div className="mt-6 flex justify-center gap-2">
          <button
            className="px-4 py-2 bg-blue-600 rounded-md disabled:bg-gray-300 text-white cursor-pointer"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            className="px-4 py-2 bg-blue-600 rounded-md disabled:bg-gray-300 text-white cursor-pointer"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
