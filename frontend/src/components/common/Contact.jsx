import React, { useState } from 'react';

const Contact = () => {
  // 1. Quản lý dữ liệu form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // State để hiển thị thông báo gửi thành công
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 2. Hàm xử lý khi người dùng nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 3. Hàm xử lý khi bấm nút Gửi
  const handleSubmit = (e) => {
    e.preventDefault(); // Chặn load lại trang
    
    // Giả lập gửi dữ liệu (Sau này bạn sẽ gọi API ở đây)
    console.log('Dữ liệu gửi đi:', formData);
    
    // Hiển thị thông báo thành công
    setIsSubmitted(true);
    
    // Reset form sau 3 giây
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  return (
    <section className="bg-gray-50 py-16 font-sans">
      <div className="container mx-auto px-6">
        
        {/* Tiêu đề trang */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-wide">Liên hệ với chúng tôi</h2>
          <p className="text-gray-500 mt-2">Chúng tôi luôn lắng nghe và sẵn sàng hỗ trợ bạn 24/7</p>
          <div className="w-20 h-1 bg-[#e06c7f] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* --- CỘT TRÁI: THÔNG TIN & BẢN ĐỒ --- */}
          <div className="space-y-8">
            {/* Box thông tin */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-[#e06c7f]">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Thông tin liên lạc</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#fce4e8] rounded-full flex items-center justify-center text-[#e06c7f] shrink-0">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700">Địa chỉ</h4>
                    <p className="text-gray-600 text-sm">157 Nguyễn Gia Trí, Quận Bình Thạnh, TP.HCM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#fce4e8] rounded-full flex items-center justify-center text-[#e06c7f] shrink-0">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700">Hotline</h4>
                    <p className="text-gray-600 text-sm">0398.445.888</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#fce4e8] rounded-full flex items-center justify-center text-[#e06c7f] shrink-0">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700">Email</h4>
                    <p className="text-gray-600 text-sm">cphoang07@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bản đồ Google Maps (Embed Iframe) */}
            <div className="h-64 w-full rounded-xl overflow-hidden shadow-lg">
              <iframe 
                title="Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.123456789!2d106.7123456!3d10.8123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528a123456789%3A0x123456789abcdef!2s157%20Nguy%E1%BB%85n%20Gia%20Tr%C3%AD%2C%20Ph%C6%B0%E1%BB%9Dng%2025%2C%20B%C3%ACnh%20Th%E1%BA%A1nh%2C%20Th%C3%A0nh%20ph%E1%BB%91%20H%E1%BB%93%20Ch%C3%AD%20Minh!5e0!3m2!1svi!2s!4v1600000000000!5m2!1svi!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
              ></iframe>
            </div>
          </div>

          {/* --- CỘT PHẢI: FORM LIÊN HỆ --- */}
          <div className="bg-white p-8 rounded-xl shadow-xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Gửi thắc mắc cho chúng tôi</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tên */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#e06c7f] focus:ring-2 focus:ring-[#fce4e8] outline-none transition-all"
                  />
                </div>
                {/* Số điện thoại */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required 
                    placeholder="0901234567"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#e06c7f] focus:ring-2 focus:ring-[#fce4e8] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#e06c7f] focus:ring-2 focus:ring-[#fce4e8] outline-none transition-all"
                />
              </div>

              {/* Tin nhắn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung tin nhắn</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4" 
                  placeholder="Bạn cần hỗ trợ gì không?"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#e06c7f] focus:ring-2 focus:ring-[#fce4e8] outline-none transition-all resize-none"
                ></textarea>
              </div>

              {/* Nút gửi */}
              <button 
                type="submit" 
                className="w-full bg-[#e06c7f] hover:bg-[#c95669] text-white font-bold py-3 rounded-lg transition-all transform hover:-translate-y-1 shadow-md"
              >
                Gửi Tin Nhắn
              </button>
            </form>

            {/* Thông báo thành công */}
            {isSubmitted && (
              <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg text-center animate-fade-in-up">
                <i className="fas fa-check-circle mr-2"></i>
                Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất.
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;