// src/components/Overview.jsx
import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";

const getFormattedDate = () => {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date().toLocaleDateString(undefined, options);
};

const Overview = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalReviewers, setTotalReviewers] = useState(0);
  const [newClaims, setNewClaims] = useState(0);

  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const authToken = localStorage.getItem("userToken") || "";
  const decodedToken = authToken ? jwtDecode(authToken) : {};
  const [currentDate, setCurrentDate] = useState(getFormattedDate());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(getFormattedDate());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!authToken) return;
  
    const commonHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };
  
    const fetchCount = async (url, nestedKey, setter) => {
      try {
        const res  = await fetch(url, { headers: commonHeaders });
        const json = await res.json();
        console.log(`payload for ${url}:`, json);
    
        // 1) If the key lives at top-level:
        if (nestedKey && Array.isArray(json[nestedKey])) {
          return setter(json[nestedKey].length);
        }
    
        // 2) If your paginated endpoints use json.meta.total:
        if (typeof json.meta?.total === "number") {
          return setter(json.meta.total);
        }
    
        // 3) If you’ve got json.data as an array:
        if (Array.isArray(json.data)) {
          return setter(json.data.length);
        }
    
        // 4) Or json.data[nestedKey]:
        const nestedArr = json.data?.[nestedKey];
        if (Array.isArray(nestedArr)) {
          return setter(nestedArr.length);
        }
    
        return setter(0);
      } catch (err) {
        console.error(`Error fetching ${url}:`, err);
        setter(0);
      }
    };
    
  
    // users, businesses & services all return data: [] or meta.total
    fetchCount(`${baseUrl}/admin/users`,    null, setTotalUsers);
    fetchCount(`${baseUrl}/admin/businesses`,null, setTotalBusinesses);
    fetchCount(`${baseUrl}/admin/services`, null, setTotalServices);
    // reviewers endpoint likely same shape
    fetchCount(`${baseUrl}/admin/reviewers`,null, setTotalReviewers);
    // reviews & claims need their nestedKey
    fetchCount(`${baseUrl}/admin/reviews`, "reviews", setTotalReviews);
    fetchCount(`${baseUrl}/admin/claims`,  "claims",  setNewClaims);
    
  }, [baseUrl, authToken]);
  
  return (
    <div className="space-y-6 p-4">
      {/* Overview header */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <p className="text-gray-900 font-black text-xl">JAFI's OVERVIEW</p>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded">
              {totalReviews} Reviews
            </button>
            {/* replace newClaims with API-driven value when ready */}
            <button className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
           {newClaims > 1 ? `${newClaims} Claims` : `${newClaims} Claim`}
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
            <span className="font-semibold">{totalReviewers} Reviewers</span>
          </div>
        </div>
      </div>

      {/* Admin details */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-4 shadow rounded">
          <p className="text-sm text-gray-500">Admin Name</p>
          <p className="text-lg font-semibold capitalize">
            {decodedToken.name}
          </p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <p className="text-sm text-gray-500">Role</p>
          <p className="text-lg font-semibold capitalize">
            {decodedToken.role}
          </p>
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
