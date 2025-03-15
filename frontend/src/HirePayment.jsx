import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HiringPayment() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState(1); // 1 = Select Plan, 2 = Payment, 3 = Confirmation

  const plans = [
    { duration: "1 Month", price: 150 },
    { duration: "3 Months", price: 400 },
    { duration: "6 Months", price: 750 },
  ];
  const navigate = useNavigate();

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setStep(2); // Move to payment step
  };

  const handlePayment = () => {
    setStep(3); // Move to confirmation step
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg text-center">
      {step === 1 && (
        <>
          <h2 className="text-2xl font-bold mb-4">Choose a Pricing Plan</h2>
          <div className="space-y-4">
            {plans.map((plan, index) => (
              <button
                key={index}
                className="w-full p-4 border rounded-lg text-lg font-semibold bg-gray-100 hover:bg-gray-200"
                onClick={() => handleSelectPlan(plan)}
              >
                {plan.duration} - ${plan.price}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-2xl font-bold mb-4">Confirm Payment</h2>
          <p className="text-lg mb-4">
            You selected <strong>{selectedPlan.duration}</strong> for{" "}
            <strong>${selectedPlan.price}</strong>
          </p>
          <button
            onClick={handlePayment}
            className="w-full bg-blue-600 text-white p-3 rounded-lg"
          >
            Pay Now
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Payment Successful!
          </h2>
          <p className="text-gray-700">
            Your account is undergoing approval, which will take 1-2 working
            days. An email confirmation will be sent to you.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white p-3 rounded-lg mt-4"
          >
            Go to Homepage
          </button>
        </>
      )}
    </div>
  );
}
