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

const AdminDashboard: React.FC = () => {
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
      // Not authenticated, redirect to login
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

  const handleLogout = async (): Promise<void> => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      navigate("/admin/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?")) {
      return;
    }

    try {
      await axios.delete(`/api/admin/registrations/${id}`, {
        withCredentials: true,
      });
      // Refresh list
      fetchRegistrations();
    } catch (err) {
      alert("ไม่สามารถลบข้อมูลได้");
    }
  };

  const formatShortDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminNavbar userName={user?.full_name} />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Data Table */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                รายการลงทะเบียน
              </h2>
              <div className="text-sm text-gray-600">
                ทั้งหมด {registrations.length} รายการ
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {registrations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-xl">ยังไม่มีข้อมูลการลงทะเบียน</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        ลำดับ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        ชื่อ-นามสกุล
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        ฉายา
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        วันเกิด
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        เบอร์โทร
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        ที่อยู่
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        วัด
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        โรคประจำตัว
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        วันที่ลงทะเบียน
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.map((registration, index) => (
                      <tr
                        key={registration.id}
                        className="hover:bg-purple-50 transition-colors"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-purple-700">
                            {registration.full_name}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {registration.nickname || "-"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatShortDate(registration.birth_date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {registration.phone_number}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div className="max-w-xs">
                            <div className="font-medium">
                              {registration.address_detail}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              ต.{registration.sub_district?.name_th || "-"} อ.
                              {registration.district?.name_th || "-"} จ.
                              {registration.province?.name_th || "-"}
                              {registration.sub_district?.zip_code && (
                                <> {registration.sub_district.zip_code}</>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {registration.temple_name || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div className="max-w-xs">
                            {registration.medical_condition || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatShortDate(registration.created_at)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleDelete(registration.id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-all"
                          >
                            ลบ
                          </button>
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

export default AdminDashboard;
