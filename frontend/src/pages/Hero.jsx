import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

// Sample images (replace with your own)
import Car from "../assets/cars.jpg";
import Bank from "../assets/bank.jpg";
import Hospital from "../assets/hospital.jpg";
import Mall from "../assets/mall.jpg";
import Hotel from "../assets/hotel.jpg";

// Adjust to your environment variable or config
const baseUrl = import.meta.env.VITE_BACKEND_URL;

// Example images array for the background carousel
const images = [Car, Bank, Hospital, Mall, Hotel, Car, Bank, Hospital, Mall, Hotel];

export default function HeroSection() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");   // User’s search query
  const [suggestions, setSuggestions] = useState([]);   // Fetched search results
  // Example "Recent searches"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load initial search query from localStorage
  useEffect(() => {
    const savedSearchQuery = localStorage.getItem("searchQuery");
    if (savedSearchQuery) {
      setSearchQuery(savedSearchQuery);
      // If you don’t want to auto-populate, uncomment below:
       setSearchQuery("");
    }
  }, []);

  // Fetch suggestions whenever searchQuery changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery) {
        setLoading(true);
        try {
          const response = await axios.get(`${baseUrl}/user/listings`, {
            params: { searchTerm: searchQuery },
          });
          setSuggestions(response.data.listings  || [])
          console.log("Fetched data:", response.data);
          

        } catch (error) {
          console.error("Error fetching listings:", error);
          setError("Failed to fetch listings. Please try again later.");
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [searchQuery]);

  // Update search query in state + localStorage
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    localStorage.setItem("searchQuery", query);
  };

  // Navigate to the appropriate page
  const handleListingClick = (id, type) => {
    if (type === "service") {
      navigate(`/hire/${id}`);
    } else if (type === "business") {
      navigate(`/business/${id}`);
    }
  };

  return (
    <div className="relative h-screen w-full">
      {/* Background Image Carousel */}
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        slidesPerView={1}
        className="relative h-full w-full"
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${img})` }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Overlay for Hero Text + Search */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white text-center px-4 z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Find Trusted Reviews In Africa
        </h1>
        <p className="text-lg mb-6">Discover genuine reviews from real users.</p>

        {/* Search Input */}
        <div className="relative w-full max-w-lg">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white"
          />
          <input
            type="text"
            placeholder="Search for a listing by name or category"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full py-3 px-12 bg-black/50 border border-gray-300 rounded-full text-white placeholder-white focus:outline-none"
          />

          {/* Command-Palette–Style Search Overlay */}
          {(searchQuery || loading || suggestions.length > 0) && (
            <div className="absolute left-0 w-full bg-white text-black rounded-md shadow-lg mt-2 py-2 z-20">
              {/* "Recent searches" heading + items */}
             

              {/* Search results */}
              {loading ? (
                <p className="px-4 py-2">Loading...</p>
              ) : (
                searchQuery &&
                suggestions.length > 0 ? (
                  <ul className="py-2">
                    {suggestions.map((listing) => (
                      <li
                        key={listing.id}
                        onClick={() =>
                          handleListingClick(listing.id, listing.type)
                        }
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      >
                        <span>{listing.name} - {listing.category}</span>
                        <span className="text-xs text-gray-400">
                          {listing.type === "business" ? "Business" : "Service"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )
                : (
                  <p className="px-4 py-2 text-gray-500">{suggestions.message}</p>
                )
              ) }

             

              {/* Error message if any */}
              {error && !loading && (
                <p className="px-4 py-2 text-red-500">{error}</p>
              )}

              {/* Bottom "shortcut" row */}
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
