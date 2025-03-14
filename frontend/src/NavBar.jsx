import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md p-4 fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="../jafi.png" alt="Logo" className="h-10 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-600 hover:text-black">
            Home
          </Link>
          <a href="#about" className="text-gray-600 hover:text-black">
            About
          </a>
          <a href="#services" className="text-gray-600 hover:text-black">
            Services
          </a>
          <a href="#contact" className="text-gray-600 hover:text-black">
            Contact
          </a>
          <Link
            to="/auth"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-2 bg-white p-4 rounded-lg shadow-md">
          <Link to="/" className="block text-black hover:text-gray-600">
            Home
          </Link>
          <a href="#about" className="block text-black hover:text-gray-600">
            About
          </a>
          <a href="#services" className="block text-black hover:text-gray-600">
            Services
          </a>
          <a href="#contact" className="block text-black hover:text-gray-600">
            Contact
          </a>
          <Link
            to="/auth"
            className="block w-full bg-blue-500 text-white px-4 py-2 rounded-md text-center"
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
