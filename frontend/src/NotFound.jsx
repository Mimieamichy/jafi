import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    document.title = "404 - Page Not Found";
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-white px-4 text-center animate-fade-in">
      <h1 className="text-[6rem] sm:text-[8rem] font-extrabold text-blue-600 drop-shadow-lg animate-bounce">
        404
      </h1>
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
        Oops! This page doesn't exist.
      </h2>
      <p className="text-gray-600 mb-6 max-w-md">
        The page you're looking for might have been removed or is temporarily
        unavailable.
      </p>
      <Link
        to="/"
        className="bg-blue-600 text-white py-2 px-6 rounded-full shadow hover:bg-blue-700 transition duration-300"
      >
        Take me back home
      </Link>
    </div>
  );
}
