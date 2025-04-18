// src/components/MyAddedBusinesses.jsx
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSave,
  faTimes,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

import { useSnackbar } from "notistack";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function AdminPage() {
  const authToken = localStorage.getItem("userToken");
  const { enqueueSnackbar } = useSnackbar();

  const initialFormState = {
    name: "",
    category: "",
    address: "",
    phone_number1: "",
    start: "",
    end: "",
    city: "",
    state: "",
    day: [], // Comma-separated list; you can parse later if needed.
    description: "",
    images: [], // Will be handled as a FileList.
  };

  const categories = [
    "Automotives",
    "Hotels",
    "Healthcare",
    "Groceries",
    "Malls & Supermarkets",
    "Banking & FinTech",
    "Churches",
    "Aircrafts",
    "Nigerian Made",
    "Nightlife & Entertainment",
    "Restaurants & Cafes",
    "Real Estate",
    "Education & Training",
    "Fashion & Beauty",
    "Fitness & Wellness",
    "Travel & Tours",
    "Tech Hubs",
  ];
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

  /* ---------------- state ---------------- */
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewImages, setPreviewImages] = useState([]);

  const [editTarget, setEditTarget] = useState(null); // full biz obj
  const [editData, setEditData] = useState({}); // working copy
  const [previewImgs, setPreviewImgs] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const openPwdModal = () => {
    setNewPwd("");
    setShowPwdModal(true);
  };
  const closePwdModal = () => setShowPwdModal(false);

  const updatePassword = async () => {
    if (!newPwd.trim()) {
      enqueueSnackbar("Password can’t be empty", { variant: "warning" });
      return;
    }
    try {
      await fetch(`${baseUrl}/admin/updateAdminPassword`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ password: newPwd }),
      });
      enqueueSnackbar("Password updated", { variant: "success" });
      closePwdModal();
    } catch (e) {
      enqueueSnackbar("Update failed", { variant: "error" });
      console.error(e);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);

    dataToSend.append("category", formData.category);
    dataToSend.append("address", formData.address);
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
    }
  };

  /* ---------------- fetch only *my* businesses ---------------- */
  /* example with async / await */
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await fetch(`${baseUrl}/admin/myBusiness`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();

        // 👇 inspect everything that comes back
        console.log("MY‑BUSINESSES API →", data);
        const rowsArr = Array.isArray(data)
          ? data
          : Array.isArray(data.businesses)
          ? data.businesses
          : Array.isArray(data.business)
          ? data.business // if backend ever sends an array here
          : data.business
          ? [data.business] // wrap single object
          : [];

        setRows(rowsArr);
      } catch (e) {
        console.error("my‑businesses error", e);
      }
    };
    fetchBusinesses();
  }, [authToken]);

  /* ---------------- pagination helpers ---------------- */
  const perPage = 20;
  const totalPages = Math.ceil(rows.length / perPage);
  const slice = rows.slice((currentPage - 1) * perPage, currentPage * perPage);

  /* ---------------- open edit modal ---------------- */
  const openEdit = (biz) => {
    setEditTarget(biz);
    setEditData({
      address: biz.address,
      city: biz.city,
      state: biz.state,
      phone_number1: biz.phone_number1,
      start: biz.start,
      end: biz.end,
      description: biz.description,
      images: [], // new images
    });
    setPreviewImgs([]);
  };

  /* ---------------- handle edits ---------------- */
  const change = (e) => {
    const { name, value } = e.target;
    setEditData((p) => ({ ...p, [name]: value }));
  };

  const changeImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setEditData((p) => ({ ...p, images: files }));
    setPreviewImgs(files.map((f) => URL.createObjectURL(f)));
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    const fd = new FormData();
    [
      "address",
      "city",
      "state",
      "phone_number1",
      "start",
      "end",
      "description",
    ].forEach((k) => fd.append(k, editData[k] ?? ""));
    editData.images.forEach((f) => fd.append("images", f));

    try {
      await fetch(`${baseUrl}/admin/myBusiness/${editTarget.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
        body: fd,
      });
      enqueueSnackbar("Updated successfully", { variant: "success" });
      // refresh row locally
      setRows((prev) =>
        prev.map((b) => (b.id === editTarget.id ? { ...b, ...editData } : b))
      );
      setEditTarget(null);
    } catch (e) {
      enqueueSnackbar("Update failed", { variant: "error" });
      console.error(e);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* ---------- header ---------- */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Listed Businesses</h2>
        <div className="space-x-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-2 py-1 bg-blue-600 text-white rounded"
          >
            Add Business
          </button>

          <button
            onClick={openPwdModal}
            className="px-2 py-1 bg-gray-700 text-white rounded"
          >
            Settings
          </button>
        </div>
      </div>

      {/* -------- desktop table -------- */}
      <div className="hidden md:block overflow-x-auto border border-gray-300 rounded">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">S/N</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">City</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((b, idx) => (
              <tr key={b.id} className="border-t text-center">
                <td className="p-2 border">
                  {(currentPage - 1) * perPage + idx + 1}
                </td>
                <td className="p-2 border capitalize">{b.name}</td>
                <td className="p-2 border">{b.phone_number1}</td>
                <td className="p-2 border">{b.city}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => openEdit(b)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </td>
              </tr>
            ))}
            {slice.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  No businesses yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* -------- mobile cards -------- */}
      <div className="md:hidden space-y-4">
        {slice.map((b, idx) => (
          <div
            key={b.id}
            className="border border-gray-300 rounded p-4 space-y-2"
          >
            <div>
              <strong>S/N:</strong> {(currentPage - 1) * perPage + idx + 1}
            </div>
            <div>
              <strong>Name:</strong> {b.name}
            </div>
            <div>
              <strong>Phone:</strong> {b.phone_number1}
            </div>
            <div>
              <strong>City:</strong> {b.city}
            </div>
            <button
              onClick={() => openEdit(b)}
              className="text-blue-600 hover:text-blue-800 mt-1"
            >
              <FontAwesomeIcon icon={faEdit} /> Edit
            </button>
          </div>
        ))}
        {slice.length === 0 && (
          <p className="text-center text-gray-500">No businesses yet.</p>
        )}
      </div>

      {/* -------- pagination -------- */}
      {rows.length > 0 && (
        <div className="flex justify-center space-x-3 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {currentPage}/{totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* -------- edit modal -------- */}
      {editTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Edit {editTarget.name}</h3>
              <button onClick={() => setEditTarget(null)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* form fields */}
            <label className="block text-sm font-medium">Address</label>
            <input
              name="address"
              value={editData.address}
              onChange={change}
              className="w-full border p-2 rounded"
            />

            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium">City</label>
                <input
                  name="city"
                  value={editData.city}
                  onChange={change}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">State</label>
                <input
                  name="state"
                  value={editData.state}
                  onChange={change}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>

            <label className="block text-sm font-medium">Phone</label>
            <input
              name="phone_number1"
              value={editData.phone_number1}
              onChange={change}
              className="w-full border p-2 rounded"
            />

            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium">
                  Start&nbsp;Time
                </label>
                <input
                  type="time"
                  name="start"
                  value={editData.start}
                  onChange={change}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">
                  End&nbsp;Time
                </label>
                <input
                  type="time"
                  name="end"
                  value={editData.end}
                  onChange={change}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>

            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              rows="3"
              value={editData.description}
              onChange={change}
              className="w-full border p-2 rounded"
            />

            <label className="block text-sm font-medium">
              Replace / Add Images (max 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={changeImages}
            />
            {previewImgs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {previewImgs.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setEditTarget(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded flex items-center space-x-1"
              >
                <FontAwesomeIcon icon={faSave} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal for Adding a Business */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 overflow-y-auto bg-black/50 items-start justify-center p-4"
        >
          <div className="bg-white p-6 rounded-lg w-full max-w-xl mx-2 max-h-[85vh] overflow-y-auto">
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

              <div>
                <label htmlFor="category" className="font-semibold">
                  Category:
                </label>
                <select
                  name="category"
                  id="category"
                  className="p-2 border rounded-md w-full"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

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
                  Create Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- password modal ---------- */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Change Password</h3>

            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full border p-2 rounded pr-10"
                placeholder="New password"
              />
              {/* eye / eye‑slash icon */}
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              >
                <FontAwesomeIcon icon={showPwd ? faEyeSlash : faEye} />
              </button>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={closePwdModal}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={updatePassword}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
