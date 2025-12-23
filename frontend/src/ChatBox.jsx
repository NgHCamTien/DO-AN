import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Kết nối Server (đảm bảo đúng cổng server của bạn)
const ENDPOINT = "http://localhost:5000";
const socket = io.connect(ENDPOINT);

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // --- KHO DỮ LIỆU CÂU TRẢ LỜI ---
  const getBotResponse = (text) => {
    const lowerText = text.toLowerCase();

    // Định nghĩa các chủ đề và câu trả lời tương ứng
    const knowledgeBase = [
      {
        keywords: ["xin chào", "hi", "hello", "hế lô", "chào shop", "alo"],
        answers: [
          "Chào bạn! 🌸 Shop hoa tươi rất vui được đón tiếp. Bạn cần tìm hoa tặng dịp nào ạ?",
          "Hello tình yêu! 🥰 Hôm nay bạn muốn tìm mẫu hoa nào nè?",
          "Dạ chào bạn, Shop đây ạ! Mình có thể giúp gì cho bạn không? ❤️"
        ]
      },
      {
        keywords: ["giá", "bao nhiêu", "tiền", "mắc không", "chi phí"],
        answers: [
          "Dạ giá hoa bên mình dao động từ 300k - 2 triệu tùy mẫu và size ạ. 💸",
          "Tùy vào loại hoa bạn chọn mà giá sẽ khác nhau nha. Bạn xem chi tiết trên web giúp mình nhé!",
          "Bên mình có nhiều phân khúc giá lắm. Bạn định mua bó khoảng bao nhiêu tiền để mình tư vấn nè? 💰"
        ]
      },
      {
        keywords: ["ship", "giao hàng", "vận chuyển", "freeship"],
        answers: [
          "Bên mình miễn phí ship nội thành cho đơn từ 500k ạ! 🚚",
          "Shop giao hỏa tốc trong 2h nội thành nhé. Phí ship tùy xa gần ạ.",
          "Dạ có giao hàng tận nơi nha. Bạn cho mình xin địa chỉ cụ thể để check phí ship nhé! 🛵"
        ]
      },
      {
        keywords: ["địa chỉ", "ở đâu", "shop đâu", "đến xem"],
        answers: [
          "Shop mình ở Quận 1, TP.HCM ạ. Mời bạn ghé xem hoa trực tiếp nha! 🏡",
          "Dạ kho hoa bên mình ở trung tâm Sài Gòn ạ. Bạn ghé chơi nhé! 🌸",
          "Địa chỉ shop ở ngay Quận 1 nè. Mở cửa từ 8h sáng đến 9h tối ạ."
        ]
      },
      {
        keywords: ["sinh nhật", "sn", "chúc mừng"],
        answers: [
          "Dịp sinh nhật thì tặng hoa hồng hoặc hướng dương là chuẩn bài luôn ạ! 🎂",
          "Bạn xem mục 'Hoa Sinh Nhật' trên web nha, bên mình mới về nhiều mẫu bó tròn đẹp lắm! 🎁",
          "Tặng sinh nhật bạn gái hay mẹ vậy ạ? Để mình gửi mẫu phù hợp nhé! 🥳"
        ]
      },
      {
        keywords: ["khai trương", "kệ hoa", "chúc mừng"],
        answers: [
          "Khai trương thì nên tặng kệ hoa đồng tiền hoặc lan hồ điệp cho phát tài phát lộc ạ! 🎉",
          "Bên mình chuyên kệ hoa khai trương rực rỡ, bao sang trọng luôn nhé! 🎊"
        ]
      },
      {
        keywords: ["bạn gái", "người yêu", "ny", "vợ", "tình nhân"],
        answers: [
          "Tặng người thương thì hoa hồng đỏ hoặc tulip là lãng mạn nhất rồi ạ! 🌹",
          "Dạ để hâm nóng tình cảm thì một bó hồng pastel nhẹ nhàng là tuyệt vời lắm đó! 💕"
        ]
      }
    ];

    // Logic tìm câu trả lời phù hợp
    for (let topic of knowledgeBase) {
      // Nếu tin nhắn chứa từ khóa trong topic
      if (topic.keywords.some(word => lowerText.includes(word))) {
        // Chọn ngẫu nhiên 1 câu trả lời trong mảng answers
        const randomAnswer = topic.answers[Math.floor(Math.random() * topic.answers.length)];
        return randomAnswer;
      }
    }

    // Câu trả lời mặc định nếu không hiểu
    const defaultAnswers = [
      "Cảm ơn bạn đã nhắn tin. Nhân viên tư vấn sẽ phản hồi bạn sớm nhất có thể ạ! ❤️",
      "Dạ mình chưa rõ ý bạn lắm. Bạn chờ xíu nhân viên thật sẽ vào tư vấn ngay nha! 😅",
      "Thông tin này mình xin phép check lại và báo bạn sau nhé! 🌸"
    ];
    return defaultAnswers[Math.floor(Math.random() * defaultAnswers.length)];
  };

  // --- XỬ LÝ GỬI VÀ NHẬN ---
  const handleAutoReply = (text) => {
    setIsTyping(true); // Bật trạng thái đang gõ
    
    // Lấy nội dung trả lời từ hàm thông minh phía trên
    const replyText = getBotResponse(text);

    setTimeout(() => {
      const botMessage = {
        sender: "admin",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessageList((list) => [...list, botMessage]);
      setIsTyping(false); // Tắt trạng thái đang gõ
    }, 1500); 
  };

  useEffect(() => {
    socket.on("receive_message_at_client", (data) => {
      if (data.sender !== "user") {
        setMessageList((list) => [...list, data]);
      }
    });
    return () => socket.off("receive_message_at_client");
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList, isOpen, isTyping]);

  const sendMessage = async () => {
    if (currentMessage.trim() !== "") {
      const messageData = {
        sender: "user",
        text: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessageList((list) => [...list, messageData]);
      await socket.emit("send_message_from_client", messageData);
      
      // Kích hoạt bot trả lời
      handleAutoReply(currentMessage);
      
      setCurrentMessage("");
    }
  };

  // --- GIAO DIỆN ---
  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Nút mở Chat */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="group flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 animate-bounce-slow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-fade-in-up">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png" 
                  alt="Admin Avatar" 
                  className="w-10 h-10 rounded-full border-2 border-white bg-white p-0.5"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div className="text-white">
                <h3 className="font-bold text-base">CSKH Shop Hoa</h3>
                <p className="text-xs text-pink-100 opacity-90">Trả lời tự động</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-full">✖</button>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#f0f2f5] flex flex-col gap-3 scrollbar-hide">
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white text-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] text-sm border border-gray-200">
                Chào bạn! 🌸<br/> Shop có thể giúp gì cho bạn hôm nay?
              </div>
            </div>

            {messageList.map((msg, index) => {
              const isUser = msg.sender === "user";
              return (
                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  {!isUser && (
                    <img src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png" className="w-6 h-6 rounded-full mr-2 self-end mb-1" alt="bot"/>
                  )}
                  <div className={`p-3 max-w-[80%] text-sm break-words shadow-sm ${
                    isUser 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-200'
                  }`}>
                    <p>{msg.text}</p>
                    <span className={`text-[10px] block text-right mt-1 ${isUser ? 'text-pink-100' : 'text-gray-400'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start items-end gap-2">
                 <img src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png" className="w-6 h-6 rounded-full mb-1" alt="bot"/>
                 <div className="bg-gray-200 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center h-10 w-16">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                 </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Footer */}
          <div className="p-3 bg-white border-t border-gray-100 shadow-inner">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-pink-400 focus-within:bg-white transition-all">
              <input 
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-700 outline-none"
                type="text" 
                placeholder="Nhập tin nhắn..." 
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button 
                onClick={sendMessage} 
                disabled={!currentMessage.trim()}
                className={`ml-2 p-2 rounded-full transition-all ${currentMessage.trim() ? 'text-pink-600 hover:bg-pink-100 cursor-pointer' : 'text-gray-300'}`}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;