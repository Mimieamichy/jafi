import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons"; // Importing FontAwesome Icons

export default function BusinessProfileCard() {
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("businessSignupData"));
    console.log("Fetched Business Data:", storedData);
    if (storedData) {
      setBusinesses([storedData]); // Modify this to load multiple businesses
    }
  }, []);

  if (businesses.length === 0) {
    return <p className="text-center mt-2">No businesses listed yet.</p>;
  }

  return (
    <div>
      <h2 className="text-4xl font-bold text-gray-900 m-3 text-center">
        Listed Businesses
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
        {businesses.map((business, index) => (
          <div
            key={index}
            className=" rounded-lg shadow-md p-4 bg-white transition hover:shadow-lg"
          >
            {/* Image */}
            <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
              <img
                src={
                  business.images?.length > 0 &&
                  business.images[0].startsWith("data:image")
                    ? business.images[0]
                    : "/placeholder.jpg"
                }
                alt={business.companyName}
                className="w-full h-full  rounded-md"
              />
            </div>

            {/* Business Details */}
            <div className="mt-3">
              <h2 className="text-lg font-bold">{business.companyName}</h2>
              <p className="text-gray-600">{business.category}</p>
              <p className="text-gray-800">{business.address}</p>

              {/* Star Rating */}
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < business.rating ? (
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-400"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-gray-300"
                      />
                    )}
                  </span>
                ))}
              </div>

              {/* Opening Time */}
              <p className="text-blue-600 font-semibold mt-2">
                {business.openingTime} - {business.closingTime}
              </p>

              {/* See More Button */}
              <Link
                to={`/business/${business.companyName}`}
                className="mt-2 inline-block text-blue-600 underline"
              >
                See More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
