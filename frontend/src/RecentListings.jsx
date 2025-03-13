import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useReviews } from "./context/reviewContext"; // Import global review context
import Car2 from "./assets/car2.jpg";
import Hotel2 from "./assets/hotel2.jpg";
import Gym from "./assets/gym.jpg";
import Mobile from "./assets/phoneShop.jpg";
import Grocery from "./assets/grocery.jpg";
import Tech from "./assets/tech.jpg";
import Goods from "./assets/goods.jpg";
import Restaurant from "./assets/restaurant.jpg";
import Cafe from "./assets/cafe.jpg";

// Sample Listings Data with Categories
const listings = [
  {
    id: 1,
    name: "Luxury Hotel",
    image: Hotel2,
    category: "Hotel",
    address: "123 Main Street, Cityville",
    time: "Open 24/7",
  },
  {
    id: 2,
    name: "Elite Restaurant",
    image: Restaurant,
    category: "Restaurant",
    address: "456 Food Avenue, Townsville",
    time: "10 AM - 11 PM",
  },
  {
    id: 3,
    name: "Smart Electronics",
    image: Mobile,
    category: "Electronics",
    address: "789 Tech Park, Metropolis",
    time: "9 AM - 8 PM",
  },
  {
    id: 4,
    name: "Cozy Café",
    image: Cafe,
    category: "Cafe",
    address: "12 Coffee Lane, Brewtown",
    time: "7 AM - 10 PM",
  },
  {
    id: 5,
    name: "Fitness Club",
    image: Gym,
    category: "Gym",
    address: "100 Gym Street, FitCity",
    time: "5 AM - 11 PM",
  },
  {
    id: 6,
    name: "Tech Gadgets",
    image: Tech,
    category: "Electronics",
    address: "55 Innovation Road, Silicon Valley",
    time: "10 AM - 9 PM",
  },
  {
    id: 7,
    name: "Automotive Hub",
    image: Car2,
    category: "Automotive",
    address: "123 Car Street",
    time: "9 AM - 7 PM",
  },
  {
    id: 8,
    name: "Grocery Market",
    image: Grocery,
    category: "Supermarket",
    address: "789 Food Blvd",
    time: "8 AM - 6 PM",
  },
  {
    id: 9,
    name: "Eco Friendly Goods",
    image: Goods,
    category: "Retail",
    address: "303 Green Way",
    time: "9 AM - 7 PM",
  },
];

const categories = [
  "All",
  "Hotel",
  "Restaurant",
  "Electronics",
  "Cafe",
  "Gym",
  "Automotive",
  "Supermarket",
  "Retail",
];
const ITEMS_PER_PAGE = 4;

const RecentListings = () => {
  const { addReview } = useReviews();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [formData, setFormData] = useState({
    name: "",
    comment: "",
    rating: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered Listings by Category
  const filteredListings =
    selectedCategory === "All"
      ? listings
      : listings.filter((item) => item.category === selectedCategory);
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const currentListings = filteredListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.comment || formData.rating === 0) return;

    addReview({
      id: Date.now(),
      name: formData.name,
      product: selectedProduct,
      rating: formData.rating,
      comment: formData.comment,
    });

    setFormData({ name: "", comment: "", rating: 0 });
    setSelectedProduct(null);
  };

  return (
    <div className="p-6 mt-5 flex">
      {/* Sidebar for Categories */}
      <div className="w-1/8 bg-white p-4 rounded-lg shadow-md h-fit">
        <h3 className="text-xl font-bold mb-3">Categories</h3>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category}>
              <button
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Listings */}
      <div className="w-3/4 pl-6">
        <h2 className="text-2xl font-bold mb-4">Recent Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {currentListings.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="text-lg font-semibold mt-2">{item.name}</h3>
              <p className="text-gray-500">{item.address}</p>
              <p className="text-gray-500">Open: {item.time}</p>
              <p className="text-sm font-semibold text-gray-700 mt-2">
                Category: {item.category}
              </p>
              <button
                onClick={() => setSelectedProduct(item.name)}
                className="mt-3 px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-lg"
              >
                Write a Review
              </button>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-600 text-white cursor-pointer rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-blue-100 rounded-lg">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Review Form */}
      {selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-2">
              Review {selectedProduct}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Your Name"
                className="p-2 border rounded-md capitalize"
                required
              />
              <textarea
                name="comment"
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                placeholder="Your Review"
                rows="3"
                className="p-2 border rounded-md capitalize"
                required
              />
              <div className="flex space-x-2 text-yellow-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesomeIcon
                    key={star}
                    icon={faStar}
                    className={`text-2xl cursor-pointer ${
                      star <= formData.rating
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                    onClick={() => setFormData({ ...formData, rating: star })}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentListings;
