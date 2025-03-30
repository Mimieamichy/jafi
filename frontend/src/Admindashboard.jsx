import { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Transactions from "./Transactions";
import Users from "./AminUsers";
import Businesses from "./AdminListedBus";
import Hirings from "./AdminHiring";
import Reviews from "./AdminReviews";
import Settings from "./AdminSettings";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("businesses");

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white p-5">
        <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>

        <nav className="space-y-3">
          <Link
            to="/admin/businesses"
            className={`block p-2 rounded ${
              activeTab === "businesses" ? "bg-blue-500" : ""
            }`}
            onClick={() => setActiveTab("businesses")}
          >
            Businesses
          </Link>
          <Link
            to="/admin/hirings"
            className={`block p-2 rounded ${
              activeTab === "hirings" ? "bg-blue-500" : ""
            }`}
            onClick={() => setActiveTab("hirings")}
          >
            Hirings
          </Link>
          
          <Link
            to="/admin/reviews"
            className={`block p-2 rounded ${
              activeTab === "reviews" ? "bg-blue-500" : ""
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </Link>
          <Link
            to="/admin/users"
            className={`block p-2 rounded ${
              activeTab === "users" ? "bg-blue-500" : ""
            }`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </Link>
          <Link
            to="/admin/transactions"
            className={`block p-2 rounded ${
              activeTab === "transactions" ? "bg-blue-500" : ""
            }`}
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </Link>
          <Link
            to="/admin/settings"
            className={`block p-2 rounded ${
              activeTab === "settings" ? "bg-blue-500" : ""
            }`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Routes>
          <Route path="businesses" element={<Businesses />} />
          <Route path="hirings" element={<Hirings />} />

          <Route path="reviews" element={<Reviews />} />
          <Route path="users" element={<Users />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
