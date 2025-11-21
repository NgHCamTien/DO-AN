import React, { useState } from 'react';
import { useLocation } from "react-router-dom";

const Footer = () => {
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    content: ''
  });

  const showInfo = (title, content) => {
    setModalInfo({ show: true, title, content });
  };

  const closeModal = () => {
    setModalInfo({ ...modalInfo, show: false });
  };

  return (
    <>
      <footer className="footer bg-[#faf8f6] py-10 px-5 font-sans text-gray-700 mt-8 border-t border-[#f0e8e3]">
        <div className="footer-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Cột 1: Giới thiệu */}
          <div className="footer-col">
            <h3 className="text-lg font-bold mb-4 text-[#e06c7f]">Giới thiệu</h3>
            <ul className="list-none p-0 space-y-3">
              <li>
                <button 
                  onClick={() => showInfo('Cơ hội nghề nghiệp', 'Chúng tôi luôn tìm kiếm những tài năng mới để gia nhập đội ngũ. Xem thêm về các vị trí tuyển dụng hiện tại của chúng tôi.')}
                  className="text-gray-700 hover:text-[#e06c7f] transition-colors"
                >
                  Cơ hội nghề nghiệp
                </button>
              </li>
              <li>
                <button 
                  onClick={() => showInfo('Quy chế sàn giao dịch', 'Quy chế này được xây dựng để đảm bảo quyền lợi của cả người mua và người bán, tạo môi trường giao dịch công bằng và minh bạch.')}
                  className="text-gray-700 hover:text-[#e06c7f] transition-colors"
                >
                  Quy chế sàn giao dịch
                </button>
              </li>
              <li>
                <button 
                  onClick={() => showInfo('Các khuyến mãi đã bán', 'Xem danh sách các chương trình khuyến mãi trước đây của chúng tôi và lịch sử giá sản phẩm.')}
                  className="text-gray-700 hover:text-[#e06c7f] transition-colors"
                >
                  Các khuyến mãi đã bán
                </button>
              </li>
            </ul>
          </div>

          {/* Cột 2: Chính sách công ty */}
          <div className="footer-col">
            <h3 className="text-lg font-bold mb-4 text-[#e06c7f]">Chính sách công ty</h3>
            <ul className="list-none p-0 space-y-3">
              {[
                ['Hình thức đặt hàng', 'Bạn có thể đặt hàng trực tuyến thông qua website, hotline hoặc cửa hàng.'],
                ['Hình thức thanh toán', 'Chúng tôi chấp nhận tiền mặt, chuyển khoản và ví điện tử.'],
                ['Phương thức vận chuyển', 'Giao hàng nhanh trong ngày nội thành, 2-3 ngày với tỉnh thành khác.'],
                ['Chính sách đổi trả', 'Đổi/trả trong vòng 24h nếu sản phẩm không đúng mô tả hoặc bị hư hỏng.']
              ].map(([title, content]) => (
                <li key={title}>
                  <button 
                    onClick={() => showInfo(title, content)}
                    className="text-gray-700 hover:text-[#e06c7f] transition-colors"
                  >
                    {title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Hotline liên hệ */}
          <div className="footer-col contact">
            <h3 className="text-lg font-bold mb-4 text-[#e06c7f]">Hotline liên hệ:</h3>
            <p className="hotline text-xl text-[#e06c7f] font-bold mb-2">0398.445.888</p>
            <p className="text-sm text-gray-600 mb-5">(Tất cả các ngày trong tuần)</p>
            
            <h4 className="text-base font-bold mb-3 text-[#e06c7f]">Kết nối với chúng tôi</h4>
            <div className="social-icons flex gap-3">
              <a href="https://facebook.com/kyuuk" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#e06c7f] text-white flex items-center justify-center hover:bg-[#c85d70] transition-colors" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://zalo.me/0909817137" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#f2b5bb] text-white flex items-center justify-center hover:bg-[#e06c7f] transition-colors" aria-label="Zalo">
                <span className="font-bold text-sm">Z</span>
              </a>
              <a href="mailto:cphoang07@gmail.com" className="w-10 h-10 rounded-full bg-[#f8a9b0] text-white flex items-center justify-center hover:bg-[#e06c7f] transition-colors" aria-label="Email">
                <i className="fas fa-envelope"></i>
              </a>
            </div>
          </div>

          {/* Cột 4: Hệ thống cửa hàng */}
          <div className="footer-col stores">
            <h3 className="text-lg font-bold mb-4 text-[#e06c7f]">Hệ thống cửa hàng</h3>
            <div className="mb-3">
              <button 
                onClick={() => showInfo('Trụ sở Tp.HCM', 'Địa chỉ: 157 Nguyễn Gia Trí, Quận Bình Thạnh, TP.HCM<br>Điện thoại: 0398.445.888<br>Giờ mở cửa: 8:00 - 21:00')}
                className="text-gray-700 hover:text-[#e06c7f] font-semibold"
              >
                Trụ sở Tp.HCM
              </button>
              <address className="not-italic text-gray-600">157 Nguyễn Gia Trí, Quận Bình Thạnh</address>
            </div>
          </div>
        </div>

        {/* Phương thức thanh toán */}
        <div className="mt-8">
          <p className="mb-3 font-medium text-[#e06c7f]">Chấp nhận thanh toán:</p>
          <div className="flex flex-wrap gap-2">
            {[
              ['fa-money-bill-wave', '#e06c7f', 'Tiền mặt'],
              ['fa-credit-card', '#f091a0', 'ATM'],
              ['fab fa-cc-visa', '#d87888', 'Visa'],
              ['fa-wallet', '#f4a7b9', 'Ví điện tử']
            ].map(([icon, color, label]) => (
              <button key={label} className="px-4 py-2 bg-white border border-[#f0e8e3] rounded-md text-gray-700 hover:bg-[#fdf8f7] flex items-center">
                <i className={`fas ${icon} mr-2`} style={{ color }}></i>{label}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* Modal */}
      {modalInfo.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-[#f0e8e3]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#e06c7f]">{modalInfo.title}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-[#e06c7f] text-xl">×</button>
            </div>
            <div className="mb-6 text-gray-700" dangerouslySetInnerHTML={{ __html: modalInfo.content }}></div>
            <div className="text-right">
              <button onClick={closeModal} className="bg-[#e06c7f] text-white px-4 py-2 rounded hover:bg-[#c85d70]">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
