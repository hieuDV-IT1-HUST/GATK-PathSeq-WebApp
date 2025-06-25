"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      const res = await api.post("/auth/register", { username, email, password });
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
                      Đăng ký
                  </h2>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      <input
                          type="text"
                          placeholder="Tên đăng nhập"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="w-full px-4 py-2 rounded bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full px-4 py-2 rounded bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                          type="password"
                          placeholder="Mật khẩu"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full px-4 py-2 rounded bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                          type="submit"
                          className="rounded bg-green-600 text-white py-2 px-4 font-semibold hover:bg-green-700 transition-colors mt-2"
                      >
                          Đăng ký
                      </button>
                      <button
                          type="button"
                          onClick={() => router.push("/")}
                          className="rounded bg-neutral-600 text-white py-2 px-4 font-semibold hover:bg-neutral-700 transition-colors mt-2"
                      >
                          Quay lại
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
