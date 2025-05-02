// src/components/Claims.jsx
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faDownload } from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function Claims() {
  const authToken = localStorage.getItem("userToken");
  const { enqueueSnackbar } = useSnackbar();

  /* ---------------- state ---------------- */
  const [claims, setClaims] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // approve‑confirmation modal
  const [approveTarget, setApproveTarget] = useState(null);

  /* ---------------- fetch all claims ---------------- */
  useEffect(() => {
    if (!authToken) return;

    fetch(`${baseUrl}/admin/claims`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        // expect either [] or {claims:[…]}
        console.log("datac", data);

        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data.claims)
          ? data.claims
          : [];
        setClaims(arr);
      })
      .catch((err) => console.error("claims‑fetch error", err));
  }, [authToken]);

  /* ---------------- approve handler ---------------- */
  const approveClaim = async (id) => {
    try {
      await fetch(`${baseUrl}/admin/approveClaim/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      // mark as approved locally so the button disappears
      /* after approve succeeds */
      setClaims((prev) =>
        prev.map((claim) =>
          claim.id === id ? { ...claim, status: "approved" } : claim
        )
      );
      enqueueSnackbar("Claim Successful", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(err, "Approve failed", { variant: "error" });
    } finally {
      setApproveTarget(null);
    }
  };

  


  /* ---------------- pagination ---------------- */
  const itemsPerPage = 20;
  const totalPages = Math.ceil(claims.length / itemsPerPage);
  const pageSlice = claims.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const getFileName = (proofUrl) => {
    if (!proofUrl) return "";
    // convert backslashes to forward slashes:
    const normalized = proofUrl.replace(/\\/g, "/");
    const parts = normalized.split("/");
    return parts[parts.length - 1];
  };
  

  /* ---------------- render ---------------- */
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Pending Claims</h2>

      {/* ------------ DESKTOP TABLE ------------ */}
      <div className="hidden md:block overflow-x-auto border border-gray-300 rounded">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">S/N</th>              
              <th className="p-2 border">Business Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Transaction Id</th>
              <th className="p-2 border">POB</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageSlice.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  No claims found.
                </td>
              </tr>
            ) : (
              pageSlice.map((c, idx) => {
                const sn = (currentPage - 1) * itemsPerPage + idx + 1;
                return (
                  <tr key={c.id} className="border-t text-center">
                    <td className="p-2 border">{sn}</td>         
                    <td className="p-2 border">{c.bussinessName}</td>
                    <td className="p-2 border">{c.email}</td>
                    <td className="p-2 border">{c.transactionId}</td>
                    <td className="p-2 border">
                      <a
                        href={`${baseUrl}/download/${getFileName(
                          c.proof
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="text-blue-600 hover:underline"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                        Download
                      </a>
                    </td>
                    <td className="p-2 border">
                      {c.status === "pending" && (
                        <button
                          title="Approve"
                          onClick={() => setApproveTarget(c)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ------------ MOBILE CARDS ------------ */}
      <div className="md:hidden space-y-4">
        {pageSlice.length === 0 ? (
          <p className="text-center text-gray-500">No claims found.</p>
        ) : (
          pageSlice.map((c, idx) => {
            const sn = (currentPage - 1) * itemsPerPage + idx + 1;
            return (
              <div
                key={c.id}
                className="border border-gray-300 rounded p-4 space-y-2"
              >
                <div>
                  <strong>S/N:</strong> {sn}
                </div>
                <div>
                  <strong>Email:</strong> {c.email}
                </div>
                <div>
                  <strong>Phone:</strong> {c.phone}
                </div>
                <div>
                  <strong>POB:</strong>{" "}
                  <a
                    href={c.proof}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="text-blue-600 hover:underline"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    Download
                  </a>
                </div>

                {c.status === "pending" && (
                  <button
                    title="Approve"
                    onClick={() => setApproveTarget(c)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <FontAwesomeIcon icon={faCheck} /> Approve
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ------------ Pagination ------------ */}
      {claims.length > 0 && (
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

      {/* ------------ Approve Confirmation Modal ------------ */}
      {approveTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h4 className="text-lg font-bold mb-4">Approve Claim?</h4>
            <p className="mb-4">
              Approve claim for&nbsp;<strong>{approveTarget.email}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setApproveTarget(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => approveClaim(approveTarget.id)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
