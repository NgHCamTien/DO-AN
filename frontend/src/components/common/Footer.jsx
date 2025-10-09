import React, { useState } from 'react';

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
      <footer className="footer bg-green-50 py-10 px-5 font-sans text-gray-700 mt-8 border-t border-green-200">
        <div className="footer-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Cột 1: Giới thiệu */}
          <div className="footer-col">
            <h3 className="text-lg font-bold mb-4 text-green-800">Giới thiệu</h3>
            <ul className="list-none p-0 space-y-3">
              <li>
                <button 
                  onClick={() => showInfo('Cơ hội nghề nghiệp', 'Chúng tôi luôn tìm kiếm những tài năng mới để gia nhập đội ngũ. Xem thêm về các vị trí tuyển dụng hiện tại của chúng tôi.')}
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Cơ hội nghề nghiệp
                </button>
              </li>
              <li>
                <button 
                  onClick={() => showInfo('Quy chế sàn giao dịch', 'Quy chế này được xây dựng để đảm bảo quyền lợi của cả người mua và người bán, tạo môi trường giao dịch công bằng và minh bạch.')}
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Quy chế sàn giao dịch
                </button>
              </li>
              <li>
                <button 
                  onClick={() => showInfo('Các khuyến mãi đã bán', 'Xem danh sách các chương trình khuyến mãi trước đây của chúng tôi và lịch sử giá sản phẩm.')}
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Các khuyến mãi đã bán
                </button>
              </li>
            </ul>
          </div>

          {/* Cột 2: Chính sách công ty */}
          <div className="footer-col">
            <h3 className="text-lg font-bold mb-4 text-green-800">Chính sách công ty</h3>
            <ul className="list-none p-0 space-y-3">
              <li>
                <button 
                  onClick={() => showInfo('Hình thức đặt hàng', 'Bạn có thể đặt hàng trực tuyến thông qua website, gọi điện thoại đến hotline hoặc đến trực tiếp cửa hàng của chúng tôi.')}
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Hình thức đặt hàng
                </button>
              </li>
              <li>
                <button 
                  onClick={() => showInfo('Hình thức thanh toán', 'Chúng tôi chấp nhận nhiều hình thức thanh toán như: tiền mặt, chuyển khoản ngân hàng, thẻ tín dụng/ghi nợ và các ví điện tử phổ biến.')}
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Hình thức thanh toán
                </button>
              </li>
              <li>
                <button 
                  onClick={() => showInfo('Phương thức vận chuyển', 'Chúng tôi cung cấp dịch vụ giao hàng nhanh trong ngày đối với khu vực nội thành và 2-3 ngày đối với các tỉnh thành khác.')}
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Phương thức vận chuyển
                </button>
              </li>
              <li>
                <button 
                  onClick={() => showInfo('Chính sách đổi trả', 'Bạn có thể yêu cầu đổi hoặc trả hàng trong vòng 24 giờ nếu sản phẩm không đúng với mô tả hoặc bị hư hỏng trong quá trình vận chuyển.')}
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Chính sách đổi trả
                </button>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hotline liên hệ */}
          <div className="footer-col contact">
            <h3 className="text-lg font-bold mb-4 text-green-800">Hotline liên hệ:</h3>
            <p className="hotline text-xl text-green-700 font-bold mb-2">0398.445.888</p>
            <p className="text-sm text-gray-600 mb-5">(Tất cả các ngày trong tuần)</p>
            
            <h4 className="text-base font-bold mb-3 text-green-800">Kết nối với chúng tôi</h4>
            <div className="social-icons flex gap-3">
              <a href="https://facebook.com/kyuuk" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-800 transition-colors" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://zalo.me/0909817137" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-700 transition-colors" aria-label="Zalo">
                <span className="font-bold text-sm">Z</span>
              </a>
              <a href="mailto:cphoang07@gmail.com" className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-700 transition-colors" aria-label="Email">
                <i className="fas fa-envelope"></i>
              </a>
            </div>
          </div>

          {/* Cột 4: Hệ thống cửa hàng */}
          <div className="footer-col stores">
            <h3 className="text-lg font-bold mb-4 text-green-800">Hệ thống cửa hàng</h3>
            <div className="mb-3">
              <button 
                onClick={() => showInfo('Trụ sở Tp.HCM', 'Địa chỉ: 157 Nguyễn Gia Trí, Quận Bình Thạnh, TP.HCM<br>Điện thoại: 0398.445.888<br>Giờ mở cửa: 8:00 - 21:00')}
                className="text-gray-700 hover:text-green-600 font-semibold"
              >
                Trụ sở Tp.HCM
              </button>
              <address className="not-italic text-gray-600">157 Nguyễn Gia Trí, Quận Bình Thạnh</address>
            </div>
          </div>
        </div>

        {/* Phương thức thanh toán */}
        <div className="mt-8">
          <p className="mb-3 font-medium text-green-800">Chấp nhận thanh toán:</p>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-white border border-green-200 rounded-md text-gray-700 hover:bg-green-100 flex items-center">
              <i className="fas fa-money-bill-wave text-green-600 mr-2"></i>Tiền mặt
            </button>
            <button className="px-4 py-2 bg-white border border-green-200 rounded-md text-gray-700 hover:bg-green-100 flex items-center">
              <i className="fas fa-credit-card text-blue-600 mr-2"></i>ATM
            </button>
            <button className="px-4 py-2 bg-white border border-green-200 rounded-md text-gray-700 hover:bg-green-100 flex items-center">
              <i className="fab fa-cc-visa text-blue-700 mr-2"></i>Visa
            </button>
            <button className="px-4 py-2 bg-white border border-green-200 rounded-md text-gray-700 hover:bg-green-100 flex items-center">
              <i className="fas fa-wallet text-purple-600 mr-2"></i>Ví điện tử
            </button>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {modalInfo.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-green-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-green-700">{modalInfo.title}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-green-600 text-xl">×</button>
            </div>
            <div className="mb-6 text-gray-700" dangerouslySetInnerHTML={{ __html: modalInfo.content }}></div>
            <div className="text-right">
              <button onClick={closeModal} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600">
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
