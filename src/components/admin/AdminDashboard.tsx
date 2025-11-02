import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { AxiosError } from "../../api";
import AdminNavbar from "./AdminNavbar";
import { User } from "../../types";

interface ErrorResponse {
  error: string;
}

interface Stats {
  totalRegistrations: number;
  totalTransactions: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalRegistrations: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const checkAuth = async (): Promise<void> => {
    try {
      const response = await api.get<User>("/api/admin/me");
      setUser(response.data);
    } catch (err) {
      // Not authenticated, redirect to login
      navigate("/admin/login");
    }
  };

  const fetchStats = async (): Promise<void> => {
    try {
      const hasRegistration = user?.roles?.includes("registration");
      const hasFinance = user?.roles?.includes("finance");
      
      // Fetch stats based on user roles
      if (hasRegistration && hasFinance) {
        // Both roles - fetch everything
        const registrationsResponse = await api.get("/api/admin/registrations");
        const totalRegistrations = registrationsResponse.data.length || 0;

        const transactionsResponse = await api.get("/api/admin/transactions");
        const totalTransactions = transactionsResponse.data.length || 0;

        setStats({
          totalRegistrations,
          totalTransactions,
        });
      } else if (hasRegistration) {
        // Only registration
        const registrationsResponse = await api.get("/api/admin/registrations");
        const totalRegistrations = registrationsResponse.data.length || 0;
        setStats({
          totalRegistrations,
          totalTransactions: 0,
        });
      } else if (hasFinance) {
        // Only finance
        const transactionsResponse = await api.get("/api/admin/transactions");
        const totalTransactions = transactionsResponse.data.length || 0;
        setStats({
          totalRegistrations: 0,
          totalTransactions,
        });
      } else {
        // No roles or undefined - fetch both
        const registrationsResponse = await api.get("/api/admin/registrations");
        const totalRegistrations = registrationsResponse.data.length || 0;

        const transactionsResponse = await api.get("/api/admin/transactions");
        const totalTransactions = transactionsResponse.data.length || 0;

        setStats({
          totalRegistrations,
          totalTransactions,
        });
      }
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      if (axiosError.response?.status === 401) {
        navigate("/admin/login");
      }
      // If stats fail, continue with 0 values
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="animate-pulse text-purple-600 text-xl font-semibold">
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <AdminNavbar userName={user?.full_name} />

      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              ยินดีต้อนรับเข้าสู่ระบบจัดการข้อมูล
            </h1>
            <p className="text-lg text-gray-600">
              เลือกส่วนที่ต้องการจัดการ
            </p>
          </div>

          {/* Main Action Cards - Show based on roles */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Show Registration Card if user has registration role */}
            {(!user?.roles || user.roles.includes("registration")) && (
              <div
                onClick={() => navigate("/admin/registration/list")}
                className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                    📋
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.totalRegistrations}
                    </div>
                    <div className="text-sm text-gray-500">รายการลงทะเบียน</div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  ส่วนการลงทะเบียน
                </h2>
                <p className="text-gray-600 mb-6">
                  จัดการข้อมูลผู้ลงทะเบียน ดูรายชื่อทั้งหมด และบันทึกกิจกรรม
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    รายชื่อทั้งหมด
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    บันทึกกิจกรรม
                  </span>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg group-hover:shadow-xl">
                  เข้าสู่ส่วนการลงทะเบียน →
                </button>
              </div>
            )}

            {/* Show Finance Card if user has finance role */}
            {(!user?.roles || user.roles.includes("finance")) && (
              <div
                onClick={() => navigate("/admin/finance/transactions")}
                className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                    💰
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {stats.totalTransactions}
                    </div>
                    <div className="text-sm text-gray-500">รายการธุรกรรม</div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  ส่วนรายรับ-รายจ่าย
                </h2>
                <p className="text-gray-600 mb-6">
                  บันทึกและจัดการรายรับ-รายจ่าย รวมถึงดูสรุปข้อมูลการเงิน
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    บันทึกรายรับ-รายจ่าย
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    สรุปข้อมูล
                  </span>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg group-hover:shadow-xl">
                  เข้าสู่ส่วนรายรับ-รายจ่าย →
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats - Show based on roles */}
          <div className="grid md:grid-cols-2 gap-6">
            {(!user?.roles || user.roles.includes("registration")) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      สถิติการลงทะเบียน
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.totalRegistrations}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">รายการทั้งหมด</p>
                  </div>
                  <div className="text-5xl">📊</div>
                </div>
              </div>
            )}

            {(!user?.roles || user.roles.includes("finance")) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      สถิติธุรกรรม
                    </h3>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.totalTransactions}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">รายการทั้งหมด</p>
                  </div>
                  <div className="text-5xl">💳</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
