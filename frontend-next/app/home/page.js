"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image"

function Toast({ open, message, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-green-600 text-white px-6 py-3 rounded shadow-lg flex items-center gap-4">
        <span>{message}</span>
        <button className="ml-2 text-white font-bold" onClick={onClose}>
          x
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [trashHover, setTrashHover] = useState(false);
  useEffect(() => {
    // Nếu chưa đăng nhập thì chuyển về trang welcome
    if (!localStorage.getItem("session_id") || !localStorage.getItem("user")) {
      router.replace("/");
    }
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem("session_id");
    localStorage.removeItem("user");
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/");
  };

  const handleLogoutWithCleanup = async () => {
    await handleCleanup();
    await handleLogout();
  };

  const handleCleanup = async () => {
    const sessionId = localStorage.getItem("session_id");
    if (sessionId) {
      await fetch("/api/files/upload/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
        credentials: "include",
      });
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center relative"
      style={{
        backgroundImage: 'url(/nature.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Đăng xuất góc trên phải */}
      <button
        className="absolute top-6 right-10 p-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition z-50 flex items-center justify-center"
        onClick={handleLogoutWithCleanup}
        title="Đăng xuất"
      >
        <Image src="/power-off.svg" alt="Đăng xuất" width={32} height={32} className="w-8 h-8" />
      </button>
      {/* Xóa cache góc dưới phải */}
      <button
        className="fixed bottom-10 right-10 px-4 py-2 bg-yellow-600 text-white rounded-full shadow hover:bg-yellow-700 transition z-50 flex items-center gap-2"
        onClick={handleCleanup}
        onMouseEnter={() => setTrashHover(true)}
        onMouseLeave={() => setTrashHover(false)}
        title="Xóa cache"
      >
        {trashHover ? (
          // SVG thùng rác mở nắp
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 32" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <g>
              <rect x="6" y="10" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13v10M12 13v10M15 13v10" />
              <rect x="5" y="8" width="14" height="2" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" transform="rotate(-30 5 9)" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l1.5-3.5a1 1 0 0 1 .92-.62h5.16a1 1 0 0 1 .92.62L17 10"  transform="rotate(-30 5 9)" />
            </g>
          </svg>
        ) : (
          // SVG thùng rác đóng nắp
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 32" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <rect x="6" y="10" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13v10M12 13v10M15 13v10" />
            <rect x="5" y="8" width="14" height="2" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l1.5-3.5a1 1 0 0 1 .92-.62h5.16a1 1 0 0 1 .92.62L17 10" />
          </svg>
        )}
      </button>
      {/* Nút upload file chính giữa bên dưới */}
      <button
        className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white text-2xl font-bold rounded-full shadow-lg hover:scale-105 transition flex items-center gap-3 z-40"
        onClick={() => router.push("/upload")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
          />
        </svg>
        Upload file
      </button>
      <Toast
        open={showToast}
        message="Đã xóa cache!"
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
