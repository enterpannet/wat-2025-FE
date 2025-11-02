import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api, { AxiosError } from "../../api";
import { Transaction, TransactionRequest, User } from "../../types";
import AdminNavbar from "./AdminNavbar";

interface ErrorResponse {
  error: string;
}

const IncomeExpense: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<TransactionRequest>({
    type: "income",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
  });

  useEffect(() => {
    checkAuth();
    fetchTransactions();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      const response = await api.get<User>("/api/admin/me");
      setUser(response.data);
    } catch (err) {
      navigate("/admin/login");
    }
  };

  const fetchTransactions = async (): Promise<void> => {
    try {
      const response = await api.get<Transaction[]>("/api/admin/transactions");
      setTransactions(response.data);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      if (axiosError.response?.status === 401) {
        navigate("/admin/login");
      } else {
        setError("ไม่สามารถโหลดข้อมูลได้");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.put(`/api/admin/transactions/${editingId}`, formData);
      } else {
        await api.post("/api/admin/transactions", formData);
      }

      fetchTransactions();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        type: "income",
        amount: 0,
        description: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
      });
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleEdit = (transaction: Transaction): void => {
    setEditingId(transaction.id);
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date.split("T")[0],
      category: transaction.category || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบรายการนี้?")) {
      return;
    }

    try {
      await api.delete(`/api/admin/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      alert("ไม่สามารถลบข้อมูลได้");
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminNavbar userName={user?.full_name} />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                รายรับ-รายจ่าย
              </h2>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingId(null);
                  setFormData({
                    type: "income",
                    amount: 0,
                    description: "",
                    date: new Date().toISOString().split("T")[0],
                    category: "",
                  });
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                {showForm ? "ยกเลิก" : "เพิ่มรายการ"}
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">รวมรายรับ</div>
                <div className="text-2xl font-bold text-green-700">
                  {formatMoney(totalIncome)}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">รวมรายจ่าย</div>
                <div className="text-2xl font-bold text-red-700">
                  {formatMoney(totalExpense)}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">คงเหลือ</div>
                <div className="text-2xl font-bold text-blue-700">
                  {formatMoney(totalIncome - totalExpense)}
                </div>
              </div>
            </div>

            {/* Form */}
            {showForm && (
              <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ประเภท <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as "income" | "expense" })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
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
                      min="0"
                      value={formData.amount || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="เช่น บุญบารมี, ค่าใช้จ่ายทั่วไป"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      รายละเอียด <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                  >
                    {editingId ? "อัปเดต" : "บันทึก"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      วันที่
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      ประเภท
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      รายละเอียด
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      หมวดหมู่
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase">
                      จำนวนเงิน
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-purple-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            transaction.type === "income"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.type === "income" ? "รายรับ" : "รายจ่าย"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {transaction.description}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {transaction.category || "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-right">
                        <span
                          className={
                            transaction.type === "income"
                              ? "text-green-700"
                              : "text-red-700"
                          }
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatMoney(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeExpense;

