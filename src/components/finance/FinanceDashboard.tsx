import { useState, useEffect } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import api, { AxiosError } from "../../api";
import FinanceNavbar from "./FinanceNavbar";
import AlertModal from "../common/AlertModal";
import ConfirmModal from "../common/ConfirmModal";
import {
  FinanceTransaction,
  FinanceSummary,
} from "../../types";

const FinanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    start_date: "",
    end_date: "",
  });
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
    isOpen: false,
    message: "",
    type: "info",
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  const showAlert = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    setAlertModal({ isOpen: true, message, type });
  };

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

  const handleDelete = (id: number): void => {
    setConfirmModal({
      isOpen: true,
      message: "คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?",
      onConfirm: async () => {
        try {
          await api.delete(`/api/finance/transactions/${id}`);
          fetchTransactions();
          fetchSummary();
          showAlert("ลบข้อมูลสำเร็จ", "success");
        } catch (err) {
          const axiosError = err as AxiosError;
          showAlert((axiosError.response?.data as { error?: string })?.error || "ไม่สามารถลบข้อมูลได้", "error");
        }
      },
    });
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
            onClick={() => navigate("/finance/new")}
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
                          onClick={() => navigate(`/finance/edit/${transaction.id}`)}
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

        {/* Alert Modal */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
          message={alertModal.message}
          type={alertModal.type}
        />

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          message={confirmModal.message}
          type="danger"
          confirmText="ลบ"
          cancelText="ยกเลิก"
        />
      </div>
    </div>
  );
};

export default FinanceDashboard;

