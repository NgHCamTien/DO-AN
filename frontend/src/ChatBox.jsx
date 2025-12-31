import { useEffect, useState, useContext } from "react";
import axios from "axios";
import socket from "./socket";
import { AuthContext } from "./context/AuthContext";

const ChatBox = () => {
  const { user } = useContext(AuthContext);
  const userId = user?._id;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);

  const [isOpen, setIsOpen] = useState(false);   // 👈 thu gọn / mở
  const [unread, setUnread] = useState(0);       // 👈 badge unread

  // =====================
  // LOAD CHAT HISTORY (USER)
  // =====================
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.token) return;

      try {
        const res = await axios.get("/api/chat/user", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (res.data?.messages) {
          setMessages(
            res.data.messages.map((m) => ({
              sender: m.sender,
              text: m.text,
              time: new Date(m.createdAt).toLocaleTimeString(),
            }))
          );
        }
      } catch (err) {
        console.error("❌ Load chat history error:", err);
      }
    };

    fetchHistory();
  }, [user]);

  // =====================
  // SOCKET SETUP + REGISTER USER
  // =====================
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setConnected(true);

      if (userId) {
        socket.emit("register_client", {
          role: "user",
          userId,
        });
      }
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onReceiveFromAdmin = (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "admin",
          text: msg.text,
          time: new Date(msg.time).toLocaleTimeString(),
        },
      ]);

      // 🔴 nếu chat đang đóng → tăng unread
      if (!isOpen) {
        setUnread((u) => u + 1);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message_to_user", onReceiveFromAdmin);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message_to_user", onReceiveFromAdmin);
    };
  }, [userId, isOpen]);

  // =====================
  // USER SEND MESSAGE
  // =====================
  const sendMessage = () => {
    if (!input.trim() || !userId) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: input,
        time: new Date().toLocaleTimeString(),
      },
    ]);

    socket.emit("user_send_message", {
      userId,
      text: input,
    });

    setInput("");
  };

  // =====================
  // TOGGLE CHAT
  // =====================
  const toggleChat = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setUnread(0); // mở chat → reset unread
      return next;
    });
  };
return (
  <>
    {/* =====================
        TOGGLE BUTTON
    ===================== */}
    {!isOpen && (
      <button
        onClick={toggleChat}
        className="fixed bottom-5 right-5 z-50
                   flex items-center gap-3
                   px-5 py-3 rounded-full
                   bg-[#fff6f8]
                   border border-[#f1cfd8]
                   shadow-[0_12px_32px_rgba(0,0,0,0.12)]
                   hover:shadow-[0_16px_40px_rgba(0,0,0,0.14)]
                   transition"
      >
        <span className="text-base">💬</span>
        <span className="text-sm font-medium text-[#7a4b57] tracking-wide">
          Hỗ trợ
        </span>

        {unread > 0 && (
          <span
            className="ml-1 min-w-[22px] h-[22px]
                       rounded-full
                       bg-[#e07a8d]
                       text-white text-xs font-semibold
                       flex items-center justify-center"
          >
            {unread}
          </span>
        )}
      </button>
    )}

    {/* =====================
        CHATBOX
    ===================== */}
    {isOpen && (
      <div
        className="fixed bottom-5 right-5 z-50
                   w-[360px] h-[520px]
                   bg-[#fffdfc]
                   border border-[#f1cfd8]
                   rounded-2xl
                   shadow-[0_20px_60px_rgba(0,0,0,0.15)]
                   overflow-hidden
                   flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4
                        bg-gradient-to-b from-[#fff2f5] to-[#fff9fb]
                        border-b border-[#f1cfd8]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🌸</span>
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-[#6e3f4b] tracking-wide">
                  DDT Flower • CSKH
                </span>
                <span className="text-xs text-[#9a7a84] mt-0.5">
                  {connected ? "● Trực tuyến" : "Đang kết nối..."}
                </span>
              </div>
            </div>

            <button
              onClick={toggleChat}
              className="text-[#b8929c] hover:text-[#e07a8d]
                         transition text-lg leading-none"
              aria-label="Đóng chat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 py-4 overflow-y-auto space-y-3 bg-[#fffdfc]">
          {messages.length === 0 && (
            <div className="mt-24 text-center">
              <div className="text-sm text-[#8f6b75]">
                Xin chào 👋 <br />
                Shop có thể hỗ trợ gì cho bạn?
              </div>
              <div className="text-xs text-[#c2a2ab] mt-2">
                Gợi ý: sinh nhật • khai trương • cưới • người yêu
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] px-4 py-2.5 text-sm leading-relaxed
                            border
                            ${
                              m.sender === "user"
                                ? "bg-[#e07a8d] text-white border-[#d96a7f] rounded-[18px] rounded-br-[6px]"
                                : "bg-[#fff4f7] text-[#5f4b51] border-[#f1cfd8] rounded-[18px] rounded-bl-[6px]"
                            }`}
                style={{ wordBreak: "break-word" }}
              >
                {m.sender !== "user" && (
                  <span className="mr-1">🌷</span>
                )}
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-4
                        bg-[#fffdfc]
                        border-t border-[#f1cfd8]">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && input.trim() && sendMessage()}
              placeholder={connected ? "Nhập tin nhắn..." : "Đang kết nối..."}
              className="flex-1
                         bg-white
                         border border-[#f1cfd8]
                         rounded-xl
                         px-4 py-2.5
                         text-sm text-[#5f4b51]
                         placeholder:text-[#b8929c]
                         focus:outline-none focus:ring-2 focus:ring-[#f0b7c4]"
            />

            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`px-4 py-2.5 rounded-xl
                          text-sm font-semibold tracking-wide
                          transition
                ${
                  input.trim()
                    ? "bg-[#e07a8d] text-white hover:brightness-95"
                    : "bg-[#f1cfd8] text-[#b8929c] cursor-not-allowed"
                }`}
            >
              Gửi
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2 text-[11px] text-[#b8929c]">
            <span>💡</span>
            <span>Nhập “sinh nhật”, “khai trương”, “cưới” để được tư vấn nhanh</span>
          </div>
        </div>
      </div>
    )}
  </>
);


};

export default ChatBox;
