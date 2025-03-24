import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faEdit,
  faStar,
  faSignOutAlt,
  faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [business, setBusiness] = useState(null);

  // Load business data from localStorage
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("businessSignupData"));
    if (storedData) {
      setBusiness(storedData);
    }
  }, []);

  if (!business) {
    return (
      <p className="text-center mt-5 text-gray-600">
        No business found. Please sign up.
      </p>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-5">
        <h2 className="text-2xl font-bold mb-6">Business Dashboard</h2>
        <ul>
          <li className="mb-3">
            <button
              onClick={() => setActiveTab("overview")}
              className="w-full flex items-center p-2 hover:bg-gray-700 rounded"
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" /> Overview
            </button>
          </li>
          <li className="mb-3">
            <button
              onClick={() => setActiveTab("edit")}
              className="w-full flex items-center p-2 hover:bg-gray-700 rounded"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit Business
            </button>
          </li>
          <li className="mb-3">
            <button
              onClick={() => setActiveTab("reviews")}
              className="w-full flex items-center p-2 hover:bg-gray-700 rounded"
            >
              <FontAwesomeIcon icon={faStar} className="mr-2" /> Reviews
            </button>
          </li>
          <li className="mb-3">
            <button
              onClick={() => setActiveTab("subscription")}
              className="w-full flex items-center p-2 hover:bg-gray-700 rounded"
            >
              <FontAwesomeIcon icon={faMoneyBill} className="mr-2" />{" "}
              Subscription
            </button>
          </li>
          <li className="mt-6">
            <button className="w-full flex items-center p-2 bg-red-600 hover:bg-red-700 rounded">
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-3xl font-semibold mb-4">Business Overview</h2>
            <div className="bg-white p-5 rounded shadow-md">
              <h3 className="text-xl font-bold">{business.companyName}</h3>
              <p className="text-gray-600">{business.category}</p>
              <p className="text-gray-800">{business.address}</p>
              <p className="mt-3 text-gray-700">
                Phone: <span className="font-semibold">{business.phone}</span>
              </p>
              <p className="mt-2 text-blue-600 font-semibold">
                {business.openingTime} - {business.closingTime}
              </p>
              <p className="mt-2 text-gray-700">
                Open on:{" "}
                <span className="font-semibold">
                  {business.openingDays.join(", ")}
                </span>
              </p>
            </div>
          </div>
        )}

        {activeTab === "edit" && (
          <div>
            <h2 className="text-3xl font-semibold mb-4">
              Edit Business Details
            </h2>
            <div className="bg-white p-5 rounded shadow-md">
              <input
                type="text"
                className="border w-full p-2 mb-3"
                defaultValue={business.companyName}
              />
              <input
                type="text"
                className="border w-full p-2 mb-3"
                defaultValue={business.category}
              />
              <input
                type="text"
                className="border w-full p-2 mb-3"
                defaultValue={business.address}
              />
              <input
                type="text"
                className="border w-full p-2 mb-3"
                defaultValue={business.phone}
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <h2 className="text-3xl font-semibold mb-4">Customer Reviews</h2>
            <p className="text-gray-600">No reviews yet.</p>
          </div>
        )}

        {activeTab === "subscription" && (
          <div>
            <h2 className="text-3xl font-semibold mb-4">Subscription Plan</h2>
            <div className="bg-white p-5 rounded shadow-md">
              <p className="text-gray-700">
                Plan: <strong>1 Month - $150</strong>
              </p>
              <button className="bg-green-600 text-white px-4 py-2 mt-3 rounded">
                Upgrade Plan
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
