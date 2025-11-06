import { useNavigate } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <PublicNavbar />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div className="max-w-4xl w-full">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-gray-800 mb-4">
              ยินดีต้อนรับ
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              ระบบจัดการข้อมูลการลงทะเบียนและรายรับ-รายจ่าย
            </p>
            <p className="text-lg text-gray-500">
              เลือกบริการที่คุณต้องการใช้งาน
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* แบบฟอร์มลงทะเบียน Card */}
            <div
              onClick={() => navigate("/registration")}
              className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group border-2 border-transparent hover:border-purple-300"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-5xl group-hover:scale-110 transition-transform shadow-lg">
                  📝
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                แบบฟอร์มลงทะเบียน
              </h3>
              <p className="text-gray-600 mb-6 text-center">
             
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  ลงทะเบียนออนไลน์
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  ฟรี ไม่มีค่าใช้จ่าย
                </span>
              </div>
              <button className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg group-hover:shadow-xl">
                เริ่มลงทะเบียน →
              </button>
            </div>

            {/* รายรับ-รายจ่าย Card */}
            <div
              onClick={() => navigate("/admin/dashboard")}
              className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group border-2 border-transparent hover:border-blue-300"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-5xl group-hover:scale-110 transition-transform shadow-lg">
                  💰
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                รายรับ-รายจ่าย
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                สำหรับเจ้าหน้าที่ที่ต้องการจัดการข้อมูลรายรับ-รายจ่าย
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  ต้องล็อกอิน
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  สำหรับ Admin
                </span>
              </div>
              <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg group-hover:shadow-xl">
                เข้าสู่ระบบ Admin →
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              มีปัญหาในการใช้งาน?{" "}
              <a
                href="/device-log"
                className="text-purple-600 hover:text-purple-700 font-semibold underline"
              >
                ติดต่อเจ้าหน้าที่
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

