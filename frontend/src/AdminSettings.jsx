// src/components/Settings.jsx
import { useState, useEffect, useMemo } from "react";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";


const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function Settings() {
  const authToken = localStorage.getItem("userToken");
  const { enqueueSnackbar } = useSnackbar();

  const headersJSON = useMemo(() => ({
   "Content-Type": "application/json",
   Authorization: `Bearer ${authToken}`,
 }), [authToken]);

  /* ---------- state ---------- */
  const [superCount, setSuperCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);

  const [form, setForm] = useState({ name: "", email: "", role: "admin" });

  const [newPw, setNewPw] = useState("");
  
  const [showNew, setShowNew] = useState(false);

  const [price, setPrice] = useState({ business: "", service: "" });

 

    /* ---------- fetch live admin counts ---------- */
    useEffect(() => {
      if (!authToken) return;
      fetch(`${baseUrl}/admin/adminCount`, { headers: headersJSON })
        .then((r) => {
          if (!r.ok) throw new Error("Failed to fetch counts");
          return r.json();
        })
        .then((data) => {
          console.log("adminCount data", data);
          
          // adjust these keys to match your API response
          setAdminCount(data.adminCount ?? data.admin ?? 0);
          setSuperCount(data.superAdminCount ?? data.superadmin ?? 0);
        })
        .catch((err) => {
          console.error("adminCount error", err);
          enqueueSnackbar("Could not load admin counts", { variant: "error" });
        });
    }, [authToken, enqueueSnackbar, headersJSON]);

  /* ---------- add admin / super‑admin ---------- */
  const addAdmin = async () => {
    if (!form.name || !form.email)
      return enqueueSnackbar("Name & email required", { variant: "warning" });
    if (form.role === "superadmin" && superCount >= 3)
      return enqueueSnackbar("Max 2 super‑admins", { variant: "error" });
    if (form.role === "admin" && adminCount >= 20)
      return enqueueSnackbar("Max 20 admins", { variant: "error" });

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

  /* ---------- push price helper ---------- */
  const pushPrice = async (field) => {
    if (!price[field])
      return enqueueSnackbar("Enter a price first", { variant: "warning" });
    const map = {
     standard: "standardPrice",
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

  /* ---------- UI ---------- */
  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold">Admin Settings</h2>

      {/* ---- Add Admin ---- */}
      <section>
        <h3 className="font-semibold mb-2">Add (super‑)admin</h3>

        <label className="block text-sm mb-1">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 w-full rounded mb-2"
        />

        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 w-full rounded mb-2"
        />

        <label className="block text-sm mb-1">Role</label>
        <select
          name="role"
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
            (form.role === "superadmin" && superCount >= 3) ||
            (form.role === "admin" && adminCount >= 20)
          }
          className="bg-blue-600 text-white px-4 py-2 rounded mt-3 disabled:opacity-50 w-full sm:w-auto"
        >
          Add
        </button>

        <p className="text-xs text-gray-500 mt-1">
          {superCount}/3 super‑admins • {adminCount}/20 admins
        </p>
      </section>

     
      {/* ---- Change Password ---- */}
      <section>
        <h3 className="font-semibold mb-2">Change Password</h3>

        <div className="relative">
          <input
            name="password"
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
          className="bg-green-600 text-white px-4 py-2 rounded mt-3 w-full sm:w-auto"
        >
          Update Password
        </button>
      </section>

      {/* ---- Pricing (business & service only) ---- */}
      <section>
        <h3 className="font-semibold mb-2">Update Pricing</h3>

        {["standard","premuim", "service"].map((field) => (
          <div key={field} className="mb-3 sm:flex sm:items-center">
            <label className="capitalize text-base p-3 w-30">{field}</label>
            <input
              name="price"
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
