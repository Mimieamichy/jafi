import { useState, useEffect } from "react";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(storedUsers);
  }, []);

  const handleAddRole = (index, role) => {
    const updatedUsers = users.map((user, i) =>
      i === index ? { ...user, role: [...user.role, role] } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Users</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.role.join(", ")}</td>
              <td className="p-2">
                <button onClick={() => handleAddRole(index, "Admin")} className="bg-blue-500 text-white px-2 py-1 rounded">
                  Make Admin
                </button>
                <button onClick={() => handleAddRole(index, "Business Owner")} className="bg-purple-500 text-white px-2 py-1 rounded ml-2">
                  Make Business Owner
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
