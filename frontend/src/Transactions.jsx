// src/components/Transactions.jsx
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function Transactions() {
  const authToken = localStorage.getItem("userToken");
  const { enqueueSnackbar } = useSnackbar();

  const [txs, setTxs] = useState([]); // all transactions
  const [searchTerm, setSearchTerm] = useState("");
 
  const [verifyTarget, setVerifyTarget] = useState(null); 
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);// tx awaiting confirm

  /* ---------------- fetch transactions ---------------- */
  useEffect(() => {
    if (!authToken) return;

    fetch(`${baseUrl}/payment/view?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        console.log("transdata", data);

        const arr = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.data)
          ? data.data
          : [];
        setTxs(arr);
        const total = data.meta.total ?? 0;
        setTotalPages(Math.ceil(total / limit));
      })
      .catch((err) => console.error("transactions error", err));
  }, [authToken, page, limit]);

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
      enqueueSnackbar("Transaction Verified", { variant: "success" });
    } catch (err) {
      enqueueSnackbar("Verification failed", { variant: "error" });
      console.error(err);
    } finally {
      setVerifyTarget(null);
    }
  };

  // ─── filtered list based on searchTerm ───────────────
  const filteredTxs = txs.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      String(t.payment_reference).toLowerCase().includes(term) ||
      String(t.entity_type).toLowerCase().includes(term)
    );
  });

  
  
  

  // ─── reset to page 1 when searchTerm changes ─────────
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);
  //  Add the export handler:
  const handleExport = async () => {
    try {
      const res = await fetch(`${baseUrl}/admin/exportTransactions`, {
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
      a.download = "transactions.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to export Transactions", { variant: "error" });
    }
  };

  /* ---------------- render ---------------- */
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        Transactions
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
          placeholder="Search by Payment ID or Listing Type"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1); // Reset to first page on search
          }}
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
            {filteredTxs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filteredTxs.map((t, idx) => {
               
                return (
                  <tr key={t.paymentId} className="border-t text-center">
                    <td className="p-2 border"> {(page - 1) * limit + idx + 1}</td>
                    <td className="p-2 border">{t.payment_reference}</td>
                    <td className="p-2 border capitalize">{t.user.name}</td>
                    <td className="p-2 border">
                      ${Number(t.amount).toLocaleString()}
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
        {filteredTxs.length === 0 ? (
          <p className="text-center text-gray-500">No transactions found.</p>
        ) : (
          filteredTxs.map((t, idx) => {
            
            return (
              <div
                key={t.paymentId}
                className="border border-gray-300 rounded p-4 space-y-2"
              >
                <div>
                  <strong>S/N:</strong>  {(page - 1) * limit + idx + 1}
                </div>
                <div>
                  <strong>Payment&nbsp;ID:</strong> {t.payment_reference}
                </div>
                <div>
                  <strong>Name:</strong> {t.user.name}
                </div>
                <div>
                  <strong>Amount:</strong> ${Number(t.amount).toLocaleString()}
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
