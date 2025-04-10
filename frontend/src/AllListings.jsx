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

export default function AllListings() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [listingsPerPage] = useState(6);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(`${baseUrl}/user/listings`);
        const data = await response.json();
        console.log("Fetched listings:", data);

        if (response.ok) {
          setListings(data.listings);
          setFilteredListings(data.listings);
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
  }, []);

  // Handle Search Query
  useEffect(() => {
    if (searchQuery) {
      const filtered = listings.filter(
        (listing) =>
          listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredListings(filtered);
    } else {
      setFilteredListings(listings);
    }
  }, [searchQuery, listings]);

  // Pagination Logic
  const indexOfLastListing = currentPage * listingsPerPage;
  const indexOfFirstListing = indexOfLastListing - listingsPerPage;
  const currentListings = filteredListings.slice(
    indexOfFirstListing,
    indexOfLastListing
  );

  const totalPages = Math.ceil(filteredListings.length / listingsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
      {/* Search Bar */}
      <div className="relative w-72 mb-5">
        {" "}
        {/* Reduced width of search bar */}
        <input
          type="text"
          placeholder="Search by name or category"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 pl-10 w-full border border-gray-300 rounded-lg" // Adjust padding and width
        />
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" // Positioned inside the input
        />
      </div>

      {/* Displaying the Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentListings.map((listing) => (
          <div
            key={listing.id}
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
              <h3 className="text-xl font-semibold">{listing.name}</h3>
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
              {listing.claimed && (
                <div className="absolute bottom-0 right-0 m-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-tl-full rounded-br-full">
                  Claimed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Prev
        </button>
        <span className="self-center text-lg">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
