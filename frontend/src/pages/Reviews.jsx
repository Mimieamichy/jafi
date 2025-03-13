import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useReviews } from "../context/reviewContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const categories = [
  "Hotel",
  "Restaurant",
  "Electronics",
  "Cafe",
  "Gym",
  "Grocery",
  "Tech",
]; // Predefined Categories

const productsByCategory = {
  Hotel: ["Luxury Hotel"],
  Restaurant: ["Elite Restaurant"],
  Electronics: ["Smart Electronics", "Tech Gadgets"],
  Cafe: ["Cozy Café"],
  Gym: ["Fitness Club"],
  Grocery: ["Grocery Market"],
  Tech: ["Automotive Hub", "Eco Friendly Goods"],
};

const CustomerReviews = () => {
  const { reviews, addReview } = useReviews();
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    product: "",
    comment: "",
    rating: 0,
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === "category") {
      setSelectedCategory(e.target.value);
      setFormData((prev) => ({ ...prev, product: "" })); // Reset product selection
    }
  };

  // Handle Star Rating
  const handleStarClick = (index) => {
    setFormData({ ...formData, rating: index + 1 });
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.category ||
      !formData.product ||
      !formData.comment ||
      formData.rating === 0
    )
      return;

    addReview({
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      product: formData.product,
      rating: formData.rating,
      comment: formData.comment,
    });

    setFormData({
      name: "",
      category: "",
      product: "",
      comment: "",
      rating: 0,
    });
    setShowForm(false);
  };

  return (
    <section className="bg-gray-100 py-12 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          What Customers Say
        </h2>

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="mt-8"
        >
          {reviews.map((review) => (
            <SwiperSlide
              key={review.id}
              className="bg-white p-10 rounded-lg shadow-md h-64 flex flex-col justify-between"
            >
              <h3 className="text-lg font-semibold">{review.product}</h3>
              <p className="text-gray-700">{review.name}</p>
              <div className="flex justify-center text-yellow-500 mt-2">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    icon={faStar}
                    key={i}
                    className={
                      i < review.rating ? "text-yellow-500" : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <p className="text-gray-600 mt-3 break-words overflow-hidden text-ellipsis max-w-full">
                {review.comment.length > 25
                  ? review.comment.substring(0, 25) + "..."
                  : review.comment}
              </p>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Write a Review Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700 transition cursor-pointer"
          >
            Write a Review
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2">Write a Review</h3>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                className="p-3 border rounded-md focus:ring focus:ring-blue-300 capitalize"
              />

              {/* Category Dropdown */}
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="p-3 border rounded-md focus:ring focus:ring-blue-300 capitalize"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Product Dropdown - Only Shows Products Based on Selected Category */}
              <select
                name="product"
                value={formData.product}
                onChange={handleChange}
                required
                disabled={!selectedCategory}
                className="p-3 border rounded-md focus:ring focus:ring-blue-300 capitalize"
              >
                <option value="">Select Product</option>
                {selectedCategory &&
                  productsByCategory[selectedCategory]?.map((product) => (
                    <option key={product} value={product}>
                      {product}
                    </option>
                  ))}
              </select>

              {/* Star Rating Input */}
              <div className="flex justify-center space-x-2 text-yellow-500 mt-2">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className={`text-2xl cursor-pointer ${
                      i < formData.rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                    onClick={() => handleStarClick(i)}
                  />
                ))}
              </div>

              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Your Review"
                rows="4"
                required
                className="p-3 border rounded-md focus:ring focus:ring-blue-300 capitalize"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700 transition cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomerReviews;
