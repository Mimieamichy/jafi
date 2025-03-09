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
          <a href="#" className="text-gray-600 hover:text-black">Home</a>
          <a href="#" className="text-gray-600 hover:text-black">About</a>
          <a href="#" className="text-gray-600 hover:text-black">Services</a>
          <a href="#" className="text-gray-600 hover:text-black">Contact</a>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer">
            Sign Up
          </button>
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
          <a href="#" className="block text-gray-600 hover:text-black">Home</a>
          <a href="#" className="block text-gray-600 hover:text-black">About</a>
          <a href="#" className="block text-gray-600 hover:text-black">Services</a>
          <a href="#" className="block text-gray-600 hover:text-black">Contact</a>
          <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md">
            Sign Up
          </button>
        </div>
      )}
    </nav>
  );
}
