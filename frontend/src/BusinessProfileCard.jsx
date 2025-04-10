import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faMapMarkerAlt,
  faBriefcase,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.VITE_BACKEND_URL;
const ITEMS_PER_PAGE = 6;

export default function BusinessProfileCard() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch(`${baseUrl}/business/`);
        const data = await res.json();
        console.log("Fetched data:", data);

        if (res.ok) {
          setUsers(data);
        } else {
          console.error("Failed to fetch business:", data.message);
        }
      } catch (err) {
        console.error("Error fetching business:", err);
      }
    };

    fetchBusiness();
  }, []);

  const filteredUsers = categoryFilter
    ? users.filter((user) => user.category === categoryFilter)
    : users;

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const categories = [...new Set(users.map((user) => user.category))];

  return (
    <div className="flex flex-col min-h-screen justify-between">
      <div>
        {users.length > 0 ? (
          <h2 className="text-4xl font-bold text-gray-900 m-3 text-center">
            Available Businesses
          </h2>
        ) : (
          <p className="text-center text-gray-500"></p>
        )}
        {users.length > 0 ? (
          <div className="flex justify-start ml-6 my-4 relative w-fit">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 border rounded appearance-none pr-8"
            >
              <option value="">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <FontAwesomeIcon
              icon={faChevronDown}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        ) : (
          <p className="text-center text-gray-500"></p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onClick={() => navigate(`/business/${user.id}`)}
              />
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full">
              No business available
            </p>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 mb-10 gap-2 flex-wrap">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageClick(i + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  );
}

function UserCard({ user, onClick }) {
  return (
    <div
      className="relative bg-white shadow-lg rounded-lg overflow-hidden w-full h-full cursor-pointer hover:shadow-xl transition"
      onClick={onClick}
    >
      {user.images?.length > 0 && (
        <div className="w-full h-64 bg-gray-100 overflow-hidden">
          <img
            src={user.images[0]}
            alt="Work Sample"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6 text-center">
        <h2 className="text-xl font-bold capitalize">{user.name}</h2>
        <p className="flex items-center justify-center text-gray-600 mt-2">
          <FontAwesomeIcon
            icon={faBriefcase}
            className="mr-2 text-green-500"
          />
          {user.category}
        </p>
        <p className="flex items-center justify-center text-gray-600 mt-2">
          <FontAwesomeIcon icon={faPhone} className="mr-2 text-blue-500" />
          {user.phone_number1}
        </p>
        <p className="flex items-center justify-center text-gray-600 mt-2">
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            className="mr-2 text-red-500"
          />
          {user.address}
        </p>
      </div>

      {/* "Claimed" badge displayed if user.claimed is true */}
      {user.claimed && (
        <div className="absolute bottom-0 right-0 m-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-tl-full rounded-br-full">
          Claimed
        </div>
      )}
    </div>
  );
}
