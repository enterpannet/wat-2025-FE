import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const PublicNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo / Brand */}
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer"
          >
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              ระบบจัดการข้อมูลวัด
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">Wat System</p>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                }`
              }
            >
              หน้าแรก
            </NavLink>
            <NavLink
              to="/registration"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                }`
              }
            >
              ลงทะเบียน
            </NavLink>
            <button
              onClick={() => navigate("/admin/login")}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              เข้าสู่ระบบ Admin
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              aria-expanded="false"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-4 space-y-2 border-t border-gray-200">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg font-semibold text-base transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                }`
              }
            >
              หน้าแรก
            </NavLink>
            <NavLink
              to="/registration"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg font-semibold text-base transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                }`
              }
            >
              ลงทะเบียน
            </NavLink>
            <button
              onClick={() => {
                navigate("/admin/login");
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg text-left"
            >
              เข้าสู่ระบบ Admin
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;

