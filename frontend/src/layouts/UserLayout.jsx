import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import NetworkStatus from "../pages/NetworkStatus";

const UserLayout = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
      {/* Header */}

      {/* 🔹 NETWORK – LẬP TRÌNH MẠNG */}
      <NetworkStatus
        role="user"
        userId={user?._id || "guest"}
      />

      <Outlet />

      {/* Footer */}
    </>
  );
};

export default UserLayout;
