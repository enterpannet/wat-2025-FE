import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { AxiosError } from "../../api";
import { Summary as SummaryType, User } from "../../types";
import AdminNavbar from "./AdminNavbar";

interface ErrorResponse {
  error: string;
}

const Summary: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SummaryType | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    checkAuth();
    fetchSummary();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      const response = await api.get<User>("/api/admin/me");
      setUser(response.data);
    } catch (err) {
      navigate("/admin/login");
    }
  };

  const fetchSummary = async (): Promise<void> => {
    try {
      const response = await api.get<SummaryType>("/api/admin/summary");
      setSummary(response.data);
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

  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatPercent = (current: number, total: number): string => {
    if (total === 0) return "0%";
    return ((current / total) * 100).toFixed(1) + "%";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen">
        <AdminNavbar userName={user?.full_name} />
        <div className="flex items-center justify-center py-20">
          <div className="text-red-600">ไม่สามารถโหลดข้อมูลได้</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminNavbar userName={user?.full_name} />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">สรุปข้อมูล</h2>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Registration Summary */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              สถานะการลงทะเบียน
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">ทั้งหมด</div>
                <div className="text-3xl font-bold text-purple-700">
                  {summary.registrations.total}
                </div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">สวดปริวาสแล้ว</div>
                <div className="text-3xl font-bold text-green-700">
                  {summary.registrations.chanted_pariwat}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatPercent(
                    summary.registrations.chanted_pariwat,
                    summary.registrations.total,
                  )}
                </div>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">สวดมานัดแล้ว</div>
                <div className="text-3xl font-bold text-blue-700">
                  {summary.registrations.chanted_manat}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatPercent(
                    summary.registrations.chanted_manat,
                    summary.registrations.total,
                  )}
                </div>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">สวดออกอาพานแล้ว</div>
                <div className="text-3xl font-bold text-orange-700">
                  {summary.registrations.chanted_ok_apan}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatPercent(
                    summary.registrations.chanted_ok_apan,
                    summary.registrations.total,
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              สรุปรายรับ-รายจ่าย
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-4">
                  สรุปทั้งหมด
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">รวมรายรับ</span>
                    <span className="text-lg font-bold text-green-700">
                      {formatMoney(summary.transactions.total_income)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-gray-700">รวมรายจ่าย</span>
                    <span className="text-lg font-bold text-red-700">
                      {formatMoney(summary.transactions.total_expense)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 font-semibold">คงเหลือ</span>
                    <span
                      className={`text-lg font-bold ${
                        summary.transactions.balance >= 0
                          ? "text-blue-700"
                          : "text-red-700"
                      }`}
                    >
                      {formatMoney(summary.transactions.balance)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-4">
                  เดือนนี้
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">รายรับเดือนนี้</span>
                    <span className="text-lg font-bold text-green-700">
                      {formatMoney(summary.transactions.income_this_month)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-gray-700">รายจ่ายเดือนนี้</span>
                    <span className="text-lg font-bold text-red-700">
                      {formatMoney(summary.transactions.expense_this_month)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 font-semibold">คงเหลือเดือนนี้</span>
                    <span
                      className={`text-lg font-bold ${
                        summary.transactions.balance_this_month >= 0
                          ? "text-blue-700"
                          : "text-red-700"
                      }`}
                    >
                      {formatMoney(summary.transactions.balance_this_month)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logs Summary */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              สถิติการบันทึก
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">บันทึกการทำกิจกรรม</div>
                <div className="text-3xl font-bold text-purple-700">
                  {summary.logs.activity_logs}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  (บันทึกโดยผู้ใช้ที่ login)
                </div>
              </div>
              <div className="bg-indigo-50 p-6 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">บันทึกข้อมูลอุปกรณ์</div>
                <div className="text-3xl font-bold text-indigo-700">
                  {summary.logs.device_logs}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  (บันทึกจากอุปกรณ์ - PDPA compliant)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;

