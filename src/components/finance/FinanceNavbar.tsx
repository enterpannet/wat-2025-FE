import { NavLink, useNavigate } from "react-router-dom";
import api from "../../api";
import { useState, useEffect } from "react";
import { User } from "../../types";

const FinanceNavbar: React.FC = () => {
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

  return (
    <nav className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                ระบบรายรับรายจ่าย
              </h1>
              {user && (
                <p className="hidden md:block text-xs text-green-200 font-medium">
                  👋 {user.full_name}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {/* Back to System Selection */}
            <button
              onClick={() => navigate("/admin/select")}
              className="px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 text-white hover:bg-green-700 hover:shadow-md"
            >
              🔄 เลือกระบบ
            </button>

            {/* Finance Dashboard */}
            <NavLink
              to="/finance"
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-white text-green-700 shadow-lg scale-105"
                    : "text-white hover:bg-green-700 hover:shadow-md"
                }`
              }
            >
              💰 รายรับรายจ่าย
            </NavLink>

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
              className="inline-flex items-center justify-center p-3 rounded-xl text-white bg-green-700/30 hover:bg-green-700/50 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
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
          <div className="md:hidden pb-6 pt-4 space-y-2 border-t border-green-500/50">
            {user && (
              <div className="px-4 py-3 mb-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-sm text-white font-medium">✨ ยินดีต้อนรับ</p>
                <p className="text-lg font-bold text-white">{user.full_name}</p>
              </div>
            )}
            
            {/* Back to System Selection */}
            <button
              onClick={() => {
                navigate("/admin/select");
                setMobileMenuOpen(false);
              }}
              className="block w-full px-5 py-3.5 rounded-xl font-bold text-base transition-all duration-200 text-white bg-green-700/20 hover:bg-green-700/40 backdrop-blur-sm mb-2"
            >
              🔄 เลือกระบบ
            </button>
            
            {/* Mobile Finance */}
            <NavLink
              to="/finance"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-5 py-3.5 rounded-xl font-bold text-base transition-all duration-200 ${
                  isActive
                    ? "bg-white text-green-700 shadow-xl"
                    : "text-white bg-green-700/20 hover:bg-green-700/40 backdrop-blur-sm"
                }`
              }
            >
              💰 รายรับรายจ่าย
            </NavLink>

            {/* Mobile Logout */}
            <div className="pt-4 border-t border-green-500/50">
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

export default FinanceNavbar;

