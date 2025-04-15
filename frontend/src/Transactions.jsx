import { useState, useEffect } from "react";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(storedTransactions);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Transactions</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Payment ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Service</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{tx.paymentId}</td>
              <td className="p-2">{tx.name}</td>
              <td className="p-2">${tx.amount}</td>
              <td className="p-2">{tx.service}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
