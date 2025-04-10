import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Optionally clear serviceId from storage
    localStorage.removeItem("serviceId");
    localStorage.removeItem("busId");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-700 mb-4">
          Thank you for your payment. We’ll get back to you through email within
          1–2 working days after reviewing your submission.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
