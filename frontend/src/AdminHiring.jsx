import { useState, useEffect } from "react";

export default function Hirings() {
  const [hirings, setHirings] = useState([]);
  const [selectedHiring, setSelectedHiring] = useState(null);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("hiringSignupData"));
    if (storedData) {
      setHirings(Array.isArray(storedData) ? storedData : [storedData]); // Ensure it's an array
    } else {
      setHirings([]); // Default to an empty array
    }
  }, []);

  // Generate a random password
  const generatePassword = () => Math.random().toString(36).slice(-8);

  // Handle View (Open Modal)
  const handleView = (hiring) => {
    setSelectedHiring(hiring);
  };

  // Handle Approve (Generate password & send email)
  const handleApprove = (hiring) => {
    const password = generatePassword();
    const signInLink = "https://your-app.com/signin";

    alert(
      `User approved!\n\nAn email has been sent to: ${hiring.email}\nPassword: ${password}\nSign-in link: ${signInLink}`
    );

    // Store the approved user details in local storage
    const approvedUsers = JSON.parse(localStorage.getItem("approvedHirings")) || [];
    approvedUsers.push({ ...hiring, password });
    localStorage.setItem("approvedHirings", JSON.stringify(approvedUsers));
  };

  // Handle Delete
  const handleDelete = (email) => {
    const updatedHirings = hirings.filter((hiring) => hiring.email !== email);
    setHirings(updatedHirings);
    localStorage.setItem("hiringSignupData", JSON.stringify(updatedHirings));
    alert("User deleted successfully!");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Hirings</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Add Service</button>
      </div>

      {/* Hirings Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Image</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hirings.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center">No hirings yet.</td>
              </tr>
            ) : (
              hirings.map((hiring) => (
                <tr key={hiring.email} className="border-t">
                  <td className="border p-2">
                    <img
                      src={hiring.workSamples?.length > 0 ? hiring.workSamples[0] : "/placeholder.jpg"}
                      alt={hiring.name}
                      className="h-10 w-10 rounded"
                    />
                  </td>
                  <td className="border p-2">{hiring.name}</td>
                  <td className="border p-2">{hiring.email}</td>
                  <td className="border p-2">{hiring.category}</td>
                  <td className="border p-2 flex gap-2">
                    <button
                      className="px-2 py-1 bg-green-500 text-white rounded"
                      onClick={() => handleView(hiring)}
                    >
                      View
                    </button>
                    <button
                      className="px-2 py-1 bg-yellow-500 text-white rounded"
                      onClick={() => handleApprove(hiring)}
                    >
                      Approve
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => handleDelete(hiring.email)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Viewing Hiring Details */}
      {selectedHiring && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-bold mb-4">Hiring Details</h3>
            <div className="flex flex-col gap-2">
              <img
                src={selectedHiring.workSamples?.length > 0 ? selectedHiring.workSamples[0] : "/placeholder.jpg"}
                alt={selectedHiring.name}
                className="h-20 w-20 rounded mx-auto"
              />
              <p><strong>Name:</strong> {selectedHiring.name}</p>
              <p><strong>Email:</strong> {selectedHiring.email}</p>
              <p><strong>Phone:</strong> {selectedHiring.phone}</p>
              <p><strong>Address:</strong> {selectedHiring.address}</p>
              <p><strong>Category:</strong> {selectedHiring.category}</p>
              <p><strong>Adress:</strong> {selectedHiring.address}</p>
              <p><strong>Role:</strong> {selectedHiring.userRole}</p>
            </div>
            <button
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded w-full"
              onClick={() => setSelectedHiring(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
