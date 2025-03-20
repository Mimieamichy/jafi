import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HiringPayment() {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const navigate = useNavigate();

  const handlePayment = (plan) => {
    alert(`Payment successful for: ${plan}`);
    setPaymentSuccess(true);
  };

  const plans = [{ duration: "One Off", price: "$150" }];

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      {!paymentSuccess ? (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center">Make Payment</h2>
          <div className="space-y-4">
            {plans.map((plan, index) => (
              <div key={index} className="p-4 border rounded-md text-center">
                <h3 className="text-xl font-semibold">{plan.duration}</h3>
                <p className="text-lg font-bold">{plan.price}</p>
                <button
                  onClick={() => handlePayment(plan.duration)}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg mt-2"
                >
                  Pay Now
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center w-[10em] mx-auto mb-10">
          <h2 className="text-2xl font-bold text-green-600">
            Payment Successful!
          </h2>
          <p className="text-gray-700 mt-2">
            Your account is undergoing approval, which will take 1-2 working
            days. An email of confirmation will be sent to you. Thank you
          </p>
          <button
            onClick={() => navigate("/hiring-dashboard")}
            className="bg-blue-600 text-white p-3 rounded-lg mt-4"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
