"use client";

import { useState } from "react";
import { loginAction } from "../lib/auth";

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");

    try {
      await loginAction(formData);
      onClose();
      window.location.reload(); // refresh navbar state
    } catch (err: any) {
      setError("Invalid username or password");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-xl w-80">
        <h2 className="text-lg font-semibold mb-4">Login</h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <form action={handleSubmit} className="flex flex-col space-y-3">
          <input
            name="username"
            placeholder="Username"
            className="border rounded px-2 py-1"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="border rounded px-2 py-1"
          />

          <button
            type="submit"
            className="bg-gray-900 text-white py-2 rounded hover:bg-black"
          >
            Login
          </button>
        </form>

        <button className="mt-4 text-gray-700" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
