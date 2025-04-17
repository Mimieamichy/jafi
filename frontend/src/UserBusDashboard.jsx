import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
// Import star icons
import { faStar as solidStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

export default function DashboardSection({
  formData,
  profileImage,
  reviewsCount,
  newReviewNotification,
  newReviewCount,
  handleNotificationClick,
}) {
  // Debug: log the backend rating
  

  // Helper function to render the star rating.
  // It treats any non-zero decimal as a half star.
  const renderStars = (rating) => {
    const numericRating = parseFloat(rating);
    if (isNaN(numericRating)) {
      console.error("Invalid star rating:", rating);
      return null;
    }

    // Calculate full stars (integer part)
    const fullStars = Math.floor(numericRating);
    // If the rating is not exactly an integer, we display one half star.
    const hasHalfStar = numericRating - fullStars !== 0;
    // Total stars must always be 5.
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    console.log(
      "Parsed Rating:",
      numericRating,
      "Full:",
      fullStars,
      "Has Half:",
      hasHalfStar,
      "Empty:",
      emptyStars
    );

    return (
      <div className="flex justify-center space-x-1 text-yellow-400 mt-1">
        {Array.from({ length: fullStars }).map((_, idx) => (
          <FontAwesomeIcon icon={solidStar} key={`full-${idx}`} />
        ))}
        {hasHalfStar && <FontAwesomeIcon icon={faStarHalfAlt} />}
        {Array.from({ length: emptyStars }).map((_, idx) => (
          <FontAwesomeIcon icon={regularStar} key={`empty-${idx}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-6">
      {formData ? (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Top Blue Bar */}
          <div className="h-12 bg-blue-600"></div>
          <div className="p-6">
            {/* Notification Icon */}
            <div className="flex justify-between items-center mb-4">
              <div className="bg-blue-100 text-blue-600 px-3 py-1 hover:bg-blue-600 hover:text-blue-100 rounded-full text-sm font-medium">
                {newReviewNotification ? (
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={handleNotificationClick}
                  >
                    <FontAwesomeIcon icon={faBell} className="mr-1" />
                    <span>{newReviewCount}</span>
                  </div>
                ) : (
                  <FontAwesomeIcon icon={faBell} />
                )}
              </div>
            </div>

            {/* Profile Image */}
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-2xl font-bold text-gray-600 capitalize">
                    {formData.name ? formData.name.charAt(0) : "?"}
                  </div>
                )}
              </div>
            </div>

            {/* Service Details */}
            <h2 className="text-center text-2xl font-bold text-gray-800 capitalize mb-1">
              {formData.name || "Business Name"}
            </h2>
            <h3 className="text-center text-lg text-gray-600 mb-2">
              {formData.email || "Email"}
            </h3>
            <p className="text-center text-gray-500 mb-1">
              {formData.category || "Category"}
            </p>
            {/* Render Star Rating below the category */}
            {renderStars(formData.average_rating)}

            {/* Total Reviews */}
            <div className="bg-gray-900 text-white rounded-md py-3 px-4 flex justify-center items-center mt-4">
              <span className="mr-2">Total Reviews</span>
              <span className="bg-blue-600 text-white px-2 py-0.5 text-xs rounded">
                {reviewsCount || 0}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      )}
    </div>
  );
}
