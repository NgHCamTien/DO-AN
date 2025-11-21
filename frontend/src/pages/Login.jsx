import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, register, setUser } = useContext(AuthContext);

  // ---------------------------------------------------------
  // ⭐ FACEBOOK LOGIN
  // ---------------------------------------------------------
  const handleFacebookLogin = () => {
    const FACEBOOK_APP_ID = "1180477920674027";
    const redirectUri = "http://localhost:3000/auth/facebook/callback";

    const url =
      `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=dtp_flowershop&response_type=token&scope=email,public_profile`;

    window.location.href = url;
  };

  // ---------------------------------------------------------
  // ⭐ CUSTOM GOOGLE LOGIN (để có nút đẹp)
  // ---------------------------------------------------------
  const googleLoginCustom = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );

        const res = await fetch(
          "http://localhost:5000/api/auth/google-login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userInfo.data.email,
              name: userInfo.data.name,
              googleId: userInfo.data.sub,
              picture: userInfo.data.picture,
            }),
          }
        );

        const data = await res.json();

        if (data.success) {
          const userToSave = {
            _id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            picture: data.user.picture,
            token: data.accessToken,
          };

          localStorage.setItem("userInfo", JSON.stringify(userToSave));
          setUser(userToSave);

          navigate(userToSave.role === "admin" ? "/admin" : "/");
        } else {
          setError("Không thể đăng nhập bằng Google.");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi Google Login!");
      }
    },
    onError: () => setError("Đăng nhập Google thất bại!"),
  });

  // ---------------------------------------------------------
  // ⭐ LOGIN THƯỜNG
  // ---------------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);

    if (result?.success) {
      navigate(result.user.role === "admin" ? "/admin" : "/");
    } else {
      setError(result?.message || "Sai thông tin đăng nhập!");
    }

    setLoading(false);
  };

  // ---------------------------------------------------------
  // ⭐ REGISTER THƯỜNG
  // ---------------------------------------------------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await register(
      name,
      email,
      password,
      "",
      "",
      subscribeNewsletter
    );

    if (result?.success) navigate("/");
    else setError(result?.message || "Đăng ký thất bại.");

    setLoading(false);
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-white to-[#FDE2EB] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-1 bg-[#f9d5df] items-center justify-center p-10">
          <div className="text-center">
            <img
              src="/DDT.png"
              alt="DDT Logo"
              className="w-64 mx-auto mb-6 drop-shadow-lg"
            />
            <h2 className="text-3xl font-bold text-[#e06c7f] tracking-wide">
              DDT Flower Shop
            </h2>
            <p className="mt-3 text-[#a46473] text-lg">
              Nơi gửi gắm yêu thương qua từng bó hoa 🌸
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 p-10">

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 border border-red-200 rounded-xl mb-4 text-center">
              ⚠ {error}
            </div>
          )}

          {/* ================= LOGIN ================= */}
          {mode === "login" ? (
            <>
              <form onSubmit={handleLogin} className="space-y-4">

                <div>
                  <label className="text-sm text-gray-700">Email</label>
                  <input
                    type="email"
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg 
                      focus:border-[#e06c7f]"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700">Mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full p-3 border border-gray-300 rounded-lg 
                        focus:border-[#e06c7f]"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3 text-xl"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <button
                  className="w-full bg-[#e06c7f] text-white py-3 rounded-lg font-semibold 
                    hover:bg-[#d35d75] transition"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </form>

              <div className="mt-3 text-right">
                <Link className="text-sm text-[#e06c7f] hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-grow h-px bg-gray-300" />
                <span className="px-3 text-gray-500 text-sm">HOẶC</span>
                <div className="flex-grow h-px bg-gray-300" />
              </div>

              {/* Social Login */}
              <div className="flex gap-4">

                {/* FACEBOOK */}
                <button
                  onClick={handleFacebookLogin}
                  className="flex-1 border border-gray-300 py-3 rounded-lg 
                    flex items-center justify-center gap-2 hover:bg-gray-100 transition"
                >
                  <img src="/images/facebook.svg" className="w-5" alt="fb" />
                  Facebook
                </button>

                {/* GOOGLE CUSTOM */}
                <button
                  onClick={() => googleLoginCustom()}
                  className="flex-1 border border-gray-300 py-3 rounded-lg 
                    flex items-center justify-center gap-2 hover:bg-gray-100 transition"
                >
                  <img src="/images/google.svg" className="w-5" alt="google" />
                  Google
                </button>

              </div>

              <p className="mt-6 text-center text-sm">
                Bạn mới đến DDT Flower Shop?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-[#e06c7f] font-medium hover:underline"
                >
                  Đăng ký
                </button>
              </p>
            </>
          ) : (
            /* ================= REGISTER ================= */
            <>
              <form onSubmit={handleRegister} className="space-y-4">

                <div>
                  <label className="text-sm text-gray-700">Họ tên</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-3 border border-gray-300 
                      rounded-lg focus:border-[#e06c7f]"
                    placeholder="Nhập họ tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700">Email</label>
                  <input
                    type="email"
                    className="w-full mt-1 p-3 border border-gray-300 
                      rounded-lg focus:border-[#e06c7f]"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700">Mật khẩu</label>
                  <input
                    type="password"
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg 
                      focus:border-[#e06c7f]"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={subscribeNewsletter}
                    onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                    className="mr-2"
                  />
                  Nhận email ưu đãi & khuyến mãi 🌸
                </label>

                <button
                  className="w-full bg-[#e06c7f] text-white py-3 rounded-lg font-semibold 
                    hover:bg-[#d35d75] transition"
                >
                  {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-grow h-px bg-gray-300" />
                <span className="px-3 text-gray-500 text-sm">HOẶC</span>
                <div className="flex-grow h-px bg-gray-300" />
              </div>

              {/* Social Login */}
              <div className="flex gap-4">

                {/* FACEBOOK */}
                <button
                  onClick={handleFacebookLogin}
                  className="flex-1 border border-gray-300 py-3 rounded-lg 
                    flex items-center justify-center gap-2 hover:bg-gray-100 transition"
                >
                  <img src="/images/facebook.svg" className="w-5" alt="fb" />
                  Facebook
                </button>

                {/* GOOGLE CUSTOM */}
                <button
                  onClick={() => googleLoginCustom()}
                  className="flex-1 border border-gray-300 py-3 rounded-lg 
                    flex items-center justify-center gap-2 hover:bg-gray-100 transition"
                >
                  <img src="/images/google.svg" className="w-5" alt="google" />
                  Google
                </button>

              </div>

              <p className="mt-6 text-center text-sm">
                Bạn đã có tài khoản?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-[#e06c7f] font-medium hover:underline"
                >
                  Đăng nhập
                </button>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
