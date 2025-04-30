import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";
// import { jwtDecode } from "jwt-decode";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function Hirings() {
  const authToken = localStorage.getItem("userToken");

  const { enqueueSnackbar } = useSnackbar();
  // State for existing businesses, view modal, pagination, etc.
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
 

  // confirmation–modal state
  const [approveTarget, setApproveTarget] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // open modals
  const openApproveModal = (ser) => {
    setApproveTarget(ser);
    setShowApproveModal(true);
  };
  const openDeleteModal = (ser) => {
    setDeleteTarget(ser);
    setShowDeleteModal(true);
  };

  // confirm actions
  const confirmApprove = async () => {
    if (!approveTarget) return;
    try {
      await fetch(`${baseUrl}/admin/approveService/${approveTarget.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setServices((prev) =>
        prev.map((s) =>
          s.id === approveTarget.id ? { ...s, status: "verified" } : s
        )
      );
      enqueueSnackbar("Service approved", { variant: "success" });
    } catch (err) {
      enqueueSnackbar("Error approving Service", { variant: "error" });
    } finally {
      setShowApproveModal(false);
      setApproveTarget(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`${baseUrl}/admin/deleteService/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      enqueueSnackbar("Service deleted", { variant: "info" });
    } catch (err) {
      enqueueSnackbar("Error deleting Service", err, { variant: "error" });
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      if (!authToken) {
        enqueueSnackbar("Not authenticated", { variant: "warning" });
        return;
      }

      try {
        const res = await fetch(`${baseUrl}/admin/services?page=${page}&limit=${limit}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("service", data);

        setServices(Array.isArray(data.data) ? data.data : data.data || []);
        const total = data.meta.total  ?? 0;
        setTotalPages(Math.ceil(total / limit));
      } catch (err) {
        console.error("Error fetching Services:", err);
        enqueueSnackbar("Failed to fetch Services", { variant: "error" });
      }
    };

    fetchServices();
  }, [authToken, enqueueSnackbar, page, limit]);

  // Adjust current page if needed after data updates.
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const filtered = services.filter((s) =>
    [s.name, s.category]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleView = (service) => {
    setSelectedService(service);
    setIsViewModalOpen(true);
  };

  // 1️⃣ Add the export handler:
  const handleExport = async () => {
    try {
      const res = await fetch(`${baseUrl}/admin/exportServices`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      // create a URL for the blob and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // you can customize the filename
      a.download = "services.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to export Services", { variant: "error" });
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-2 mx-2">
          All Services
          <button
            onClick={handleExport}
            className="px-2 py-1 mx-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export CSV
          </button>
        </h2>
      </div>
      {/* Search Filter */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or category"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1); // Reset to first page on search
          }}
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded"
        />
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
              {filtered.length > 0 ? (
                filtered.map((service, index) => {
                  return (
                    <tr key={service.id} className="text-center">
                      <td className="border p-2"> {(page - 1) * limit + index + 1}</td>
                      <td className="border p-2 capitalize">{service.name}</td>
                      <td className="border p-2">{service.category}</td>

                      <td className="border p-2">{service.status}</td>
                      <td className="border p-2 space-x-2">
                        <button
                          title="View"
                          onClick={() => handleView(service)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        {/* old: onClick={() => handleApprove(b.id)} */}
                        {service.status === "pending" && (
                          <button
                            onClick={() => openApproveModal(service)}
                            className="text-green-600 hover:text-green-800"
                            title="Approve"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                        )}

                        <button
                          title="Delete"
                          onClick={() => openDeleteModal(service)}
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
                    No services listed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden">
        {filtered.length > 0 ? (
          filtered.map((service, index) => {
           
            return (
              <div
                key={service.id}
                className="border border-gray-300 rounded p-4 mb-4"
              >
                <div className="mb-2">
                  <span className="font-medium">S/N:</span> {(page - 1) * limit + index + 1}
                </div>
                <div className="mb-2">
                  <span className="font-medium capitalize">Name:</span>{" "}
                  {service.name}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Category:</span>{" "}
                  {service.category}
                </div>

                <div className="mb-2">
                  <span className="font-medium">Status:</span> {service.status}
                </div>
                <div className="flex space-x-4">
                  <button
                    title="View"
                    onClick={() => handleView(service)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  {/* old: onClick={() => handleApprove(b.id)} */}
                  {service.status === "pending" && (
                    <button
                      onClick={() => openApproveModal(service)}
                      className="text-green-600 hover:text-green-800"
                      title="Approve"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                  )}

                  {/* old: onClick={() => handleDelete(b.id)} */}
                  <button
                    title="Delete"
                    onClick={() => openDeleteModal(service)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4">No services listed yet.</div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center space-x-4 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
         <strong>{page}</strong>/<strong>{totalPages}</strong>
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Modal for Viewing Business Details (Scrollable) */}
      {isViewModalOpen && selectedService && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-2 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{selectedService.name}</h2>
            <p>
              <strong>Category:</strong> {selectedService.category}
            </p>
            <p>
              <strong>Address:</strong> {selectedService.address}
            </p>
            <p>
              <strong>Phone:</strong> {selectedService.phone_number}
            </p>
            <p>
              <strong>Email:</strong> {selectedService.email}
            </p>

            <p>
              <strong>Description:</strong> {selectedService.description}
            </p>

            <p>
              <strong>Approved:</strong> {selectedService.status}
            </p>
            {selectedService.images && selectedService.images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {selectedService.images.map((img, idx) => (
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
