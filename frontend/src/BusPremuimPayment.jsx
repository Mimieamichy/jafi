import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function PremuimPricing() {
  const { enqueueSnackbar } = useSnackbar();

  /* ---------------- business ID saved earlier ---------------- */
  const busIdNum = Number(localStorage.getItem("busId") ?? 0);

  /* ---------------- price fetched from backend ---------------- */
  const [price, setPrice] = useState(null);          
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPrice = async () => {
      try {
        const r = await fetch(`${baseUrl}/admin/premuimPrice`);
        const data = await r.json();                 
        console.log("Price API →", data);
        setPrice(Number(data.premuimPrice.value));
      } catch (e) {
        console.error(e);
        enqueueSnackbar("Couldn’t fetch price", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    getPrice();
  }, [enqueueSnackbar]);

  /* ---------------- paystack redirect ---------------- */
  const handlePayment = async () => {
    if (!busIdNum) {
      enqueueSnackbar("Business ID not found.", { variant: "error" });
      return;
    }
    if (price == null) return; 

    try {
      const r = await fetch(`${baseUrl}/business/pay/${busIdNum}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price }),
      });
      const res = await r.json();
      const paystackUrl = res?.data?.paymentDetails?.data?.authorization_url;
      if (r.ok && paystackUrl) {
        window.location.href = paystackUrl;          
      } else {
        enqueueSnackbar(`Payment failed: ${res.message || "no link"}`, {
          variant: "error",
        });
      }
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Couldn’t start payment.", { variant: "error" });
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Make Payment</h2>

      <div className="p-4 border rounded-md text-center">
        {loading ? (
          <p className="text-gray-600">Loading price…</p>
        ) : (
          <>
            <p className="text-lg font-bold">${price}</p>
            <button
              onClick={handlePayment}
              disabled={price == null}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg mt-2 disabled:opacity-50"
            >
              Pay Now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
