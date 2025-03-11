import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import Car from "../assets/cars.jpg";
import Bank from "../assets/bank.jpg";
import Hospital from "../assets/hospital.jpg";
import Mall from "../assets/mall.jpg";
import Hotel from "../assets/hotel.jpg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'

const images = [Car, Bank, Hospital, Mall, Hotel];

export default function HeroSection() {
  const [searchTerm, setSearchTerm] = useState(""); // Track input
  const [category, setCategory] = useState("automotives"); // Track dropdown

  // Handle search button click
  const handleSearch = () => {
    console.log("Searching for:", searchTerm, "in", category);
    // Perform search action (e.g., API call or navigation)
  };

  return (
    <div className="relative h-screen w-full">
      {/* Background Image Slider */}
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        className="relative h-[100%] w-[100%] "
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
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center bg-black/50  px-4 z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Find Trusted Reviews All Over the World
        </h1>
        <p className="text-lg mb-6">
          Discover genuine reviews from real users.
        </p>

        {/* Search Bar & Dropdown */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-lg">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Find Review"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 w-full border border-gray-300 rounded-md text-white"
          />

          {/* Dropdown */}
          <div className="relative w-full">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none w-full px-4 py-2 border border-gray-300 rounded-md text-white bg-black/50 cursor-pointer pr-10"
            >
              <option value="automotives">Automotives</option>
              <option value="hotels">Hotels</option>
              <option value="healthcare">Healthcare</option>
              <option value="groceries">Groceries</option>
              <option value="malls-supermarket">Malls & Supermarket</option>
              <option value="banking-fintech">Banking & FinTech</option>
              <option value="churches">Churches</option>
              <option value="aircrafts">Aircrafts</option>
              <option value="nigerian-made">Nigerian Made</option>
              <option value="nightlife-entertainment">
                NightLife & Entertainment
              </option>
            </select>

            {/* Custom Arrow Icon */}
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faCaretDown}  className="w-5 h-5 text-white"/> 
            </div>
          </div>

          {/* Search Button */}
          <div className="pointer-events-auto">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
