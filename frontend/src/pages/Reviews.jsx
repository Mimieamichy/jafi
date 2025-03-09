import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const initialReviews = [
  {
    id: 1,
    name: "John Doe",
    rating: 4,
    comment: "Great service! The process was smooth and very professional.",
  },
  {
    id: 2,
    name: "Jane Smith",
    rating: 5,
    comment: "Absolutely amazing experience! Highly recommend.",
  },
  {
    id: 3,
    name: "Alex Johnson",
    rating: 3,
    comment: "Good service, but there’s room for improvement.",
  },
  {
    id: 4,
    name: "Alex Johnson",
    rating: 4,
    comment: "Good service, but there’s room for improvement.",
  },
  {
    id: 5,
    name: "Alex Johnson",
    rating: 3,
    comment: "Good service, but there’s room for improvement.",
  },
  {
    id: 6,
    name: "Alex Johnson",
    rating: 3,
    comment: "Good service, but there’s room for improvement.",
  },
];

// Review Card Component
const ReviewCard = ({ name, rating, comment }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <h3 className="text-lg font-semibold">{name}</h3>

      {/* Star Rating */}
      <div className="flex justify-center text-yellow-500 mt-2">
        {[...Array(5)].map((_, i) => (
          <FontAwesomeIcon
            key={i}
            icon={faStar}
            className={`text-xl ${
              i < rating ? "text-yellow-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>

      <p className="text-gray-600 mt-3">{comment}</p>
    </div>
  );
};
// Main Component
const CustomerReviews = () => {
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comment: "",
    rating: 0, // Default rating is 0
  });

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Star Click
  const handleStarClick = (index) => {
    setFormData({ ...formData, rating: index + 1 });
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.comment && formData.rating > 0) {
      const newReview = {
        id: reviews.length + 1,
        name: formData.name,
        rating: formData.rating,
        comment: formData.comment,
      };
      setReviews([newReview, ...reviews]); // Add new review
      setFormData({ name: "", email: "", comment: "", rating: 0 }); // Reset form
      setShowForm(false); // Hide form
    }
  };

  return (
    <section className="bg-gray-100 py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          What Our Customers Say
        </h2>

        {/* Reviews Grid */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={true}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="relative mt-8"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id}>
              <ReviewCard {...review} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Write a Review Button */}
        <div className="mt-10">
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Write a Review
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="mt-10 bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Write a Review
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="p-3 border rounded-md focus:ring focus:ring-blue-300 capitalize"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email (optional)"
                className="p-3 border rounded-md focus:ring focus:ring-blue-300"
              />

              {/* Star Rating Input */}
              <div className="flex justify-center space-x-2 text-yellow-500 mt-2">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className={`text-2xl cursor-pointer transition ${
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
                className="p-3 border rounded-md focus:ring focus:ring-blue-300 capitalize"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700 transition"
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
