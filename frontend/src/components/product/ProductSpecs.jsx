import React from "react";

const ProductSpecs = ({ product }) => {
  if (!product) return null;

  return (
    <div className="bg-white rounded-3xl shadow-md p-8 mt-10">
      <h2 className="text-2xl font-bold text-[#4b2c35] mb-5">Thông tin sản phẩm</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Loại hoa */}
        {product.flowerTypes?.length > 0 && (
          <div className="flex justify-between pb-3 border-b border-pink-100">
            <span className="text-gray-600">Loại hoa</span>
            <span className="font-semibold text-[#4b2c35]">
              {product.flowerTypes.join(", ")}
            </span>
          </div>
        )}

        {/* Mùa */}
        {product.season && (
          <div className="flex justify-between pb-3 border-b border-pink-100">
            <span className="text-gray-600">Mùa</span>
            <span className="font-semibold text-[#4b2c35]">
              {product.season}
            </span>
          </div>
        )}

        {/* Tồn kho */}
        <div className="flex justify-between pb-3 border-b border-pink-100">
          <span className="text-gray-600">Số lượng còn</span>
          <span className="font-semibold text-[#4b2c35]">
            {product.stock}
          </span>
        </div>

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="flex justify-between pb-3 border-b border-pink-100">
            <span className="text-gray-600">Tags</span>
            <span className="font-semibold text-[#4b2c35]">
              {product.tags.join(", ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSpecs;
