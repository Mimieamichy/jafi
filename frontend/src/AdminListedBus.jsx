import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faTrash,
  faCheck,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
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
  const initialFormState = {
    name: "",
    category: "",
    address: "",
    phone_number1: "",
    start: "",
    businessType: "standard",
    end: "",
    city: "",
    state: "",
    day: [], // Comma-separated list; you can parse later if needed.
    description: "",
    images: [], // Will be handled as a FileList.
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [previewImages, setPreviewImages] = useState([]);
  // confirmation–modal state
  const [approveTarget, setApproveTarget] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [standardCategories, setStandardCategories] = useState([]);
  const [premiumCategories, setPremiumCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // State for the Add Business Modal & Form

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleDaysChange = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      day: checked
        ? [...prev.day, value]
        : prev.day.filter((day) => day !== value),
    }));
  };

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

  // ─── FETCH LIVE CATEGORIES ON MOUNT ───────────────────
  useEffect(() => {
    async function loadCategories() {
      try {
        const [stdRes, premRes] = await Promise.all([
          fetch(`${baseUrl}/admin/standardCategories`),
          fetch(`${baseUrl}/admin/premiumCategories`),
        ]);

        if (!stdRes.ok) throw new Error("Failed to load standard categories");
        if (!premRes.ok) throw new Error("Failed to load premium categories");

        const stdJson = await stdRes.json();
        const premJson = await premRes.json();

        // assuming your API returns { categories: ["...", "..."] }
        setStandardCategories(stdJson.categories || []);
        setPremiumCategories(premJson.categories || []);
      } catch (err) {
        console.error(err);
        enqueueSnackbar("Error loading categories", { variant: "error" });
      }
    }
    loadCategories();
  }, [enqueueSnackbar]);

  // Fetch businesses from API
  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!authToken) {
        enqueueSnackbar("Not authenticated", { variant: "warning" });
        return;
      }

      try {
        const res = await fetch(
          `${baseUrl}/admin/businesses?page=${page}&limit=${limit}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("databus", data);

        setBusinesses(Array.isArray(data.data) ? data.data : data.data || []);
        const total = data.meta.total ?? 0;
        setTotalPages(Math.ceil(total / limit));
      } catch (err) {
        console.error("Error fetching businesses:", err);
        enqueueSnackbar("Failed to fetch businesses", { variant: "error" });
      }
    };

    fetchBusinesses();
  }, [authToken, enqueueSnackbar, page, limit]);

  const filtered = businesses.filter((b) =>
    [b.name, b.category]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Adjust current page if needed after data updates.

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleView = (business) => {
    setSelectedBusiness(business);
    setIsViewModalOpen(true);
  };

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlebusinessTypeChange = (e) => {
    const businessType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      businessType,
      category: "",
    }));
  };


  // Handle file input change (for images)
  const handleImagesChange = (e) => {
    // Convert FileList to an array and limit to the first five files
    const files = Array.from(e.target.files).slice(0, 5);
    setFormData((prev) => ({
      ...prev,
      images: files,
    }));

    // Generate preview URLs from the files
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // Submit form to create a new business
  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);

    dataToSend.append("category", formData.category);
    dataToSend.append("address", formData.address);
    dataToSend.append("businessType", formData.businessType);
    dataToSend.append("phone_number1", formData.phone_number1);
    dataToSend.append("start", formData.start);
    dataToSend.append("end", formData.end);
    dataToSend.append("city", formData.city);
    dataToSend.append("state", formData.state);
    dataToSend.append("day", formData.day);
    dataToSend.append("description", formData.description);
    // Append each selected file
    formData.images.forEach((file) => {
      dataToSend.append("images", file);
    });

    try {
      const response = await fetch(`${baseUrl}/admin/addBusiness`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: dataToSend,
      });

      if (!response.ok) {
        const data = await response.json();
        console.log("adminBuss", data);

        throw new Error("Failed to create business");
      }
      // Optionally, update the list of businesses here by refetching or appending.
      console.log("Business created successfully.");

      setFormData(initialFormState);
      setIsAddModalOpen(false);
      enqueueSnackbar("Business created successfully", {
        variant: "success",
      });
    } catch (error) {
      console.error(error);
    }finally {
      setIsSaving(false);
    }
  };

  const getFileName = (proofUrl) => {
    if (!proofUrl) return "";
    // convert backslashes to forward slashes:
    const normalized = proofUrl.replace(/\\/g, "/");
    const parts = normalized.split("/");
    return parts[parts.length - 1];
  };

  //  Add the export handler:
  const handleExport = async () => {
    try {
      const res = await fetch(`${baseUrl}/admin/exportBusinesses`, {
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
      a.download = "businesses.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to export businesses", { variant: "error" });
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-2">
          Listed Businesses{" "}
          <button
            onClick={handleExport}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export CSV
          </button>
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-2 py-1 bg-blue-600 text-white rounded"
        >
          Add Business
        </button>
      </div>

      {/* ← NEW: Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or category"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1); // Reset to first page on search
          }}
          className="w-full md:w-1/3 border p-2 rounded"
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
                <th className="border p-2">Claimed</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((business, index) => {
                  const raw = selectedBusiness?.proof;
                  const name = getFileName(raw);
                  console.log("proofUrl:", raw, "→ filename:", name);

                  return (
                    <tr key={business.id} className="text-center">
                      <td className="border p-2">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="border p-2 capitalize">{business.name}</td>
                      <td className="border p-2">{business.category}</td>
                      <td className="border p-2">
                        {business.claimed ? "Yes" : "No"}
                      </td>
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
        {filtered.length > 0 ? (
          filtered.map((business, index) => {
            return (
              <div
                key={business.id}
                className="border border-gray-300 rounded p-4 mb-4"
              >
                <div className="mb-2">
                  <span className="font-medium">S/N:</span>{" "}
                  {(page - 1) * limit + index + 1}
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
                  <span className="font-medium">Claimed:</span>{" "}
                  {business.claimed ? "Yes" : "No"}
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
      {isViewModalOpen && selectedBusiness && (
        <div className="fixed inset-0 mt-5 top-5 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-2 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{selectedBusiness.name}</h2>
            <p>
              <strong>Category:</strong> {selectedBusiness.category}
            </p>
            <p>
              <strong>Address:</strong> {selectedBusiness.address},
              {selectedBusiness.city},{selectedBusiness.state}
            </p>
            <p>
              <strong>Phone:</strong> {selectedBusiness.phone_number1},{" "}
              {selectedBusiness.phone_number2}
            </p>
            <p>
              <strong>Email:</strong> {selectedBusiness.email}
            </p>
            <p>
              <strong>Whatsapp:</strong> {selectedBusiness.whatsApp || ""}
            </p>
            <p>
              <strong>X:</strong> {selectedBusiness.x || ""}
            </p>
            <p>
              <strong>Instagram:</strong> {selectedBusiness.instagram || ""}
            </p>
            <p>
              <strong>LinkedIn:</strong> {selectedBusiness.linkedIn || ""}
            </p>
            <p>
              <strong>Tiktok:</strong> {selectedBusiness.tiktok || ""}
            </p>
            <p>
              <strong>Website:</strong> {selectedBusiness.website || ""}
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
              <strong>POB:</strong>{" "}
              <a
                href={`${baseUrl}/download/${getFileName(
                  selectedBusiness.proof
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="text-blue-600 hover:underline"
              >
                <FontAwesomeIcon icon={faDownload} />
                Download
              </a>
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

      {/* Modal for Adding a Business */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl mx-2 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Business</h2>
            <form onSubmit={handleCreateBusiness} className="space-y-4">
              <div>
                <label className="block font-medium">Business Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded capitalize"
                  required
                />
              </div>

              {/* Category */}
              <fieldset className="flex gap-6">
                <legend className="font-semibold">Plan Type:</legend>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="businessType"
                    value="standard"
                    checked={formData.businessType === "standard"}
                    onChange={handlebusinessTypeChange}
                  />
                  <span>Standard </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="businessType"
                    value="premium"
                    checked={formData.businessType === "premium"}
                    onChange={handlebusinessTypeChange}
                  />
                  <span>Premium </span>
                </label>
              </fieldset>

              {/* Sub-Category */}
              <label htmlFor="category" className="font-semibold">
                {formData.businessType === "standard"
                  ? "Standard Categories"
                  : "Premium Categories"}
                :
              </label>
              <select
                id="category"
                name="category"
                className="p-2 border rounded-md w-full"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>
                  Select{" "}
                  {formData.businessType === "standard"
                    ? "Standard"
                    : "Premium"}{" "}
                  Category
                </option>
                {formData.businessType === "standard"
                  ? standardCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))
                  : premiumCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
              </select>

              <div>
                <label className="block font-medium">Phone Number</label>
                <input
                  type="text"
                  name="phone_number1"
                  value={formData.phone_number1}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block font-medium">Start Time</label>
                  <input
                    type="time"
                    name="start"
                    value={formData.start}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block font-medium">End Time</label>
                  <input
                    type="time"
                    name="end"
                    value={formData.end}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block font-medium">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block font-medium">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <fieldset className="border p-2 rounded-md">
                <legend className="font-semibold text-black">
                  Opening Days:
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {daysOfWeek.map((day) => (
                    <label key={day} className="flex items-center space-x-2">
                      <input
                        name="day"
                        type="checkbox"
                        value={day}
                        checked={formData.day.includes(day)}
                        onChange={handleDaysChange}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <label className="block font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  rows="3"
                />
              </div>
              <div>
                <label className="block font-medium">Images (max 5)</label>
                <input
                  type="file"
                  name="images"
                  onChange={handleImagesChange}
                  multiple
                  accept="image/*"
                  className="w-full"
                />
                {previewImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {previewImages.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`Preview ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                   {isSaving
              ? "Processing..."
              : <>
                  
                  <span>Create a Business</span>
                </>}
                </button>
              </div>
            </form>
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
