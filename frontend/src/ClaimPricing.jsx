import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function ClaimPricing() {
  const { enqueueSnackbar } = useSnackbar();

  /* ------- IDs previously stashed in localStorage ------- */
  const busIdNum  = Number(localStorage.getItem("claimbusId")  ?? 0);
  const claimNum  = Number(localStorage.getItem("claimid")     ?? 0);

  /* ------- price fetched from backend ------- */
  const [price,   setPrice]   = useState(null);   // null = loading/error
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPrice = async () => {
      try {
        const r = await fetch(`${baseUrl}/admin/businessPrice`);
        const data = await r.json();              // { price: 150 }
        console.log("Business price →", data);
        setPrice(Number(data.businessPrice.value));
      } catch (e) {
        console.error(e);
        enqueueSnackbar("Couldn’t fetch claim fee", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    getPrice();
  }, [enqueueSnackbar]);

  /* ------- Paystack redirect ------- */
  const payNow = async () => {
    if (!busIdNum || !claimNum) {
      enqueueSnackbar("Missing claim or business ID.", { variant: "error" });
      return;
    }
    if (price == null) return;                    // still loading / failed

    try {
      const r = await fetch(
        `${baseUrl}/claim/pay/${busIdNum}/${claimNum}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: price }),
        }
      );
      const res = await r.json();
      const url = res?.data?.paymentDetails?.data?.authorization_url;
      if (r.ok && url) {
        window.location.href = url;               // 🡒 Paystack
      } else {
        enqueueSnackbar(
          `Payment failed: ${res.message || "no link returned"}`,
          { variant: "error" }
        );
      }
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Couldn’t start payment.", { variant: "error" });
    }
  };

  /* ------- UI ------- */
  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Make Payment</h2>

      <div className="p-4 border rounded-md text-center">
        {loading ? (
          <p className="text-gray-600">Loading price…</p>
        ) : (
          <>
            <p className="text-lg font-bold">${price}</p>
            <button
              onClick={payNow}
              disabled={price == null}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg mt-2 disabled:opacity-50"
            >
              Pay Now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
