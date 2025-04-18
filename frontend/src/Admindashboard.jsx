import { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Transactions from "./Transactions";
import Users from "./AminUsers";
import Businesses from "./AdminListedBus";
import Hirings from "./AdminHiring";
import Reviews from "./AdminReviews";
import Settings from "./AdminSettings";
import Overview from "./AdminOverview";
import Claims from "./Claims";
import AdminBusiness from "./AdminBusiness";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex  bg-gray-100">
      {/* Mobile Header with Hamburger/Close Button */}
      <div className="md:hidden p-4">
        <button 
          onClick={handleSidebarToggle} 
          className="text-gray-900 focus:outline-none"
        >
          {sidebarOpen ? (
            // Close icon (X)
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          ) : (
            // Hamburger icon
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar: Visible on desktop and toggled on mobile */}
      <aside
        className={`
          ${sidebarOpen ? "block" : "hidden"} 
          md:block w-64 bg-gray-900 text-white p-5 
          absolute md:relative z-10 overflow-y-auto
        `}
      >
        <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
        <nav className="space-y-3">
          <Link
            to="/admin"
            className={`block p-2 rounded ${activeTab === "overview" ? "bg-gray-700" : ""}`}
            onClick={() => { setActiveTab("overview"); setSidebarOpen(false); }}
          >
            Overview
          </Link>
          <Link
            to="/admin/users"
            className={`block p-2 rounded ${activeTab === "users" ? "bg-gray-700" : ""}`}
            onClick={() => { setActiveTab("users"); setSidebarOpen(false); }}
          >
            Users
          </Link>
          <Link
            to="/admin/businesses"
            className={`block p-2 rounded ${activeTab === "businesses" ? "bg-gray-700" : ""}`}
            onClick={() => { setActiveTab("businesses"); setSidebarOpen(false); }}
          >
            Businesses
          </Link>
          <Link
            to="/admin/hirings"
            className={`block p-2 rounded ${activeTab === "hirings" ? "bg-gray-700" : ""}`}
            onClick={() => { setActiveTab("hirings"); setSidebarOpen(false); }}
          >
            Services
          </Link>
          <Link
            to="/admin/reviews"
            className={`block p-2 rounded ${activeTab === "reviews" ? "bg-gray-700" : ""}`}
            onClick={() => { setActiveTab("reviews"); setSidebarOpen(false); }}
          >
            Reviews
          </Link>
          <Link
            to="/admin/claims"
            className={`block p-2 rounded ${activeTab === "claims" ? "bg-gray-700" : ""}`}
            onClick={() => { setActiveTab("claims"); setSidebarOpen(false); }}
          >
            Claims
          </Link>
          <Link
            to="/admin/transactions"
            className={`block p-2 rounded ${activeTab === "transactions" ? "bg-gray-700" : ""}`}
            onClick={() => { setActiveTab("transactions"); setSidebarOpen(false); }}
          >
            Transactions
          </Link>
          <Link
            to="/admin/adminbus"
            className={`block p-2 rounded ${activeTab === "adminbus" ? "bg-gray-700" : ""}`}
            onClick={() => { setActiveTab("adminbus"); setSidebarOpen(false); }}
          >
            My Businesses
          </Link>
          <Link
            to="/admin/settings"
            className={`block p-2 rounded ${activeTab === "settings" ? "bg-gray-700" : ""}`}
            onClick={() => { setActiveTab("settings"); setSidebarOpen(false); }}
          >
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/users" element={<Users />} />
          <Route path="/businesses" element={<Businesses />} />
          <Route path="/hirings" element={<Hirings />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/adminbus" element={<AdminBusiness />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
