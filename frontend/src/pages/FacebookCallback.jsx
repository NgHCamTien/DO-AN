import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FacebookCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy fragment từ URL (#access_token=...)
    const hash = window.location.hash;

    if (!hash) {
      alert("Không nhận được token từ Facebook!");
      navigate("/login");
      return;
    }

    const params = new URLSearchParams(hash.replace("#", ""));
    const accessToken = params.get("access_token");

    console.log("FB Access Token:", accessToken);

    if (!accessToken) {
      alert("Facebook login failed!");
      navigate("/login");
      return;
    }

    // Gọi API Graph Facebook để lấy info user
    fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    )
      .then((res) => res.json())
      .then(async (fbUser) => {
        console.log("Facebook User:", fbUser);

        // Gửi user qua backend
        const response = await fetch(
          "http://localhost:5000/api/auth/facebook-login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: fbUser.name,
              email: fbUser.email || `${fbUser.id}@facebook.com`, // fallback nếu không có email
              facebookId: fbUser.id,
              picture: fbUser.picture?.data?.url || "",
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          localStorage.setItem("userInfo", JSON.stringify(data.user));

          navigate(data.user.role === "admin" ? "/admin" : "/");
        } else {
          alert("Lỗi server khi đăng nhập bằng Facebook!");
          navigate("/login");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Không thể kết nối tới Facebook!");
        navigate("/login");
      });
  }, [navigate]);

  return (
    <div className="w-full text-center mt-20 text-lg text-gray-600">
      Đang đăng nhập bằng Facebook...
    </div>
  );
}
