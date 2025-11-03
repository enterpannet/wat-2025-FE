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
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalRegistrations: 0,
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
      const registrationsResponse = await api.get("/api/admin/registrations");
      const totalRegistrations = registrationsResponse.data.length || 0;
      
      setStats({
        totalRegistrations,
      });
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

          {/* Main Action Card */}
          <div className="grid md:grid-cols-1 gap-8 mb-8">
            {/* Registration Card */}
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
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-1 gap-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
