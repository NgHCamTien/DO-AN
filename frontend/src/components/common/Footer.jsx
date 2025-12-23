import React, { useState } from "react";

// ==========================
// FOOTER (B + C MERGED)
// ==========================
const Footer = () => {
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: "",
    content: "",
  });

  const [email, setEmail] = useState("");

  const showInfo = (title, content) => {
    setModalInfo({ show: true, title, content });
  };

  const closeModal = () => {
    setModalInfo({ ...modalInfo, show: false });
  };

  const handleRegister = () => {
    if (!email) {
      alert("Vui lòng nhập địa chỉ email!");
      return;
    }
    alert(`Cảm ơn bạn! Email ${email} đã được đăng ký nhận tin.`);
    setEmail("");
  };

  return (
    <>
      <footer className="bg-gray-900 text-gray-300 font-sans mt-16">
        {/* ================= ĐĂNG KÝ EMAIL (B) ================= */}
        <div className="border-b border-gray-800">
          <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Đăng ký nhận tin khuyến mãi
              </h2>
              <p className="text-gray-400 text-sm">
                Nhận ưu đãi & thông tin mới nhất từ DDT Flower Shop
              </p>
            </div>

            <div className="flex w-full md:w-auto mt-4 md:mt-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn..."
                className="bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-l-lg w-full md:w-64 focus:outline-none"
              />
              <button
                onClick={handleRegister}
                className="bg-[#e06c7f] hover:bg-[#c95669] text-white px-6 py-3 rounded-r-lg font-bold"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>

        {/* ================= NỘI DUNG CHÍNH ================= */}
        <div className="container mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* CỘT 1 */}
            <div>
              <h3 className="text-white font-bold mb-4">Về chúng tôi</h3>
              <p className="text-sm text-gray-400 mb-4">
                DDT Flower Shop – Mang đến những bó hoa tinh tế và cảm xúc trọn
                vẹn cho mọi khoảnh khắc.
              </p>

              <div className="flex space-x-4">
                <SocialBtn icon="fab fa-facebook-f" />
                <SocialBtn icon="fab fa-instagram" />
                <SocialBtn icon="fab fa-tiktok" />
              </div>
            </div>

            {/* CỘT 2 – THÔNG TIN (C) */}
            <div>
              <h3 className="text-white font-bold mb-4">
                Thông tin & Chính sách
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  [
                    "Cơ hội nghề nghiệp",
                    "Chúng tôi luôn chào đón những tài năng mới gia nhập đội ngũ.",
                  ],
                  [
                    "Chính sách đổi trả",
                    "Đổi/trả trong vòng 24h nếu sản phẩm lỗi hoặc không đúng mô tả.",
                  ],
                  [
                    "Hình thức thanh toán",
                    "COD, chuyển khoản ngân hàng, ví MoMo.",
                  ],
                  [
                    "Phương thức vận chuyển",
                    "Giao nhanh nội thành trong ngày, tỉnh khác 2–3 ngày.",
                  ],
                ].map(([title, content]) => (
                  <li key={title}>
                    <button
                      onClick={() => showInfo(title, content)}
                      className="hover:text-[#e06c7f]"
                    >
                      {title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* CỘT 3 – LIÊN HỆ */}
            <div>
              <h3 className="text-white font-bold mb-4">Liên hệ</h3>
              <ul className="space-y-3 text-sm">
                <li>📍 157 Nguyễn Gia Trí, Bình Thạnh</li>
                <li className="text-white font-bold">📞 0123 456 789</li>
                <li>✉️ ddtflowershop@gmail.com</li>
              </ul>
            </div>

            {/* CỘT 4 – CỬA HÀNG */}
            <div>
              <h3 className="text-white font-bold mb-4">Hệ thống cửa hàng</h3>
              <button
                onClick={() =>
                  showInfo(
                    "Trụ sở TP.HCM",
                    "157 Nguyễn Gia Trí, Bình Thạnh<br/>Giờ mở cửa: 8:00 – 21:00"
                  )
                }
                className="text-sm hover:text-[#e06c7f]"
              >
                Trụ sở TP.HCM
              </button>
            </div>
          </div>
        </div>

        {/* ================= FOOTER BOTTOM ================= */}
        <div className="bg-gray-950 py-6 border-t border-gray-800">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-500">
              © 2025 DDT Flower Shop. All rights reserved.
            </p>

            <div className="flex gap-4 text-3xl">
              <i className="fab fa-cc-visa text-gray-500 hover:text-white" />
              <i className="fab fa-cc-mastercard text-gray-500 hover:text-white" />
              <i className="fab fa-cc-paypal text-gray-500 hover:text-white" />
            </div>
          </div>
        </div>
      </footer>

      {/* ================= MODAL THÔNG TIN (C) ================= */}
      {modalInfo.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeModal}
          ></div>

          <div className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full relative z-10">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-2xl"
            >
              ×
            </button>

            <h2 className="text-xl font-bold text-[#e06c7f] mb-4">
              {modalInfo.title}
            </h2>

            <div
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: modalInfo.content }}
            />

            <div className="mt-6 text-right">
              <button
                onClick={closeModal}
                className="bg-[#e06c7f] text-white px-5 py-2 rounded"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ==========================
// SOCIAL BUTTON
// ==========================
const SocialBtn = ({ icon }) => (
  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#e06c7f] text-gray-400 hover:text-white cursor-pointer">
    <i className={icon}></i>
  </div>
);

export default Footer;
