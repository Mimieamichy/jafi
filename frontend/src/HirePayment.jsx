import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function HiringPayment() {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  /* ---------- service ID that was stashed earlier ---------- */
  const serviceIdNum = Number(
    location.state?.serviceId ?? localStorage.getItem("serviceId") ?? 0
  );

  /* ---------- price fetched from backend ---------- */
  const [price, setPrice] = useState(null); // null ⇒ loading
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const r = await fetch(`${baseUrl}/admin/servicePrice`);
        const data = await r.json(); // expect { price: 150 }
        console.log("Service price →", data.price);
        console.log("Service price →", data.price);
        console.log("Service price →", data.price.value);
        setPrice(data.price);
      } catch (e) {
        console.error(e);
        enqueueSnackbar("Couldn’t fetch price", { variant: "error" });
      } finally {
        setLoad(false);
      }
    };
    fetchPrice();
  }, [enqueueSnackbar]);

  /* ---------- Paystack redirect ---------- */
  const payNow = async () => {
    if (!serviceIdNum) {
      enqueueSnackbar("Service ID not found.", { variant: "error" });
      return;
    }
    if (price == null) return; // still loading / failed

    try {
      const r = await fetch(`${baseUrl}/service/pay/${serviceIdNum}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price.value }),
      });
      const res = await r.json();
      const paystackUrl = res?.data?.paymentDetails?.data?.authorization_url;
      if (r.ok && paystackUrl) {
        window.location.href = paystackUrl; // 🎉
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

  /* ---------- UI ---------- */
  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Make Payment</h2>

      <div className="p-4 border rounded-md text-center">
        {loading ? (
          <p className="text-gray-600">Loading price…</p>
        ) : (
          <>
            <p className="text-lg font-bold">${price.value}</p>
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
