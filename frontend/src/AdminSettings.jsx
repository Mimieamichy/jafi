// src/components/Settings.jsx
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function Settings() {
  const authToken = localStorage.getItem("userToken");
  const { enqueueSnackbar } = useSnackbar();

  /* ---------- state ---------- */
  const [superCount, setSuperCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);

  const [form, setForm] = useState({ name: "", email: "", role: "admin" });
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [price, setPrice] = useState({ business: "", service: "" });

  const headersJSON = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  };

  /* ---------- add admin / super‑admin ---------- */
  const addAdmin = async () => {
    if (!form.name || !form.email)
      return enqueueSnackbar("Name & email required", { variant: "warning" });
    if (form.role === "superadmin" && superCount >= 2)
      return enqueueSnackbar("Max 2 super‑admins", { variant: "error" });
    if (form.role === "admin" && adminCount >= 10)
      return enqueueSnackbar("Max 10 admins", { variant: "error" });

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

  /* ---------- change password ---------- */
  const changePw = async () => {
    if (!oldPw || !newPw)
      return enqueueSnackbar("Enter both passwords", { variant: "warning" });
    try {
      const r = await fetch(`${baseUrl}/admin/updateAdminPassword`, {
        method: "PUT",
        headers: headersJSON,
        body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
      });
      if (!r.ok) throw new Error();
      enqueueSnackbar("Password updated", { variant: "success" });
      setOldPw("");
      setNewPw("");
    } catch {
      enqueueSnackbar("Update failed", { variant: "error" });
    }
  };

  /* ---------- push price helper ---------- */
  const pushPrice = async (field) => {
    if (!price[field])
      return enqueueSnackbar("Enter a price first", { variant: "warning" });
    const map = {
      business: "updateBusinessPrice",
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

  /* ---------- UI ---------- */
  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold">Admin Settings</h2>

      {/* ---- Add Admin ---- */}
      <section>
        <h3 className="font-semibold mb-2">Add (super‑)admin</h3>

        <label className="block text-sm mb-1">Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 w-full rounded mb-2"
        />

        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 w-full rounded mb-2"
        />

        <label className="block text-sm mb-1">Role</label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border p-2 w-full rounded"
        >
          <option value="admin">admin</option>
          <option value="superadmin">superadmin</option>
        </select>

        <button
          onClick={addAdmin}
          disabled={
            (form.role === "superadmin" && superCount >= 2) ||
            (form.role === "admin" && adminCount >= 10)
          }
          className="bg-blue-600 text-white px-4 py-2 rounded mt-3 disabled:opacity-50 w-full sm:w-auto"
        >
          Add
        </button>

        <p className="text-xs text-gray-500 mt-1">
          {superCount}/2 super‑admins • {adminCount}/10 admins
        </p>
      </section>

      {/* ---- Change Password ---- */}
      {/* ---- Change Password ---- */}
      <section>
        <h3 className="font-semibold mb-2">Change Password</h3>

        {/* old password */}
        <div className="relative mb-2">
          <input
            type={showOld ? "text" : "password"}
            placeholder="Old password"
            value={oldPw}
            onChange={(e) => setOldPw(e.target.value)}
            className="border p-2 w-full rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowOld(!showOld)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
          >
            <FontAwesomeIcon icon={showOld ? faEyeSlash : faEye} />
          </button>
        </div>

        {/* new password */}
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            placeholder="New password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="border p-2 w-full rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
          >
            <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} />
          </button>
        </div>

        <button
          onClick={changePw}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-3 w-full sm:w-auto"
        >
          Update Password
        </button>
      </section>

      {/* ---- Pricing (business & service only) ---- */}
      <section>
        <h3 className="font-semibold mb-2">Update Pricing</h3>

        {["business", "service"].map((field) => (
          <div key={field} className="mb-3 sm:flex sm:items-center">
            <label className="capitalize sm:w-24">{field}</label>
            <input
              type="number"
              value={price[field]}
              onChange={(e) => setPrice({ ...price, [field]: e.target.value })}
              className="border p-2 rounded w-full sm:flex-1 mt-1 sm:mt-0"
            />
            <button
              onClick={() => pushPrice(field)}
              className="bg-blue-600 text-white px-3 py-2 rounded mt-2 sm:mt-0 sm:ml-2 w-full sm:w-auto"
            >
              Save
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
