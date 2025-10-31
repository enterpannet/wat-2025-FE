import { NavLink, useNavigate } from "react-router-dom";

interface PublicNavbarProps {
  currentPage?: "home" | "registration" | "contact";
}

const PublicNavbar: React.FC<PublicNavbarProps> = ({ currentPage = "home" }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo / Brand */}
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer"
          >
            <h1 className="text-2xl font-bold text-gray-800">
              ระบบจัดการข้อมูลวัด
            </h1>
            <p className="text-sm text-gray-500">Wat System</p>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
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
            <NavLink
              to="/device-log"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                }`
              }
            >
              ติดต่อ
            </NavLink>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              เข้าสู่ระบบ Admin
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;

