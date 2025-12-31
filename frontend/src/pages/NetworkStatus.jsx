import { useEffect } from "react";
import socket from "../socket";

const NetworkStatus = ({ role, userId }) => {
  useEffect(() => {
    // ⛔ chưa có user thì không làm gì
    if (!userId || !role) return;

    // 👉 đăng ký client
    socket.emit("register_client", { role, userId });

    // 👉 giữ kết nối (nếu backend có emit)
    const noop = () => {};
    socket.on("online_list", noop);

    return () => {
      socket.off("online_list", noop);
    };
  }, [role, userId]);

  // ❌ không render UI
  return null;
};

export default NetworkStatus;
