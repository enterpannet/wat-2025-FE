import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { Transaction } from "../../types";
import AdminNavbar from "./AdminNavbar";

interface ErrorResponse {
  error: string;
}

interface User {
  id: number;
  username: string;
  full_name: string;
}

const FinanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    checkAuth();
    fetchTransactions();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      const response = await axios.get<User>("/api/admin/me", {
        withCredentials: true,
      });
      setUser(response.data);
    } catch (err) {
      navigate("/admin/login");
    }
  };

  const fetchTransactions = async (): Promise<void> => {
    try {
      const response = await axios.get<Transaction[]>(
        "/api/admin/transactions",
        { withCredentials: true },
      );
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-pulse text-green-600 text-xl font-semibold">
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const balance = totalIncome - totalExpense;

  // Recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <AdminNavbar userName={user?.full_name} />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              ส่วนรายรับ-รายจ่าย
            </h1>
            <p className="text-lg text-gray-600">
              จัดการข้อมูลรายรับ-รายจ่ายทั้งหมด
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    รายรับรวม
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(totalIncome)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {transactions.filter((t) => t.type === "income").length}{" "}
                    รายการ
                  </p>
                </div>
                <div className="text-5xl">💰</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    รายจ่ายรวม
                  </h3>
                  <p className="text-3xl font-bold text-red-600">
                    {formatCurrency(totalExpense)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {transactions.filter((t) => t.type === "expense").length}{" "}
                    รายการ
                  </p>
                </div>
                <div className="text-5xl">💸</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    ยอดคงเหลือ
                  </h3>
                  <p
                    className={`text-3xl font-bold ${
                      balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(balance)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">สุทธิ</p>
                </div>
                <div className="text-5xl">💳</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => navigate("/admin/finance/manage")}
              className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-green-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  บันทึกรายรับ-รายจ่าย
                </h3>
                <div className="text-4xl">➕</div>
              </div>
              <p className="text-gray-600 mb-4">
                เพิ่ม แก้ไข หรือลบรายการรายรับ-รายจ่าย
              </p>
              <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                จัดการ →
              </span>
            </button>

            <button
              onClick={() => navigate("/admin/finance/summary")}
              className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-green-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  สรุปข้อมูล
                </h3>
                <div className="text-4xl">📊</div>
              </div>
              <p className="text-gray-600 mb-4">
                ดูสรุปข้อมูลรายรับ-รายจ่ายแบบละเอียด
              </p>
              <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                ดูสรุป →
              </span>
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                ธุรกรรมล่าสุด
              </h2>
              <button
                onClick={() => navigate("/admin/finance/manage")}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                ดูทั้งหมด →
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {recentTransactions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-xl">ยังไม่มีข้อมูลรายรับ-รายจ่าย</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-green-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        ประเภท
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        หมวดหมู่
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        รายละเอียด
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        จำนวนเงิน
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        วันที่
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-green-50 transition-colors cursor-pointer"
                        onClick={() => navigate("/admin/finance/manage")}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              transaction.type === "income"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {transaction.type === "income" ? "รายรับ" : "รายจ่าย"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {transaction.category || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div className="max-w-xs truncate">
                            {transaction.description || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-semibold ${
                              transaction.type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(parseFloat(transaction.amount.toString()))}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;

