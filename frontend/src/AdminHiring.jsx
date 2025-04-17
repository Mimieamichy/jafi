import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";
// import { jwtDecode } from "jwt-decode";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function Businesses() {
  const authToken = localStorage.getItem("userToken");

  //const decodedToken = jwtDecode(authToken);

  const { enqueueSnackbar } = useSnackbar();
  // State for existing businesses, view modal, pagination, etc.
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(businesses.length / itemsPerPage);
  const currentBusinesses = businesses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  
   

  

 
  
  // confirmation–modal state
  const [approveTarget, setApproveTarget] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // open modals
  const openApproveModal = (biz) => {
    setApproveTarget(biz);
    setShowApproveModal(true);
  };
  const openDeleteModal = (biz) => {
    setDeleteTarget(biz);
    setShowDeleteModal(true);
  };

  // confirm actions
  const confirmApprove = async () => {
    if (!approveTarget) return;
    try {
      await fetch(`${baseUrl}/admin/approveBusiness/${approveTarget.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === approveTarget.id ? { ...b, status: "verified" } : b
        )
      );
      enqueueSnackbar("Business approved", { variant: "success" });
    } catch (err) {
      enqueueSnackbar("Error approving business", { variant: "error" });
    } finally {
      setShowApproveModal(false);
      setApproveTarget(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`${baseUrl}/admin/deleteBusiness/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setBusinesses((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      enqueueSnackbar("Business deleted", { variant: "info" });
    } catch (err) {
      enqueueSnackbar("Error deleting business", { variant: "error" });
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // Fetch businesses from API
  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!authToken) {
        enqueueSnackbar("Not authenticated", { variant: "warning" });
        return;
      }

      try {
        const res = await fetch(`${baseUrl}/admin/businesses`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBusinesses(Array.isArray(data) ? data : data.businesses || []);
      } catch (err) {
        console.error("Error fetching businesses:", err);
        enqueueSnackbar("Failed to fetch businesses", { variant: "error" });
      }
    };

    fetchBusinesses();
  }, [authToken, enqueueSnackbar]);

  // Adjust current page if needed after data updates.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [currentPage, totalPages]);

  

  const handleView = (business) => {
    setSelectedBusiness(business);
    setIsViewModalOpen(true);
  };

 

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">All Services</h2>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block mb-4">
        <div className="overflow-x-auto w-full border border-gray-300 rounded">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">S/N</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Category</th>
                
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBusinesses.length > 0 ? (
                currentBusinesses.map((business, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index;
                  return (
                    <tr key={globalIndex} className="text-center">
                      <td className="border p-2">{globalIndex + 1}</td>
                      <td className="border p-2 capitalize">{business.name}</td>
                      <td className="border p-2">{business.category}</td>
                     
                      <td className="border p-2">{business.status}</td>
                      <td className="border p-2 space-x-2">
                        <button
                          title="View"
                          onClick={() => handleView(business)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        {/* old: onClick={() => handleApprove(b.id)} */}
                        {business.status === "pending" && (
                          <button
                            onClick={() => openApproveModal(business)}
                            className="text-green-600 hover:text-green-800"
                            title="Approve"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                        )}

                        {/* old: onClick={() => handleDelete(b.id)} */}
                        <button
                          title="Delete"
                          onClick={() => openDeleteModal(business)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No businesses listed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden">
        {currentBusinesses.length > 0 ? (
          currentBusinesses.map((business, index) => {
            const globalIndex = (currentPage - 1) * itemsPerPage + index;
            return (
              <div
                key={globalIndex}
                className="border border-gray-300 rounded p-4 mb-4"
              >
                <div className="mb-2">
                  <span className="font-medium">S/N:</span> {globalIndex + 1}
                </div>
                <div className="mb-2">
                  <span className="font-medium capitalize">Name:</span>{" "}
                  {business.name}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Category:</span>{" "}
                  {business.category}
                </div>
                
                <div className="mb-2">
                  <span className="font-medium">Status:</span> {business.status}
                </div>
                <div className="flex space-x-4">
                  <button
                    title="View"
                    onClick={() => handleView(business)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  {/* old: onClick={() => handleApprove(b.id)} */}
                  {business.status === "pending" && (
                    <button
                      onClick={() => openApproveModal(business)}
                      className="text-green-600 hover:text-green-800"
                      title="Approve"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                  )}

                  {/* old: onClick={() => handleDelete(b.id)} */}
                  <button
                    title="Delete"
                    onClick={() => openDeleteModal(business)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4">No businesses listed yet.</div>
        )}
      </div>

      {/* Pagination Controls */}
      {businesses.length > 0 && (
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

      {/* Modal for Viewing Business Details (Scrollable) */}
      {isViewModalOpen && selectedBusiness && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-2 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{selectedBusiness.name}</h2>
            <p>
              <strong>Category:</strong> {selectedBusiness.category}
            </p>
            <p>
              <strong>Address:</strong> {selectedBusiness.address}
            </p>
            <p>
              <strong>Phone:</strong> {selectedBusiness.phone_number1},{" "}
              {selectedBusiness.phone_number2}
            </p>
            <p>
              <strong>Email:</strong> {selectedBusiness.email}
            </p>
            <p>
              <strong>Opening Days:</strong>{" "}
              {selectedBusiness.day && Array.isArray(selectedBusiness.day)
                ? selectedBusiness.day.join(", ")
                : selectedBusiness.day || "N/A"}
            </p>
            <p>
              <strong>Opening Time:</strong> {selectedBusiness.start} -{" "}
              {selectedBusiness.end}
            </p>
            <p>
              <strong>Description:</strong> {selectedBusiness.description}
            </p>
            <p>
              <strong>Claimed:</strong>{" "}
              {selectedBusiness.claimed ? "Yes" : "No"}
            </p>
            <p>
              <strong>Approved:</strong>{" "}
              {selectedBusiness.isApproved ? "Yes" : "No"}
            </p>
            {selectedBusiness.images && selectedBusiness.images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {selectedBusiness.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="Business"
                    className="w-20 h-20 object-cover rounded-md"
                  />
                ))}
              </div>
            )}
            <button
              className="bg-gray-500 text-white mt-4 px-4 py-2 rounded"
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

     
      
      {/* Approve Confirmation Modal */}
      {showApproveModal && approveTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Approve</h3>
            <p className="mb-4">
              Approve <strong>{approveTarget.name}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Delete <strong>{deleteTarget.name}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
