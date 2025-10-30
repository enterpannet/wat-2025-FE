import { useState, useEffect, useMemo } from "react";
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

const ListTum: React.FC = () => {
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

  const updateChantingStatus = async (
    id: number,
    field: "chanted_pariwat" | "chanted_manat" | "chanted_ok_apan",
    value: boolean,
  ): Promise<void> => {
    try {
      // Find current registration
      const registration = registrations.find((r) => r.id === id);
      if (!registration) return;

      // Update the specific field
      const updatedStatus = {
        chanted_pariwat: registration.chanted_pariwat,
        chanted_manat: registration.chanted_manat,
        chanted_ok_apan: registration.chanted_ok_apan,
        [field]: value,
      };

      await axios.put(
        `/api/admin/registrations/${id}/chanting`,
        updatedStatus,
        { withCredentials: true },
      );

      // Update local state
      setRegistrations((prevRegistrations) =>
        prevRegistrations.map((reg) =>
          reg.id === id ? { ...reg, [field]: value } : reg,
        ),
      );
    } catch (err) {
      alert("ไม่สามารถอัพเดทสถานะได้");
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

  // คำนวณจำนวนคนที่สวดแล้วในแต่ละประเภท
  const chantingStats = useMemo(() => {
    const total = registrations.length;
    const pariwatCount = registrations.filter(
      (r) => r.chanted_pariwat,
    ).length;
    const manatCount = registrations.filter((r) => r.chanted_manat).length;
    const okApanCount = registrations.filter(
      (r) => r.chanted_ok_apan,
    ).length;

    return {
      total,
      pariwatCount,
      manatCount,
      okApanCount,
    };
  }, [registrations]);

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
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider bg-green-700">
                        <div>สวดปริวาสแล้ว</div>
                        <div className="text-xs font-normal mt-1">
                          {chantingStats.pariwatCount} / {chantingStats.total}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider bg-blue-700">
                        <div>สวดมานัดแล้ว</div>
                        <div className="text-xs font-normal mt-1">
                          {chantingStats.manatCount} / {chantingStats.total}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider bg-orange-700">
                        <div>สวดออกอาพานแล้ว</div>
                        <div className="text-xs font-normal mt-1">
                          {chantingStats.okApanCount} / {chantingStats.total}
                        </div>
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
                        <td className="px-4 py-4 text-center bg-green-50">
                          <input
                            type="checkbox"
                            checked={registration.chanted_pariwat}
                            onChange={(e) =>
                              updateChantingStatus(
                                registration.id,
                                "chanted_pariwat",
                                e.target.checked,
                              )
                            }
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-4 text-center bg-blue-50">
                          <input
                            type="checkbox"
                            checked={registration.chanted_manat}
                            onChange={(e) =>
                              updateChantingStatus(
                                registration.id,
                                "chanted_manat",
                                e.target.checked,
                              )
                            }
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-4 text-center bg-orange-50">
                          <input
                            type="checkbox"
                            checked={registration.chanted_ok_apan}
                            onChange={(e) =>
                              updateChantingStatus(
                                registration.id,
                                "chanted_ok_apan",
                                e.target.checked,
                              )
                            }
                            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                          />
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

export default ListTum;
