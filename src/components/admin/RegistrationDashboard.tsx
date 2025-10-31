import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { Registration } from "../../types";
import AdminNavbar from "./AdminNavbar";

interface ErrorResponse {
  error: string;
}

interface User {
  id: number;
  username: string;
  full_name: string;
}

const RegistrationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    checkAuth();
    fetchRegistrations();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      const response = await axios.get<User>("/api/admin/me", {
        withCredentials: true,
      });
      setUser(response.data);
    } catch (err) {
      navigate("/admin/login");
    }
  };

  const fetchRegistrations = async (): Promise<void> => {
    try {
      const response = await axios.get<Registration[]>(
        "/api/admin/registrations",
        { withCredentials: true },
      );
      setRegistrations(response.data);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      if (axiosError.response?.status === 401) {
        navigate("/admin/login");
      } else {
        setError("ไม่สามารถโหลดข้อมูลได้");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="animate-pulse text-blue-600 text-xl font-semibold">
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  // Recent registrations (last 5)
  const recentRegistrations = registrations
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <AdminNavbar userName={user?.full_name} />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              ส่วนการลงทะเบียน
            </h1>
            <p className="text-lg text-gray-600">
              จัดการข้อมูลผู้ลงทะเบียนทั้งหมด
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    จำนวนผู้ลงทะเบียน
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {registrations.length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">รายการทั้งหมด</p>
                </div>
                <div className="text-5xl">📋</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    ลงทะเบียนวันนี้
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {registrations.filter((reg) => {
                      const today = new Date().toDateString();
                      const regDate = new Date(reg.created_at).toDateString();
                      return today === regDate;
                    }).length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">รายการ</p>
                </div>
                <div className="text-5xl">📅</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    ลงทะเบียนเดือนนี้
                  </h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {registrations.filter((reg) => {
                      const now = new Date();
                      const regDate = new Date(reg.created_at);
                      return (
                        now.getMonth() === regDate.getMonth() &&
                        now.getFullYear() === regDate.getFullYear()
                      );
                    }).length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">รายการ</p>
                </div>
                <div className="text-5xl">📊</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => navigate("/admin/registration/detail")}
              className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  รายชื่อทั้งหมด
                </h3>
                <div className="text-4xl">📝</div>
              </div>
              <p className="text-gray-600 mb-4">
                ดูและจัดการรายชื่อผู้ลงทะเบียนทั้งหมด
              </p>
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                ดูทั้งหมด →
              </span>
            </button>

            <button
              onClick={() => navigate("/admin/registration/activity-logs")}
              className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  บันทึกกิจกรรม
                </h3>
                <div className="text-4xl">📋</div>
              </div>
              <p className="text-gray-600 mb-4">
                ดูบันทึกการทำกิจกรรมทั้งหมด
              </p>
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                ดูบันทึก →
              </span>
            </button>
          </div>

          {/* Recent Registrations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                ลงทะเบียนล่าสุด
              </h2>
              <button
                onClick={() => navigate("/admin/registration/detail")}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                ดูทั้งหมด →
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {recentRegistrations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-xl">ยังไม่มีข้อมูลการลงทะเบียน</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        ลำดับ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        ชื่อ-นามสกุล
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        เบอร์โทร
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        ที่อยู่
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        วันที่ลงทะเบียน
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentRegistrations.map((registration, index) => (
                      <tr
                        key={registration.id}
                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => navigate("/admin/registration/detail")}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-blue-700">
                            {registration.full_name}
                          </div>
                          {registration.nickname && (
                            <div className="text-xs text-gray-500">
                              ({registration.nickname})
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {registration.phone_number}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div className="max-w-xs truncate">
                            {registration.address_detail}
                          </div>
                          <div className="text-xs text-gray-500">
                            ต.{registration.sub_district?.name_th || "-"} อ.
                            {registration.district?.name_th || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(registration.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDashboard;

