import { useState,  } from "react";

const Settings = () => {
  const [admins, setAdmins] = useState(
    JSON.parse(localStorage.getItem("admins")) || []
  );
  const [currentAdmin, setCurrentAdmin] = useState(
    localStorage.getItem("currentAdmin")
  ); // Logged-in Admin
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pricing, setPricing] = useState(
    JSON.parse(localStorage.getItem("pricing")) || {}
  );

  // Check if the logged-in user is an admin

  /* useEffect(() => {
    if (!admins.includes(currentAdmin)) {
      alert("Access Denied! Only admins can access settings.");
      window.location.href = "/admin-dashboard"; // Redirect to dashboard
    }
  }, [currentAdmin, admins]);*/

  const handleAddAdmin = () => {
    if (!newAdminEmail) return alert("Enter an email");
    if (!admins.includes(currentAdmin))
      return alert("Only admins can add new admins.");

    const updatedAdmins = [...admins, newAdminEmail];
    setAdmins(updatedAdmins);
    localStorage.setItem("admins", JSON.stringify(updatedAdmins));
    alert(`Admin added: ${newAdminEmail}`);
    setNewAdminEmail("");
  };

  const handleChangePassword = () => {
    const storedPassword = localStorage.getItem("adminPassword");
    if (storedPassword !== oldPassword)
      return alert("Old password is incorrect!");

    localStorage.setItem("adminPassword", newPassword);
    alert("Password updated successfully");
    setOldPassword("");
    setNewPassword("");
  };

  const handleUpdatePricing = (duration, price) => {
    const updatedPricing = { ...pricing, [duration]: price };
    setPricing(updatedPricing);
    localStorage.setItem("pricing", JSON.stringify(updatedPricing));
    alert(`Pricing updated for ${duration}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Admin Settings</h2>

      {/* Add Admin Section */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Add Admin</h3>
        <input
          type="email"
          placeholder="Enter Admin Email"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleAddAdmin}
          className="bg-blue-500 text-white px-3 py-2 rounded mt-2"
        >
          Add Admin
        </button>
      </div>

      {/* Change Password Section */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Change Password</h3>
        <input
          type="password"
          placeholder="Enter Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <input
          type="password"
          placeholder="Enter New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleChangePassword}
          className="bg-green-500 text-white px-3 py-2 rounded mt-2"
        >
          Change Password
        </button>
      </div>

      {/* Update Pricing Section */}
      <div>
        <h3 className="font-semibold mb-2">Update Pricing</h3>
        {["1 month", "3 months", "6 months"].map((duration) => (
          <div key={duration} className="mb-2">
            <span>{duration}: </span>
            <input
              type="number"
              placeholder="Enter Price"
              defaultValue={pricing[duration] || ""}
              onBlur={(e) => handleUpdatePricing(duration, e.target.value)}
              className="border p-2 rounded w-32"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
