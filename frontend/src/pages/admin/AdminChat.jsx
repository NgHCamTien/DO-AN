import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Đảm bảo cổng này trùng với server của bạn
const ENDPOINT = "http://localhost:5000";
const socket = io.connect(ENDPOINT);

const AdminChat = () => {
  const [conversations, setConversations] = useState({}); // Lưu tin nhắn: { userId: [messages...] }
  const [selectedUserId, setSelectedUserId] = useState(null); // User đang được chọn
  const [replyText, setReplyText] = useState("");
  const scrollRef = useRef(null);

  // 1. Lắng nghe tin nhắn từ Server gửi về (Khách nhắn -> Server -> Admin)
  useEffect(() => {
    socket.on("message_to_admin", (data) => {
      // data: { sender: "user", text: "...", userId: "...", time: "..." }
      setConversations((prev) => {
        const userId = data.userId;
        const currentMsgs = prev[userId] || [];
        return {
          ...prev,
          [userId]: [...currentMsgs, data]
        };
      });
    });

    return () => socket.off("message_to_admin");
  }, []);

  // 2. Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, selectedUserId]);

  // 3. Gửi tin nhắn trả lời
  const sendReply = () => {
    if (replyText.trim() === "" || !selectedUserId) return;

    const msgData = {
      userId: selectedUserId, // Gửi đúng cho người này
      text: replyText,
      sender: "admin",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Gửi xuống server
    socket.emit("send_message_from_admin", msgData);

    // Cập nhật giao diện bên mình ngay lập tức
    setConversations((prev) => ({
      ...prev,
      [selectedUserId]: [...(prev[selectedUserId] || []), msgData]
    }));

    setReplyText("");
  };

  return (
    <div className="w-full h-full p-6">
      {/* KHUNG BAO NGOÀI (Giống style trang Danh mục) */}
      <div className="bg-white rounded-lg shadow-md h-[85vh] flex flex-col overflow-hidden">
        
        {/* HEADER CỦA BOX CHAT */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
             <div className="bg-pink-100 p-2 rounded-lg text-pink-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
             </div>
             <h2 className="text-xl font-bold text-gray-800 uppercase">Chat Hỗ Trợ Khách Hàng</h2>
          </div>
          <div className="text-sm text-gray-500">
             Trạng thái: <span className="text-green-600 font-bold">● Online</span>
          </div>
        </div>

        {/* BODY (CHIA 2 CỘT) */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* CỘT TRÁI: DANH SÁCH USER */}
          <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
             <div className="p-4 bg-gray-100 border-b border-gray-200 font-bold text-gray-600 text-sm">
                DANH SÁCH HỘI THOẠI
             </div>
             <div className="flex-1 overflow-y-auto">
                {Object.keys(conversations).length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    Chưa có tin nhắn nào...
                  </div>
                ) : (
                  Object.keys(conversations).map((userId) => {
                    const msgs = conversations[userId];
                    const lastMsg = msgs[msgs.length - 1];
                    const isActive = selectedUserId === userId;

                    return (
                      <div 
                        key={userId}
                        onClick={() => setSelectedUserId(userId)}
                        className={`p-4 cursor-pointer transition-all border-b border-gray-100 hover:bg-white ${
                          isActive ? "bg-white border-l-4 border-l-pink-500 shadow-sm" : "bg-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                           {/* Avatar user giả lập */}
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isActive ? 'bg-pink-500' : 'bg-gray-400'}`}>
                              {userId.substr(0, 2).toUpperCase()}
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                 <span className={`font-bold text-sm ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>
                                    Khách #{userId.substr(0, 5)}
                                 </span>
                                 <span className="text-xs text-gray-400">{lastMsg?.time}</span>
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                 {lastMsg?.sender === "admin" ? "Bạn: " : ""}{lastMsg?.text}
                              </p>
                           </div>
                        </div>
                      </div>
                    );
                  })
                )}
             </div>
          </div>

          {/* CỘT PHẢI: KHUNG CHAT CHI TIẾT */}
          <div className="flex-1 flex flex-col bg-white">
             {selectedUserId ? (
                <>
                   {/* Header User đang chat */}
                   <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10">
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                         <span className="font-bold text-gray-700">Đang chat với: <span className="text-pink-600">#{selectedUserId.substr(0, 5)}</span></span>
                      </div>
                   </div>

                   {/* Nội dung hội thoại */}
                   <div className="flex-1 p-5 overflow-y-auto bg-gray-50 flex flex-col gap-4">
                      {conversations[selectedUserId]?.map((msg, index) => {
                         const isAdmin = msg.sender === "admin";
                         return (
                            <div key={index} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                               {!isAdmin && (
                                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs text-white mr-2 mt-1">
                                     U
                                  </div>
                               )}
                               <div className={`max-w-[70%] p-3 text-sm shadow-sm break-words ${
                                  isAdmin 
                                     ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl rounded-tr-none' 
                                     : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-tl-none'
                               }`}>
                                  <p>{msg.text}</p>
                                  <span className={`text-[10px] block text-right mt-1 opacity-70`}>
                                     {msg.time}
                                  </span>
                               </div>
                            </div>
                         );
                      })}
                      <div ref={scrollRef} />
                   </div>

                   {/* Footer nhập liệu */}
                   <div className="p-4 border-t border-gray-100 bg-white">
                      <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-pink-300 focus-within:bg-white transition-all">
                         <input 
                            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700"
                            placeholder="Nhập tin nhắn trả lời..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                         />
                         <button 
                            onClick={sendReply}
                            disabled={!replyText.trim()}
                            className={`p-2 rounded-full transition-colors ${
                               replyText.trim() ? 'text-pink-600 hover:bg-pink-100' : 'text-gray-400'
                            }`}
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                               <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                         </button>
                      </div>
                   </div>
                </>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                   </svg>
                   <p className="text-lg font-medium">Chọn một hội thoại để bắt đầu chat</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;