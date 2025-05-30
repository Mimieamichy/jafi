import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// /import { faStar } from "@fortawesome/free-solid-svg-icons";

import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
import {
  faStar as solidStar,
  faStarHalfAlt,
} from "@fortawesome/free-solid-svg-icons";

// Base URL for API calls
const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function CategoryPage() {
  const { category } = useParams();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryPerPage = 6;
  const [page, setPage] = useState(1);
  const [limit] = useState(categoryPerPage);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        setLoading(true);
        const res = await fetch(
          `${baseUrl}/business/category/${encodeURIComponent(
            category
          )}?page=${page}&limit=${limit}&filter=${sortOption}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch businesses");
        }
        const data = await res.json();
        console.log("businesses", data);

        setBusinesses(data.data || data.message || []);
        const total = data.meta.total ?? 0;
        setTotalPages(Math.ceil(total / limit));
      } catch (err) {
        console.error(err);
        setBusinesses([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    }
    fetchBusinesses();
  }, [category, page, limit, sortOption]);

  const currentListings = businesses;

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const renderStars = (rating) => {
    const numericRating = parseFloat(rating);
    if (isNaN(numericRating)) {
      console.error("Invalid star rating:", rating);
      return null;
    }

    // Calculate full stars (integer part)
    const fullStars = Math.floor(numericRating);
    // If the rating is not exactly an integer, we display one half star.
    const hasHalfStar = numericRating - fullStars !== 0;
    // Total stars must always be 5.
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    console.log(
      "Parsed Rating:",
      numericRating,
      "Full:",
      fullStars,
      "Has Half:",
      hasHalfStar,
      "Empty:",
      emptyStars
    );

    return (
      <div className="flex justify-center space-x-1 text-yellow-400 mt-1">
        {Array.from({ length: fullStars }).map((_, idx) => (
          <FontAwesomeIcon icon={solidStar} key={`full-${idx}`} />
        ))}
        {hasHalfStar && <FontAwesomeIcon icon={faStarHalfAlt} />}
        {Array.from({ length: emptyStars }).map((_, idx) => (
          <FontAwesomeIcon icon={regularStar} key={`empty-${idx}`} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500">Loading {category} businesses...</span>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="text-gray-600 text-center py-8">
        No businesses found for <strong>{category}</strong>.
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="relative inline-block m-10 w-48">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md text-sm pr-8"
        >
          <option value="">Sort By</option>
          <option value="mostRecent">Recent</option>
          <option value="oldest">Oldest</option>
          <option value="highestRated">Highest Rated</option>         
          <option value="highestReviewed">Most Reviewed</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-2 text-gray-500">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M7 7l3-3 3 3H7zm0 6h6l-3 3-3-3z" />
          </svg>
        </div>
      </div>
      <h2 className="text-4xl font-bold mb-4 mt-5 text-center">
        {category} Businesses
      </h2>
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentListings.map((biz) => (
            <div
              key={biz.id}
              onClick={() => navigate(`/business/${biz.id}`)}
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            >
              {/* if backend already sends full url use it; otherwise prefix */}
              <img
                src={biz.images?.[0] || "/default-image.jpg"}
                alt={biz.name}
                className="w-full h-40 object-cover rounded-md"
              />
              <h3 className="text-lg font-semibold mt-4 capitalize">
                {biz.name}
              </h3>
              <p className="text-sm text-gray-400">{biz.category}</p>
              <p className="text-gray-500">{biz.address}</p>
              <div className="mt-2">
                {renderStars(biz.rating || biz.average_rating || 0)}
              </div>
              {biz.time && (
                <p className="text-blue-600 font-medium mt-2">{biz.time}</p>
              )}
            </div>
          ))}
        </div>
      </>

      {/* Pagination Controls */}
      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={handlePreviousPage}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Prev
        </button>
        <span className="self-center text-lg">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page === totalPages || totalPages === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
