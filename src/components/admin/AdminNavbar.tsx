import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { User } from "../../types";

interface AdminNavbarProps {
  userName?: string;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ userName }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get<User>("/api/admin/me", {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

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
            {/* Main Dashboard */}
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

            {/* User Management - Available to all roles */}
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  isActive
                    ? "bg-white text-purple-600 shadow-lg"
                    : "text-white hover:bg-purple-700"
                }`
              }
            >
              👥 จัดการผู้ใช้
            </NavLink>

            {/* ส่วนการลงทะเบียน - Show only for registration role or no role */}
            {(!user?.role || user.role === "registration") && (
              <div className="relative group">
                <div className="px-4 py-2 rounded-lg font-semibold text-white hover:bg-purple-700 transition-all text-sm cursor-pointer border-r border-purple-400 pr-0">
                  <span className="px-2">📋 การลงทะเบียน</span>
                </div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-2">
                    <NavLink
                      to="/admin/registration/list"
                      className={({ isActive }) =>
                        `block px-4 py-2 text-sm ${
                          isActive
                            ? "bg-purple-100 text-purple-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      Dashboard การลงทะเบียน
                    </NavLink>
                    <NavLink
                      to="/admin/registration/detail"
                      className={({ isActive }) =>
                        `block px-4 py-2 text-sm ${
                          isActive
                            ? "bg-purple-100 text-purple-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      รายชื่อทั้งหมด
                    </NavLink>
                    <NavLink
                      to="/admin/registration/activity-logs"
                      className={({ isActive }) =>
                        `block px-4 py-2 text-sm ${
                          isActive
                            ? "bg-purple-100 text-purple-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      บันทึกกิจกรรม
                    </NavLink>
                  </div>
                </div>
              </div>
            )}

            {/* ส่วนรายรับ-รายจ่าย - Show only for finance role or no role */}
            {(!user?.role || user.role === "finance") && (
              <div className="relative group">
                <div className="px-4 py-2 rounded-lg font-semibold text-white hover:bg-purple-700 transition-all text-sm cursor-pointer border-r border-purple-400 pr-0">
                  <span className="px-2">💰 รายรับ-รายจ่าย</span>
                </div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-2">
                    <NavLink
                      to="/admin/finance/transactions"
                      className={({ isActive }) =>
                        `block px-4 py-2 text-sm ${
                          isActive
                            ? "bg-purple-100 text-purple-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      Dashboard รายรับ-รายจ่าย
                    </NavLink>
                    <NavLink
                      to="/admin/finance/manage"
                      className={({ isActive }) =>
                        `block px-4 py-2 text-sm ${
                          isActive
                            ? "bg-purple-100 text-purple-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      บันทึกรายรับ-รายจ่าย
                    </NavLink>
                    <NavLink
                      to="/admin/finance/summary"
                      className={({ isActive }) =>
                        `block px-4 py-2 text-sm ${
                          isActive
                            ? "bg-purple-100 text-purple-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      สรุปข้อมูล
                    </NavLink>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
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
