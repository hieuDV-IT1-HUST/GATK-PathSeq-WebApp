"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMsg(res.data.msg);
    } catch (err) {
      setError(err.response?.data?.msg || "Error");
    }
  };

  return (
      <>
          <div
              className="fixed inset-0 -z-10 bg-cover bg-center"
              style={{
                  backgroundImage: "url(/Full_Moon.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
              }}
          />
          <div className="min-h-screen flex items-center justify-center">
              <div className="w-full max-w-xs bg-black/60 rounded-lg shadow-lg p-8 flex flex-col gap-6">
                  <h2 className="text-2xl font-bold text-center text-white mb-2">
                      Quên mật khẩu
                  </h2>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      <input
                          type="email"
                          placeholder="Nhập email của bạn"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full px-4 py-2 rounded bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      />
                      <button
                          type="submit"
                          className="rounded bg-gray-400 text-white py-2 px-4 font-semibold hover:bg-gray-500 transition-colors mt-2"
                      >
                          Gửi liên kết đặt lại mật khẩu
                      </button>
                      <button
                          type="button"
                          onClick={() => router.push("/")}
                          className="rounded bg-neutral-600 text-white py-2 px-4 font-semibold hover:bg-neutral-700 transition-colors mt-2"
                      >
                          Quay lại trang chủ
                      </button>
                  </form>
                  {msg && (
                      <div className="text-green-400 text-center">{msg}</div>
                  )}
                  {error && (
                      <div className="text-red-400 text-center">{error}</div>
                  )}
              </div>
          </div>
      </>
  );
}
