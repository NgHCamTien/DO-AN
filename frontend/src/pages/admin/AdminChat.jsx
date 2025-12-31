import {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import socket from "../../socket";
import { AuthContext } from "../../context/AuthContext";

const AdminChat = () => {
  const { user } = useContext(AuthContext);
  const token = user?.token;

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const selectedRef = useRef(null);

  const menuRef = useRef(null);

  // =====================
  // LOAD CONVERSATIONS
  // =====================
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get("/api/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // thêm unread mặc định
      const withUnread = (res.data || []).map((c) => ({
        ...c,
        unread: c.unread || 0,
      }));

      setConversations(withUnread);
    } catch (err) {
      console.error("❌ fetchConversations:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // =====================
  // OPEN CONVERSATION
  // =====================
  const openConversation = async (conversation) => {
    setSelectedConversation(conversation);
    selectedRef.current = conversation;

    // reset unread
    setConversations((prev) =>
      prev.map((c) =>
        c._id === conversation._id ? { ...c, unread: 0 } : c
      )
    );

    try {
      const res = await axios.get(
        `/api/chat/messages/${conversation._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(res.data || []);
    } catch (err) {
      console.error("❌ load messages:", err);
    }
  };

  // =====================
  // SOCKET
  // =====================
  useEffect(() => {
    if (!user?._id) return;

    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      socket.emit("register_client", {
        role: "admin",
        userId: user._id,
      });
    });

    const onMessage = (msg) => {
      // update conversation list + unread
      setConversations((prev) => {
        const exists = prev.find(
          (c) => c._id === msg.conversationId
        );

        if (exists) {
          return prev.map((c) =>
            c._id === msg.conversationId
              ? {
                  ...c,
                  lastMessage: msg.text,
                  unread:
                    selectedRef.current?._id === c._id
                      ? 0
                      : (c.unread || 0) + 1,
                }
              : c
          );
        }

        return [
          {
            _id: msg.conversationId,
            user: msg.user || { name: "Khách" },
            lastMessage: msg.text,
            unread: 1,
          },
          ...prev,
        ];
      });

      // append message nếu đang mở đúng hội thoại
      if (
        selectedRef.current &&
        selectedRef.current._id === msg.conversationId
      ) {
        setMessages((prev) => [
          ...prev,
          {
            sender: msg.sender,
            text: msg.text,
            time: msg.time,
            isBot: msg.isBot || false,
          },
        ]);
      }
    };

    socket.on("message_to_admin", onMessage);

    return () => {
      socket.off("message_to_admin", onMessage);
    };
  }, [user]);

  // =====================
  // SEND MESSAGE
  // =====================
  const sendMessage = () => {
    if (!input.trim() || !selectedRef.current) return;

    socket.emit("admin_send_message", {
      conversationId: selectedRef.current._id,
      text: input,
    });

    setInput("");
  };

// =====================
    useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =====================
  // DELETE + CLEAR
  // =====================
 const handleDeleteConversation = (id) => {
  if (!window.confirm("Xóa hội thoại này?")) return;
  setConversations(prev => prev.filter(c => c._id !== id));
  if (selectedConversation?._id === id) {
    setSelectedConversation(null);
    setMessages([]);
  }
};

const markConversationRead = (id) => {
  setConversations(prev =>
    prev.map(c =>
      c._id === id ? { ...c, unread: 0 } : c
    )
  );
};

const togglePinConversation = (id) => {
  setConversations(prev =>
    prev.map(c =>
      c._id === id ? { ...c, pinned: !c.pinned } : c
    )
  );
};

const toggleBotConversation = (id) => {
  alert("Tạm thời chỉ demo UI 😄");
};


  const handleClearAll = () => {
    if (
      !window.confirm(
        "Xóa TẤT CẢ hội thoại?\nChỉ áp dụng trên giao diện."
      )
    )
      return;

    setConversations([]);
    setSelectedConversation(null);
    selectedRef.current = null;
    setMessages([]);
  };

  // =====================
  // UI
  // =====================
  return (
    <div className="h-full bg-stone-50 rounded-xl border border-stone-200 overflow-hidden">
      <div className="grid grid-cols-[320px_1fr] h-full">

        {/* LEFT */}
        <div className="flex flex-col bg-white border-r border-stone-200">
          <div className="h-16 px-4 flex items-center justify-between border-b border-stone-200">
            <div className="flex items-center gap-2 font-semibold">
              💬 <span>Hội thoại</span>
            </div>

            {conversations.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-stone-400 hover:text-red-500 border px-2 py-1 rounded"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
      <div
  key={c._id}
  className={`relative px-4 py-3 pr-16 border-b border-stone-100 transition
    ${
      selectedConversation?._id === c._id
        ? "bg-stone-100"
        : "hover:bg-stone-50"
    }`}
>
  {/* CLICK MỞ HỘI THOẠI */}
  <div
    onClick={() => openConversation(c)}
    className="cursor-pointer"
  >
    <div className="flex items-center gap-2">
      🌸
      <span className="font-medium text-stone-800">
        {c.user?.name || "Khách"}
      </span>

      {c.unread > 0 && (
        <span className="ml-auto text-xs bg-rose-400 text-white px-2 py-0.5 rounded-full">
          {c.unread}
        </span>
      )}
    </div>

    <div className="text-sm text-stone-500 truncate mt-1">
      {c.lastMessage}
    </div>
  </div>

  {/* NÚT ... (LUÔN HIỆN) */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      setMenuOpenId(menuOpenId === c._id ? null : c._id);
    }}
    className="absolute right-3 top-1/2 -translate-y-1/2
               text-stone-400 hover:text-stone-700 transition"
  >
    ⋯
  </button>

  {/* MENU */}
  {menuOpenId === c._id && (
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      className="absolute right-10 top-1/2 -translate-y-1/2
                 z-50 w-44 bg-white border border-stone-200
                 rounded-xl shadow-xl text-sm overflow-hidden"
    >
      <button
        onClick={() => {
          handleDeleteConversation(c._id);
          setMenuOpenId(null);
        }}
        className="w-full px-4 py-2 text-left hover:bg-stone-50 text-red-500"
      >
      Xóa 
      </button>

      {/* <button
        onClick={() => {
          markConversationRead(c._id);
          setMenuOpenId(null);
        }}
        className="w-full px-4 py-2 text-left hover:bg-stone-50"
      >
        ✔️ Đánh dấu đã đọc
      </button> */}

      <button
        onClick={() => {
          togglePinConversation(c._id);
          setMenuOpenId(null);
        }}
        className="w-full px-4 py-2 text-left hover:bg-stone-50"
      >
       Ghim 
      </button>

      {/* <button
        onClick={() => {
          toggleBotConversation(c._id);
          setMenuOpenId(null);
        }}
        className="w-full px-4 py-2 text-left hover:bg-stone-50"
      >
        🤖 Tắt bot
      </button> */}
    </div>
  )}
</div>



            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col bg-stone-50">
          {!selectedConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-400">
              <div className="text-4xl mb-2">💬</div>
              <div>Chọn hội thoại để bắt đầu</div>
            </div>
          ) : (
            <>
              <div className="h-16 px-5 flex items-center gap-3 border-b bg-white">
                🌸
                <div>
                  <div className="font-semibold">
                    {selectedConversation.user?.name || "Khách"}
                  </div>
                  <div className="text-xs text-stone-500">
                    Đang trò chuyện
                  </div>
                </div>
              </div>

              <div className="flex-1 p-5 overflow-y-auto space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      m.sender === "admin"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm
                        ${
                          m.sender === "admin"
                            ? m.isBot
                              ? "bg-stone-200 italic"
                              : "bg-rose-400 text-white"
                            : "bg-white border"
                        }`}
                    >
                      {m.isBot && "🤖 "}
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 bg-white border-t flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && sendMessage()
                  }
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="Nhập tin nhắn..."
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className={`px-4 rounded-lg text-sm
                    ${
                      input.trim()
                        ? "bg-rose-400 text-white"
                        : "bg-stone-200 text-stone-400"
                    }`}
                >
                  Gửi
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
