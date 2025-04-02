import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faClock,
  faCalendar,
  faGlobe,
  faLocationDot,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faLinkedin,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function BusinessPage() {
  const { businessName } = useParams();
  const [business, setBusiness] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    product: "",
    rating: 0,
    comment: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("businessSignupData"));
    if (storedData && storedData.companyName === businessName) {
      setBusiness(storedData);
    }
  }, [businessName]);

  if (!business) {
    return <p className="text-center text-gray-600">Business not found.</p>;
  }

  // Carousel settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  // Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleLogout = () => {
    navigate("/reviewer");
  };

  // Handle star rating click
  const handleStarClick = (index) => {
    setFormData({ ...formData, rating: index + 1 });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Get existing reviews from localStorage or initialize an empty array
    const existingReviews =
      JSON.parse(localStorage.getItem("businessReviews")) || [];

    // Retrieve user role from localStorage
   // Default role if not set

    // Create a new review object with the business name and user role
    const newReview = {
      companyName: business.companyName,
      name: formData.name,
      rating: formData.rating,
      comment: formData.comment,
       // Store user role in the review
    };

    // Update the reviews array
    const updatedReviews = [...existingReviews, newReview];

    // Save updated reviews back to localStorage
    localStorage.setItem("businessReviews", JSON.stringify(updatedReviews));

    // Reset form and close modal
    setFormData({ name: "", rating: 0, comment: "" });
    setShowReviewForm(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Image Slider */}
      <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
        <Slider {...settings}>
          {business.images?.length > 0 ? (
            business.images.map((img, index) => (
              <div
                key={index}
                className="w-full h-55 flex items-center justify-center"
              >
                <img
                  src={img}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full  rounded-md"
                />
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center h-full">
              <p>No images available</p>
            </div>
          )}
        </Slider>
      </div>

      {/* Business Info */}
      <div className="mt-6">
        <h1 className="text-3xl font-bold">{business.companyName}</h1>
        <p className="text-gray-600 m-2"> {business.category}</p>
        <p className="text-gray-800 m-2">
          <FontAwesomeIcon icon={faEnvelope} className="text-blue-500 pr-2" />
          {business.email}
        </p>
        <p className="text-gray-800 m-2">
          <FontAwesomeIcon icon={faPhone} className="text-yellow-500 pr-2" />
          {business.phone}
        </p>
        <p className="text-gray-800 m-2">
          <FontAwesomeIcon icon={faLocationDot} className="text-red-500 pr-2" />
          {business.address}
        </p>

        {/* Opening & Closing Time */}
        <p className="m-2">
          <FontAwesomeIcon icon={faClock} className="text-blue-500 pr-2" />
          Opening Time:
          <span className="font-semibold text-gray-800 p-3">
            {business.openingTime} - {business.closingTime}
          </span>
        </p>

        {/* Opening Days */}
        <p className="m-2">
          <FontAwesomeIcon icon={faCalendar} className="text-green-500 pr-2" />
          Opening Days:
          <span className="font-semibold text-gray-800 p-3">
            {business.openingDays?.join(", ") || "Not specified"}
          </span>
        </p>

        {/* Star Rating */}
        <div className="flex items-center mt-2">
          <p className="p-2">Rating:</p>
          {[...Array(5)].map((_, i) => (
            <FontAwesomeIcon
              key={i}
              icon={faStar}
              className={
                i < business.rating ? "text-yellow-400" : "text-gray-300"
              }
            />
          ))}
        </div>

        {/* Description */}
        <p className="mt-4 p-4   text-gray-700 bg-gray-100">
          {business.description}
        </p>

        {/* Social Media Links & Write a Review Button */}
        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="font-semibold">Visit us @:</p>
            <div className="flex space-x-4">
              {business.socialLinks?.facebook && (
                <a
                  href={business.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  <FontAwesomeIcon
                    icon={faFacebook}
                    className="text-blue-500"
                  />
                </a>
              )}
              {business.socialLinks?.linkedin && (
                <a
                  href={business.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  <FontAwesomeIcon
                    icon={faLinkedin}
                    className="text-blue-500"
                  />
                </a>
              )}
              {business.socialLinks?.twitter && (
                <a
                  href={business.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  <FontAwesomeIcon icon={faXTwitter} className="text-black" />
                </a>
              )}
              {business.socialLinks?.website && (
                <a
                  href={business.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  <FontAwesomeIcon
                    icon={faGlobe}
                    className="text-green-500 pr-2"
                  />
                </a>
              )}
            </div>
          </div>

          {/* Write a Review Button */}
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-6 py-2 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700 transition cursor-pointer"
          >
            Write a Review
          </button>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 flex items-center mt-15 justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              {/* Company Name (Read-Only) */}
              <input
                type="text"
                name="companyName"
                value={business.companyName}
                readOnly
                className="p-3 border rounded-md bg-gray-200 text-gray-600"
              />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                className="p-3 border rounded-md focus:ring focus:ring-blue-300 capitalize"
              />

              {/* Star Rating */}
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
                onClick={handleLogout}
                className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700 transition cursor-pointer"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition cursor-pointer"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
