"use client";
import { useEffect, useState, useRef } from "react";
import api from "../api";

const GATK_VERSIONS = [
  { label: "GATK 4.2.0.0", value: "4.2.0.0" },
  { label: "GATK 4.6.2.0", value: "4.6.2.0" },
];

// Các cờ bắt buộc (cho phép chỉnh sửa giá trị)
const REQUIRED_FLAGS_DEF = [
  { flag: "--min-clipped-read-length", value: "70", type: "number" },
];

export default function RunPathSeqPage() {
  const [user, setUser] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [files, setFiles] = useState({ input: [], host: [], microbe: [], taxonomy: [] });
  const [gatkVersion, setGatkVersion] = useState(GATK_VERSIONS[0].value);
  const [outputName, setOutputName] = useState("");
  const [requiredFlags, setRequiredFlags] = useState(REQUIRED_FLAGS_DEF);
  const [optionalFlags, setOptionalFlags] = useState([]);
  const [flagInput, setFlagInput] = useState({ flag: "", value: "" });
  const [log, setLog] = useState("");
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState({});
  const [error, setError] = useState("");
  const [jobId, setJobId] = useState("");
  const pollingRef = useRef(null);

  // Lấy user/session_id từ localStorage
  useEffect(() => {
    const u = localStorage.getItem("user") || "";
    const sid = localStorage.getItem("session_id") || "default";
    setUser(u);
    setSessionId(sid);
    if (u && sid) {
      api.get(`/files/list?user=${u}&session_id=${sid}`)
        .then(res => setFiles(res.data))
        .catch(() => setFiles({ input: [], host: [], microbe: [], taxonomy: [] }));
    }
  }, []);

  // Thêm cờ tùy chọn
  const handleAddFlag = () => {
    if (flagInput.flag && flagInput.value) {
      setOptionalFlags([...optionalFlags, { ...flagInput }]);
      setFlagInput({ flag: "", value: "" });
    }
  };

  // Xóa cờ tùy chọn
  const handleRemoveFlag = (idx) => {
    setOptionalFlags(optionalFlags.filter((_, i) => i !== idx));
  };

  // Sửa giá trị cờ bắt buộc
  const handleRequiredFlagChange = (idx, value) => {
    setRequiredFlags(requiredFlags.map((f, i) => i === idx ? { ...f, value } : f));
  };

  // Gửi yêu cầu chạy PathSeq (submit job)
  const handleRun = async () => {
    setLoading(true);
    setLog("");
    setError("");
    setOutputs({});
    setJobId("");
    try {
      const body = {
        user: user,
        session_id: sessionId,
        input: files.input[0],
        host_img: files.host.find(f => f.endsWith(".img")),
        host_hss: files.host.find(f => f.endsWith(".hss")),
        host_fasta: files.host.find(f => f.endsWith(".fasta")),
        microbe_dict: files.microbe.find(f => f.endsWith(".dict")),
        microbe_img: files.microbe.find(f => f.endsWith(".img")),
        taxonomy_db: files.taxonomy.find(f => f.endsWith(".db")),
        output_name: outputName,
        gatk_version: gatkVersion,
        extra_flags: [
          ...requiredFlags.map(f => [f.flag, f.value]).flat(),
          ...optionalFlags.map(f => [f.flag, f.value]).flat(),
        ],
      };
      const res = await api.post("/pathseq/run", body);
      if (res.data.job_id) {
        setJobId(res.data.job_id);
      } else {
        setError("Không nhận được job_id từ server!");
        setLoading(false);
      }
    } catch (e) {
      setError("Có lỗi xảy ra khi gửi job!");
      setLog(e?.response?.data?.log || e.message);
      setLoading(false);
    }
  };

  // Polling trạng thái job
  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/pathseq/status?job_id=${jobId}`);
        setLog(res.data.log || "");
        setOutputs(res.data.outputs || {});
        if (res.data.status === "success" || res.data.status === "failed") {
          setLoading(false);
          clearInterval(pollingRef.current);
          if (res.data.status === "failed") setError("Chạy thất bại!");
        }
      } catch (e) {
        setError("Không lấy được trạng thái job!");
        setLoading(false);
        clearInterval(pollingRef.current);
      }
    }, 3000); // 3 giây/lần
    return () => clearInterval(pollingRef.current);
  }, [jobId]);

  // Các file cần thiết cho từng mục
  const inputBam = files.input.find(f => f.endsWith('.bam'));
  const hostImg = files.host.find(f => f.endsWith('.img'));
  const hostHss = files.host.find(f => f.endsWith('.hss'));
  const microbeDict = files.microbe.find(f => f.endsWith('.dict'));
  const microbeImg = files.microbe.find(f => f.endsWith('.img'));
  const taxonomyDb = files.taxonomy.find(f => f.endsWith('.db'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-blue-950 flex flex-col items-center py-10">
      <div className="w-full max-w-3xl bg-neutral-800 rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-white">Chạy GATK PathSeqPipelineSpark</h1>
          {/* Nút Trang chủ góc trên trái, chỉ là icon */}
          <button
            className="absolute top-6 left-10 p-2 bg-neutral-700 text-white rounded-full shadow hover:bg-blue-700 transition z-50 flex items-center justify-center"
            onClick={() => window.location.href = "/home"}
            title="Trang chủ"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4.5 10.5V21h15V10.5" />
            </svg>
          </button>
        </div>
        {/* Hiển thị file đã upload */}
        <div className="grid grid-cols-2 gap-4">
          {/* 1. Input */}
          <div className="bg-neutral-900/80 rounded-lg p-4 border border-blue-700">
            <h3 className="text-white font-semibold mb-1">1. Mẫu thử (Input)</h3>
            <div className="text-green-400 text-xs">
              {inputBam ? (
                <div className="mb-1">
                  <b>--input</b> {inputBam}
                </div>
              ) : <span className="text-red-400">Chưa có file .bam</span>}
            </div>
          </div>
          {/* 2. Host */}
          <div className="bg-neutral-900/80 rounded-lg p-4 border border-blue-700">
            <h3 className="text-white font-semibold mb-1">2. Bộ gen tham chiếu vật chủ</h3>
            <div className="text-green-400 text-xs">
              {hostImg ? <div className="mb-1"><b>--filter-bwa-image</b> {hostImg}</div> : <span className="text-red-400">Chưa có .img</span>}
              {hostHss ? <div className="mb-1"><b>--kmer-file</b> {hostHss}</div> : <span className="text-red-400">Chưa có .hss</span>}
            </div>
          </div>
          {/* 3. Microbe */}
          <div className="bg-neutral-900/80 rounded-lg p-4 border border-blue-700">
            <h3 className="text-white font-semibold mb-1">3. CSDL vi sinh vật</h3>
            <div className="text-green-400 text-xs">
              {microbeDict ? <div className="mb-1"><b>--microbe-dict</b> {microbeDict}</div> : <span className="text-red-400">Chưa có .dict</span>}
              {microbeImg ? <div className="mb-1"><b>--microbe-bwa-image</b> {microbeImg}</div> : <span className="text-red-400">Chưa có .img</span>}
            </div>
          </div>
          {/* 4. Taxonomy */}
          <div className="bg-neutral-900/80 rounded-lg p-4 border border-blue-700">
            <h3 className="text-white font-semibold mb-1">4. CSDL cây phân cấp sinh học</h3>
            <div className="text-green-400 text-xs">
              {taxonomyDb ? <div className="mb-1"><b>--taxonomy-file</b> {taxonomyDb}</div> : <span className="text-red-400">Chưa có .db</span>}
            </div>
          </div>
        </div>
        {/* Chọn version, output, flags */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <label className="text-white font-semibold">Chọn phiên bản GATK:</label>
            <select
              className="rounded px-3 py-2 bg-neutral-700 text-white"
              value={gatkVersion}
              onChange={e => setGatkVersion(e.target.value)}
            >
              {GATK_VERSIONS.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 items-center">
            <label className="text-white font-semibold">Tên output:</label>
            <input
              className="rounded px-3 py-2 bg-neutral-700 text-white flex-1"
              value={outputName}
              onChange={e => setOutputName(e.target.value)}
              placeholder="output.pathseq.[microbe_db]"
            />
          </div>
          <div>
            <label className="text-white font-semibold">Cờ bắt buộc:</label>
            <div className="flex gap-4 mt-2 flex-wrap bg-blue-950/60 p-4 rounded-lg">
              {requiredFlags.map((f, i) => (
                <div key={f.flag} className="flex items-center gap-2 text-xs">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded">{f.flag}</span>
                  <input
                    type={f.type || "text"}
                    className="rounded px-2 py-1 bg-neutral-700 text-white w-20"
                    value={f.value}
                    onChange={e => handleRequiredFlagChange(i, e.target.value.replace(/[^0-9]/g, ""))}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-white font-semibold">Cờ tùy chọn:</label>
            <div className="flex gap-2 mt-1 bg-yellow-950/60 p-4 rounded-lg">
              <input
                className="rounded px-2 py-1 bg-neutral-700 text-white"
                placeholder="--flag"
                value={flagInput.flag}
                onChange={e => setFlagInput({ ...flagInput, flag: e.target.value })}
              />
              <input
                className="rounded px-2 py-1 bg-neutral-700 text-white"
                placeholder="giá trị"
                value={flagInput.value}
                onChange={e => setFlagInput({ ...flagInput, value: e.target.value })}
              />
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={handleAddFlag}
                type="button"
              >Thêm</button>
            </div>
            <ul className="flex gap-2 mt-2 flex-wrap">
              {optionalFlags.map((f, i) => (
                <li key={i} className="bg-yellow-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  {f.flag} {f.value}
                  <button className="ml-1 text-white" onClick={() => handleRemoveFlag(i)}>×</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Nút chạy */}
        <button
          className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white text-lg font-bold rounded-full shadow-lg hover:scale-105 transition"
          onClick={handleRun}
          disabled={loading}
        >
          {loading ? "Đang chạy..." : "Chạy PathSeqPipelineSpark"}
        </button>
        {/* Log và output */}
        {error && <div className="text-red-400 font-semibold">{error}</div>}
        {log && (
          <div className="bg-black/80 text-green-300 rounded p-4 mt-4 max-h-96 overflow-auto text-xs whitespace-pre-wrap">
            <b>Log:</b>
            <br />
            {log}
          </div>
        )}
        {Object.keys(outputs).length > 0 && (
          <div className="mt-4">
            <h3 className="text-white font-semibold mb-2">Kết quả:</h3>
            <ul className="text-blue-400 underline">
              {Object.entries(outputs).map(([name, path]) => (
                <li key={name}>
                  <a href={`/api/files/download?user=${user}&session_id=${sessionId}&file=${encodeURIComponent(name)}`} target="_blank" rel="noopener noreferrer">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}