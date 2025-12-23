import React, { useEffect, useState } from "react";
import socket from "../socket";

const NetworkStatus = ({ role = "user", userId = "guest" }) => {
  const [onlineList, setOnlineList] = useState([]);

  useEffect(() => {
    // Gửi vai trò lên server
    socket.emit("register_client", { role, userId });

    // Nhận danh sách online (demo mạng)
    socket.on("online_list", (list) => {
      setOnlineList(list);
    });

    return () => {
      socket.off("online_list");
    };
  }, [role, userId]);

  return (
    <div className="max-w-md mx-auto mt-6 p-4 border rounded">
      <h3 className="font-semibold mb-2">🌐 Trạng thái mạng</h3>
      <div className="text-sm mb-2">
        Vai trò hiện tại: <b>{role}</b>
      </div>

      <div className="text-sm font-medium mb-1">Client đang online:</div>
      <ul className="text-sm list-disc pl-5">
        {onlineList.map((c, i) => (
          <li key={i}>
            {c.role} {c.userId ? `(${c.userId})` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NetworkStatus;
