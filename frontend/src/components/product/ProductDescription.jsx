import React from "react";

const ProductDescription = ({ description }) => {
  return (
    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
      {description}
    </p>
  );
};

export default ProductDescription;
