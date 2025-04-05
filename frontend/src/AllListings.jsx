import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function AllListings() {
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

  const fetchAllListings = async () => {
    try {
      const res = await fetch(`${baseUrl}/user/listings`);
      const data = await res.json();
      setListings(data || []);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    }
  };

  useEffect(() => {
    fetchAllListings();

    const handleSearchEvent = (e) => {
      const query = e.detail;
      if (!query) {
        fetchAllListings(); // Reset when input is cleared
        return;
      }

      fetch(`${baseUrl}/user/listings?search=${query}`)
        .then((res) => res.json())
        .then((data) => setListings(data || []))
        .catch((err) => console.error("Search error:", err));
    };

    window.addEventListener("searchListings", handleSearchEvent);
    return () => window.removeEventListener("searchListings", handleSearchEvent);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">All Listings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.length > 0 ? (
          listings.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded shadow hover:shadow-md transition cursor-pointer"
              onClick={() =>
                navigate(item.type === "service" ? `/hire/${item.id}` : `/business/${item.companyName}`)
              }
            >
              <img
                src={item.images?.[0] || "https://via.placeholder.com/300x200"}
                alt={item.name || item.service_name}
                className="w-full h-48 object-cover rounded mb-3"
              />
              <h3 className="text-xl font-semibold text-gray-800 capitalize">
                {item.companyName || item.service_name}
              </h3>
              <p className="text-gray-500 capitalize">{item.category}</p>
              <p className="text-gray-600 mt-1 truncate">{item.address}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600 col-span-full text-center">No listings found.</p>
        )}
      </div>
    </div>
  );
}
