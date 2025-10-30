import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

interface AdminNavbarProps {
  userName?: string;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ userName }) => {
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      navigate("/admin/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo / Brand */}
          <div className="text-white">
            <h1 className="text-2xl font-bold">ระบบจัดการข้อมูล</h1>
            {userName && (
              <p className="text-sm text-purple-200 mt-1">
                ยินดีต้อนรับ {userName}
              </p>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 flex-wrap">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  isActive
                    ? "bg-white text-purple-600 shadow-lg"
                    : "text-white hover:bg-purple-700"
                }`
              }
            >
              หน้าจัดการ
            </NavLink>
            <NavLink
              to="/admin/listtum"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  isActive
                    ? "bg-white text-purple-600 shadow-lg"
                    : "text-white hover:bg-purple-700"
                }`
              }
            >
              รายชื่อทั้งหมด
            </NavLink>
            <NavLink
              to="/admin/income-expense"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  isActive
                    ? "bg-white text-purple-600 shadow-lg"
                    : "text-white hover:bg-purple-700"
                }`
              }
            >
              รายรับ-รายจ่าย
            </NavLink>
            <NavLink
              to="/admin/summary"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  isActive
                    ? "bg-white text-purple-600 shadow-lg"
                    : "text-white hover:bg-purple-700"
                }`
              }
            >
              สรุป
            </NavLink>
            <NavLink
              to="/admin/activity-logs"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  isActive
                    ? "bg-white text-purple-600 shadow-lg"
                    : "text-white hover:bg-purple-700"
                }`
              }
            >
              บันทึกกิจกรรม
            </NavLink>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold text-sm"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
