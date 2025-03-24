import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faHome,
  faEdit,
  faStar,
  faSignOutAlt,
  faMoneyBill,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [business, setBusiness] = useState(null);
  const [formData, setFormData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate()
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("businessSignupData"));
    if (storedData) {
      setBusiness(storedData);
      setFormData(storedData);
    }
  }, []);
  const handleSignOut = () => {
    navigate("/");
  };
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth < 768) {
      setSidebarOpen(false); // Close sidebar on mobile
    }
  };
  const handleDaysChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      openingDays: checked
        ? [...prev.openingDays, value]
        : prev.openingDays.filter((day) => day !== value),
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-22 left-4  text-gray-900 md:hidden"
      >
        <FontAwesomeIcon
          icon={sidebarOpen ? faTimes : faBars}
          className="text-2xl"
        />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 bg-gray-900 text-white p-5 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:translate-x-0 md:flex-shrink-0`}
      >
        <h2 className="text-2xl font-bold mb-6">Business Dashboard</h2>
        <ul>
          <li className="mb-3">
            <button
              onClick={() => handleTabClick("overview")}
              className="w-full flex items-center p-2 hover:bg-gray-700 rounded"
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" /> Overview
            </button>
          </li>
          <li className="mb-3">
            <button
              onClick={() => handleTabClick("edit")}
              className="w-full flex items-center p-2 hover:bg-gray-700 rounded"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit Business
            </button>
          </li>
          <li className="mb-3">
            <button
              onClick={() => handleTabClick("reviews")}
              className="w-full flex items-center p-2 hover:bg-gray-700 rounded"
            >
              <FontAwesomeIcon icon={faStar} className="mr-2" /> Reviews
            </button>
          </li>
          <li className="mb-3">
            <button
              onClick={() => handleTabClick("subscription")}
              className="w-full flex items-center p-2 hover:bg-gray-700 rounded"
            >
              <FontAwesomeIcon icon={faMoneyBill} className="mr-2" />{" "}
              Subscription
            </button>
          </li>
          <li className="mt-6">
            <button onClick={handleSignOut} className="w-full flex items-center p-2 bg-red-600 hover:bg-red-700 rounded">
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-2 ">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-3xl font-semibold mb-4 text-center">
              Business Overview
            </h2>
            <div className="bg-white p-5 rounded shadow-md">
              <h3 className="text-xl font-bold">{business?.companyName}</h3>
              <p className="text-gray-600">{business?.category}</p>
              <p className="text-gray-800">{business?.address}</p>
              <p className="mt-3 text-gray-700">
                Phone: <span className="font-semibold">{business?.phone}</span>
              </p>
              <p className="mt-2 text-blue-600 font-semibold">
                {business?.openingTime} - {business?.closingTime}
              </p>
              <p className="mt-2 text-gray-700">
                Open on:{" "}
                <span className="font-semibold">
                  {business?.openingDays?.join(", ")}
                </span>
              </p>
            </div>
          </div>
        )}

        {activeTab === "edit" && (
          <div>
            <h2 className="text-3xl font-semibold mb-4 text-center">
              Edit Business Details
            </h2>
            <div className="bg-white p-5 rounded shadow-md">
              <div className="mb-4">
                <label className="font-semibold">Address:</label>
                <input
                  type="text"
                  name="address"
                  value={formData?.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>

              <div className="mb-4">
                <label className="font-semibold">Phone:</label>
                <input
                  type="type"
                  maxlength="11"
                  name="phone"
                  value={formData?.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>

              <div className="mb-4 flex flex-col md:flex-row md:justify-between">
                <div className="md:w-1/2 md:pr-2">
                  <label className="font-semibold">Opening Time:</label>
                  <input
                    type="time"
                    name="openingTime"
                    value={formData?.openingTime}
                    onChange={(e) =>
                      setFormData({ ...formData, openingTime: e.target.value })
                    }
                    className="border p-2 w-full rounded"
                  />
                </div>
                <div className="md:w-1/2 md:pl-2">
                  <label className="font-semibold">Closing Time:</label>
                  <input
                    type="time"
                    name="closingTime"
                    value={formData?.closingTime}
                    onChange={(e) =>
                      setFormData({ ...formData, closingTime: e.target.value })
                    }
                    className="border p-2 w-full rounded"
                  />
                </div>
              </div>

              <div className="mb-4">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <label key={day} className="flex items-center gap-2 ">
                    <input
                      type="checkbox"
                      value={day}
                      checked={formData.openingDays?.includes(day)}
                      onChange={handleDaysChange}
                    />
                    {day}
                  </label>
                ))}
              </div>

              <button
                onClick={() => setBusiness(formData)}
                className="bg-green-600 text-white py-2 px-4 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <h2 className="text-3xl font-semibold mb-4 text-center">
              Customer Reviews
            </h2>
            <p className="text-gray-600">No reviews yet.</p>
          </div>
        )}

        {activeTab === "subscription" && (
          <div>
            <h2 className="text-3xl font-semibold mb-4 text-center">
              Subscription Plan
            </h2>
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
