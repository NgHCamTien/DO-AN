import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);

    try {
      // 1) LẤY SẢN PHẨM
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

      // 2) LẤY REVIEW
      const rvRes = await fetch(`${API_BASE}/api/reviews/${id}`);
      const rvJson = await rvRes.json();
      const rvList = rvJson.data || rvJson.reviews || [];
      setReviews(Array.isArray(rvList) ? rvList : []);

      // 3) LẤY SẢN PHẨM LIÊN QUAN
      const relRes = await fetch(`${API_BASE}/api/products/${id}/related`);
      const relJson = await relRes.json();
      const relList = relJson.data || relJson.products || [];
      setRelated(Array.isArray(relList) ? relList : []);
    } catch (err) {
      console.log("❌ Lỗi lấy sản phẩm:", err);
      setProduct(null);
      setReviews([]);
      setRelated([]);
    }

    setLoading(false);
  };

  // GỬI ĐÁNH GIÁ
  const submitReview = async ({ rating, comment }) => {
    if (!user) {
      alert("Bạn cần đăng nhập để đánh giá sản phẩm.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/api/reviews/${product._id}`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      alert("Cảm ơn bạn đã đánh giá ❤️");
      fetchProduct();
    } catch (err) {
      console.error("❌ Lỗi gửi đánh giá:", err);
      alert(
        err.response?.data?.message ||
          "Không gửi được đánh giá, vui lòng thử lại."
      );
    }
  };
  
const refreshReviews = () => fetchProduct();

  // CART
  const addToCart = () => {
    if (!product) return;

    const item = {
      _id: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images?.[0] || "",
      qty,
    };

    let cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const exist = cart.find((x) => x._id === item._id);
    if (exist) exist.qty += qty;
    else cart.push(item);

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Đã thêm vào giỏ hàng!");
  };

  const buyNow = () => {
    addToCart();
    navigate("/cart");
  };

  // LOADING
  if (loading) {
    return (
      <>
        <Header />
        <Navbar />
        <div className="text-center text-pink-600 mt-20 text-xl">
          Đang tải sản phẩm...
        </div>
      </>
    );
  }

  // KHÔNG TÌM THẤY
  if (!product) {
    return (
      <>
        <Header />
        <Navbar />
        <div className="text-center text-red-600 mt-20 text-xl">
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
          {/* Ảnh + Info */}
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
              addToCart={addToCart}
              buyNow={buyNow}
            />
          </div>

          {/* Tabs: Mô tả + Đánh giá */}
          <ProductTabs
           activeTab={activeTab}
          setActiveTab={setActiveTab}
          product={product}
          reviews={reviews}
          user={user}
          onSubmitReview={submitReview}
          onAdminReply={refreshReviews}
          />

          <ProductSpecs product={product} />
          <ShareButtons product={product} />
          <RelatedProducts related={related} navigate={navigate} />
        </div>
      </div>

      <StickyCartBar
        product={product}
        qty={qty}
        addToCart={addToCart}
        buyNow={buyNow}
      />

      <Footer />
    </>
  );
};

export default ProductDetail;
