import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function AllListings() {
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    
    const storedSearchQuery = localStorage.getItem("searchQuery");
    if (storedSearchQuery) {
      setSearchQuery(storedSearchQuery);
    }
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/user/listings?searchTerm=${searchQuery}`
        );
        const data = await response.json();

        if (response.ok) {
          setListings(data.listings); // Assuming listings are in data.listings
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

    if (searchQuery) {
      fetchListings();
    } else {
      setListings([]); // Reset listings if search query is empty
    }
  }, [searchQuery]);

  const handleListingClick = (listingId, role) => {
    // Navigate to the appropriate route based on role
    if (role === "service") {
      navigate(`/hire/${listingId}`);
    } else if (role === "business") {
      navigate(`/bus/${listingId}`);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="bg-white p-4 rounded shadow cursor-pointer"
          onClick={() => handleListingClick(listing.id, listing.role)} // Handle navigation based on role
        >
          <img
            src={listing.image} // Assuming each listing has an image
            alt={listing.name}
            className="w-full h-48 object-cover rounded-md"
          />
          <h3 className="text-xl font-semibold mt-4">{listing.name}</h3>
          <p className="text-gray-600">{listing.category}</p>
        </div>
      ))}
    </div>
  );
}
