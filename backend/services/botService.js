// services/botService.js

const AUTO_REPLY_TEMPLATES = {
  greeting: [
    "🌸 DDT Flower xin chào bạn! Shop có thể hỗ trợ gì cho bạn hôm nay ạ?",
    "💐 Chào bạn! Bạn đang tìm hoa cho dịp nào để shop tư vấn nhé?",
  ],
  birthday: [
    "🎂 Shop có nhiều mẫu hoa sinh nhật rất xinh. Bạn muốn tặng nam hay nữ ạ?",
    "🎉 Hoa sinh nhật bên shop có nhiều mức giá. Bạn dự kiến tầm bao nhiêu để shop gợi ý ạ?",
  ],
  love: [
    "❤️ Hoa tặng người yêu thường chọn tone hồng hoặc đỏ. Bạn thích phong cách nào ạ?",
    "💝 Shop có hoa bó, hoa hộp và hoa nhập khẩu cho dịp lãng mạn. Bạn muốn loại nào ạ?",
  ],
  wedding: [
    "💍 Shop nhận hoa cưới, hoa cầm tay cô dâu và trang trí tiệc. Bạn cần tư vấn phần nào ạ?",
  ],
  opening: [
    "🏵️ Hoa khai trương thường chọn tone vàng – đỏ tượng trưng cho may mắn. Bạn muốn bó hoa hay kệ hoa ạ?",
  ],
  price: [
    "💰 Shop có hoa từ 300.000đ đến 2.000.000đ. Bạn cho shop biết mức giá mong muốn nhé!",
  ],
  fallback: [
    "🌷 Bạn có thể cho shop biết rõ hơn nhu cầu để được tư vấn chính xác ạ?",
    "📞 Nhân viên CSKH sẽ hỗ trợ bạn ngay nhé!",
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// =====================
// BOT CORE (PURE FUNCTION)
// =====================
function getBotReply({ botStep = 0, botActive = true }, userText) {
  if (!botActive) return null;

  const text = userText.toLowerCase();

  // 🔒 tối đa 2 lần
  if (botStep >= 2) {
    return {
      reply: "📞 Nhân viên CSKH sẽ hỗ trợ bạn ngay ạ!",
      nextStep: botStep + 1,
      botActive: false,
    };
  }

  let reply = null;

  if (text.includes("chào") || text.includes("hi") || text.includes("hello")) {
    reply = pickRandom(AUTO_REPLY_TEMPLATES.greeting);
  } else if (text.includes("sinh nhật")) {
    reply = pickRandom(AUTO_REPLY_TEMPLATES.birthday);
  } else if (
    text.includes("người yêu") ||
    text.includes("bạn gái") ||
    text.includes("vợ")
  ) {
    reply = pickRandom(AUTO_REPLY_TEMPLATES.love);
  } else if (text.includes("cưới")) {
    reply = pickRandom(AUTO_REPLY_TEMPLATES.wedding);
  } else if (text.includes("khai trương")) {
    reply = pickRandom(AUTO_REPLY_TEMPLATES.opening);
  } else if (text.includes("giá") || text.includes("bao nhiêu")) {
    reply = pickRandom(AUTO_REPLY_TEMPLATES.price);
  } else {
    reply = pickRandom(AUTO_REPLY_TEMPLATES.fallback);
  }

  return {
    reply,
    nextStep: botStep + 1,
    botActive: true,
  };
}

module.exports = { getBotReply };
