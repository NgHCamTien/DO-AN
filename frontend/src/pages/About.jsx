import React from 'react';
import Header from "../components/common/Header";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const About = () => {
  // 1. Khai báo các style ở đây cho code JSX bên dưới gọn gàng hơn
  const styles = {
    page: {
      fontFamily: "'Playfair Display', 'Times New Roman', serif", // Font có chân cho sang trọng
      color: '#4a4a4a',
      backgroundColor: '#fff', // Nền trắng
      minHeight: '100vh',
    },
    container: {
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '40px 20px',
    },
    header: {
      textAlign: 'center',
      marginBottom: '60px',
      position: 'relative',
    },
    title: {
      color: '#c24d73', // Hồng đậm sang trọng
      fontSize: '2.5rem',
      marginBottom: '10px',
      letterSpacing: '1px',
    },
    subtitle: {
      fontStyle: 'italic',
      color: '#8c8c8c',
      fontSize: '1.1rem',
    },
    flexContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '60px',
      alignItems: 'center', // Căn giữa theo chiều dọc
    },
    imageWrapper: {
      flex: '1',
      minWidth: '320px',
      maxWidth: '500px',
      position: 'relative', // Để trang trí viền
    },
    image: {
      width: '100%',
      borderRadius: '20px 0 20px 0', // Bo góc chéo nghệ thuật
      boxShadow: '15px 15px 0px #fcebf0', // Tạo bóng cứng màu hồng phấn
      objectFit: 'cover',
      height: '400px',
    },
    contentWrapper: {
      flex: '1',
      minWidth: '320px',
      maxWidth: '500px',
      fontFamily: "'Helvetica', 'Arial', sans-serif", // Font không chân cho nội dung dễ đọc
    },
    sectionTitle: {
      color: '#2d5a27', // Xanh rêu
      fontSize: '1.8rem',
      borderBottom: '2px solid #fcebf0',
      paddingBottom: '10px',
      display: 'inline-block',
      marginBottom: '20px',
    },
    paragraph: {
      lineHeight: '1.8',
      color: '#666',
      marginBottom: '30px',
      fontSize: '1rem',
    },
    list: {
      listStyleType: 'none',
      padding: 0,
    },
    listItem: {
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    },
    icon: {
      fontSize: '1.5rem',
      marginRight: '15px',
      backgroundColor: '#fcebf0',
      padding: '8px',
      borderRadius: '50%',
    },
    commitment: {
      marginTop: '80px',
      textAlign: 'center',
      backgroundColor: '#fff0f6',
      padding: '40px',
      borderRadius: '20px',
      border: '1px dashed #c24d73', // Viền nét đứt
    }
  };

  return (
  <div className="flex flex-col min-h-screen bg-white">
    <Header />
    <Navbar />

    <main style={styles.page}>
      <div style={styles.container}>
        
        {/* Phần Tiêu đề */}
        <div style={styles.header}>
          <h1 style={styles.title}>Về Tiệm Hoa Của Chúng Tôi</h1>
          <p style={styles.subtitle}>"Nơi gửi gắm yêu thương 🌸"</p>
        </div>

        <div style={styles.flexContainer}>
          
          {/* Hình ảnh */}
          <div style={styles.imageWrapper}>
            <img 
              src="https://images.unsplash.com/photo-1562690868-60bbe7293e94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Tiệm hoa tươi"
              style={styles.image}
            />
          </div>

          {/* Nội dung */}
          <div style={styles.contentWrapper}>
            <h2 style={styles.sectionTitle}>Câu Chuyện Khởi Đầu</h2>
            <p style={styles.paragraph}>
              Chào mừng bạn đến với <strong>DDT Flower Shop</strong>. 
              Chúng tôi tin rằng mỗi bó hoa không chỉ là quà tặng, mà còn là thông điệp của cảm xúc.
            </p>

            <h3 style={{ ...styles.sectionTitle, fontSize: "1.4rem", borderBottom: "none" }}>
              Tại sao chọn chúng tôi?
            </h3>

            <ul style={styles.list}>
              <li style={styles.listItem}>
                <span style={styles.icon}>🌸</span>
                <div><strong>Hoa tươi mỗi ngày:</strong> Nhập trực tiếp từ vườn.</div>
              </li>
              <li style={styles.listItem}>
                <span style={styles.icon}>🎨</span>
                <div><strong>Thiết kế độc đáo:</strong> Mỗi bó hoa là một tác phẩm.</div>
              </li>
              <li style={styles.listItem}>
                <span style={styles.icon}>🚀</span>
                <div><strong>Giao hàng nhanh:</strong> Trong 2 giờ.</div>
              </li>
            </ul>
          </div>
        </div>

        {/* Cam kết */}
        <div style={styles.commitment}>
          <h3 style={{ color: "#c24d73", marginBottom: "10px" }}>
            Cam Kết Chất Lượng
          </h3>
          <p style={{ color: "#555" }}>
            Sự hài lòng của bạn là ưu tiên số 1.<br />
            Hoàn tiền 100% nếu hoa không tươi.
          </p>
        </div>

      </div>
    </main>

    <Footer />
  </div>
);

};

export default About;