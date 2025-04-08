import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const REVIEWS_PER_PAGE = 6;
const baseUrl = import.meta.env.VITE_BACKEND_URL;

const ReviewCard = ({
  user_name,
  listingName,
  star_rating,
  comment,
  createdAt,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = comment.length > 150;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-semibold text-black capitalize">
          {listingName}
        </h3>
        <p className="text-gray-700 capitalize">{user_name}</p>

        <div className="flex justify-center text-yellow-500 mt-2">
          {[...Array(5)].map((_, i) => (
            <FontAwesomeIcon
              key={i}
              icon={faStar}
              className={`text-xl ${
                i < star_rating ? "text-yellow-500" : "text-gray-300"
              }`}
            />
          ))}
        </div>

        <p className="text-gray-600 mt-3">
          {expanded || !isLong ? comment : comment.slice(0, 150) + "..."}
        </p>

        {isLong && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-1 text-blue-600 text-sm font-medium hover:underline"
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-right">
        {new Date(createdAt).toLocaleString()}
      </p>
    </div>
  );
};

export default function PaginatedReviews() {
  const [allReviews, setAllReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${baseUrl}/review/`);
        const data = await res.json();
        const sorted = data.reviews?.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAllReviews(sorted || []);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      }
    };

    fetchReviews();
  }, []);

  const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);
  const currentReviews = allReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  return (
    <section className="bg-gray-100 py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">All Reviews</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {currentReviews.map((review, index) => (
            <ReviewCard key={index} {...review} />
          ))}
        </div>

        {/* Pagination Controls */}
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

