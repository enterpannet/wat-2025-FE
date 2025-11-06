import { useState, useEffect } from "react";
import api, { AxiosError } from "../../api";
import FinanceNavbar from "./FinanceNavbar";
import {
  FinanceTransaction,
  FinanceTransactionRequest,
  FinanceSummary,
} from "../../types";

const FinanceDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<FinanceTransaction | null>(null);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.category) params.append("category", filters.category);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);

      const response = await api.get<FinanceTransaction[]>(
        `/api/finance/transactions?${params.toString()}`
      );
      setTransactions(response.data);
      setError("");
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(
        (axiosError.response?.data as { error?: string })?.error || "ไม่สามารถดึงข้อมูลได้"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);

      const response = await api.get<FinanceSummary>(
        `/api/finance/summary?${params.toString()}`
      );
      setSummary(response.data);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
      return;
    }

    try {
      await api.delete(`/api/finance/transactions/${id}`);
      fetchTransactions();
      fetchSummary();
    } catch (err) {
      const axiosError = err as AxiosError;
      alert((axiosError.response?.data as { error?: string })?.error || "ไม่สามารถลบข้อมูลได้");
    }
  };

  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100">
      <FinanceNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            💰 ระบบรายรับรายจ่าย
          </h1>
          <p className="text-gray-600">จัดการรายรับและรายจ่ายทั้งหมด</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-sm font-medium opacity-90">รายรับทั้งหมด</div>
              <div className="text-3xl font-bold mt-2">
                {formatMoney(summary.summary.total_income)}
              </div>
              <div className="text-sm mt-2 opacity-75">
                {summary.summary.income_count} รายการ
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-sm font-medium opacity-90">รายจ่ายทั้งหมด</div>
              <div className="text-3xl font-bold mt-2">
                {formatMoney(summary.summary.total_expense)}
              </div>
              <div className="text-sm mt-2 opacity-75">
                {summary.summary.expense_count} รายการ
              </div>
            </div>
            <div
              className={`rounded-2xl p-6 text-white shadow-xl ${
                summary.summary.net_amount >= 0
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-gradient-to-br from-orange-500 to-orange-600"
              }`}
            >
              <div className="text-sm font-medium opacity-90">ยอดคงเหลือ</div>
              <div className="text-3xl font-bold mt-2">
                {formatMoney(summary.summary.net_amount)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-sm font-medium opacity-90">รายการทั้งหมด</div>
              <div className="text-3xl font-bold mt-2">
                {summary.summary.income_count + summary.summary.expense_count}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🔍 กรองข้อมูล</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ประเภท
              </label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">ทั้งหมด</option>
                <option value="income">รายรับ</option>
                <option value="expense">รายจ่าย</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมวดหมู่
              </label>
              <input
                type="text"
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                placeholder="กรอกหมวดหมู่"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  setFilters({ ...filters, start_date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) =>
                  setFilters({ ...filters, end_date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() =>
              setFilters({ type: "", category: "", start_date: "", end_date: "" })
            }
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ล้างตัวกรอง
          </button>
        </div>

        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingTransaction(null);
              setShowForm(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-900 transition-all shadow-lg hover:shadow-xl"
          >
            ➕ เพิ่มรายการใหม่
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Transactions Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">ยังไม่มีรายการ</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-600 to-green-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      วันที่
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      ประเภท
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      รายละเอียด
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      หมวดหมู่
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      รูปภาพ
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                      จำนวนเงิน
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            transaction.type === "income"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.type === "income" ? "รายรับ" : "รายจ่าย"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.category || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.image_urls && transaction.image_urls.length > 0 ? (
                          <div className="flex gap-2">
                            {transaction.image_urls.slice(0, 3).map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Transaction ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:scale-110 transition-transform border border-gray-200"
                                onClick={() => window.open(url, "_blank")}
                              />
                            ))}
                            {transaction.image_urls.length > 3 && (
                              <div
                                className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border border-gray-200"
                                onClick={() => {
                                  // Open all images in a modal or new window
                                  if (!transaction.image_urls) return;
                                  const imageWindow = window.open("", "_blank");
                                  if (imageWindow) {
                                    imageWindow.document.write(`
                                      <html>
                                        <head><title>ภาพทั้งหมด (${transaction.image_urls.length})</title></head>
                                        <body style="margin:0;padding:20px;background:#f0f0f0;">
                                          <h2>ภาพทั้งหมด (${transaction.image_urls.length} ภาพ)</h2>
                                          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
                                            ${transaction.image_urls.map((url) => `<img src="${url}" style="width:100%;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);" />`).join("")}
                                          </div>
                                        </body>
                                      </html>
                                    `);
                                  }
                                }}
                              >
                                <span className="text-xs text-gray-600 font-semibold">
                                  +{transaction.image_urls.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatMoney(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingTransaction(transaction);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️ ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transaction Form Modal */}
        {showForm && (
          <FinanceTransactionForm
            transaction={editingTransaction}
            onClose={() => {
              setShowForm(false);
              setEditingTransaction(null);
            }}
            onSuccess={() => {
              setShowForm(false);
              setEditingTransaction(null);
              fetchTransactions();
              fetchSummary();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Transaction Form Component
interface FinanceTransactionFormProps {
  transaction: FinanceTransaction | null;
  onClose: () => void;
  onSuccess: () => void;
}

const FinanceTransactionForm: React.FC<FinanceTransactionFormProps> = ({
  transaction,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FinanceTransactionRequest>({
    type: transaction?.type || "income",
    amount: transaction?.amount || 0,
    description: transaction?.description || "",
    date: transaction?.date
      ? new Date(transaction.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    category: transaction?.category || "",
    image_urls: transaction?.image_urls || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    transaction?.image_urls || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Prepare request data
      const requestData: FinanceTransactionRequest = {
        type: formData.type,
        amount: formData.amount,
        description: formData.description,
        date: formData.date,
        category: formData.category,
        image_urls: formData.image_urls && formData.image_urls.length > 0 ? formData.image_urls : undefined,
      };

      if (transaction) {
        await api.put(`/api/finance/transactions/${transaction.id}`, requestData);
      } else {
        await api.post("/api/finance/transactions", requestData);
      }
      onSuccess();
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(
        (axiosError.response?.data as { error?: string })?.error || "ไม่สามารถบันทึกข้อมูลได้"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check total images (including existing)
    const totalImages = imagePreviews.length + files.length;
    if (totalImages > 5) {
      setError(`สามารถอัพโหลดได้สูงสุด 5 ภาพ (ปัจจุบันมี ${imagePreviews.length} ภาพ)`);
      return;
    }

    // Validate all files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        setError("กรุณาเลือกไฟล์ภาพเท่านั้น");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("ขนาดไฟล์ต้องไม่เกิน 10MB");
        return;
      }
    }

    setUploadingImage(true);
    setError("");

    // Upload all files
    const uploadPromises = Array.from(files).map(async (file) => {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      const response = await api.post<{ success: boolean; image_url: string }>(
        "/api/finance/upload-image",
        formDataUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.image_url;
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const newImageUrls = [...(formData.image_urls || []), ...uploadedUrls];
      setFormData({ ...formData, image_urls: newImageUrls });
      setImagePreviews(newImageUrls);
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(
        (axiosError.response?.data as { error?: string })?.error ||
          "ไม่สามารถอัพโหลดภาพได้"
      );
    } finally {
      setUploadingImage(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImageUrls = formData.image_urls?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, image_urls: newImageUrls });
    setImagePreviews(newImageUrls);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {transaction ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ประเภท <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "income" | "expense",
                })
              }
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="income">รายรับ</option>
              <option value="expense">รายจ่าย</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              จำนวนเงิน <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) })
              }
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              รายละเอียด <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="กรอกรายละเอียด"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              วันที่ <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              หมวดหมู่
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="เช่น บุญบารมี, ค่าใช้จ่ายทั่วไป"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              รูปภาพ (สูงสุด 5 ภาพ) {imagePreviews.length > 0 && `(${imagePreviews.length}/5)`}
            </label>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {imagePreviews.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {imagePreviews.length < 5 && (
              <div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    uploadingImage
                      ? "border-gray-300 bg-gray-100"
                      : "border-gray-300 hover:border-green-500 hover:bg-green-50"
                  }`}
                >
                  {uploadingImage ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                      <span className="text-sm text-gray-600">กำลังอัพโหลด...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-10 h-10 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">
                        คลิกเพื่ออัพโหลดรูปภาพ
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        รองรับ JPEG, PNG, GIF, WebP (สูงสุด 10MB ต่อภาพ)
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        สามารถเลือกหลายภาพได้ (สูงสุด 5 ภาพ)
                      </span>
                    </div>
                  )}
                </label>
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-800 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinanceDashboard;

