import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faMapMarkerAlt,
  faBriefcase,
  faSearch,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";

const baseUrl = import.meta.env.VITE_BACKEND_URL;
const REVIEWS_PER_PAGE = 6;

export default function AllListings() {
  const [listings, setListings] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(REVIEWS_PER_PAGE);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [sortOption, setSortOption] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/user/listings?searchTerm=${searchQuery}&page=${page}&limit=${limit}&filter=${sortOption}`
        );
        const data = await response.json();
        console.log("Fetched listings:", data);

        if (response.ok) {
          setListings(data.data);

          setError(data.message || "No listings found");

          const total = data.meta.total ?? 0;
          setTotalPages(Math.ceil(total / limit));
        } else {
          console.error(
            "Error fetching listings:",
            data.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchListings();
  }, [page, limit, searchQuery, sortOption]);

  // Pagination Logic

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleListingClick = (id, type) => {
    // Navigate to the appropriate route based on type (either service or business)
    if (type === "service") {
      navigate(`/hire/${id}`);
    } else if (type === "business") {
      navigate(`/business/${id}`);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-4xl font-bold text-gray-900 mt-7 m-3 text-center">
        All Listings
      </h2>
      {/* Search + Sort Container */}
      <div className="flex flex-wrap items-center mt-10 gap-4 mb-5">
        {/* Search Bar */}
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search by name or category"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative w-48">
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setPage(1);
            }}
            className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-lg pr-8 text-sm"
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
      </div>

      {/* Displaying the Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings ? (
          listings.map((listing) => (
            <div
              key={listing.uniqueId}
              className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:scale-105 transform transition-all"
              onClick={() => handleListingClick(listing.id, listing.type)} // Handle navigation based on role
            >
              <img
                src={
                  listing.images && listing.images.length > 0
                    ? listing.images[0]
                    : "/placeholder.jpg"
                }
                alt={listing.name}
                className="w-full h-48 object-cover rounded-md"
              />

              <div className="mt-4">
                <h3 className="text-xl font-semibold capitalize">
                  {listing.name}
                </h3>
                <p className="text-gray-600">
                  <FontAwesomeIcon
                    icon={faBriefcase}
                    className="mr-2 text-green-500"
                  />
                  {listing.category}
                </p>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="mr-2 text-blue-500"
                    />{" "}
                    {listing.phone_number || listing.phone_number1}
                  </p>
                  <p className="text-sm text-gray-500">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="mr-2 text-red-500"
                    />{" "}
                    {listing.address}
                  </p>
                  <p className="text-sm text-gray-500">
                    <FontAwesomeIcon
                      icon={faHouse}
                      className="mr-2 text-yellow-400"
                    />{" "}
                    {listing.type}
                  </p>
                </div>
                {listing.claimed === 1 && (
                  <div className="absolute bottom-0 right-0 m-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-tl-full rounded-br-full">
                    Claimed
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

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
