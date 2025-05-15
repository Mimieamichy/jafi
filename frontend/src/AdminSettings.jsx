import { useState, useEffect, useMemo } from "react";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function Settings() {
  const authToken = localStorage.getItem("userToken");
  const { enqueueSnackbar } = useSnackbar();

  const headersJSON = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    }),
    [authToken]
  );

  const [superCount, setSuperCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", role: "admin" });
  const [newPw, setNewPw] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newCatType, setNewCatType] = useState("enterprise");
  const [newCatName, setNewCatName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [enterprisePrice, setEnterprisePrice] = useState(null);
  const [premiumPrice, setPremiumPrice] = useState(null);
  const [enterpriseCategories, setEnterpriseCategories] = useState([]);
  const [premiumCategories, setPremiumCategories] = useState([]);

  const [price, setPrice] = useState({ business: "", service: "" });

  useEffect(() => {
    if (!authToken) return;
    fetch(`${baseUrl}/admin/adminCount`, { headers: headersJSON })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch counts");
        return r.json();
      })
      .then((data) => {
        console.log("adminCount data", data);

        setAdminCount(data.adminCount ?? data.admin ?? 0);
        setSuperCount(data.superAdminCount ?? data.superadmin ?? 0);
      })
      .catch(() => {
        enqueueSnackbar("Could not load admin counts", { variant: "error" });
      });
  }, [authToken, enqueueSnackbar, headersJSON]);

  const addAdmin = async () => {
    if (!form.name || !form.email)
      return enqueueSnackbar("Name & email required", { variant: "warning" });
    if (form.role === "superadmin" && superCount >= 3)
      return enqueueSnackbar("Max 2 super-admins", { variant: "error" });
    if (form.role === "admin" && adminCount >= 20)
      return enqueueSnackbar("Max 20 admins", { variant: "error" });

    try {
      const r = await fetch(`${baseUrl}/admin/createAdmin`, {
        method: "POST",
        headers: headersJSON,
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      enqueueSnackbar("Admin added", { variant: "success" });
      setSuperCount((c) => c + (form.role === "superadmin" ? 1 : 0));
      setAdminCount((c) => c + (form.role === "admin" ? 1 : 0));
      setForm({ name: "", email: "", role: "admin" });
    } catch {
      enqueueSnackbar("Add failed", { variant: "error" });
    }
  };

  const changePw = async () => {
    if (!newPw)
      return enqueueSnackbar("Enter a new password", { variant: "warning" });
    try {
      const r = await fetch(`${baseUrl}/admin/updateAdminPassword`, {
        method: "PUT",
        headers: headersJSON,
        body: JSON.stringify({ newPassword: newPw }),
      });
      if (!r.ok) throw new Error();
      enqueueSnackbar("Password updated", { variant: "success" });
      setNewPw("");
    } catch {
      enqueueSnackbar("Update failed", { variant: "error" });
    }
  };

  const handleAddCategory = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed)
      return enqueueSnackbar("Please enter a category name.", {
        variant: "warning",
      });

    try {
      const res = await fetch(`${baseUrl}/admin/addCategory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ type: newCatType, categoryName: trimmed }),
      });

      if (!res.ok) throw new Error(await res.text());
      enqueueSnackbar(
        `${
          newCatType === "enterprise" ? "Enterprise" : "Premium"
        } category added!`,
        { variant: "success" }
      );
      setNewCatName("");
    } catch (err) {
      enqueueSnackbar(err.message || "Error adding category", {
        variant: "error",
      });
    }
  };

  const pushPrice = async (field) => {
    if (!price[field])
      return enqueueSnackbar("Enter a price first", { variant: "warning" });
    const map = {
      enterprise: "enterprisePrice",
      premuim: "premiumPrice",
      service: "updateServicePrice",
    };
    try {
      const r = await fetch(`${baseUrl}/admin/${map[field]}`, {
        method: "PUT",
        headers: headersJSON,
        body: JSON.stringify({ price: Number(price[field]) }),
      });
      if (!r.ok) throw new Error();
      enqueueSnackbar("Price updated", { variant: "success" });
    } catch {
      enqueueSnackbar("Price update failed", { variant: "error" });
    }
  };

  const fetchPricesAndCategories = async () => {
  try {
    const [epRes, ppRes, ecRes, pcRes] = await Promise.all([
      fetch(`${baseUrl}/admin/enterprisePrice`, { headers: headersJSON }),
      fetch(`${baseUrl}/admin/premiumPrice`, { headers: headersJSON }),
      fetch(`${baseUrl}/admin/enterpriseCategories`, { headers: headersJSON }),
      fetch(`${baseUrl}/admin/premiumCategories`, { headers: headersJSON }),
    ]);

    const enterprisePriceData = await epRes.json();
    const premiumPriceData = await ppRes.json();
    const enterpriseCategoriesData = await ecRes.json();
    const premiumCategoriesData = await pcRes.json();

    setEnterprisePrice(enterprisePriceData.enterprisePrice);
    setPremiumPrice(premiumPriceData.premiumPrice);

    // 👇 Extract the actual array
    setEnterpriseCategories(Array.isArray(enterpriseCategoriesData.categories)
      ? enterpriseCategoriesData.categories.map((name, i) => ({ id: i, name }))
      : []);

    setPremiumCategories(Array.isArray(premiumCategoriesData.categories)
      ? premiumCategoriesData.categories.map((name, i) => ({ id: i, name }))
      : []);

    setShowModal(true);
  } catch (err) {
    console.error('Error fetching data:', err);
    enqueueSnackbar("Failed to load categories or pricing", { variant: "error" });
  }
};


  const deleteCategory = async (name) => {
    try {
      await fetch(`${baseUrl}/admin/deleteCategory`, {
        method: "DELETE",
        headers: headersJSON,
        body: JSON.stringify({ categoryName: name }),
      });
      enqueueSnackbar("Category Deleted", { variant: "info" });
      // Optionally re-fetch categories
      fetchPricesAndCategories();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-center">Admin Settings</h2>

      {/* Add Admin */}
      <section className="space-y-2">
        <h3 className="font-semibold text-lg">Add Admin</h3>

        <div className="space-y-2">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 w-full rounded"
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 w-full rounded"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border p-2 w-full rounded"
          >
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
          <button
            onClick={addAdmin}
            disabled={
              (form.role === "superadmin" && superCount >= 3) ||
              (form.role === "admin" && adminCount >= 20)
            }
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
          >
            Add
          </button>
          <p className="text-xs text-gray-500 text-center">
            {superCount}/3 super‑admins • {adminCount}/20 admins
          </p>
        </div>
      </section>

      {/* Change Password */}
      <section className="space-y-2">
        <h3 className="font-semibold text-lg">Change Password</h3>

        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            placeholder="New Password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="border p-2 w-full rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
          >
            <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} />
          </button>
        </div>

        <button
          onClick={changePw}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
        >
          Update Password
        </button>
      </section>
      

      {/* Add New Category */}
      <section className="space-y-2">
        <h3 className="font-semibold text-lg">Add New Category</h3>

        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="enterprise"
              checked={newCatType === "enterprise"}
              onChange={() => setNewCatType("enterprise")}
            />
            <span>Enterprise</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="premium"
              checked={newCatType === "premium"}
              onChange={() => setNewCatType("premium")}
            />
            <span>Premium</span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Category name"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="border p-2 rounded flex-1 capitalize"
          />
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full sm:w-auto"
          >
            Add
          </button>
        </div>
      </section>

      {/* Update Pricing */}
      <section className="space-y-2">
        <h3 className="font-semibold text-lg">Update Pricing</h3>

        {["enterprise", "premuim", "service"].map((field) => (
          <div
            key={field}
            className="flex flex-col sm:flex-row sm:items-center gap-2"
          >
            <label className="capitalize font-medium sm:w-32">{field}</label>
            <input
              type="number"
              value={price[field]}
              onChange={(e) => setPrice({ ...price, [field]: e.target.value })}
              className="border p-2 rounded flex-1"
            />
            <button
              onClick={() => pushPrice(field)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full sm:w-auto"
            >
              Save
            </button>
          </div>
        ))}
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto space-y-4 shadow-lg">

            <h3 className="text-lg font-bold text-center">
              Pricing & Categories
            </h3>

            <div>
              <p>
                <strong>Enterprise Price:</strong>{" "}
                {enterprisePrice?.value || "N/A"}
              </p>
              <p>
                <strong>Premium Price:</strong> {premiumPrice?.value || "N/A"}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mt-4">Enterprise Categories</h4>
              <ul className="space-y-1">
                {enterpriseCategories.map((cat) => (
                  <li
                    key={cat.id}
                    className="flex justify-between items-center border p-2 rounded"
                  >
                    {cat.name}
                    <button
                      onClick={() => deleteCategory(cat.name)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mt-4">Premium Categories</h4>
              <ul className="space-y-1">
                {premiumCategories.map((cat) => (
                  <li
                    key={cat.id}
                    className="flex justify-between items-center border p-2 rounded"
                  >
                    {cat.name}
                    <button
                      onClick={() => deleteCategory(cat.name)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mt-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={fetchPricesAndCategories}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-50"
      >
        View Categories & Prices
      </button>
    </div>
  );
}
