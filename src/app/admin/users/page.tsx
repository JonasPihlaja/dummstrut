"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  username: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  }

  async function createUser() {
    if (!username || !password) return;

    setLoading(true);
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setUsername("");
    setPassword("");
    await loadUsers();
    setLoading(false);
  }

  async function deleteUser(id: number) {
    if (!confirm("Delete this user?")) return;

    await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });

    loadUsers();
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-semibold mb-6">
        User Management
      </h1>

      {/* Create User Widget */}
      <div className="mb-8 bg-white rounded-2xl border border-gray-200 shadow-md p-4 sm:p-6">
        <h2 className="text-lg font-medium mb-4">Create User</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={createUser}
            disabled={loading}
            className="
              bg-blue-600 text-white px-5 py-2 rounded-lg
              hover:bg-blue-700 active:bg-blue-800
              transition-colors font-medium
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            Create
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div
        className="
          grid gap-4
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
        "
      >
        {users.map((user) => (
          <div
            key={user.id}
            className="
              bg-white rounded-2xl border border-gray-200
              shadow-md hover:shadow-xl
              transition-all duration-300
              transform hover:-translate-y-1
              p-4 flex flex-col
            "
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800 text-base">
                  {user.username}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Created{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => deleteUser(user.id)}
                className="
                  text-gray-400 hover:text-red-600
                  transition-colors
                "
                title="Delete user"
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}