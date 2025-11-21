import React, { useEffect, useState } from "react";

const EmailHistoryPage = () => {
  const [logs, setLogs] = useState([]);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetch("http://localhost:5000/api/email/history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setLogs(data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#e06c7f] mb-6">📜 Lịch sử email đã gửi</h1>

      <table className="w-full border rounded-lg overflow-hidden text-sm">
        <thead className="bg-[#fce5eb] text-[#e06c7f] font-semibold">
          <tr>
            <th className="p-3 border">Thời gian</th>
            <th className="p-3 border">Tiêu đề</th>
            <th className="p-3 border">Nhóm</th>
            <th className="p-3 border">Trạng thái</th>
            <th className="p-3 border">Xem</th>
          </tr>
        </thead>

        <tbody>
          {Array.isArray(logs) && logs.map((log) => (
            <tr key={log._id} className="border">
              <td className="p-3">{new Date(log.createdAt).toLocaleString()}</td>
              <td className="p-3">{log.subject}</td>
              <td className="p-3">{log.toGroup}</td>
              <td
                className={`p-3 font-semibold ${
                  log.status === "success" ? "text-green-600" : "text-red-500"
                }`}
              >
                {log.status}
              </td>
              <td className="p-3 text-center">
                <button
                  onClick={() => alert(log.html)}
                  className="text-blue-600 underline"
                >
                  Xem nội dung
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {logs.length === 0 && (
        <p className="text-gray-500 text-center mt-6">
          Chưa có email nào được gửi.
        </p>
      )}
    </div>
  );
};

export default EmailHistoryPage;
