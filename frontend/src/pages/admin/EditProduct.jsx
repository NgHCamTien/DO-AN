import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Select from "react-select";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext || {});

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    shortDescription: "",
    description: "",
    flowerTypes: [],
    season: "Quanh năm",
    occasion: "other",
    categoryId: "",
    price: "",
    discountPrice: "",
    discountStartDate: "",
    discountEndDate: "",
    stock: 0,
    isFeatured: false,
    tagsInput: "",
    tags: [],
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);

  // 🧮 Tính phần trăm giảm
  const discountPercent =
    formData.price && formData.discountPrice
      ? Math.min(
          Math.round(
            ((Number(formData.price) - Number(formData.discountPrice)) /
              Number(formData.price)) *
              100
          ),
          99
        )
      : 0;

  const getToken = () => {
    try {
      return user?.token || JSON.parse(localStorage.getItem("userInfo"))?.token;
    } catch {
      return null;
    }
  };

  // 🟢 Load sản phẩm
  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products/${id}`);
      const p = res.data.product || res.data.data || res.data;

      setFormData({
        sku: p.sku || "",
        name: p.name || "",
        shortDescription: p.shortDescription || "",
        description: p.description || "",
        flowerTypes: p.flowerTypes || [],
        season: p.season || "Quanh năm",
        occasion: p.occasion || "other",
        categoryId: p.category?._id || p.categoryId || "",
        price: p.price || "",
        discountPrice: p.discountPrice || "",
        discountStartDate: p.discountStartDate
          ? p.discountStartDate.split("T")[0]
          : "",
        discountEndDate: p.discountEndDate
          ? p.discountEndDate.split("T")[0]
          : "",
        stock: p.stock || 0,
        isFeatured: p.isFeatured || false,
        tagsInput: (p.tags || []).join(", "),
        tags: p.tags || [],
      });

      setCurrentImages(p.images || []);
    } catch (err) {
      console.error("Load product error:", err);
      setError("Không thể tải dữ liệu sản phẩm.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 🟢 Load danh mục
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categories`);
        const cats = Array.isArray(res.data)
          ? res.data
          : res.data.categories || [];
        setCategories(cats);
      } catch (err) {
        console.error("Load categories error", err);
      }
    };
    fetchCats();
  }, []);

  // 🟢 Preview ảnh mới
  useEffect(() => {
    if (!files.length) return setPreviews([]);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  // 🟢 Đồng bộ tags theo tagsInput
  useEffect(() => {
    const arr = formData.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    setFormData((prev) => ({ ...prev, tags: arr }));
  }, [formData.tagsInput]);

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 5) {
      alert("Tối đa 5 ảnh thôi nhé 🌸");
      return;
    }
    setFiles(selected);
  };

  // Hàm xử lý input chung
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🟢 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

  const { name, price, categoryId, description } = formData;
  if (!name || !price || !categoryId || !description) {
    setError("Vui lòng điền đầy đủ các trường có dấu *");
    return;
  }


    if (
      formData.discountPrice &&
      Number(formData.discountPrice) >= Number(formData.price)
    ) {
      setError("Giá khuyến mãi phải nhỏ hơn giá gốc");
      return;
    }

    if (
      formData.discountStartDate &&
      formData.discountEndDate &&
      formData.discountEndDate < formData.discountStartDate
    ) {
      setError("Ngày kết thúc khuyến mãi phải sau ngày bắt đầu");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      if (logout) logout();
      return;
    }

    try {
      setLoading(true);

      // 1. Upload ảnh mới (nếu có)
      let imageUrls = currentImages;
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

      // 2. Gửi dữ liệu cập nhật
      const payload = {
      name: formData.name,
      shortDescription: formData.shortDescription,
      description: formData.description,
      price: Number(formData.price),
      discountPrice: formData.discountPrice
        ? Number(formData.discountPrice)
        : undefined,
      discountStartDate: formData.discountStartDate || undefined,
      discountEndDate: formData.discountEndDate || undefined,
      categoryId: formData.categoryId,
      flowerTypes: formData.flowerTypes,
      season: formData.season,
      stock: Number(formData.stock),
      isFeatured: formData.isFeatured,
      tags: formData.tags,
      occasion: formData.occasion,
      images: imageUrls,
};


      await axios.put(`${API_URL}/api/products/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("🌸 Cập nhật sản phẩm thành công!");
      navigate("/admin/products");
    } catch (err) {
      console.error("Update product error:", err);
      setError(
        err?.response?.data?.message || "Lỗi khi cập nhật sản phẩm."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          🌸 Cập Nhật Sản Phẩm
        </h2>

        {error && (
          <div className="mb-4 text-red-600 bg-red-100 border border-red-300 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mã & tên */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Mã sản phẩm
            </label>
            <input
              value={formData.sku}
              disabled
              className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 cursor-not-allowed text-gray-700"
            />
          </div>


            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Tên sản phẩm *
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
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
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-400 focus:ring focus:ring-pink-100 outline-none transition"
            />
          </div> */}

          {/* Loại hoa */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Loại hoa
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  isMulti
                  value={formData.flowerTypes.map((f) => ({
                    value: f,
                    label: f,
                  }))}
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      flowerTypes: selected.map((s) => s.value),
                    }))
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
                    if (!formData.flowerTypes.includes(newFlower)) {
                      setFormData((prev) => ({
                        ...prev,
                        flowerTypes: [...prev.flowerTypes, newFlower],
                      }));
                    }
                    e.target.value = "";
                  }
                }}
              />
            </div>
          </div>

          {/* Danh mục + Giá */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Danh mục *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:ring focus:ring-blue-100 outline-none transition"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Giá gốc *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
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
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-purple-400 focus:ring focus:ring-purple-100 outline-none transition"
            />
          </div>

          {/* Mùa hoa + Dịp tặng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Mùa hoa
              </label>
              <select
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-400 focus:ring focus:ring-pink-100 outline-none transition"
              >
                <option value="Quanh năm">Quanh năm</option>
                <option value="Xuân">Xuân</option>
                <option value="Hạ">Hạ</option>
                <option value="Thu">Thu</option>
                <option value="Đông">Đông</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Dịp tặng
              </label>
              <select
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
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
          </div>

          {/* Giá khuyến mãi & ngày */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Giá khuyến mãi
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-green-400 focus:ring focus:ring-green-100 outline-none transition"
              />
              {discountPercent > 0 && (
                <p className="text-sm mt-1 text-green-600">
                  Giảm khoảng{" "}
                  <span className="font-semibold">{discountPercent}%</span> so
                  với giá gốc
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
                  value={formData.discountStartDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discountStartDate: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-400 focus:ring focus:ring-pink-100 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Kết thúc KM
                </label>
                <input
                  type="date"
                  value={formData.discountEndDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discountEndDate: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-400 focus:ring focus:ring-pink-100 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Mô tả *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-400 focus:ring focus:ring-pink-100 outline-none transition"
            />
          </div>

          {/* Ảnh */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Hình ảnh (chọn mới để thay thế)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              className="block w-full border border-gray-200 rounded-lg p-2 bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
            />
            {/* Ảnh hiện tại */}
            {currentImages.length > 0 && files.length === 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {currentImages.map((img, i) => (
                  <img
                    key={i}
                    src={`${API_URL}${img}`}
                    alt=""
                    className="w-28 h-28 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                ))}
              </div>
            )}
            {/* Preview ảnh mới */}
            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {previews.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt=""
                    className="w-28 h-28 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tags + nổi bật */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                name="tagsInput"
                value={formData.tagsInput}
                onChange={handleChange}
                placeholder="hoa hồng, sinh nhật, dễ thương..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-400 focus:ring focus:ring-pink-100 outline-none transition"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm shadow"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          tags: prev.tags.filter((_, idx) => idx !== i),
                          tagsInput: prev.tags
                            .filter((_, idx) => idx !== i)
                            .join(", "),
                        }))
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="featured"
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 accent-pink-500"
              />
              <label htmlFor="featured" className="text-gray-700">
                Sản phẩm nổi bật
              </label>
            </div>
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
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 shadow transition"
            >
              {loading ? "Đang lưu..." : "Cập nhật sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
