

// src/components/ReviewerPersonalPage.jsx
import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar as solidStar,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
import { useParams, useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.VITE_BACKEND_URL;
const ITEMS_PER_PAGE = 6;

export default function ReviewerPersonalPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(ITEMS_PER_PAGE);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState(""); 

  const [reviewer, setReviewer] = useState({
    name: "",
    email: "",
    profilePic: null,
  });

  

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(
          `${baseUrl}/review/${userId}?page=${page}&limit=${limit}&filter=${sortOption}`
        );
        const data = await res.json();
        console.log("Raw response:", data);

        if (!res.ok) {
          throw new Error(data.message || "Failed to load reviews");
        }

        // 1) Make sure we have an array
        const reviewsArray = Array.isArray(data.data)
          ? data.data
          : data.data || [];
        setReviews(reviewsArray);
        const total = data.meta.total ?? 0;
        setTotalPages(Math.ceil(total / limit));

        // 2) Grab the User object off the first review (they all belong to same user)
        if (reviewsArray.length > 0 && reviewsArray[0].user) {
          setReviewer({
            name: reviewsArray[0].user.name,
            email: reviewsArray[0].user.email,
            profilePic: reviewsArray[0].user.profilePic,
          });
        }
      } catch (err) {
        console.error(err);
        enqueueSnackbar(err.message, { variant: "error" });
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [enqueueSnackbar, userId, page, limit, sortOption]);

  const paginatedUsers = reviews;

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleReviewCardClick = (id, listingType) => {
    // Navigate to the appropriate route based on listingType (either service or business)
    if (listingType === "service") {
      navigate(`/hire/${id}`);
    } else if (listingType === "business") {
      navigate(`/business/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* — Profile Header — */}
      <div className="bg-white p-6 flex flex-col items-center md:flex-row md:space-x-6">
        <img
          src={reviewer?.profilePic}
          alt={reviewer?.name || "Reviewer"}
          className="w-28 h-28 rounded-full object-cover mb-4 md:mb-0"
        />
        <div>
          <h1 className="text-3xl font-semibold">{reviewer.name}</h1>
          {reviewer.email && <p className="text-gray-600">{reviewer.email}</p>}
          <p className="text-gray-600 mt-2">Total Reviews: {reviews.length}</p>
        </div>
      </div>

      <div className="relative inline-block m-10 w-48">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md text-sm pr-8"
        >
          <option  value="">
            Sort By
          </option>
          <option value="newest">Recently Rated</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Least Rated</option>
          <option value="relevant">Most Relevant</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-2 text-gray-500">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M7 7l3-3 3 3H7zm0 6h6l-3 3-3-3z" />
          </svg>
        </div>
      </div>

      {/* — All Reviews Header — */}
      <h2 className="md:text-4xl font-bold text-base text-center mt-8 mb-6 capitalize">
        All {reviewer.name} Reviews
      </h2>

      {/* — Loading / Empty states — */}
      {loading ? (
        <p className="text-center text-gray-600">Loading reviews…</p>
      ) : paginatedUsers.length === 0 ? (
        <p className="text-center text-gray-600">No reviews yet.</p>
      ) : (
        <div className="max-w-6xl mx-auto px-4 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedUsers.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              handleReviewCardClick={handleReviewCardClick}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 mb-10 gap-2 flex-wrap">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1}
            className="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          Page {page} of {totalPages}
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const {
    listingName,
    user_name,
    star_rating,
    comment,
    images,
    createdAt,
    listing,
    listingType,
    handleReviewCardClick,
  } = review;

  const isLong = comment.length > 150;
  const displayText =
    expanded || !isLong ? comment : comment.slice(0, 150) + "...";

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
      <h3
        className="text-xl font-semibold text-center mb-1, cursor-pointer capitalize"
        onClick={() => handleReviewCardClick(listing.id, listingType)}
      >
        {listingName}
      </h3>
      <p className="text-gray-700 text-center mb-3 capitalize">{user_name}</p>

      <div className="flex justify-center space-x-1 text-yellow-400 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <FontAwesomeIcon
            key={i}
            icon={i < star_rating ? solidStar : regularStar}
          />
        ))}
      </div>

      <p className="text-gray-800 mb-2 text-center">{displayText}</p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-blue-600 text-sm font-medium mb-4"
        >
          {expanded ? "Show Less" : "Read More"}
        </button>
      )}

      {images?.length > 0 && (
        <img
          src={images[0]}
          alt="Review"
          className="w-full h-32 object-cover rounded mb-4"
        />
      )}

      {createdAt && (
        <p className="text-gray-500 text-xs mt-auto text-right">
          {new Date(createdAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
