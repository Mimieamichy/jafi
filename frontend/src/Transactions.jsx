// src/components/Transactions.jsx
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function Transactions() {
  const authToken = localStorage.getItem("userToken");

  const [txs, setTxs] = useState([]); // all transactions
  const [searchTerm, setSearchTerm] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const [verifyTarget, setVerifyTarget] = useState(null); // tx awaiting confirm

  /* ---------------- fetch transactions ---------------- */
  useEffect(() => {
    if (!authToken) return;

    fetch(`${baseUrl}/payment/view`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        console.log("transdata", data);

        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data.transactions)
          ? data.transactions
          : [];
        setTxs(arr);
      })
      .catch((err) => console.error("transactions error", err));
  }, [authToken]);

  

  /* ---------------- verify handler ---------------- */
  const verifyPayment = async (refId) => {
    try {
      await fetch(`${baseUrl}/payment/verify/${refId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      // mark verified in UI
      setTxs((prev) =>
        prev.map((t) =>
          t.referenceId === refId ? { ...t, paymentStatus: "verified" } : t
        )
      );
    } catch (err) {
      alert("Verification failed");
      console.error(err);
    } finally {
      setVerifyTarget(null);
    }
  };

  // ─── filtered list based on searchTerm ───────────────
  const filteredTxs = txs.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      String(t.entity_id).toLowerCase().includes(term) ||
      String(t.entity_type).toLowerCase().includes(term)
    );
  });

  // ─── pagination using filteredTxs ────────────────────
  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage);
  const slice = filteredTxs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ─── reset to page 1 when searchTerm changes ─────────
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  /* ---------------- render ---------------- */
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Transactions</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Payment ID or Listing Type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded"
        />
      </div>

      {/* ----------- DESKTOP TABLE ----------- */}
      <div className="hidden md:block overflow-x-auto border border-gray-300 rounded">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">S/N</th>
              <th className="p-2 border">Payment&nbsp;ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Listing&nbsp;Type</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  No transactions found.
                </td>
              </tr>
            ) : (
              slice.map((t, idx) => {
                const sn = (currentPage - 1) * itemsPerPage + idx + 1;
                return (
                  <tr key={t.paymentId} className="border-t text-center">
                    <td className="p-2 border">{sn}</td>
                    <td className="p-2 border">{t.entity_id}</td>
                    <td className="p-2 border capitalize">{t.user.name}</td>
                    <td className="p-2 border">
                      ₦{Number(t.amount).toLocaleString()}
                    </td>
                    <td className="p-2 border">{t.entity_type}</td>
                    <td className="p-2 border capitalize">{t.status}</td>
                    <td className="p-2 border">
                      
                        <button
                          title="Verify payment"
                          onClick={() => setVerifyTarget(t)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                     
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ----------- MOBILE CARDS ----------- */}
      <div className="md:hidden space-y-4">
        {slice.length === 0 ? (
          <p className="text-center text-gray-500">No transactions found.</p>
        ) : (
          slice.map((t, idx) => {
            const sn = (currentPage - 1) * itemsPerPage + idx + 1;
            return (
              <div
                key={t.paymentId}
                className="border border-gray-300 rounded p-4 space-y-2"
              >
                <div>
                  <strong>S/N:</strong> {sn}
                </div>
                <div>
                  <strong>Payment&nbsp;ID:</strong> {t.entity_id}
                </div>
                <div>
                  <strong>Name:</strong> {t.user.name}
                </div>
                <div>
                  <strong>Amount:</strong> ₦{Number(t.amount).toLocaleString()}
                </div>
                <div>
                  <strong>Listing&nbsp;Type:</strong> {t.entity_type}
                </div>
                <div>
                  <strong>Status:</strong> {t.status}
                </div>
                
                  <button
                    title="Verify payment"
                    onClick={() => setVerifyTarget(t)}
                    className="text-green-600 hover:text-green-800 mt-1"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    Verify
                  </button>
                
              </div>
            );
          })
        )}
      </div>

      {/* ----------- Pagination ----------- */}
      {txs.length > 0 && (
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

      {/* ----------- Verify confirmation modal ----------- */}
      {verifyTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h4 className="text-lg font-bold mb-4">Verify Payment?</h4>
            <p className="mb-4">
              Confirm payment&nbsp;
              
              <strong>{verifyTarget.user.name}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setVerifyTarget(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => verifyPayment(verifyTarget.payment_reference)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
