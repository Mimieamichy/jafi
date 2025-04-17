import { useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";

export default function ClaimPricing() {
  const { enqueueSnackbar } = useSnackbar();
 
  const busId = localStorage.getItem("claimbusId");
  const busIdNum = parseInt(busId);
  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  console.log(busIdNum);
  console.log(busId);
  
  

  const plan = { price: 150 };

  const handlePayment = async () => {
    if (!busIdNum) {
      enqueueSnackbar("Business ID not found.", { variant: "error" });
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/claim/pay/${busIdNum}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: plan.price }),
      });

      const result = await response.json();
      console.log("Payment result:", result);
      const paystackUrl = result?.data?.paymentDetails?.data?.authorization_url;

      if (response.ok && paystackUrl) {
        window.location.href = paystackUrl; // ✅ Redirect to Paystack
      } else {
        enqueueSnackbar(
          `Payment failed: ${result.message || "No redirect link received"}`,
          {
            variant: "info",
          }
        );
      }
    } catch (error) {
      console.error("Payment error:", error);

      enqueueSnackbar("Something went wrong while initiating payment.", {
        variant: "error",
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Make Payment</h2>
      <div className="p-4 border rounded-md text-center">
        <p className="text-lg font-bold">${plan.price}</p>
        <button
          onClick={handlePayment}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg mt-2"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
}
