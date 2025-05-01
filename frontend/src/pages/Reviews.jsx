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
        console.log("Fetched reviews:", data.data);

        const sorted = (data.data || [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);
        setReviews(sorted);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      }
    };

    fetchReviews();
  }, []);

  const handleReviewCardClick = (id, listingType) => {
    // Navigate to the appropriate route based on listingType (either service or business)
    if (listingType === "service") {
      navigate(`/hire/${id}`);
    } else if (listingType === "business") {
      navigate(`/business/${id}`);
    }
  };

  const handleNameNavigate = (userId) => {
    navigate(`/reveiwerPage/${userId}`);
  };

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
              className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center h-auto cursor-pointer"
            >
              {/* Review details */}
              <div className="w-full mb-4 flex-grow">
                <h3
                  className="text-lg font-semibold text-black capitalize"
                  onClick={() =>
                    handleReviewCardClick(review.listing.id, review.listingType)
                  }
                >
                  {review.listingName}
                </h3>
                <p
                  className="text-gray-700 capitalize"
                  onClick={() => handleNameNavigate(review.userId)}
                >
                  {review.user?.user_name || review.user_name}
                </p>
                <div className="flex justify-center text-yellow-500 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
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
              </div>

              {/* Nested Swiper for review images */}
              {review.images && review.images.length > 0 ? (
                <Swiper
                  modules={[Pagination, Autoplay]}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  loop={true}
                  className="w-full mt-4"
                >
                  {review.images.map((imgUrl, idx) => (
                    <SwiperSlide key={idx}>
                      <img
                        src={imgUrl}
                        alt={`Review image ${idx}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-lg">
                  <p className="text-gray-500">No images available</p>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Button to navigate to the All Listings page */}
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
