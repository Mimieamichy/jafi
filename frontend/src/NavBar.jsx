import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SignupModal from "./SignupModal";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  // const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const [isOpen, setIsOpen] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [reviewer, setReviewer] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Static category list
  const categories = [
    "Hotel",
    "Banking",
    "Church",
    "Nightlife & Entertainment",
    "Airplane",
    "Beauty & Salon",
    "Communication",
    "Hospital",
    "Restaurant",
  ];
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
 

  // Close dropdowns on outside click
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

  // Authentication token handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    const storedToken = localStorage.getItem("userToken");
    const storedUser = localStorage.getItem("userData");
    const storedRole = localStorage.getItem("userRole");

    const handleDecoded = (rawToken) => {
      try {
        const decoded = jwtDecode(rawToken);
        // if your token payload wraps the user object under `user`, use decoded.user
        const user = decoded.user || decoded;
        localStorage.setItem("userToken", rawToken);
        localStorage.setItem("userData", JSON.stringify(user));
        setReviewer(user);
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
      }
    };

    if (tokenFromUrl) {
      handleDecoded(tokenFromUrl);
      // remove token from URL
      const cleanPath = location.pathname;
      window.history.replaceState({}, document.title, cleanPath);
    } else if (storedToken && storedUser) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setReviewer(JSON.parse(storedUser));
        } else {
          // token expired
          localStorage.removeItem("userToken");
          localStorage.removeItem("userData");
        }
      } catch (err) {
        console.error("Error decoding stored token:", err);
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
      }
    }

    if (storedRole) {
      setUserRole(storedRole);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("userToken");
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

  const dashboardPath =
    {
      business: "/bus-dashboard",
      service: "/hiring-dashboard",
      admin: "/admin-page",
      superadmin: "/admin",
    }[userRole] || "/";

  return (
    <nav className="bg-white shadow-md p-4  fixed top-0 left-0 w-full z-50  ">
      <div className="container mx-auto flex justify-between items-center h-full">
        <Link to="/" className="flex items-center">
          <img src="../jafia.png" alt="Logo" className="h-16 w-auto" />
        </Link>

        <div className="hidden md:flex space-x-6 items-center">
          <Link
            to="/"
            onClick={handleNavClick}
            className="text-gray-600 hover:text-black"
          >
            Home
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowCategoriesDropdown((prev) => !prev)}
              className="text-gray-600 hover:text-black" ref={dropdownRef}
            >
              Categories
            </button>
            {showCategoriesDropdown && (
              <div className="absolute left-0 mt-2 bg-white border rounded shadow-md w-48 z-10 max-h-60 overflow-y-auto" ref={dropdownRef}>
                <ul>
                  {categories.map((cat, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        navigate(`/category/${encodeURIComponent(cat)}`);
                        setShowCategoriesDropdown(false);
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {cat}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Link
            to="/howtoreview"
            onClick={handleNavClick}
            className="text-gray-600 hover:text-black"
          >
            How to Review
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
          {userRole && (
            <Link
              to={dashboardPath}
              onClick={handleNavClick}
              className="text-gray-600 hover:text-black"
            >
              Dashboard
            </Link>
          )}

          {!reviewer && userRole === null ? (
            <button
              onClick={handleLoginClick}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Login
            </button>
          ) : reviewer || userRole ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="text-gray-800 font-medium bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
              >
                {"Welcome"}
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
            ""
          ) : (
            <button
              onClick={() => setShowSignupModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition"
            >
              For Listings
            </button>
          )}
        </div>

        <button
          className="md:hidden text-gray-600 text-xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden mt-4 space-y-2 bg-white p-4 rounded-lg shadow-md max-h-60 overflow-y-auto">
         
          <Link
            to="/"
            onClick={handleNavClick}
            className="block text-black hover:text-gray-600"
          >
            Home
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowCategoriesDropdown((v) => !v)}
              className="block w-full text-left hover:bg-gray-100"
              ref={dropdownRef}
            >
              Categories
            </button>
            {showCategoriesDropdown && (
              <ul className="bg-white border-l-4 " ref={dropdownRef}>
                {categories.map((c, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      navigate(`/category/${encodeURIComponent(c)}`);
                      setShowCategoriesDropdown(false);
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            to="/howtoreview"
            onClick={handleNavClick}
            className="block text-black hover:text-gray-600"
          >
           How to Review
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
              to={dashboardPath}
              onClick={handleNavClick}
              className="block text-black hover:text-gray-600"
            >
              Dashboard
            </Link>
          )}

          {!reviewer && userRole === null ? (
            <button
              onClick={handleLoginClick}
              className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
            >
              Login
            </button>
          ) : reviewer ? (
            <>
              <button
                onClick={() => {
                  navigate("/reviewer");
                  setIsOpen(false);
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
            </>
          ) : null}

          {userRole ? (
            ""
          ) : (
            <button
              onClick={() => {
                setShowSignupModal(true);
                setIsOpen(false);
              }}
              className="block w-full bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              For Listings
            </button>
          )}
        </div>
      )}

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
