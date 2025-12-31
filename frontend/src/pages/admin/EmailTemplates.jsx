import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MOCK_TEMPLATES = [
  {
    id: 1,
    name: "Khuyến mãi cuối tuần",
    type: "Khuyến mãi",
    subject: "🌸 Ưu đãi cuối tuần tại DDT Flower Shop",
    description: "Email giới thiệu chương trình giảm giá cuối tuần",
    content: `
      <h2 style="color:#e06c7f">🌸 Ưu đãi cuối tuần</h2>
      <p>DDT Flower Shop gửi bạn chương trình <b>giảm giá 20%</b> cho toàn bộ hoa tươi.</p>
      <p>⏰ Áp dụng từ thứ 6 đến chủ nhật.</p>
      <p>💐 Cảm ơn bạn đã đồng hành cùng chúng tôi!</p>
    `,
  },
  {
    id: 2,
    name: "Thông báo đơn hàng",
    type: "Thông báo",
    subject: "📦 Đơn hàng của bạn đã được xác nhận",
    description: "Email thông báo trạng thái đơn hàng cho khách",
    content: `
      <h3>📦 Xác nhận đơn hàng</h3>
      <p>Đơn hàng của bạn đã được xác nhận thành công.</p>
      <p>Chúng tôi sẽ tiến hành giao hàng trong thời gian sớm nhất.</p>
    `,
  },
  {
    id: 3,
    name: "Chúc mừng sinh nhật",
    type: "Chăm sóc khách hàng",
    subject: "🎂 Chúc mừng sinh nhật từ DDT Flower Shop",
    description: "Email chúc mừng sinh nhật kèm ưu đãi",
    content: `
      <h2>🎂 Chúc mừng sinh nhật!</h2>
      <p>DDT Flower Shop chúc bạn một ngày sinh nhật thật vui vẻ.</p>
      <p>🎁 Tặng bạn mã giảm giá <b>HAPPY10</b>.</p>
    `,
  },
];

const EmailTemplates = () => {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "Khuyến mãi",
    subject: "",
    content: "",
  });

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#2c2c2c]">
          📑 Mẫu Email
        </h2>

        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#e06c7f] hover:bg-[#d85b70] text-white px-4 py-2 rounded-lg text-sm"
        >
          ➕ Tạo mẫu mới
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Quản lý các mẫu email để sử dụng nhanh cho chiến dịch marketing và thông báo khách hàng.
      </p>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Tên mẫu</th>
              <th className="p-3">Loại</th>
              <th className="p-3 text-left">Tiêu đề email</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {templates.map((tpl) => (
              <tr key={tpl.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{tpl.name}</td>
                <td className="p-3 text-center">
                  <span className="px-3 py-1 rounded-full text-xs bg-pink-100 text-pink-700">
                    {tpl.type}
                  </span>
                </td>
                <td className="p-3">{tpl.subject}</td>

                {/* ===== THAO TÁC ===== */}
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setSelected(tpl)}
                      className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      Xem
                    </button>

                    <button
                      onClick={() =>
                        navigate("/admin/email/send", {
                          state: {
                            subject: tpl.subject,
                            html: tpl.content,
                          },
                        })
                      }
                      className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200"
                    >
                      Dùng
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm("Bạn có chắc muốn xoá mẫu này không?")) {
                          setTemplates(
                            templates.filter((t) => t.id !== tpl.id)
                          );
                        }
                      }}
                      className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== MODAL TẠO MẪU ===== */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              ➕ Tạo mẫu email
            </h3>

            <div className="mb-3">
              <label className="block mb-1 font-medium">Tên mẫu</label>
              <input
                className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#e06c7f]"
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, name: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <label className="block mb-1 font-medium">Loại</label>
              <select
                className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#e06c7f]"
                value={newTemplate.type}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, type: e.target.value })
                }
              >
                <option>Khuyến mãi</option>
                <option>Thông báo</option>
                <option>Chăm sóc khách hàng</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block mb-1 font-medium">Tiêu đề email</label>
              <input
                className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#e06c7f]"
                value={newTemplate.subject}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, subject: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <label className="block mb-1 font-medium">
                Nội dung email (HTML)
              </label>
              <textarea
                rows={6}
                className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#e06c7f]"
                value={newTemplate.content}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, content: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                Huỷ
              </button>
              <button
                onClick={() => {
                  if (
                    !newTemplate.name ||
                    !newTemplate.subject ||
                    !newTemplate.content
                  ) {
                    alert("Vui lòng nhập đầy đủ thông tin");
                    return;
                  }

                  setTemplates([
                    {
                      ...newTemplate,
                      id: Date.now(),
                      description: "Mẫu email mới",
                    },
                    ...templates,
                  ]);

                  setNewTemplate({
                    name: "",
                    type: "Khuyến mãi",
                    subject: "",
                    content: "",
                  });

                  setShowCreate(false);
                }}
                className="px-4 py-2 bg-[#e06c7f] hover:bg-[#d85b70] text-white rounded-lg text-sm"
              >
                Lưu mẫu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL XEM TEMPLATE ===== */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">
              {selected.name}
            </h3>

            <p className="text-sm text-gray-500 mb-3">
              <b>Tiêu đề:</b> {selected.subject}
            </p>

            <div
              className="border rounded p-4 bg-gray-50 text-sm"
              dangerouslySetInnerHTML={{ __html: selected.content }}
            />

            <div className="mt-4 text-right">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;
