import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

import Header from "../components/common/Header";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

import ProductImages from "../components/product/ProductImages";
import ProductInfo from "../components/product/ProductInfo";
import ProductTabs from "../components/product/ProductTabs";
import RelatedProducts from "../components/product/RelatedProducts";
import ProductSpecs from "../components/product/ProductSpecs";
import ShareButtons from "../components/product/ShareButtons";
import StickyCartBar from "../components/product/StickyCartBar";

const API_BASE = "http://localhost:5000";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();

  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      // 1️⃣ LẤY SẢN PHẨM
      const res = await fetch(`${API_BASE}/api/products/${id}`);
      const data = await res.json();

      const p =
        data.product ||
        data.data ||
        data.item ||
        (data.success ? data.product : null);

      if (p) {
        setProduct(p);
        setSelectedImage(p.images?.[0] || "");
      } else {
        setProduct(null);
      }

      // 2️⃣ REVIEW
      const rvRes = await fetch(`${API_BASE}/api/reviews/${id}`);
      const rvJson = await rvRes.json();
      setReviews(Array.isArray(rvJson.data) ? rvJson.data : []);

      // 3️⃣ SẢN PHẨM LIÊN QUAN
      const relRes = await fetch(`${API_BASE}/api/products/${id}/related`);
      const relJson = await relRes.json();
      setRelated(Array.isArray(relJson.data) ? relJson.data : []);
    } catch (err) {
      console.error("❌ Lỗi lấy sản phẩm:", err);
      setProduct(null);
    }
    setLoading(false);
  };

  // =========================
  // ADD TO CART (ĐÚNG CHUẨN)
  // =========================
  const addToCartHandler = () => {
    if (!product) return;

    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images?.[0],
      images: product.images,
      quantity: qty,
    });

    alert("Đã thêm vào giỏ hàng!");
  };

  const buyNow = () => {
    addToCartHandler();
    navigate("/cart");
  };

  // =========================
  // REVIEW
  // =========================
  const submitReview = async ({ rating, comment }) => {
    if (!user) {
      alert("Bạn cần đăng nhập để đánh giá.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/api/reviews/${product._id}`,
        { rating, comment },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      alert("Cảm ơn bạn đã đánh giá ❤️");
      fetchProduct();
    } catch (err) {
      alert("Không gửi được đánh giá.");
    }
  };

  // =========================
  // UI STATES
  // =========================
  if (loading) {
    return (
      <>
        <Header />
        <Navbar />
        <div className="text-center mt-20 text-pink-600 text-xl">
          Đang tải sản phẩm...
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <Navbar />
        <div className="text-center mt-20 text-red-600 text-xl">
          Sản phẩm không tồn tại!
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Navbar />

      <div className="min-h-screen bg-white py-12">
        <div className="max-w-[1180px] mx-auto px-4">
          {/* ẢNH + THÔNG TIN */}
          <div className="bg-[#fff6f8] rounded-3xl shadow-xl p-8 grid grid-cols-1 md:grid-cols-[58%_42%] gap-10">
            <ProductImages
              product={product}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
            />

            <ProductInfo
              product={product}
              qty={qty}
              setQty={setQty}
              addToCart={addToCartHandler}
              buyNow={buyNow}
            />
          </div>

          <ProductTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            product={product}
            reviews={reviews}
            user={user}
            onSubmitReview={submitReview}
          />

          <ProductSpecs product={product} />
          <ShareButtons product={product} />
          <RelatedProducts related={related} navigate={navigate} />
        </div>
      </div>

      <StickyCartBar
        product={product}
        qty={qty}
        addToCart={addToCartHandler}
        buyNow={buyNow}
      />

      <Footer />
    </>
  );
};

export default ProductDetail;
