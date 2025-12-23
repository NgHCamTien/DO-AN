import React from "react";

const ShareButtons = ({ product }) => {
  if (!product) return null;

  const url = window.location.href;
  const text = encodeURIComponent(`Xem sản phẩm này: ${product.name}`);

  // FACEBOOK
  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  // MESSENGER
  const shareMessenger = () => {
    window.open(
      `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
        url
      )}&app_id=123456789&redirect_uri=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  // ZALO (Official share link)
  const shareZalo = () => {
    window.open(
      `https://zalo.me/share?url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  // COPY LINK
  const copyLink = () => {
    navigator.clipboard.writeText(url);
    alert("Đã sao chép liên kết sản phẩm 💗");
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-3xl shadow-md">
      <h3 className="text-xl font-bold text-[#4b2c35] mb-4">
        Chia sẻ sản phẩm
      </h3>

      <div className="flex gap-4">
        {/* FACEBOOK */}
        <button
          onClick={shareFacebook}
          className="w-12 h-12 rounded-full bg-[#e8eaff] hover:bg-[#d9dcff] flex items-center justify-center shadow"
        >
          <img src="/icons/facebook.png" alt="fb" className="w-6 h-6" />
        </button>

        {/* MESSENGER */}
        <button
          onClick={shareMessenger}
          className="w-12 h-12 rounded-full bg-[#eaf3ff] hover:bg-[#d9e9ff] flex items-center justify-center shadow"
        >
          <img src="/icons/messenger.png" alt="mess" className="w-6 h-6" />
        </button>

        {/* ZALO */}
        <button
          onClick={shareZalo}
          className="w-12 h-12 rounded-full bg-[#e4f5ff] hover:bg-[#d2edff] flex items-center justify-center shadow"
        >
          <img src="/icons/zalo.png" alt="zalo" className="w-6 h-6" />
        </button>

        {/* COPY LINK */}
        <button
          onClick={copyLink}
          className="w-12 h-12 rounded-full bg-[#fde9f1] hover:bg-[#fcd8e7] flex items-center justify-center shadow"
        >
          <img src="/icons/link.png" alt="copy" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ShareButtons;
