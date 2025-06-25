"use client";
import { useState } from "react";
import api from "./api";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [toast, setToast] = useState("");

  // Lấy danh sách user
  const fetchUsers = async () => {
    const res = await api.get("/admin/users", { withCredentials: true });
    setUsers(res.data.users || []);
  };

  // Xóa user
  const handleDeleteUser = async (username) => {
    setShowModal(false);
    await api.post("/admin/delete-user", { username }, { withCredentials: true });
    setToast(`Đã xóa user ${username}`);
    fetchUsers();
  };

  // Xóa cache user
  const handleDeleteCache = async (username) => {
    setShowModal(false);
    await api.post("/admin/cleanup-user", { username }, { withCredentials: true });
    setToast(`Đã xóa cache của user ${username}`);
  };

  // Xóa toàn bộ cache hệ thống
  const handleDeleteAllCache = async () => {
    setShowModal(false);
    await api.post("/admin/cleanup-all", {}, { withCredentials: true });
    setToast("Đã xóa toàn bộ cache hệ thống!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Quản trị hệ thống</h1>
      <button
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={fetchUsers}
      >
        Tải danh sách user
      </button>
      <div className="w-full max-w-xl bg-neutral-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl text-white mb-4">Danh sách user</h2>
        <ul className="divide-y divide-neutral-700">
          {users.map((u) => (
            <li key={u} className="flex items-center justify-between py-2">
              <span className="text-white">{u}</span>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => { setSelectedUser(u); setModalMsg(`Xóa user ${u}?`); setShowModal('deleteUser'); }}
                >Xóa user</button>
                <button
                  className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  onClick={() => { setSelectedUser(u); setModalMsg(`Xóa cache của user ${u}?`); setShowModal('deleteCache'); }}
                >Xóa cache</button>
              </div>
            </li>
          ))}
        </ul>
        <button
          className="mt-6 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 w-full"
          onClick={() => { setModalMsg("Xóa toàn bộ cache hệ thống?"); setShowModal('deleteAll'); }}
        >
          Xóa toàn bộ cache hệ thống
        </button>
      </div>
      {/* Modal xác nhận */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-neutral-800 rounded-lg shadow-lg p-8 min-w-[320px] flex flex-col items-center">
            <h2 className="text-xl font-bold text-white mb-2">Xác nhận</h2>
            <p className="text-neutral-200 mb-6 text-center">{modalMsg}</p>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                onClick={() => {
                  if (showModal === 'deleteUser') handleDeleteUser(selectedUser);
                  if (showModal === 'deleteCache') handleDeleteCache(selectedUser);
                  if (showModal === 'deleteAll') handleDeleteAllCache();
                }}
              >Xác nhận</button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                onClick={() => setShowModal(false)}
              >Hủy</button>
            </div>
          </div>
        </div>
      )}
      {/* Toast */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded shadow-lg flex items-center gap-4">
            <span>{toast}</span>
            <button className="ml-2 text-white font-bold" onClick={() => setToast("")}>x</button>
          </div>
        </div>
      )}
    </div>
  );
}
