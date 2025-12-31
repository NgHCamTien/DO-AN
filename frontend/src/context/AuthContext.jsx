import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // 🟢 LOAD USER TỪ SESSIONSTORAGE (THEO TỪNG TAB)
  // =====================================================
  useEffect(() => {
    try {
      const userInfo = sessionStorage.getItem("userInfo");
      if (userInfo) {
        setUser(JSON.parse(userInfo));
      }
    } catch (error) {
      console.error("❌ Error parsing userInfo:", error);
      sessionStorage.removeItem("userInfo");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // 🟢 LOGIN
  // =====================================================
  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, message: data.message };
      }

      const userToSave = {
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || "user",
        picture: data.user.picture || "",
        token: data.accessToken,
      };

      sessionStorage.setItem("userInfo", JSON.stringify(userToSave));
      setUser(userToSave);

      return { success: true, user: userToSave };
    } catch (error) {
      return { success: false, message: "Lỗi kết nối server" };
    }
  };

  // =====================================================
  // 🟢 REGISTER
  // =====================================================
  const register = async (
    name,
    email,
    password,
    phone = "",
    address = "",
    subscribeNewsletter = true
  ) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
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

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, message: data.message };
      }

      const userToSave = {
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || "user",
        picture: data.user.picture || "",
        token: data.accessToken,
      };

      sessionStorage.setItem("userInfo", JSON.stringify(userToSave));
      setUser(userToSave);

      return { success: true, user: userToSave };
    } catch (error) {
      return { success: false, message: "Lỗi server khi đăng ký" };
    }
  };

  // =====================================================
  // 🟢 UPDATE PROFILE
  // =====================================================
  const updateProfile = async (profileData) => {
    if (!user?.token) {
      return { success: false, message: "Chưa đăng nhập" };
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, message: data.message };
      }

      const updatedUser = { ...user, ...data.user };
      sessionStorage.setItem("userInfo", JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      return { success: false, message: "Lỗi kết nối" };
    }
  };

  // =====================================================
  // 🟢 LOGOUT (CHỈ ẢNH HƯỞNG TAB HIỆN TẠI)
  // =====================================================
  const logout = () => {
    sessionStorage.removeItem("userInfo");
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
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
