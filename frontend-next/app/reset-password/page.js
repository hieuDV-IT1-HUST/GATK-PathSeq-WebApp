"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../api";

export default function ResetPassword() {
  const router = useRouter();
  const email = router.query?.email || "";
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      const res = await api.post("/auth/reset-password", { email, password });
      setMsg(res.data.msg);
    } catch (err) {
      setError(err.response?.data?.msg || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900">
      <div className="w-full max-w-xs bg-neutral-800 rounded-lg shadow-lg p-8 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center text-white mb-2">Đặt lại mật khẩu</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded bg-blue-600 text-white py-2 px-4 font-semibold hover:bg-blue-700 transition-colors mt-2"
          >
            Đặt lại mật khẩu
          </button>
        </form>
        {msg && <div className="text-green-400 text-center">{msg}</div>}
        {error && <div className="text-red-400 text-center">{error}</div>}
      </div>
    </div>
  );
}
