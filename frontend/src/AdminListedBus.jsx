import { useState, useEffect } from "react";

export default function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedBusinesses = JSON.parse(localStorage.getItem("businessSignupData")) || [];
    setBusinesses(Array.isArray(storedBusinesses) ? storedBusinesses : [storedBusinesses]);
  }, []);

  const handleApprove = (index) => {
    const updatedBusinesses = [...businesses];
    updatedBusinesses[index].isApproved = true;
    setBusinesses(updatedBusinesses);
    localStorage.setItem("businessSignupData", JSON.stringify(updatedBusinesses));
  };

  const handleDelete = (index) => {
    const updatedBusinesses = businesses.filter((_, i) => i !== index);
    setBusinesses(updatedBusinesses);
    localStorage.setItem("businessSignupData", JSON.stringify(updatedBusinesses));
  };

  const handleView = (business) => {
    setSelectedBusiness(business);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
 <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Listed Businesses</h2>
        {/* "Add Business" Button Here */}
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Add Business
        </button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Image</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Claimed</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {businesses.length > 0 ? (
            businesses.map((business, index) => (
              <tr key={index} className="text-center">
                <td className="border p-2">
                  {business.images.length > 0 && (
                    <img src={business.images[0]} alt="Business" className="w-16 h-16 object-cover rounded-md" />
                  )}
                </td>
                <td className="border p-2">{business.companyName}</td>
                <td className="border p-2">{business.category}</td>
                <td className="border p-2">{business.claimed ? "Yes" : "No"}</td>
                <td className="border p-2">{business.isApproved ? "Approved" : "Pending"}</td>
                <td className="border p-2 space-x-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => handleView(business)}>
                    View
                  </button>
                  <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => handleApprove(index)}>
                    Approve
                  </button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(index)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4">No businesses listed yet.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal for Viewing Business Details */}
      {isModalOpen && selectedBusiness && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">{selectedBusiness.companyName}</h2>
            <p><strong>Category:</strong> {selectedBusiness.category}</p>
            <p><strong>Address:</strong> {selectedBusiness.address}</p>
            <p><strong>Phone:</strong> {selectedBusiness.phone}</p>
            <p><strong>Email:</strong> {selectedBusiness.email}</p>
            <p><strong>Opening Days:</strong> {selectedBusiness.openingDays.join(", ")}</p>
            <p><strong>Opening Time:</strong> {selectedBusiness.openingTime} - {selectedBusiness.closingTime}</p>
            <p><strong>Description:</strong> {selectedBusiness.description}</p>
            <p><strong>Claimed:</strong> {selectedBusiness.claimed ? "Yes" : "No"}</p>
            <p><strong>Approved:</strong> {selectedBusiness.isApproved ? "Yes" : "No"}</p>

            {/* Display images */}
            {selectedBusiness.images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {selectedBusiness.images.map((img, index) => (
                  <img key={index} src={img} alt="Business" className="w-20 h-20 object-cover rounded-md" />
                ))}
              </div>
            )}

            {/* Close Button */}
            <button className="bg-gray-500 text-white mt-4 px-4 py-2 rounded" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
