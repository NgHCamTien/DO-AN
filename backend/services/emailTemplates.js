const getHolidayEmail = (userName, event) => {
  const events = {
    "valentine": {
      subject: "💖 Ưu đãi Valentine dành riêng cho bạn!",
      discount: "20%",
      code: "LOVE20",
      banner: "https://images.unsplash.com/photo-1518199266791-5375a83190b7"
    },
    "8-3": {
      subject: "🌸 Happy Women's Day - Tặng bạn ưu đãi đặc biệt!",
      discount: "25%",
      code: "WOMEN25",
      banner: "https://images.unsplash.com/photo-1485286124563-d9c4f74e8a38"
    },
    "tet": {
      subject: "🎊 Xuân gõ cửa – Nhận lì xì ưu đãi ngay!",
      discount: "30%",
      code: "SPRING30",
      banner: "https://images.unsplash.com/photo-1549890762-5a1a75c85a09"
    },
    "noel": {
      subject: "🎄 Noel an lành – Giảm giá tưng bừng",
      discount: "15%",
      code: "NOEL15",
      banner: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b"
    }
  };

  const ev = events[event];
  if (!ev) throw new Error("Event not supported");

  return {
    subject: ev.subject,
    html: `
      <h2>Xin chào ${userName} 🎁</h2>
      <p>DDT Flower Shop dành tặng bạn ưu đãi <b>${ev.discount}</b>!</p>
      <h3>Mã giảm giá: <strong>${ev.code}</strong></h3>
      <img src="${ev.banner}" style="width:100%; border-radius:10px; margin-top:10px"/>
      <p>🎀 Chúc bạn một mùa lễ thật hạnh phúc!</p>
    `
  };
};

module.exports = { getHolidayEmail };
