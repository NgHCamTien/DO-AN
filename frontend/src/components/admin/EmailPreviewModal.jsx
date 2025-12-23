const EmailPreviewModal = ({ template, onClose }) => {
  if (!template) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[600px] max-h-[80vh] overflow-auto rounded-lg shadow-xl p-5">
        <h3 className="text-xl font-semibold mb-4">📄 Preview Email</h3>

        <iframe
          src={`http://localhost:5000/api/email/preview?template=${template}`}
          className="w-full h-[70vh] border rounded"
        />

        <button
          onClick={onClose}
          className="mt-4 py-2 px-6 bg-gray-300 rounded-lg"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default EmailPreviewModal;
