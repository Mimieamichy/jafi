import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${baseUrl}/review/`);
        const data = await res.json();
        const sorted = (data.reviews || [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);
        setReviews(sorted);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      }
    };

    fetchReviews();
  }, []);

 

  const handleNavigate = () => navigate("/all-listing");

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
              className="bg-white p-10 rounded-lg shadow-md h-64 flex flex-col items-center justify-center text-center"
            >
              <h3 className="text-lg font-semibold text-black capitalize">
                {review.listingName || review.companyName}
              </h3>
              <p className="text-gray-700 capitalize">
                {review.user?.user_name || review.user_name}
              </p>

              <div className="flex justify-center text-yellow-500 mt-2">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    icon={faStar}
                    key={i}
                    className={
                      i < (review.star_rating || review.rating)
                        ? "text-yellow-500"
                        : "text-gray-300"
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
            onClick={handleNavigate}
            className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Write a Review
          </button>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
