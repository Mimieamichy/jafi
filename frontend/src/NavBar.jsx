import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SignupModal from "./SignupModal";
const baseUrl = import.meta.env.VITE_BACKEND_URL;
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [reviewer, setReviewer] = useState(null);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        localStorage.setItem("reviewerToken", token);
        localStorage.setItem("reviewer", JSON.stringify(decoded));
        setReviewer(decoded);

        // Remove token from the URL after processing
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      } catch (err) {
        console.error("Token decoding failed", err);
      }
    } else {
      const saved = localStorage.getItem("reviewer");
      if (saved) {
        setReviewer(JSON.parse(saved));
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("reviewer");
    localStorage.removeItem("reviewerToken");
    setShowDropdown(false);
    navigate("/");
    window.location.reload();
  };

  const handleNavClick = () => setIsOpen(false);

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

          {!reviewer ? (
            <>
              <button
                onClick={() => {
                  setIsOpen(false);
                  const currentUrl = window.location.href;
                  window.location.href = `${baseUrl}/review/google?redirect=${encodeURIComponent(
                    currentUrl
                  )}`;
                }}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Login
              </button>
            </>
          ) : (
            <div ref={dropdownRef} className="relative ">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="text-gray-800 font-medium bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
              >
                {reviewer.name}
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-48 z-10">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/reviewer");
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
          )}
          <button
            onClick={() => setShowSignupModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition"
          >
            For Listings
          </button>
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
          {!reviewer ? (
            <>
              <button
                onClick={() => {
                  setIsOpen(false);
                  const currentUrl = window.location.href;

                  window.location.href = `${baseUrl}/review/google?redirect=${encodeURIComponent(
                    currentUrl
                  )}`;
                }}
                className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
              >
                Login
              </button>
            </>
          ) : (
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
          )}
          <button
            onClick={() => {
              setIsOpen(false);
              setShowSignupModal(true);
            }}
            className="block w-full bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            For Listings
          </button>
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
