import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import Car from "../assets/cars.jpg";
import Bank from "../assets/bank.jpg";
import Hospital from "../assets/hospital.jpg";
import Mall from "../assets/mall.jpg";
import Hotel from "../assets/hotel.jpg";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const images = [
  Car,
  Bank,
  Hospital,
  Mall,
  Hotel,
  Car,
  Bank,
  Hospital,
  Mall,
  Hotel,
];

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(""); // Added error state
  const navigate = useNavigate();

  // Fetch matching listings based on the search query
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery) {
        try {
          const response = await axios.get(`${baseUrl}/user/listings`, {
            params: { searchTerm: searchQuery },
          });
          setSuggestions(response.data.listings || []);
          console.log("Data:", response); // Assuming listings are in response.data.listings
        } catch (error) {
          console.error("Error fetching listings:", error);
          setError("Failed to fetch listings. Please try again later.");
        }
      } else {
        setSuggestions([]); // Reset suggestions if search is cleared
      }
    };

    fetchSuggestions();
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleListingClick = (listingId, role) => {
    // Navigate to the appropriate route based on role
    if (role === "service") {
      navigate(`/hire/${listingId}`);
    } else if (role === "business") {
      navigate(`/bus/${listingId}`);
    }
  };

  return (
    <div className="relative h-screen w-full">
      {/* Background Image */}
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        slidesPerView={1}
        className="relative h-[100%] w-[100%]"
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

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center bg-black/50 px-4 z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Find Trusted Reviews In Africa
        </h1>
        <p className="text-lg mb-6">
          Discover genuine reviews from real users.
        </p>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-lg">
          <div className="relative w-full">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white"
            />
            <input
              name={searchQuery}
              type="text"
              placeholder="Search for a listing"
              value={searchQuery}
              onChange={handleSearchChange}
              className="px-6 py-3 w-full border border-gray-300 rounded-full text-white pl-12 bg-black/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        {/* Suggestions Dropdown */}
        {searchQuery && suggestions.length > 0 && (
          <div className="absolute mt-2 bg-white rounded-lg shadow-lg w-full max-w-md mx-auto text-black">
            <ul>
              {suggestions.map((listing) => (
                <li
                  key={listing.id}
                  onClick={() => handleListingClick(listing.id, listing.role)} // Handle navigation based on role
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                  {listing.name} - {listing.category}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
