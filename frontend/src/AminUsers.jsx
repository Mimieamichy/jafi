import React, { useState, useEffect } from "react";
// Make sure to install and configure FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  // Get the users for the current page
  const currentUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${baseUrl}/admin/users`);
        const data = await response.json();
        console.log("Users data:", data);

        // Adjust based on your API response shape:
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          console.error("Unexpected data format:", data);
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // If the current page becomes invalid (e.g. after deletion), adjust it.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [currentPage, totalPages]);

  // Open delete confirmation modal
  const handleOpenDeleteModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Close modal without deleting
  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    // (Optional) API call to delete user:
    // try {
    //   await fetch(`${baseUrl}/admin/users/${selectedUser.id}`, {
    //     method: "DELETE",
    //   });
    //   setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    // } catch (error) {
    //   console.error("Error deleting user:", error);
    // }

    // For demo purposes, remove user from local state.
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    handleCloseModal();
  };

  return (
    <div className="mx-auto max-w-7xl p-4">
      <h2 className="text-xl font-bold mb-4">All Users</h2>

      {/* Desktop Table View */}
      <div className="hidden md:block mb-4">
        <div className="overflow-x-auto w-full border border-gray-200 rounded">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 font-medium">S/N</th>
                <th className="p-2 font-medium">Name</th>
                <th className="p-2 font-medium">Email</th>
                <th className="p-2 font-medium">Role</th>
                <th className="p-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500 italic">
                    No users found.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user, index) => (
                  <tr key={user.id || index} className="border-t">
                    <td className="p-2">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="p-2 capitalize">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">
                      {Array.isArray(user.role)
                        ? user.role.join(", ")
                        : user.role || "No roles"}
                    </td>
                    <td className="p-2">
                      <button
                      title="Delete User"
                        onClick={() => handleOpenDeleteModal(user)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden">
        {currentUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500 italic">
            No users found.
          </div>
        ) : (
          currentUsers.map((user, index) => (
            <div
              key={user.id || index}
              className="border border-gray-200 rounded p-4 mb-4"
            >
              <div className="mb-2">
                <span className="font-medium">S/N:</span>{" "}
                {(currentPage - 1) * itemsPerPage + index + 1}
              </div>
              <div className="mb-2">
                <span className="font-medium capitalize">Name:</span> {user.name}
              </div>
              <div className="mb-2">
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div className="mb-2">
                <span className="font-medium">Role:</span>{" "}
                {Array.isArray(user.role)
                  ? user.role.join(", ")
                  : user.role || "No roles"}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleOpenDeleteModal(user)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {users.length > 0 && (
        <div className="flex items-center justify-center mt-4 space-x-2">
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-blue-500 text-white disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-blue-500 text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm mx-2">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Do you want to delete{" "}
              <strong>{selectedUser.name || "this user"}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
