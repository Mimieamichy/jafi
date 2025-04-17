import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
const REVIEWS_PER_PAGE = 6;
const baseUrl = import.meta.env.VITE_BACKEND_URL;

const ReviewCard = ({
  id,
  user_name,
  listingName,
  star_rating,
  comment,
  createdAt,
  images,
  type,
  onImageClick,
  reply,
  onReplyClick,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = comment.length > 150;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col justify-between h-full cursor-pointer">
      <div>
        <h3 className="text-lg font-semibold text-black capitalize">
          {listingName || ""}
        </h3>
        <p className="text-gray-700 capitalize">{user_name || ""}</p>
        <div className="flex justify-center text-yellow-500 mt-2">
          {[...Array(5)].map((_, i) => (
            <FontAwesomeIcon
              key={i}
              icon={faStar}
              className={`text-xl ${
                i < (star_rating || 0) ? "text-yellow-500" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-gray-600 mt-3">
          {expanded || !isLong ? comment : comment.slice(0, 150) + "..."}
        </p>
        {isLong && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            className="mt-1 text-blue-600 text-sm font-medium hover:underline"
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        )}
        {images && images.length > 0 && (
          <img
            src={images[0]}
            alt="Review Thumbnail"
            className="mt-4 w-full h-40 object-cover rounded"
            onClick={(e) => {
              e.stopPropagation();
              onImageClick(images, id, type);
            }}
          />
        )}
      </div>

      {/* Bottom row: replies (left) + timestamp (right) */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
        {reply && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReplyClick(reply);
            }}
            className="text-blue-700 hover:underline flex items-center gap-1"
          >
            <span className="text-base"></span> view reply
          </button>
        )}
        <p className="text-xs text-gray-400">
          {new Date(createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default function PaginatedReviews() {
  const [allReviews, setAllReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReply, setSelectedReply] = useState("");

  // const [modalReviewId, setModalReviewId] = useState(null);
  // const [modalReviewType, setModalReviewType] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${baseUrl}/review/`);
        const data = await res.json();
        console.log("Fetched reviews:", data);

        const sorted = data.reviews
          ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);
        setAllReviews(sorted || []);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      }
    };
    fetchReviews();
  }, []);

  const openReplyModal = (replyText) => {
    setSelectedReply(replyText);
    setReplyModalOpen(true);
  };

  const closeReplyModal = () => {
    setSelectedReply("");
    setReplyModalOpen(false);
  };

  const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);
  const currentReviews = allReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // When a review card is clicked, if there are images, open modal to show a larger view with slide navigation.
  const openImageModal = (images) => {
    if (images && images.length > 0) {
      setModalImages(images);

      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImages([]);
  };

  return (
    <section className="bg-gray-100 py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">All Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {currentReviews.map((review, index) => (
            <ReviewCard
              key={review.id || index}
              {...review}
              onImageClick={openImageModal}
              onReplyClick={openReplyModal}
            />
          ))}
        </div>
        {/* Pagination Controls */}
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 rounded-md disabled:bg-gray-300 text-white cursor-pointer"
          >
            Prev
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 bg-blue-600 rounded-md disabled:bg-gray-300 text-white cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
      {/* Modal for full-size image preview and swipe navigation */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
          <div className="relative bg-gray-900 rounded-lg p-4 w-full max-w-3xl">
            <button
              onClick={closeModal}
              className="absolute top-1 right-1 text-white text-3xl font-black"
            >
              &times;
            </button>
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={true}
              className="mt-4"
            >
              {modalImages.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <img
                    src={img}
                    alt={`Review image ${idx}`}
                    className="w-full md:object-cover h-[80vh] object-contain rounded-lg"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      {replyModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full p-6 rounded-lg shadow-lg relative">
            <button
              onClick={closeReplyModal}
              className="absolute top-2 right-3 text-2xl text-gray-500 font-bold"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">Reply</h3>
            <p className="text-gray-800 whitespace-pre-line">{selectedReply}</p>
          </div>
        </div>
      )}
    </section>
  );
}
