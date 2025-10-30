import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios, { AxiosError } from "axios";

interface LoginFormData {
  username: string;
  password: string;
}

interface ErrorResponse {
  error: string;
}

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(
        "/api/auth/login",
        formData,
        { withCredentials: true } // Important for cookies
      );

      // Redirect to dashboard
      navigate("/admin/dashboard");
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(
        axiosError.response?.data?.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            ระบบจัดการข้อมูล
          </h1>
          <p className="text-white text-sm">เข้าสู่ระบบสำหรับผู้ดูแล</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            เข้าสู่ระบบ
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ชื่อผู้ใช้ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="กรอกชื่อผู้ใช้"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                รหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="กรอกรหัสผ่าน"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ยังไม่มีบัญชี?{" "}
              <Link
                to="/admin/register"
                className="text-purple-600 hover:text-purple-800 font-semibold"
              >
                สร้างบัญชีผู้ดูแล
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← กลับไปหน้าลงทะเบียน
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
