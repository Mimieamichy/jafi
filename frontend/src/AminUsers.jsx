// src/components/Users.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const Users = () => {
  const authToken = localStorage.getItem("userToken");
  const { enqueueSnackbar } = useSnackbar();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
 
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // initialize to null (no mode selected yet)
const [deleteMode, setDeleteMode] = useState(null);

  const [admins, setAdmins] = useState([]);
  const [transferTo, setTransferTo] = useState("");

  const itemsPerPage = 20;

  // Filter users by search term (email or role)
  const filteredUsers = users
    .filter((user) => {
      const term = searchTerm.toLowerCase();
      const emailMatch = user.email?.toLowerCase().includes(term);
      const roles = Array.isArray(user.role) ? user.role : [user.role];
      const roleMatch = roles.some((r) => r && r.toLowerCase().includes(term));
      return emailMatch || roleMatch;
    })
    .filter((user) => {
      if (!user.createdAt) return true;
      const created = new Date(user.createdAt);
      if (dateFrom && created < new Date(dateFrom)) return false;
      if (dateTo && created > new Date(dateTo)) return false;
      return true;
    });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fetch users with Authorization header
  useEffect(() => {
    const fetchUsers = async () => {
      if (!authToken) {
        enqueueSnackbar("Not authenticated", { variant: "warning" });
        return;
      }
      try {
        const response = await fetch(`${baseUrl}/admin/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        console.log("Users data:", data);

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
        enqueueSnackbar("Failed to fetch users", { variant: "error" });
      }
    };

    fetchUsers();
  }, [authToken, enqueueSnackbar]);

  // Adjust page if out of bounds when filtering or pagination changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [currentPage, totalPages]);

  const handleOpenDeleteModal = (user) => {
    setSelectedUser(user);
    // if business, start on "choose" step; otherwise go straight to full delete:
    setDeleteMode(user.role?.includes("business") ? "choose" : "full");
    setShowDeleteModal(true);
  };

  

  useEffect(() => {
    if (!showDeleteModal || deleteMode !== "transfer") return;
    fetch(`${baseUrl}/admin/users?role=admin&role=superadmin`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((r) => r.json())
      .then((data) => setAdmins(data.users || data))
      .catch(() =>
        enqueueSnackbar("Could not load admins", { variant: "error" })
      );
      console.log("admins", admins);
      
  }, [showDeleteModal, deleteMode, authToken, enqueueSnackbar, admins]);

  // Confirm deletion with Authorization header
  const handleDeleteConfirm = async () => {
    if (deleteMode === "transfer") {
      // transfer-only: hit your transfer endpoint
      await fetch(`${baseUrl}/admin/transfer/${selectedUser.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ toAdminId: transferTo }),
      });
      enqueueSnackbar("User deleted, business transferred", {
        variant: "success",
      });
    } else {
      // full delete
      await fetch(`${baseUrl}/admin/user/${selectedUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      enqueueSnackbar("User (and business) deleted", { variant: "success" });
    }
    // cleanup UI
    setUsers((u) => u.filter((u) => u.id !== selectedUser.id));
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  // inside Users component, before `return(...)`
  const exportCSV = () => {
    // 1) Define our CSV headers
    const headers = ["Name", "Email", "Role", "Created At", "Listings Count"];
    // 2) Turn each filteredUser into an array of strings
    const rows = filteredUsers.map((user) => [
      user.name,
      user.email,
      Array.isArray(user.role) ? user.role.join("|") : user.role,
      user.createdAt || "",
      user.count ?? "",
    ]);
    // 3) Build the CSV content
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    // 4) Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl p-4">
      <h2 className="text-xl font-bold mb-2">
        All Users{" "}
        <button
          onClick={exportCSV}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export CSV
        </button>
      </h2>

      {/* Search Bar */}
      <div className=" flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4 mb-4">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by email or role"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="md:w-full w-64 p-2 border border-gray-300 rounded"
        />

        {/* Date Range Picker */}
        <div className=" flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border border-gray-300 rounded"
          />
          <span className="hidden sm:inline">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border border-gray-300 rounded"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setCurrentPage(1);
              }}
              className="ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>

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
                <th className="p-2 font-medium">No of Listing</th>
                <th className="p-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-gray-500 italic"
                  >
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
                    <td className="p-2">{user.count}</td>
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
                <span className="font-medium capitalize">Name:</span>{" "}
                {user.name}
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
              <div className="mb-2">
                <span className="font-medium">No of Listing:</span> {user.count}
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
      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-center mt-4 space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded p-6 w-80 space-y-4">
            {deleteMode === "choose" && (
              <>
                <h3 className="font-bold">What do you want to do?</h3>
                <button
                  onClick={() => setDeleteMode("transfer")}
                  className="w-full py-2 bg-yellow-500 text-white rounded"
                >
                  Delete user & transfer business
                </button>
                <button
                  onClick={() => setDeleteMode("full")}
                  className="w-full py-2 bg-red-500 text-white rounded"
                >
                  Delete user & business
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-2 text-gray-600"
                >
                  Cancel
                </button>
              </>
            )}

            {deleteMode === "transfer" && (
              <>
                <h3 className="font-bold">Transfer business to:</h3>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="" disabled>
                    Select admin
                  </option>
                  {admins.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={!transferTo}
                    className="flex-1 py-2 bg-red-500 text-white rounded disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteMode("choose")}
                    className="flex-1 py-2 bg-gray-200 rounded"
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {deleteMode === "full" && (
              <>
                <h3 className="font-bold">
                  Delete <em>{selectedUser.name}</em> and their business?
                </h3>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 py-2 bg-red-600 text-white rounded"
                  >
                    Yes, delete both
                  </button>
                  <button
                    onClick={() => setDeleteMode("choose")}
                    className="flex-1 py-2 bg-gray-200 rounded"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
