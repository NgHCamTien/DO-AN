import React, { useRef } from "react";

const API_BASE = "http://localhost:5000";

const ProductImages = ({ product, selectedImage, setSelectedImage }) => {
  const containerRef = useRef(null);

  const scrollLeft = () => {
    containerRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    containerRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  if (!product?.images || product.images.length === 0) return null;

  return (
    <div className="w-full">
      {/* ảnh lớn */}
      <div className="rounded-3xl overflow-hidden border border-pink-200 bg-pink-50 shadow-md">
        <img
          src={API_BASE + selectedImage}
          className="w-full h-[330px] object-cover"
          alt=""
        />
      </div>

      {/* thumbnails + scroll */}
      <div className="relative mt-4">
        
        {/* Nút trái */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 hover:bg-pink-50"
        >
          ◀
        </button>

        {/* dải thumbnail */}
        <div
          ref={containerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-10"
        >
          {product.images.map((img, i) => (
            <img
              key={i}
              src={API_BASE + img}
              onClick={() => setSelectedImage(img)}
              className={`w-20 h-20 rounded-xl object-cover cursor-pointer transition-all ${
                selectedImage === img
                  ? "border-4 border-pink-500"
                  : "border border-pink-200"
              }`}
              alt=""
            />
          ))}
        </div>

        {/* Nút phải */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 hover:bg-pink-50"
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default ProductImages;
