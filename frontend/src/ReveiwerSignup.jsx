import { useState } from "react"; // Replace with your actual base URL


const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function ReviewerSignup() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}/review/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to register. Try again.");

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">
          Registration Successful!
        </h2>
        <p className="text-gray-700">
          Please check your email for your login password.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow"
    >
      <h2 className="text-2xl font-bold mb-6">Reviewer Sign Up</h2>
      {error && (
        <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}
      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor="name">
          Name
        </label>
        <input
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>
      <div className="mb-6">
        <label className="block mb-1 font-medium" htmlFor="email">
          Email
        </label>
        <input
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Sign Up"}
      </button>
    </form>
  );
}
