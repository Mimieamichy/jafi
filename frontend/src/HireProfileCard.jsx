import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faMapMarkerAlt,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";

export default function HireProfileCard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Get the current signed-up user
    const currentUser = JSON.parse(localStorage.getItem("hiringSignupData"));

    // Get all previously stored users
    let storedUsers = JSON.parse(localStorage.getItem("hiringUsers")) || [];

    // Avoid duplicates: Add the current user only if they are not already in the list
    if (
      currentUser &&
      !storedUsers.some((user) => user.phone === currentUser.phone)
    ) {
      storedUsers.push(currentUser);
      localStorage.setItem("hiringUsers", JSON.stringify(storedUsers));
    }

    // Set users state
    setUsers(storedUsers);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 ">
      {users.length > 0 ? (
        users.map((user, index) => <UserCard key={index} user={user} />)
      ) : (
        <p className="text-center text-gray-600 col-span-full">
          No users available
        </p>
      )}
    </div>
  );
}

function UserCard({ user }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) =>
      prev === user.workSamples.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? user.workSamples.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-md mx-auto">
      {/* Work Samples Carousel */}
      {user.workSamples.length > 0 && (
        <div className="relative">
          <img
            src={user.workSamples[currentIndex]}
            alt="Work Sample"
            className="w-full h-56 object-cover"
          />
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full shadow-md"
          >
            ❮
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full shadow-md"
          >
            ❯
          </button>
        </div>
      )}

      {/* User Info */}
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold capitalize">{user.name}</h2>
        <p className="flex items-center justify-center text-gray-600 mt-2">
          <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-green-500" />
          {user.category}
        </p>
        <p className="flex items-center justify-center text-gray-600 mt-2">
          <FontAwesomeIcon icon={faPhone} className="mr-2 text-blue-500" />
          {user.phone}
        </p>
        <p className="flex items-center justify-center text-gray-600 mt-2">
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            className="mr-2 text-red-500"
          />
          {user.address}
        </p>
      </div>
    </div>
  );
}
