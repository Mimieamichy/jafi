// src/components/Transactions.jsx
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function Transactions() {
  const authToken = localStorage.getItem("userToken");

  const [txs, setTxs] = useState([]);           // all transactions
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
        
        const arr =
          Array.isArray(data) ? data : Array.isArray(data.transactions) ? data.transactions : [];
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

  /* ---------------- pagination ---------------- */
  const itemsPerPage = 20;
  const totalPages = Math.ceil(txs.length / itemsPerPage);
  const slice = txs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ---------------- render ---------------- */
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Transactions</h2>

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
                    <td className="p-2 border">{t.paymentId}</td>
                    <td className="p-2 border capitalize">{t.name}</td>
                    <td className="p-2 border">
                      ₦{Number(t.amount).toLocaleString()}
                    </td>
                    <td className="p-2 border">{t.listingType}</td>
                    <td className="p-2 border capitalize">{t.paymentStatus}</td>
                    <td className="p-2 border">
                      {t.paymentStatus === "unpaid" && (
                        <button
                          title="Verify payment"
                          onClick={() => setVerifyTarget(t)}
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

      {/* ----------- MOBILE CARDS ----------- */}
      <div className="md:hidden space-y-4">
        {slice.length === 0 ? (
          <p className="text-center text-gray-500">No transactions found.</p>
        ) : (
          slice.map((t, idx) => {
            const sn = (currentPage - 1) * itemsPerPage + idx + 1;
            return (
              <div key={t.paymentId} className="border border-gray-300 rounded p-4 space-y-2">
                <div><strong>S/N:</strong> {sn}</div>
                <div><strong>Payment&nbsp;ID:</strong> {t.paymentId}</div>
                <div><strong>Name:</strong> {t.name}</div>
                <div><strong>Amount:</strong> ₦{Number(t.amount).toLocaleString()}</div>
                <div><strong>Listing&nbsp;Type:</strong> {t.listingType}</div>
                <div><strong>Status:</strong> {t.paymentStatus}</div>
                {t.paymentStatus === "unpaid" && (
                  <button
                    title="Verify payment"
                    onClick={() => setVerifyTarget(t)}
                    className="text-green-600 hover:text-green-800 mt-1"
                  >
                    <FontAwesomeIcon icon={faCheck} /> Verify
                  </button>
                )}
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
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
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
              <strong>{verifyTarget.paymentId}</strong> for{" "}
              <strong>{verifyTarget.name}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setVerifyTarget(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => verifyPayment(verifyTarget.referenceId || verifyTarget.paymentId)}
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
