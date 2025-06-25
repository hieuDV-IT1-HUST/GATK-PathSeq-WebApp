"use client";
import { useState, useEffect } from "react";
import api from "../api";
import Image from "next/image";

function Modal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-neutral-800 rounded-lg shadow-lg p-8 min-w-[320px] flex flex-col items-center">
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-neutral-200 mb-6 text-center">{message}</p>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            onClick={onConfirm}
          >
            Xác nhận
          </button>
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            onClick={onCancel}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ open, message, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-green-600 text-white px-6 py-3 rounded shadow-lg flex items-center gap-4">
        <span>{message}</span>
        <button className="ml-2 text-white font-bold" onClick={onClose}>x</button>
      </div>
    </div>
  );
}

const boxStyle =
  "bg-neutral-800 rounded-lg shadow-lg p-6 flex flex-col gap-4 border-2 border-neutral-700 hover:border-blue-500 transition-all duration-200";

function formatSize(size) {
  if (size > 1024 * 1024)
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  if (size > 1024)
    return (size / 1024).toFixed(1) + ' KB';
  return size + ' B';
}

function FileUploadBox({ title, desc, accept, multiple, onUpload, uploadedFiles, children, uploadProgress, lastSelectedFiles }) {
  // Hiển thị tất cả file đang upload hoặc đã upload (dựa trên lastSelectedFiles và uploadProgress)
  const allFiles = lastSelectedFiles && lastSelectedFiles.length > 0
    ? lastSelectedFiles.map(f => f.name)
    : uploadedFiles;
  return (
    <div className={boxStyle}>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-neutral-300 text-sm mb-2">{desc}</p>
      {/* Khung chọn file bo tròn nổi bật */}
      <div
        className="mb-2 p-4 border-2 border-dashed border-neutral-600 rounded-xl flex items-center gap-3 cursor-pointer hover:border-blue-500 transition-all duration-200 bg-neutral-900/60"
        onClick={e => {
          // Click vào khung sẽ focus vào input file
          e.currentTarget.querySelector('input[type=file]').click();
        }}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.currentTarget.querySelector('input[type=file]').click();
          }
        }}
        style={{ outline: 'none' }}
      >
        {/* Icon upload */}
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-400">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
        </svg>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={onUpload}
        />
        <span className="text-white text-sm select-none">Chọn file để upload</span>
      </div>
      {allFiles && allFiles.length > 0 && (
        <ul className="text-xs text-green-400 mb-2">
          {lastSelectedFiles && lastSelectedFiles.length > 0
            ? lastSelectedFiles.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  {f.name} <span className="text-gray-400">({formatSize(f.size)})</span>
                  {uploadProgress && uploadProgress[f.name] !== undefined && uploadProgress[f.name] !== 100 && uploadProgress[f.name] !== -1 && (
                    <span className="ml-2 text-blue-400">{uploadProgress[f.name]}%</span>
                  )}
                  {uploadProgress && uploadProgress[f.name] === 100 && <span className="ml-2 text-green-400">✓</span>}
                  {uploadProgress && uploadProgress[f.name] === -1 && <span className="ml-2 text-red-400">Lỗi</span>}
                </li>
              ))
            : uploadedFiles.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  {f}
                  {/* Luôn hiển thị dấu tích xanh lá cho file đã upload thành công */}
                  <span className="ml-2 text-green-400">✓</span>
                </li>
              ))}
        </ul>
      )}
      {children}
    </div>
  );
}

export default function UploadPage() {
  // State cho từng khu vực
  const [inputFiles, setInputFiles] = useState([]);
  const [hostFiles, setHostFiles] = useState([]);
  const [microbeFiles, setMicrobeFiles] = useState([]);
  const [taxonomyFiles, setTaxonomyFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState({}); // {filename: percent}
  const [trashHover, setTrashHover] = useState(false);

  // Trạng thái điều kiện
  const hasBam = inputFiles.some(f => f.endsWith('.bam'));
  const hasFastqPair = inputFiles.filter(f => f.endsWith('.fastq') || f.endsWith('.fq')).length === 2;
  const hasHostImg = hostFiles.some(f => f.endsWith('.img'));
  const hasHostHss = hostFiles.some(f => f.endsWith('.hss'));
  const hasHostFasta = hostFiles.some(f => f.endsWith('.fasta'));
  const hasMicrobeDict = microbeFiles.some(f => f.endsWith('.dict'));
  const hasMicrobeAmb = microbeFiles.some(f => f.endsWith('.fasta.amb'));
  const hasMicrobeAnn = microbeFiles.some(f => f.endsWith('.fasta.ann'));
  const hasMicrobeBwt = microbeFiles.some(f => f.endsWith('.fasta.bwt'));
  const hasMicrobeFai = microbeFiles.some(f => f.endsWith('.fasta.fai'));
  const hasMicrobeImg = microbeFiles.some(f => f.endsWith('.fasta.img'));
  const hasMicrobePac = microbeFiles.some(f => f.endsWith('.fasta.pac'));
  const hasMicrobeSa = microbeFiles.some(f => f.endsWith('.fasta.sa'));
  const hasTaxonomyDb = taxonomyFiles.some(f => f.endsWith('.db'));

  // Điều kiện để hiện nút chuyển sang bước tiếp theo
  const readyToNext =
    hasBam &&
    hasHostImg &&
    hasHostHss &&
    hasMicrobeDict &&
    hasMicrobeAmb &&
    hasMicrobeAnn &&
    hasMicrobeBwt &&
    hasMicrobeFai &&
    hasMicrobeImg &&
    hasMicrobePac &&
    hasMicrobeSa &&
    hasTaxonomyDb;

  // Lấy user và session_id từ localStorage
  const [user, setUser] = useState("");
  const [sessionId, setSessionId] = useState("");
  useEffect(() => {
    const u = localStorage.getItem("user") || "";
    const sid = localStorage.getItem("session_id") || "";
    setUser(u);
    setSessionId(sid);
  }, []);

  // Hàm upload
  const handleUpload = (setter) => async (e) => {
    const files = Array.from(e.target.files);
    // Lưu lại file vừa chọn để hiển thị tiến độ
    if (setter === setInputFiles) setInputLastFiles(files);
    if (setter === setHostFiles) setHostLastFiles(files);
    if (setter === setMicrobeFiles) setMicrobeLastFiles(files);
    if (setter === setTaxonomyFiles) setTaxonomyLastFiles(files);
    const apiPathMap = new Map([
      [setInputFiles, "/files/upload/input"],
      [setHostFiles, "/files/upload/host"],
      [setMicrobeFiles, "/files/upload/microbe-db"],
      [setTaxonomyFiles, "/files/upload/taxonomy-db"],
    ]);
    const apiPath = apiPathMap.get(setter);
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user", user);
      formData.append("session_id", sessionId);
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
      await api.post(apiPath, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (event.lengthComputable) {
            setUploadProgress((prev) => ({ ...prev, [file.name]: Math.round((event.loaded / event.total) * 100) }));
          }
        },
      }).then(() => {
        setter((prev) => [...prev, file.name]);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      }).catch(() => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: -1 }));
      });
    }
    // Sau khi upload xong, xóa danh sách file vừa chọn để chỉ hiển thị file đã upload thành công
    if (setter === setInputFiles) setInputLastFiles([]);
    if (setter === setHostFiles) setHostLastFiles([]);
    if (setter === setMicrobeFiles) setMicrobeLastFiles([]);
    if (setter === setTaxonomyFiles) setTaxonomyLastFiles([]);
  };

  const handleCleanup = async () => {
    setShowModal(false);
    await api.post("/files/upload/cleanup", { session_id: sessionId }, { withCredentials: true });
    setInputFiles([]);
    setHostFiles([]);
    setMicrobeFiles([]);
    setTaxonomyFiles([]);
    setToastMsg("Đã xóa toàn bộ file đã upload!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Lưu lại file vừa chọn để hiển thị tiến độ
  const [inputLastFiles, setInputLastFiles] = useState([]);
  const [hostLastFiles, setHostLastFiles] = useState([]);
  const [microbeLastFiles, setMicrobeLastFiles] = useState([]);
  const [taxonomyLastFiles, setTaxonomyLastFiles] = useState([]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-blue-950 py-8">
      <button
        className="absolute top-6 right-10 p-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition z-50 flex items-center justify-center"
        onClick={async () => {
          await fetch("/api/files/upload/cleanup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId }),
            credentials: "include",
          });
          localStorage.removeItem("session_id");
          localStorage.removeItem("user");
          await api.post("/auth/logout", {}, { withCredentials: true });
          window.location.href = "/";
        }}
        title="Đăng xuất"
      >
        <Image src="/power-off.svg" alt="Đăng xuất" width={32} height={32} className="w-8 h-8" />
      </button>
      {/* Nút Trang chủ góc trên trái */}
      <button
        className="absolute top-6 left-10 p-2 bg-neutral-700 text-white rounded-full shadow hover:bg-blue-700 transition z-50 flex items-center justify-center"
        onClick={() => window.location.href = "/home"}
        title="Trang chủ"
      >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-9 h-9">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l8-8 8 8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20V12 M18 20V12 M6 20H18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19v-2a2 2 0 1 1 4 0v2" />
      </svg>
      </button>
      {/* Xóa cache góc dưới phải */}
      <button
        className="fixed bottom-10 right-10 px-4 py-2 bg-yellow-600 text-white rounded-full shadow hover:bg-yellow-700 transition z-50 flex items-center gap-2"
        onClick={() => setShowModal(true)}
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
      <Modal
        open={showModal}
        title="Xác nhận xóa bộ nhớ cache"
        message="Bạn có chắc chắn muốn xóa toàn bộ file đã upload không?"
        onConfirm={handleCleanup}
        onCancel={() => setShowModal(false)}
      />
      <Toast
        open={showToast}
        message={toastMsg}
        onClose={() => setShowToast(false)}
      />
      <div className="w-full max-w-6xl grid grid-cols-2 grid-rows-2 gap-8">
        {/* Trái trên: Mẫu thử */}
        <FileUploadBox
          title="1. Mẫu thử (Input)"
          desc="Tải lên file .bam hoặc 2 file .fastq/.fq. Nếu chọn 2 file fastq, bạn có thể chuyển sang trang Picard để tạo file .bam."
          accept=".bam,.fastq,.fq"
          multiple={true}
          onUpload={handleUpload(setInputFiles)}
          uploadedFiles={inputFiles}
          uploadProgress={uploadProgress}
          lastSelectedFiles={inputLastFiles}
        >
          {hasFastqPair && !hasBam && (
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => window.location.href = '/picard'}
            >
              Sử dụng Picard tạo file BAM
            </button>
          )}
        </FileUploadBox>

        {/* Phải trên: Bộ gen tham chiếu vật chủ */}
        <FileUploadBox
          title="2. Bộ gen tham chiếu vật chủ"
          desc="Tải lên file .fasta, .img, .hss của vật chủ. Nếu không có .fasta thì phải có cả .img và .hss."
          accept=".fasta,.img,.hss"
          multiple={true}
          onUpload={handleUpload(setHostFiles)}
          uploadedFiles={hostFiles}
          uploadProgress={uploadProgress}
          lastSelectedFiles={hostLastFiles}
        />

        {/* Trái dưới: CSDL vi sinh vật */}
        <FileUploadBox
          title="3. CSDL vi sinh vật"
          desc="Tải lên các file .fna, .fna.gz, .fasta, .gz, .db, .dict, .amb, .ann, .bwt, .fai, .img, .pac, .sa."
          accept=".fna,.fna.gz,.fasta,.gz,.db,.dict,.amb,.ann,.bwt,.fai,.img,.pac,.sa"
          multiple={true}
          onUpload={handleUpload(setMicrobeFiles)}
          uploadedFiles={microbeFiles}
          uploadProgress={uploadProgress}
          lastSelectedFiles={microbeLastFiles}
        />

        {/* Phải dưới: CSDL cây phân cấp sinh học */}
        <FileUploadBox
          title="4. CSDL cây phân cấp sinh học (Taxonomy)"
          desc="Tải lên RefSeq-releaseXX.catalog.gz (XX: release number), taxdump.tar.gz hoặc file .db đã tạo."
          accept=".catalog.gz,.tar.gz,.db"
          multiple={true}
          onUpload={handleUpload(setTaxonomyFiles)}
          uploadedFiles={taxonomyFiles}
          uploadProgress={uploadProgress}
          lastSelectedFiles={taxonomyLastFiles}
        />
      </div>
      {readyToNext && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
          <button
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white text-lg font-bold rounded-full shadow-lg hover:scale-105 transition"
            onClick={() => window.location.href = '/run-pathseq'}
          >
            Chạy PathSeqPipelineSpark →
          </button>
        </div>
      )}
    </div>
  );
}
