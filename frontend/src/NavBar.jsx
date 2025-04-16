import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SignupModal from "./SignupModal";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const [isOpen, setIsOpen] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [reviewer, setReviewer] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [categories, setCategories] = useState([]); // New state for categories
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false); // Toggles the dropdown
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown on outside click for reviewer dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowCategoriesDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch categories from the listings API (only used on desktop)
  useEffect(() => {
    fetch(`${baseUrl}/user/listings`)
      .then((res) => res.json())
      .then((data) => {
        // Assuming the API returns an object with a listings array.
        const listings = data.listings || [];
        const uniqueCats = [
          ...new Set(listings.map((listing) => listing.category)),
        ];
        setCategories(uniqueCats);
      })
      .catch((err) =>
        console.error("Error fetching listings for categories:", err)
      );
  }, []);

  // Check for token and reviewer status on mount and URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const isExpired = decodedToken.exp * 1000 < Date.now();
        if (isExpired) {
          localStorage.removeItem("reviewerToken");
          localStorage.removeItem("reviewer");
          console.log("Token expired");
        } else {
          localStorage.setItem("reviewerToken", token);
          localStorage.setItem("reviewer", JSON.stringify(decodedToken));
          setReviewer(decodedToken);
          console.log("Reviewer authenticated:", decodedToken);
          const cleanedUrl = location.pathname;
          window.history.replaceState({}, document.title, cleanedUrl);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      const storedToken = localStorage.getItem("reviewerToken");
      const storedRole = localStorage.getItem("userRole");
      if (storedToken) {
        try {
          const decodedToken = jwtDecode(storedToken);
          const isExpired = decodedToken.exp * 1000 < Date.now();
          if (isExpired) {
            localStorage.removeItem("reviewerToken");
            localStorage.removeItem("reviewer");
            console.log("Stored token expired");
          } else {
            setReviewer(JSON.parse(localStorage.getItem("reviewer") || "null"));
            console.log("Using stored reviewer data");
          }
        } catch (error) {
          console.error("Error with stored token:", error);
          localStorage.removeItem("reviewerToken");
          localStorage.removeItem("reviewer");
        }
      }
      if (storedRole) {
        setUserRole(storedRole);
        console.log("User role:", storedRole);
      }
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("reviewer");
    localStorage.removeItem("reviewerToken");
    localStorage.removeItem("userRole");
    setShowDropdown(false);
    setUserRole(null);
    setReviewer(null);
    navigate("/");
    window.location.reload();
  };

  const handleNavClick = () => setIsOpen(false);

  const handleLoginClick = () => {
    navigate("/signin");
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-md p-4 fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="../jafi.png" alt="Logo" className="h-10 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link
            to="/"
            onClick={handleNavClick}
            className="text-gray-600 hover:text-black"
          >
            Home
          </Link>
          {/* Categories Dropdown - only on desktop */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowCategoriesDropdown((prev) => !prev)}
              className="text-gray-600 hover:text-black"
            >
              Categories
            </button>
            {showCategoriesDropdown && (
              <div className="absolute left-0 mt-2 bg-white border rounded shadow-md w-48 z-10">
                <ul>
                  {categories.length > 0 ? (
                    categories.map((cat, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          navigate("/all-listing");
                          setShowCategoriesDropdown(false);
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        {cat}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-sm text-gray-500">
                      No categories
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Menu Items */}

          <Link
            to="/#about"
            onClick={handleNavClick}
            className="text-gray-600 hover:text-black"
          >
            About
          </Link>
          <Link
            to="/#services"
            onClick={handleNavClick}
            className="text-gray-600 hover:text-black"
          >
            Services
          </Link>
          {userRole && (
            <Link
              to={
                userRole === "business"
                  ? "/bus-dashboard"
                  : userRole === "service"
                  ? "/hiring-dashboard"
                  : "/admin"
              }
              onClick={handleNavClick}
              className="text-gray-600 hover:text-black"
            >
              Dashboard
            </Link>
          )}

          {/* Conditional Rendering based on authentication status */}
          {!reviewer && userRole === null ? (
            <>
              <button
                onClick={handleLoginClick}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Login
              </button>
            </>
          ) : reviewer ? (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="text-gray-800 font-medium bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
              >
                {reviewer.name}
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-48 z-50">
                  <button
                    onClick={() => {
                      navigate("/reviewer");
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    My Reviews
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {userRole ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-400 transition"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => setShowSignupModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition"
            >
              For Listings
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-600 text-xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-2 bg-white p-4 rounded-lg shadow-md">
          <Link
            to="/"
            onClick={handleNavClick}
            className="block text-black hover:text-gray-600"
          >
            Home
          </Link>
          <Link
            to="/#about"
            onClick={handleNavClick}
            className="block text-black hover:text-gray-600"
          >
            About
          </Link>
          <Link
            to="/#services"
            onClick={handleNavClick}
            className="block text-black hover:text-gray-600"
          >
            Services
          </Link>
          {userRole && (
            <Link
              to={
                userRole === "business"
                  ? "/bus-dashboard"
                  : userRole === "service"
                  ? "/hiring-dashboard"
                  : "/admin"
              }
              onClick={handleNavClick}
              className="block text-black hover:text-gray-600"
            >
              Dashboard
            </Link>
          )}

          {!reviewer && userRole === null ? (
            <>
              <button
                onClick={handleLoginClick}
                className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
              >
                Login
              </button>
            </>
          ) : reviewer ? (
            <div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/reviewer");
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                My Reviews
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                Logout
              </button>
            </div>
          ) : null}

          {userRole ? (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false);
                setShowSignupModal(true);
              }}
              className="block w-full bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              For Listings
            </button>
          )}
        </div>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSelect={(type) => {
            setShowSignupModal(false);
            window.location.href =
              type === "hiring" ? "/hiring-signup" : "/business-signup";
          }}
        />
      )}
    </nav>
  );
}
