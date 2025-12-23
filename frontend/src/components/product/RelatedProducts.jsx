import React, { useRef } from "react";

const API_BASE = "http://localhost:5000";

const RelatedProducts = ({ related, navigate }) => {
  // ❗ Hook phải luôn ở đây (trên cùng)
  const scrollRef = useRef(null);

  // Nếu không có sản phẩm thì return sau khi hooks đã được định nghĩa
  if (!related || related.length === 0) return null;

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -350, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 350, behavior: "smooth" });
  };

  return (
    <div className="mt-16">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#4b2c35]">
          Gợi ý dành cho bạn
        </h2>

        <div className="flex gap-3">
          <button
            onClick={scrollLeft}
            className="bg-white shadow p-2 rounded-full hover:bg-pink-50"
          >
            ◀
          </button>

          <button
            onClick={scrollRight}
            className="bg-white shadow p-2 rounded-full hover:bg-pink-50"
          >
            ▶
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
      >
        {related.map((p) => (
          <div
            key={p._id}
            onClick={() => navigate(`/product/${p._id}`)}
            className="min-w-[220px] bg-white hover:bg-[#fdf4f8] rounded-2xl shadow-md cursor-pointer
                       transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <img
              src={API_BASE + p.images[0]}
              alt={p.name}
              className="h-40 w-full object-cover rounded-t-2xl"
            />

            <div className="p-3">
              <p className="font-semibold text-[#4b2c35] line-clamp-1">
                {p.name}
              </p>

              <p className="text-pink-600 font-bold mt-1">
                {(p.discountPrice || p.price).toLocaleString()}₫
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
