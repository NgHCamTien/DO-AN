import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --------------------------------------
  // 🟢 Load user từ localStorage khi mở trang
  // --------------------------------------
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");

    if (userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch (error) {
        console.error("Error parsing user info:", error);
        localStorage.removeItem("userInfo");
      }
    }

    setLoading(false);
  }, []);

  // --------------------------------------
  // 🟢 LOGIN thường
  // --------------------------------------
  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userToSave = {
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || "user",
          picture: data.user.picture || "",
          token: data.accessToken,     // ⭐ FIX token đúng chuẩn
        };

        localStorage.setItem("userInfo", JSON.stringify(userToSave));
        setUser(userToSave);

        return { success: true, user: userToSave };
      }

      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: "Lỗi kết nối!" };
    }
  };

  // --------------------------------------
  // 🟢 REGISTER
  // --------------------------------------
  const register = async (name, email, password, phone = "", address = "", subscribeNewsletter = true) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          address,
          subscribeNewsletter,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userToSave = {
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || "user",
          picture: data.user.picture || "",
          token: data.accessToken,    // ⭐ Đồng bộ
        };

        localStorage.setItem("userInfo", JSON.stringify(userToSave));
        setUser(userToSave);

        return { success: true, user: userToSave };
      }

      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: "Lỗi server khi đăng ký." };
    }
  };

  // --------------------------------------
  // 🟢 UPDATE PROFILE
  // --------------------------------------
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const updatedUser = { ...user, ...data.user };

        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
        setUser(updatedUser);

        return { success: true };
      }

      return { success: false, message: data.message };
    } catch {
      return { success: false, message: "Lỗi kết nối." };
    }
  };

  // --------------------------------------
  // 🟢 ĐĂNG XUẤT
  // --------------------------------------
  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateProfile,
        logout,
        setUser,   // ⭐ Cho Google Login dùng bảo đảm đồng bộ
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
