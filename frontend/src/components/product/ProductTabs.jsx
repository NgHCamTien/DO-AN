import React from "react";
import ProductReviews from "./ProductReviews";

const ProductTabs = ({
  activeTab,
  setActiveTab,
  product,
  reviews,
  user,
  onSubmitReview,
  onAdminReply,
}) => {
  return (
    <div className="mt-10 bg-white rounded-3xl shadow-md p-6">

      {/* Tabs header */}
      <div className="flex gap-6 border-b border-gray-200 mb-4">
        <button
          className={`pb-2 text-sm md:text-base ${
            activeTab === "description"
              ? "border-b-2 border-pink-500 text-pink-600 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("description")}
        >
          Mô tả sản phẩm
        </button>

        <button
          className={`pb-2 text-sm md:text-base ${
            activeTab === "reviews"
              ? "border-b-2 border-pink-500 text-pink-600 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("reviews")}
        >
          Đánh giá ({reviews?.length || 0})
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-2 text-sm md:text-[15px] text-gray-700 leading-relaxed">

        {/* TAB MÔ TẢ */}
        {activeTab === "description" && (
          <div>
            {product?.description ? (
              <p className="whitespace-pre-line">{product.description}</p>
            ) : (
              <p className="text-gray-400">Sản phẩm chưa có mô tả chi tiết.</p>
            )}
          </div>
        )}

        {/* TAB ĐÁNH GIÁ */}
        {activeTab === "reviews" && (
          <ProductReviews
            reviews={reviews || []}
            user={user}
            onSubmitReview={onSubmitReview}
            onAdminReply={onAdminReply}
          />
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
