"use client";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900">
      <div className="bg-neutral-800 rounded-lg shadow-lg p-10 flex flex-col gap-6 items-center">
        <h1 className="text-4xl font-bold text-red-500">404 - Không tìm thấy trang</h1>
        <p className="text-white text-lg">Trang bạn truy cập không tồn tại hoặc đã bị xóa.</p>
        <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => router.back()}
        >
          Quay về trang trước
        </button>
      </div>
    </div>
  );
}
