// src/components/MyAddedBusinesses.jsx
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function AdminBusiness() {
  const authToken = localStorage.getItem("userToken");
  const { enqueueSnackbar } = useSnackbar();

  /* ---------------- state ---------------- */
  const [rows, setRows] = useState([]);
 ;
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const totalPagess = Math.ceil(total / limit);

  const [editTarget, setEditTarget] = useState(null); // full biz obj
  const [editData, setEditData] = useState({}); // working copy
  const [previewImgs, setPreviewImgs] = useState([]);

  /* ---------------- fetch only *my* businesses ---------------- */
  /* example with async / await */
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await fetch(`${baseUrl}/admin/myBusiness?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();

        // 👇 inspect everything that comes back
        console.log("MY‑BUSINESSES API →", data);
        const rowsArr = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.data)
          ? data.data // if backend ever sends an array here
          : data.data
          ? [data.data] // wrap single object
          : [];

        setRows(rowsArr);
        setTotal(data.meta.total); 
        console.log("total", data.meta.total); // total number of businesses
        // total number of businesses
      } catch (e) {
        console.error("my‑businesses error", e);
      }
    };
    fetchBusinesses();
  }, [authToken, page, limit]);

  /* ---------------- pagination helpers ---------------- */
  

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
      <h2 className="text-2xl font-bold mb-4">My Added Businesses</h2>

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
            {rows.map((b, idx) => (
              <tr key={b.id} className="border-t text-center">
                <td className="p-2 border">{idx + 1 + (page - 1) * limit}</td>
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
            {rows.length === 0 && (
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
        {rows.map((b, idx) => (
          <div
            key={b.id}
            className="border border-gray-300 rounded p-4 space-y-2"
          >
           <div><strong>S/N:</strong> {idx + 1 + (page - 1) * limit}</div>
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
        {rows.length === 0 && (
          <p className="text-center text-gray-500">No businesses yet.</p>
        )}
      </div>

      {/* -------- pagination -------- */}
      
        <div className="flex justify-center space-x-3 mt-4">
          <button
           onClick={() => setPage(p => Math.max(p - 1, 1))}
           disabled={page === 1}
            
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
          Page <strong>{page}</strong> of <strong>{totalPagess}</strong>
          </span>
          <button
             onClick={() => setPage(p => Math.min(p + 1, totalPagess))}
             disabled={page === totalPagess}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
    

      {/* -------- edit modal -------- */}
      {editTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
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
    </div>
  );
}
