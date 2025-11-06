import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { User } from "../../types";

const SystemSelection: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get<User>("/api/admin/me");
        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-green-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            ยินดีต้อนรับ
          </h1>
          {user && (
            <p className="text-xl text-gray-600">
              สวัสดี, <span className="font-semibold text-purple-600">{user.full_name}</span>
            </p>
          )}
          <p className="text-gray-500 mt-2">เลือกระบบที่ต้องการใช้งาน</p>
        </div>

        {/* System Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Registration System */}
          <div
            onClick={() => navigate("/admin/dashboard")}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <span className="text-5xl">📋</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                ระบบลงทะเบียน
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                จัดการข้อมูลการลงทะเบียน
                <br />
                ดูรายชื่อผู้ลงทะเบียน
                <br />
                บันทึกกิจกรรม
              </p>
              <div className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg">
                เข้าสู่ระบบ →
              </div>
            </div>
          </div>

          {/* Finance System */}
          <div
            onClick={() => navigate("/finance")}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-green-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <span className="text-5xl">💰</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                ระบบรายรับรายจ่าย
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                จัดการรายการรายรับและรายจ่าย
                <br />
                ดูสรุปข้อมูลทางการเงิน
                <br />
                อัพโหลดรูปภาพประกอบ
              </p>
              <div className="w-full bg-gradient-to-r from-green-600 to-green-800 text-white py-4 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-green-900 transition-all shadow-lg">
                เข้าสู่ระบบ →
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-12 text-center">
          <button
            onClick={async () => {
              try {
                await api.post("/api/auth/logout", {});
                navigate("/admin/login");
              } catch (err) {
                console.error("Logout error:", err);
                navigate("/admin/login");
              }
            }}
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all shadow-md"
          >
            🚪 ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSelection;

