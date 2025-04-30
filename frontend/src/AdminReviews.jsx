// src/components/Reviews.jsx
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash, faStar } from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function Reviews() {
  const authToken = localStorage.getItem("userToken");
  const { enqueueSnackbar } = useSnackbar();

  const [reviewers, setReviewers] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const filteredReviewers = reviewers.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.name?.toLowerCase().includes(term) ||
      r.email?.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // modal state
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const renderStars = (n) =>
    [...Array(Number(n))].map((_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className="text-yellow-500 mr-0.5"
      />
    ));

  const reviewsForTarget = viewTarget
    ? allReviews.filter((rv) => rv.userId === viewTarget.id)
    : [];

  /* ---------- fetch reviewers & reviews ---------- */
  useEffect(() => {
    if (!authToken) return;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    // reviewers
    fetch(`${baseUrl}/admin/reviewers?page=${page}&limit=${limit}`, { headers })
      .then((r) => r.json())
      .then((data) => {
        console.log("Reviewers →", data);
        setReviewers(Array.isArray(data.data) ? data.data : data.data || []);
        const total = data.meta.total ?? 0;
        setTotalPages(Math.ceil(total / limit));
      })
      .catch((err) => console.error("reviewers err", err));

    // reviews
    fetch(`${baseUrl}/admin/reviews`, { headers })
      .then((r) => r.json())
      .then((data) => {
        console.log("Reviews →", data);
        setAllReviews(Array.isArray(data) ? data : data.reviews || []);
      })
      .catch((err) => console.error("reviews err", err));
  }, [authToken, page, limit]);

  /* ---------- delete reviewer ---------- */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`${baseUrl}/admin/deleteReviewer/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setReviewers((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      return enqueueSnackbar("Reviewer deleted successfully", {
        variant: "success",
      });
    } catch {
      return enqueueSnackbar("Delete failed", { variant: "error" });
    } finally {
      setDeleteTarget(null);
      setShowDeleteModal(false);
    }
  };

  // 1️⃣ Add the export handler:
  const handleExport = async () => {
    try {
      const res = await fetch(`${baseUrl}/admin/exportReviews`, {
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
      a.download = "reviews.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to export Reviews", { variant: "error" });
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        Reviewers
        <button
          onClick={handleExport}
          className="px-2 py-1 mx-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export CSV
        </button>
      </h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1); // Reset to first page on search
          }}
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded"
        />
      </div>

      {/* -------- Desktop table -------- */}
      <div className="hidden md:block overflow-x-auto border border-gray-300 rounded">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">S/N</th>
              <th className="p-2 border">Reviewer&#39;s Name</th>
              <th className="p-2 border">Reviewer&#39;s Email</th>
              <th className="p-2 border">Total Reviews</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviewers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  No reviewers found.
                </td>
              </tr>
            ) : (
              filteredReviewers.map((r, idx) => {
                const reviewCount = allReviews.filter(
                  (rv) => rv.userId === r.id
                ).length;
                return (
                  <tr key={r.id} className="border-t text-center">
                    <td className="p-2 border">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="p-2 border capitalize">{r.name}</td>
                    <td className="p-2 border">{r.email}</td>
                    <td className="p-2 border">{reviewCount}</td>
                    <td className="p-2 border space-x-2">
                      <button
                        title="View"
                        onClick={() => setViewTarget(r)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => {
                          setDeleteTarget(r);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* -------- Mobile cards -------- */}
      <div className="md:hidden space-y-4">
        {filteredReviewers.length === 0 ? (
          <p className="text-center text-gray-500">No reviewers found.</p>
        ) : (
          filteredReviewers.map((r, idx) => {
            const reviewCount = allReviews.filter(
              (rv) => rv.userId === r.id
            ).length;
            return (
              <div
                key={r.id}
                className="border border-gray-300 rounded p-4 space-y-2"
              >
                <div>
                  <strong>S/N:</strong> {(page - 1) * limit + idx + 1}
                </div>
                <div>
                  <strong>Reviewer&#39;s Name:</strong> {r.name}
                </div>
                <div>
                  <strong>Reviewer&#39;s Email:</strong> {r.email}
                </div>
                <div>
                  <strong>Total Reviews:</strong> {reviewCount}
                </div>
                <div className="flex space-x-4 pt-1">
                  <button
                    title="View"
                    onClick={() => setViewTarget(r)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => {
                      setDeleteTarget(r);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* -------- Pagination -------- */}
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

      {/* -------- View Modal -------- */}
      {viewTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto space-y-3">
            <h3 className="text-xl font-bold">{viewTarget.name}</h3>
            {reviewsForTarget.length === 0 ? (
              <p className="text-gray-600">No reviews from this user.</p>
            ) : (
              reviewsForTarget.map((rv) => (
                <div key={rv.id} className="border-t pt-2">
                  <p>
                    <strong>Listing Name:</strong> {rv.listingName}
                  </p>
                  <p>
                    <strong>Rating:</strong>{" "}
                    {renderStars(rv.star_rating || rv.star)}
                  </p>
                  <p>
                    <strong>Comment:</strong> {rv.comment}
                  </p>
                </div>
              ))
            )}

            <button
              onClick={() => setViewTarget(null)}
              className="mt-2 px-4 py-2 bg-gray-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* -------- Delete Modal -------- */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h4 className="text-lg font-bold mb-4">Delete Reviewer?</h4>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>?
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
