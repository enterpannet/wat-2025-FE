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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const hasRegistrationRole = !user?.roles || user.roles.includes("registration");
  const hasFinanceRole = !user?.roles || user.roles.includes("finance");

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top Bar with Logo and Mobile Menu Button */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              ระบบจัดการข้อมูล
            </h1>
            {userName && (
              <p className="hidden md:block text-xs md:text-sm text-purple-200 mt-1">
                ยินดีต้อนรับ {userName}
              </p>
            )}
          </div>

          {/* Desktop Menu - Show on md and up */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {/* Dashboard */}
            <NavLink
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 md:px-4 py-2 rounded-lg font-semibold transition-all text-xs md:text-sm ${
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
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 md:px-4 py-2 rounded-lg font-semibold transition-all text-xs md:text-sm ${
                  isActive
                    ? "bg-white text-purple-600 shadow-lg"
                    : "text-white hover:bg-purple-700"
                }`
              }
            >
              👥 จัดการผู้ใช้
            </NavLink>

            {/* Registration Menu */}
            {hasRegistrationRole && (
              <div className="relative group">
                <button className="px-3 md:px-4 py-2 rounded-lg font-semibold text-white hover:bg-purple-700 transition-all text-xs md:text-sm flex items-center gap-1">
                  📋 การลงทะเบียน
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
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

            {/* Finance Menu */}
            {hasFinanceRole && (
              <div className="relative group">
                <button className="px-3 md:px-4 py-2 rounded-lg font-semibold text-white hover:bg-purple-700 transition-all text-xs md:text-sm flex items-center gap-1">
                  💰 รายรับ-รายจ่าย
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
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
              className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold text-xs md:text-sm whitespace-nowrap"
            >
              ออกจากระบบ
            </button>
          </div>

          {/* Mobile Menu Button - Show on small screens */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
              aria-expanded="false"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-purple-500 space-y-1">
            {userName && (
              <p className="text-sm text-purple-200 px-4 py-3">ยินดีต้อนรับ {userName}</p>
            )}
            
            {/* Mobile Dashboard */}
            <NavLink
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg font-semibold transition-all ${
                  isActive
                    ? "bg-white text-purple-600 shadow-lg"
                    : "text-white hover:bg-purple-700"
                }`
              }
            >
              หน้าจัดการ
            </NavLink>

            {/* Mobile User Management */}
            <NavLink
              to="/admin/users"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg font-semibold transition-all ${
                  isActive
                    ? "bg-white text-purple-600 shadow-lg"
                    : "text-white hover:bg-purple-700"
                }`
              }
            >
              👥 จัดการผู้ใช้
            </NavLink>

            {/* Mobile Registration Section */}
            {hasRegistrationRole && (
              <>
                <div className="px-4 py-2 border-t border-purple-500 mt-2">
                  <p className="text-purple-200 text-sm font-semibold">📋 การลงทะเบียน</p>
                </div>
                <NavLink
                  to="/admin/registration/list"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-8 py-3 rounded-lg transition-all text-sm ${
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
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-8 py-3 rounded-lg transition-all text-sm ${
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
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-8 py-3 rounded-lg transition-all text-sm ${
                      isActive
                        ? "bg-purple-700 text-white"
                        : "text-purple-100 hover:bg-purple-700"
                    }`
                  }
                >
                  บันทึกกิจกรรม
                </NavLink>
              </>
            )}

            {/* Mobile Finance Section */}
            {hasFinanceRole && (
              <>
                <div className="px-4 py-2 border-t border-purple-500 mt-2">
                  <p className="text-purple-200 text-sm font-semibold">💰 รายรับ-รายจ่าย</p>
                </div>
                <NavLink
                  to="/admin/finance/transactions"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-8 py-3 rounded-lg transition-all text-sm ${
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
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-8 py-3 rounded-lg transition-all text-sm ${
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
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-8 py-3 rounded-lg transition-all text-sm ${
                      isActive
                        ? "bg-purple-700 text-white"
                        : "text-purple-100 hover:bg-purple-700"
                    }`
                  }
                >
                  สรุปข้อมูล
                </NavLink>
              </>
            )}

            {/* Mobile Logout */}
            <div className="pt-2 mt-2 border-t border-purple-500">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold text-sm"
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
