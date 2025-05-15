// src/components/Overview.jsx
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

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

  const commonHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  };

  const fetchReviewCount = async () => {
    try {
      const res = await fetch(`${baseUrl}/admin/reviews`, {
        headers: commonHeaders,
      });
      const data = await res.json();
      
      setTotalReviews(data.data.length);
      console.log("Review count:", data);
    } catch (err) {
      console.error("Failed to fetch review count", err);
    }
  };


  const fetchUsersCount = async () => {
    try {
      const res = await fetch(`${baseUrl}/admin/users`, {
        headers: commonHeaders,
      });
      const data = await res.json();
       
      setTotalUsers(data.meta.total);
      console.log("users count:", data);
    } catch (err) {
      console.error("Failed to fetch review count", err);
    }
  };


  const fetchReviewersCount = async () => {
    try {
      const res = await fetch(`${baseUrl}/admin/reviewers`, {
        headers: commonHeaders,
      });
      const data = await res.json();
      
      setTotalReviewers(data.meta.total);
      console.log("Reviewers count:", data);
    } catch (err) {
      console.error("Failed to fetch review count", err);
    }
  };


  const fetchBusinessCount = async () => {
    try {
      const res = await fetch(`${baseUrl}/admin/businesses`, {
        headers: commonHeaders,
      });
      const data = await res.json();
      
      setTotalBusinesses(data.meta.total);
      console.log("business count:", data);
    } catch (err) {
      console.error("Failed to fetch review count", err);
    }
  };


  const fetchServiceCount = async () => {
    try {
      const res = await fetch(`${baseUrl}/admin/services`, {
        headers: commonHeaders,
      });
      const data = await res.json();
      
      setTotalServices(data.meta.total);
      console.log("service count:", data);
    } catch (err) {
      console.error("Failed to fetch review count", err);
    }
  };


  const fetchClaimCount = async () => {
    try {
      const res = await fetch(`${baseUrl}/admin/claims`, {
        headers: commonHeaders,
      });
      const data = await res.json();
      
      setNewClaims(data.length);
      console.log("claim count:", data);
    } catch (err) {
      console.error("Failed to fetch review count", err);
    }
  };
  
  useEffect(() => {
  const fetchAll = async () => {
    await Promise.all([
      fetchReviewCount(),
      fetchUsersCount(),
      fetchReviewersCount(),
      fetchBusinessCount(),
      fetchServiceCount(),
      fetchClaimCount(),
    ]);
  };

  fetchAll();
}, []); // ← no fetch functions here


 
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
