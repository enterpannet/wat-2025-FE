import { NavLink, useNavigate } from "react-router-dom";
import api from "../../api";
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
        const response = await api.get<User>("/api/admin/me");
        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async (): Promise<void> => {
    try {
      await api.post("/api/auth/logout", {});
      navigate("/admin/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const hasRegistrationRole = !user?.roles || user.roles.includes("registration");

  return (
    <nav className="bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏛️</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                ระบบจัดการข้อมูล
              </h1>
              {userName && (
                <p className="hidden md:block text-xs text-purple-200 font-medium">
                  👋 {userName}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {/* Dashboard */}
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-white text-purple-700 shadow-lg scale-105"
                    : "text-white hover:bg-purple-700 hover:shadow-md"
                }`
              }
            >
              🏠 หน้าจัดการ
            </NavLink>

            {/* User Management */}
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-white text-purple-700 shadow-lg scale-105"
                    : "text-white hover:bg-purple-700 hover:shadow-md"
                }`
              }
            >
              👥 จัดการผู้ใช้
            </NavLink>

            {/* Registration Dropdown */}
            {hasRegistrationRole && (
              <div className="relative group">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-lg font-semibold text-white text-sm transition-all duration-200 hover:bg-purple-700 hover:shadow-md flex items-center space-x-1"
                >
                  <span>📋 การลงทะเบียน</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border-2 border-purple-200">
                  <div className="py-2">
                    <NavLink
                      to="/admin/registration/list"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-6 py-3 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-l-4 border-purple-600"
                            : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        }`
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <span>📊</span>
                        <span>Dashboard การลงทะเบียน</span>
                      </div>
                    </NavLink>
                    <NavLink
                      to="/admin/registration/detail"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-6 py-3 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-l-4 border-purple-600"
                            : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        }`
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <span>📝</span>
                        <span>รายชื่อทั้งหมด</span>
                      </div>
                    </NavLink>
                    <NavLink
                      to="/admin/registration/activity-logs"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-6 py-3 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-l-4 border-purple-600"
                            : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        }`
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <span>📋</span>
                        <span>บันทึกกิจกรรม</span>
                      </div>
                    </NavLink>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="ml-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🚪 ออก
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-xl text-white bg-purple-700/30 hover:bg-purple-700/50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              aria-expanded="false"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="block h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 pt-4 space-y-2 border-t border-purple-500/50">
            {userName && (
              <div className="px-4 py-3 mb-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-sm text-white font-medium">✨ ยินดีต้อนรับ</p>
                <p className="text-lg font-bold text-white">{userName}</p>
              </div>
            )}
            
            {/* Mobile Dashboard */}
            <NavLink
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-5 py-3.5 rounded-xl font-bold text-base transition-all duration-200 ${
                  isActive
                    ? "bg-white text-purple-700 shadow-xl"
                    : "text-white bg-purple-700/20 hover:bg-purple-700/40 backdrop-blur-sm"
                }`
              }
            >
              🏠 หน้าจัดการ
            </NavLink>

            {/* Mobile User Management */}
            <NavLink
              to="/admin/users"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-5 py-3.5 rounded-xl font-bold text-base transition-all duration-200 ${
                  isActive
                    ? "bg-white text-purple-700 shadow-xl"
                    : "text-white bg-purple-700/20 hover:bg-purple-700/40 backdrop-blur-sm"
                }`
              }
            >
              👥 จัดการผู้ใช้
            </NavLink>

            {/* Mobile Registration Section */}
            {hasRegistrationRole && (
              <div className="pt-2">
                <div className="px-5 py-3 bg-white/10 rounded-xl backdrop-blur-sm mb-2">
                  <p className="text-white text-sm font-bold tracking-wide">📋 การลงทะเบียน</p>
                </div>
                <NavLink
                  to="/admin/registration/list"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-8 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                      isActive
                        ? "bg-white text-purple-700 shadow-lg"
                        : "text-purple-100 bg-purple-800/30 hover:bg-purple-800/50 backdrop-blur-sm"
                    }`
                  }
                >
                  📊 Dashboard การลงทะเบียน
                </NavLink>
                <NavLink
                  to="/admin/registration/detail"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-8 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                      isActive
                        ? "bg-white text-purple-700 shadow-lg"
                        : "text-purple-100 bg-purple-800/30 hover:bg-purple-800/50 backdrop-blur-sm"
                    }`
                  }
                >
                  📝 รายชื่อทั้งหมด
                </NavLink>
                <NavLink
                  to="/admin/registration/activity-logs"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-8 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                      isActive
                        ? "bg-white text-purple-700 shadow-lg"
                        : "text-purple-100 bg-purple-800/30 hover:bg-purple-800/50 backdrop-blur-sm"
                    }`
                  }
                >
                  📋 บันทึกกิจกรรม
                </NavLink>
              </div>
            )}

            {/* Mobile Logout */}
            <div className="pt-4 border-t border-purple-500/50">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-5 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-bold text-base shadow-xl transform hover:scale-105"
              >
                🚪 ออกจากระบบ
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
