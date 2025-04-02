import {  useLocation } from "react-router-dom"

export default function HiringPayment() {
  const location = useLocation()
  const serviceId = location.state?.serviceId || localStorage.getItem("serviceId")
  const serviceIdNum = parseInt(serviceId)

  const plan = { price: 150 }

  const handlePayment = async () => {
    if (!serviceIdNum) {
      alert("Service ID not found.")
      return
    }

    try {
      const response = await fetch(`http://localhost:4900/api/v1/service/pay/${serviceIdNum}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: plan.price }),
      })

      const result = await response.json()
      const paystackUrl = result?.data?.paymentDetails?.data?.authorization_url

      if (response.ok && paystackUrl) {
        window.location.href = paystackUrl // ✅ Redirect to Paystack
      } else {
        alert(`Payment init failed: ${result.message || "No redirect link received"}`)
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Something went wrong while initiating payment.")
    }
  }

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
  )
}
