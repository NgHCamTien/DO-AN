import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Select from "react-select";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AddProduct = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext || {});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [generatedSku, setGeneratedSku] = useState("");

  // 🆔 Lấy SKU preview từ backend
  useEffect(() => {
    const fetchSku = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products/generate-sku`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setGeneratedSku(res.data.sku || "");
      } catch (err) {
        console.error("❌ Không lấy được SKU preview:", err);
        setGeneratedSku("");
      }
    };

    if (user?.token) fetchSku();
  }, [user?.token]);

  // State sản phẩm
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [flowerTypes, setFlowerTypes] = useState([]);
  const [season, setSeason] = useState("Quanh năm");
  const [occasion, setOccasion] = useState("other");

  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [discountStartDate, setDiscountStartDate] = useState("");
  const [discountEndDate, setDiscountEndDate] = useState("");

  const [stock, setStock] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);

  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState([]);

  // Ảnh
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 🧮 Tính % giảm
  const calculateDiscountPercent = () => {
    const p = Number(price);
    const d = Number(discountPrice);
    if (!p || !d || d <= 0 || d >= p) return 0;
    const percent = ((p - d) / p) * 100;
    return Math.min(Math.round(percent), 99);
  };
  const discountPercent = calculateDiscountPercent();

  // 🟢 Lấy danh mục
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categories`);
        const cats = Array.isArray(res.data)
          ? res.data
          : res.data.categories || [];
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0]._id || cats[0].id || "");
        }
      } catch (err) {
        console.error("Load categories error", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();
  }, []);

  // 🟢 Tạo preview ảnh
  useEffect(() => {
    if (!files.length) return setPreviews([]);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  // 🟢 Xử lý tags từ chuỗi nhập
  useEffect(() => {
    const arr = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    setTags(arr);
  }, [tagsInput]);

  // 🟢 Chọn ảnh
  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length + files.length > 5) {
      alert("Tối đa 5 ảnh thôi nhé 🌸");
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
  };

  const removePreviewAt = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const getToken = () => {
    try {
      return user?.token || JSON.parse(localStorage.getItem("userInfo"))?.token;
    } catch {
      return null;
    }
  };

  // 🟢 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

  if (!name || !categoryId || !price || !description) {
  setError("Vui lòng điền đầy đủ các trường có dấu *");
  return;
}


    const p = Number(price);
    const d = Number(discountPrice);
    if (d && d >= p) {
      setError("Giá khuyến mãi phải nhỏ hơn giá gốc");
      return;
    }

    if (
      discountStartDate &&
      discountEndDate &&
      discountEndDate < discountStartDate
    ) {
      setError("Ngày kết thúc khuyến mãi phải sau ngày bắt đầu");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("Bạn chưa đăng nhập hoặc phiên đã hết hạn. Vui lòng đăng nhập lại.");
      if (logout) logout();
      return;
    }

    try {
      setSubmitting(true);

      // 1. Upload ảnh (nếu có)
      let imageUrls = [];
      if (files.length > 0) {
        const imgForm = new FormData();
        files.forEach((f) => imgForm.append("images", f));
        const uploadRes = await axios.post(
          `${API_URL}/api/upload`,
          imgForm,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        imageUrls = uploadRes.data.urls || uploadRes.data.paths || [];
      }

      // 2. Gửi dữ liệu sản phẩm
      const productData = {
        name,
        shortDescription,
        description,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        discountStartDate: discountStartDate || undefined,
        discountEndDate: discountEndDate || undefined,
        categoryId,
        flowerTypes,
        season,
        stock: Number(stock),
        isFeatured,
        tags,
        occasion,
        images: imageUrls,
      };


      const res = await axios.post(`${API_URL}/api/products`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 👉 LẤY SKU TỪ BACKEND
      setGeneratedSku(res.data.data.sku);

      alert("🌸 Thêm sản phẩm thành công!");

    } catch (err) {
      console.error("Upload hoặc thêm sản phẩm lỗi:", err);
      setError(
        err?.response?.data?.message || "Có lỗi xảy ra khi thêm sản phẩm"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          🌸 Thêm Sản Phẩm Mới
        </h2>

        {error && (
          <div className="mb-4 text-red-600 bg-red-100 border border-red-300 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mã & Tên sản phẩm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Mã sản phẩm</label>
            <input
              value={generatedSku || "Đang tạo mã..."}
              disabled
              className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 cursor-not-allowed text-gray-700"
            />
          </div>



            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Tên sản phẩm *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-400 focus:ring focus:ring-pink-100 outline-none transition"
              />
            </div>
          </div>

          {/* Mô tả ngắn */}
          {/* <div>
            <label className="block font-medium text-gray-700 mb-1">
              Mô tả ngắn
            </label>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows="3"
              placeholder="Mô tả ngắn gọn về sản phẩm..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-400 focus:ring focus:ring-pink-100 outline-none transition"
            />
          </div> */}

          {/* Danh mục + Giá */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Danh mục *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring focus:ring-blue-100 outline-none transition"
              >
                {loadingCategories ? (
                  <option>Đang tải...</option>
                ) : (
                  categories.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Giá gốc *
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-green-400 focus:ring focus:ring-green-100 outline-none transition"
              />
            </div>
          </div>

          {/* Tồn kho */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Tồn kho *
            </label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Nhập số lượng tồn"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-purple-400 focus:ring focus:ring-purple-100 outline-none transition"
            />
          </div>

          {/* Loại hoa */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Loại hoa
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  isMulti
                  value={flowerTypes.map((f) => ({
                    value: f,
                    label: f,
                  }))}
                  onChange={(selected) =>
                    setFlowerTypes(selected.map((s) => s.value))
                  }
                  options={[
                    { value: "Hoa hồng", label: "Hoa hồng" },
                    { value: "Hoa tulip", label: "Hoa tulip" },
                    { value: "Hoa baby", label: "Hoa baby" },
                    { value: "Hoa hướng dương", label: "Hoa hướng dương" },
                    { value: "Hoa lan", label: "Hoa lan" },
                    { value: "Hoa cúc", label: "Hoa cúc" },
                  ]}
                  placeholder="Chọn hoặc nhập thêm..."
                  className="text-sm"
                />
              </div>

              <input
                type="text"
                placeholder="+ Thêm loại mới"
                className="border border-gray-300 rounded-lg px-2 py-1 w-40 text-sm focus:border-pink-400 focus:ring focus:ring-pink-100 outline-none transition"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    e.preventDefault();
                    const newFlower = e.target.value.trim();
                    if (!flowerTypes.includes(newFlower)) {
                      setFlowerTypes([...flowerTypes, newFlower]);
                    }
                    e.target.value = "";
                  }
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              🌺 Chọn hoặc nhập loại hoa mới rồi nhấn Enter
            </p>
          </div>

          {/* Mùa hoa */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Mùa hoa
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-400 focus:ring focus:ring-pink-100 outline-none transition"
            >
              <option value="Quanh năm">Quanh năm</option>
              <option value="Xuân">Xuân</option>
              <option value="Hạ">Hạ</option>
              <option value="Thu">Thu</option>
              <option value="Đông">Đông</option>
            </select>
          </div>

          {/* Dịp tặng */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Dịp tặng
            </label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-400 focus:ring focus:ring-pink-100 outline-none transition"
            >
              <option value="birthday">Sinh nhật</option>
              <option value="graduation">Tốt nghiệp</option>
              <option value="opening">Khai trương</option>
              <option value="anniversary">Kỷ niệm</option>
              <option value="love">Tình yêu</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Nhập tag, ví dụ: sinh nhật, tình yêu, khai trương..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-400 focus:ring focus:ring-pink-100 outline-none transition"
            />

            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm shadow"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() =>
                      setTags(tags.filter((_, idx) => idx !== i))
                    }
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <p className="text-sm text-gray-500 mt-1">
              Gợi ý: nhập nhiều tag bằng dấu phẩy. Ví dụ:{" "}
              <i>lãng mạn, sinh nhật, tốt nghiệp</i>
            </p>
          </div>

          {/* Giá khuyến mãi + thời gian */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Giá khuyến mãi
              </label>
              <input
                type="number"
                min="0"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-green-400 focus:ring focus:ring-green-100 outline-none transition"
              />
              {discountPercent > 0 && (
                <p
                  className={`text-sm mt-1 ${
                    discountPercent > 70
                      ? "text-red-600 font-semibold"
                      : discountPercent > 40
                      ? "text-orange-500"
                      : "text-green-600"
                  }`}
                >
                  Giảm khoảng{" "}
                  <span className="font-semibold">
                    {discountPercent}%
                  </span>{" "}
                  so với giá gốc
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">
                  Bắt đầu KM
                </label>
                <input
                  type="date"
                  value={discountStartDate}
                  onChange={(e) => setDiscountStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-400 focus:ring focus:ring-pink-100 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Kết thúc KM
                </label>
                <input
                  type="date"
                  value={discountEndDate}
                  onChange={(e) => setDiscountEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-400 focus:ring focus:ring-pink-100 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Mô tả đầy đủ */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Mô tả *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-400 focus:ring focus:ring-pink-100 outline-none transition"
            />
          </div>

          {/* Ảnh */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Hình ảnh (tối đa 5 ảnh)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              className="block w-full border border-gray-200 rounded-lg p-2 bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
            />
            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {previews.map((p, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={p}
                      alt=""
                      className="w-28 h-28 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removePreviewAt(i)}
                      className="absolute top-1 right-1 bg-white/80 hover:bg-red-500 hover:text-white text-red-500 rounded-full p-1 shadow transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sản phẩm nổi bật */}
          <div className="flex items-center gap-3">
            <input
              id="featured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 accent-pink-500"
            />
            <label htmlFor="featured" className="text-gray-700">
              Sản phẩm nổi bật
            </label>
          </div>

          {/* Nút */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 shadow transition"
            >
              {submitting ? "Đang lưu..." : "Thêm sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
