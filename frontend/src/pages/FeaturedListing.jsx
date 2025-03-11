import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import Art from "../assets/artgallery.jpg";
import Book from "../assets/bookshop.jpg";
import Car2 from "../assets/car2.jpg";
import Hotel2 from "../assets/hotel2.jpg";
import Cinema from "../assets/cinema.jpg";
import Fashion from "../assets/fashion.jpg";
import Gym from "../assets/gym.jpg";
import Mobile from "../assets/phoneShop.jpg";
import Grocery from "../assets/grocery.jpg";
import MusicShop from "../assets/musicStore.jpg";
import Tech from "../assets/tech.jpg";
import Goods from "../assets/goods.jpg";

const FeaturedListings = () => {
  const listings = [
    {
      id: 1,
      name: "Automotive Hub",
      category: "Automotive",
      address: "123 Car Street",
      image: Car2,
      rating: 4,
      time: "9 AM - 7 PM",
    },
    {
      id: 2,
      name: "Luxury Hotels",
      category: "Hotel",
      address: "456 Hotel Ave",
      image: Hotel2,
      rating: 5,
      time: "24/7",
    },
    {
      id: 3,
      name: "Grocery Market",
      category: "Groceries",
      address: "789 Food Blvd",
      image: Grocery,
      rating: 3,
      time: "8 AM - 6 PM",
    },
    {
      id: 4,
      name: "Tech Gadgets",
      category: "Electronics",
      address: "101 Tech Road",
      image: Tech,
      rating: 4,
      time: "10 AM - 8 PM",
    },
    {
      id: 5,
      name: "Fitness Center",
      category: "Health & Wellness",
      address: "202 Health St",
      image: Gym,
      rating: 4,
      time: "5 AM - 11 PM",
    },
    {
      id: 6,
      name: "Eco Friendly Goods",
      category: "Retail",
      address: "303 Green Way",
      image: Goods,
      rating: 5,
      time: "9 AM - 7 PM",
    },
    {
      id: 7,
      name: "Fashion Store",
      category: "Fashion",
      address: "404 Trend St",
      image: Fashion,
      rating: 4,
      time: "10 AM - 6 PM",
    },
    {
      id: 8,
      name: "Mobile Store",
      category: "Electronics",
      address: "505 Phone Ave",
      image: Mobile,
      rating: 3,
      time: "9 AM - 8 PM",
    },
    {
      id: 9,
      name: "Art Gallery",
      category: "Arts",
      address: "606 Culture Rd",
      image: Art,
      rating: 4,
      time: "11 AM - 7 PM",
    },
    {
      id: 10,
      name: "Music Store",
      category: "Entertainment",
      address: "707 Melody Blvd",
      image: MusicShop,
      rating: 5,
      time: "9 AM - 10 PM",
    },
    {
      id: 11,
      name: "Bookstore",
      category: "Books",
      address: "808 Reading Ln",
      image: Book,
      rating: 4,
      time: "9 AM - 9 PM",
    },
    {
      id: 12,
      name: "Movie Theater",
      category: "Entertainment",
      address: "909 Cinema St",
      image: Cinema,
      rating: 3,
      time: "All Day",
    },
  ];

  const [showAll, setShowAll] = useState(false);

  const handleToggle = () => {
    setShowAll(!showAll);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-4xl font-bold mb-4 text-center">Featured Listings</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.slice(0, showAll ? listings.length : 6).map((listing) => (
          <div key={listing.id} className="bg-white p-6 rounded-lg shadow-md">
            <img
              src={listing.image}
              alt={listing.name}
              className="w-full h-40 object-cover rounded-md"
            />
            <h3 className="text-lg font-semibold mt-4">{listing.name}</h3>
            <p className="text-sm text-gray-400">{listing.category}</p>{" "}
            {/* Category Display */}
            <p className="text-gray-500">{listing.address}</p>
            <div className="mt-2">{renderStars(listing.rating)}</div>
            <p className="text-blue-600 font-medium mt-2">{listing.time}</p>
          </div>
        ))}
      </div>

      {/* Show More / Close Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleToggle}
          className={`px-6 py-2 text-white font-semibold rounded-lg transition cursor-pointer ${
            showAll
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {showAll ? "Close" : "View More"}
        </button>
      </div>
    </div>
  );
};

// Function to render FontAwesome stars
const renderStars = (rating) => {
  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={` ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
};

export default FeaturedListings;
