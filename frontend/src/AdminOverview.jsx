// src/components/Overview.jsx
import React, { useEffect, useState } from "react";


const getFormattedDate = () => {
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return new Date().toLocaleDateString(undefined, options);
};

const Overview = () => {
  // Define state for totals
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  // totalReviewers will be updated later when API becomes available

  // Hardcoded details
  const adminName = "Admin Name";
  const email = "admin@example.com";
  
  const newClaims = 5; // corresponds to "Diventa cliente"

  // Change this as needed for your API
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  const [currentDate, setCurrentDate] = useState(getFormattedDate());

  useEffect(() => {
    // Update the date every minute to ensure it stays current
    const interval = setInterval(() => {
      setCurrentDate(getFormattedDate());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch API data on mount
  useEffect(() => {
    // Fetch total users
    fetch(`${baseUrl}/admin/users`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Users data:", data); // Debugging line to check the response
        
        // Adjust data extraction per your API response structure.
        setTotalUsers(data.users.length || 0);
      })
      .catch((error) => console.error("Error fetching users:", error));

    // Fetch total businesses
    fetch(`${baseUrl}/admin/businesses`)
      .then((res) => res.json())
      .then((data) => {
        console.log("bus data:", data);
        setTotalBusinesses(data.businesses.length || 0);
      })
      .catch((error) => console.error("Error fetching businesses:", error));

    // Fetch total services
    fetch(`${baseUrl}/admin/services`)
      .then((res) => res.json())
      .then((data) => {
        console.log("ser data:", data);
        setTotalServices(data.services.length || 0);
      })
      .catch((error) => console.error("Error fetching services:", error));

    // Fetch total reviews
    fetch(`${baseUrl}/admin/reviews`)
      .then((res) => res.json())
      .then((data) => {
        console.log("rev data:", data);
        setTotalReviews(data.reviews.length || 0);
      })
      .catch((error) => console.error("Error fetching reviews:", error));
  }, [baseUrl]);

  

  return (
    <div className="space-y-6  p-4">
      {/* Pipeline section */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <p className="text-gray-900 font-black text-xl">JAFI's OVERVIEW</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded">
            {totalReviews} Reviews 
            </button>
            <button className="bg-blue-100 text-blue-600 px-2 py-1 rounded flex items-center">
             

              {newClaims} New Claims
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm mt-2">
          <div className="flex-1 text-center bg-blue-100 p-2 rounded">
            <span className="font-semibold">{totalUsers} Users</span>
          </div>
          <div className="flex-1 text-center bg-blue-100 p-2 rounded">
            <span className="font-semibold">{totalBusinesses} Businesses</span>
          </div>
          <div className="flex-1 text-center bg-blue-100 p-2 rounded">
            <span className="font-semibold">{totalServices} Services</span>
          </div>
          <div className="flex-1 text-center bg-blue-100 p-2 rounded">
            <span className="font-semibold">
              {/* Placeholder for when API is available */}
              {0} Reviewers
            </span>
          </div>
        </div>
      </div>

      {/* Additional cards for admin details */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-4 shadow rounded">
          <p className="text-sm text-gray-500">Admin Name</p>
          <p className="text-lg font-semibold">{adminName}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-lg font-semibold">{email}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <p className="text-sm text-gray-500">Date</p>
          <p className="text-lg font-semibold">{currentDate}</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
