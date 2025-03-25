import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useReviews } from "../context/reviewContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useNavigate } from "react-router-dom";

const CustomerReviews = () => {
  const { reviews } = useReviews();
  const [allReviews, setAllReviews] = useState(reviews);
  const navigate = useNavigate();

  useEffect(() => {
    const storedReviews =
      JSON.parse(localStorage.getItem("businessReviews")) || [];
    setAllReviews([...reviews, ...storedReviews]);
  }, [reviews]);

  const handleNavigate = () => {
    navigate("/bus-profile");
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
          {allReviews.map((review, index) => (
            <SwiperSlide
              key={index}
              className="bg-white p-10 rounded-lg shadow-md h-64 flex flex-col justify-between"
            >

              <h3 className="text-lg font-semibold text-black capitalize">{review.companyName}</h3>
              <p className="text-gray-700 capitalize">{review.name}</p>
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
            onClick={handleNavigate}
            className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700 transition cursor-pointer"
          >
            Write a Review
          </button>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
