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
  const [searchTerm, setSearchTerm] = useState(""); // User's search input
  const [listings, setListings] = useState([]); // All listings fetched from API
  const [filteredListings, setFilteredListings] = useState([]); // Filtered listings based on search
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Controls dropdown visibility

  const navigate = useNavigate();

  // Fetch all listings when component mounts
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get(`${baseUrl}/user/listings`);
        setListings(response.data); // Store all listings from the API
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchListings();
  }, []);

  // Handle search input change and filter listings based on name and category
  useEffect(() => {
    if (searchTerm.length > 0) {
      setIsDropdownOpen(true);
      setFilteredListings(
        listings.filter(
          (listing) =>
            listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setIsDropdownOpen(false); // Close the dropdown if the search term is empty
    }
  }, [searchTerm, listings]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Navigate to the selected listing's page when clicked
  const handleListingClick = (listingId) => {
    setIsDropdownOpen(false); // Close the dropdown
    navigate(`/listing/${listingId}`); // Navigate to the listing's page
  };

  return (
    <div className="relative h-screen w-full">
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
        <div className="relative w-full max-w-lg">
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search Listings"
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-4 py-2 w-full border-2 border-gray-300 rounded-full text-white bg-black/50 focus:outline-none"
            />

            {/* Search Icon */}
            <FontAwesomeIcon
              icon={faSearch}
              className="text-white text-lg absolute right-4"
            />
          </div>

          {/* Dropdown of matching listings */}
          {isDropdownOpen && filteredListings.length > 0 && (
            <div className="absolute w-full bg-white rounded-lg shadow-md mt-2 z-20">
              <ul>
                {filteredListings.map((listing) => (
                  <li
                    key={listing.id}
                    onClick={() => handleListingClick(listing.id)}
                    className="p-3 hover:bg-gray-100 cursor-pointer"
                  >
                    {listing.name} - {listing.category}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
