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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <h1 className="text-xl md:text-2xl font-bold">ระบบจัดการข้อมูล</h1>
            {userName && (
              <p className="text-xs md:text-sm text-purple-200 mt-1 hidden md:block">
                ยินดีต้อนรับ {userName}
              </p>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white hover:bg-purple-700 p-2 rounded-lg transition-all"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
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

            {/* ส่วนการลงทะเบียน - Show if user has registration role */}
            {(!user?.roles || user.roles.includes("registration")) && (
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

            {/* ส่วนรายรับ-รายจ่าย - Show if user has finance role */}
            {(!user?.roles || user.roles.includes("finance")) && (
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            {userName && (
              <p className="text-sm text-purple-200 mb-3 px-2">ยินดีต้อนรับ {userName}</p>
            )}
            
            {/* Main Dashboard */}
            <NavLink
              to="/admin/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg font-semibold transition-all ${
                  isActive
                    ? "bg-white text-purple-600 shadow-lg"
                    : "text-white hover:bg-purple-700"
                }`
              }
            >
              หน้าจัดการ
            </NavLink>

            {/* User Management */}
            <NavLink
              to="/admin/users"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg font-semibold transition-all ${
                  isActive
                    ? "bg-white text-purple-600 shadow-lg"
                    : "text-white hover:bg-purple-700"
                }`
              }
            >
              👥 จัดการผู้ใช้
            </NavLink>

            {/* ส่วนการลงทะเบียน */}
            {(!user?.roles || user.roles.includes("registration")) && (
              <div className="border-t border-purple-500 pt-2 mt-2">
                <p className="px-4 py-2 text-purple-200 text-sm font-semibold">📋 การลงทะเบียน</p>
                <NavLink
                  to="/admin/registration/list"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-6 py-2 text-sm rounded-lg transition-all ${
                      isActive
                        ? "bg-purple-700 text-white"
                        : "text-purple-100 hover:bg-purple-700"
                    }`
                  }
                >
                  Dashboard การลงทะเบียน
                </NavLink>
                <NavLink
                  to="/admin/registration/detail"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-6 py-2 text-sm rounded-lg transition-all ${
                      isActive
                        ? "bg-purple-700 text-white"
                        : "text-purple-100 hover:bg-purple-700"
                    }`
                  }
                >
                  รายชื่อทั้งหมด
                </NavLink>
                <NavLink
                  to="/admin/registration/activity-logs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-6 py-2 text-sm rounded-lg transition-all ${
                      isActive
                        ? "bg-purple-700 text-white"
                        : "text-purple-100 hover:bg-purple-700"
                    }`
                  }
                >
                  บันทึกกิจกรรม
                </NavLink>
              </div>
            )}

            {/* ส่วนรายรับ-รายจ่าย */}
            {(!user?.roles || user.roles.includes("finance")) && (
              <div className="border-t border-purple-500 pt-2 mt-2">
                <p className="px-4 py-2 text-purple-200 text-sm font-semibold">💰 รายรับ-รายจ่าย</p>
                <NavLink
                  to="/admin/finance/transactions"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-6 py-2 text-sm rounded-lg transition-all ${
                      isActive
                        ? "bg-purple-700 text-white"
                        : "text-purple-100 hover:bg-purple-700"
                    }`
                  }
                >
                  Dashboard รายรับ-รายจ่าย
                </NavLink>
                <NavLink
                  to="/admin/finance/manage"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-6 py-2 text-sm rounded-lg transition-all ${
                      isActive
                        ? "bg-purple-700 text-white"
                        : "text-purple-100 hover:bg-purple-700"
                    }`
                  }
                >
                  บันทึกรายรับ-รายจ่าย
                </NavLink>
                <NavLink
                  to="/admin/finance/summary"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-6 py-2 text-sm rounded-lg transition-all ${
                      isActive
                        ? "bg-purple-700 text-white"
                        : "text-purple-100 hover:bg-purple-700"
                    }`
                  }
                >
                  สรุปข้อมูล
                </NavLink>
              </div>
            )}

            {/* Logout Button */}
            <div className="border-t border-purple-500 pt-2 mt-2">
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold text-sm"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
