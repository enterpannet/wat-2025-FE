import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { AxiosError } from "../../api";
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Registration>>({});

  useEffect(() => {
    checkAuth();
    fetchRegistrations();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      const response = await api.get<User>("/api/admin/me");
      setUser(response.data);
    } catch (err) {
      navigate("/admin/login");
    }
  };

  const fetchRegistrations = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get<Registration[]>("/api/admin/registrations");
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

  const handleDelete = async (id: number, fullName: string): Promise<void> => {
    if (!window.confirm(`คุณต้องการลบข้อมูลของ ${fullName} ใช่หรือไม่?`)) {
      return;
    }

    try {
      await api.delete(`/api/admin/registrations/${id}`);
      setRegistrations((prev) => prev.filter((reg) => reg.id !== id));
      alert("ลบข้อมูลสำเร็จ");
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      alert(axiosError.response?.data?.error || "ไม่สามารถลบข้อมูลได้");
    }
  };

  const handleEdit = (registration: Registration): void => {
    setEditingId(registration.id);
    // Format birth_date for input (YYYY-MM-DD)
    const birthDate = registration.birth_date
      ? new Date(registration.birth_date).toISOString().split("T")[0]
      : "";
    
    setEditFormData({
      full_name: registration.full_name,
      nickname: registration.nickname || "",
      phone_number: registration.phone_number,
      address_detail: registration.address_detail,
      temple_name: registration.temple_name || "",
      medical_condition: registration.medical_condition || "",
      vassa: registration.vassa || 0,
      birth_date: birthDate,
      province_id: registration.province_id,
      district_id: registration.district_id,
      sub_district_id: registration.sub_district_id,
    });
  };

  const handleSaveEdit = async (id: number): Promise<void> => {
    try {
      // Prepare data for API
      const updateData: any = {
        full_name: editFormData.full_name,
        nickname: editFormData.nickname || "",
        phone_number: editFormData.phone_number,
        address_detail: editFormData.address_detail,
        temple_name: editFormData.temple_name || "",
        medical_condition: editFormData.medical_condition || "",
        vassa: editFormData.vassa || 0,
        birth_date: editFormData.birth_date,
        province_id: editFormData.province_id,
        district_id: editFormData.district_id,
        sub_district_id: editFormData.sub_district_id,
      };

      await api.put(`/api/admin/registrations/${id}`, updateData);
      await fetchRegistrations();
      setEditingId(null);
      setEditFormData({});
      alert("บันทึกข้อมูลสำเร็จ");
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      alert(axiosError.response?.data?.error || "ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const handleCancelEdit = (): void => {
    setEditingId(null);
    setEditFormData({});
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <AdminNavbar userName={user?.full_name} />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                ระบบลงทะเบียน
              </h1>
              <p className="text-lg text-gray-600">
                จัดการข้อมูลผู้ลงทะเบียนทั้งหมด ({registrations.length} รายการ)
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/registration/detail")}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              📋 ตรารางสวด →
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Registrations Table */}
          {registrations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-xl text-gray-500">ยังไม่มีข้อมูลการลงทะเบียน</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        ลำดับ
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        ชื่อ-นามสกุล
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        ฉายา
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        เบอร์โทร
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        ที่อยู่
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        วัด
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        พรรษา
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        วันที่ลงทะเบียน
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">
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
                        {editingId === registration.id ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={editFormData.full_name || ""}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    full_name: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={editFormData.nickname || ""}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    nickname: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={editFormData.phone_number || ""}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    phone_number: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <textarea
                                value={editFormData.address_detail || ""}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    address_detail: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                rows={2}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={editFormData.temple_name || ""}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    temple_name: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={editFormData.vassa || 0}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    vassa: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                min="0"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(registration.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleSaveEdit(registration.id)}
                                  className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm"
                                >
                                  💾 บันทึก
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm"
                                >
                                  ✕ ยกเลิก
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-purple-700">
                                {registration.full_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {registration.nickname || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {registration.phone_number}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              <div className="max-w-xs">
                                <div className="font-medium">
                                  {registration.address_detail}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  ต.{registration.sub_district?.name_th || "-"} อ.
                                  {registration.district?.name_th || "-"} จ.
                                  {registration.province?.name_th || "-"}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {registration.temple_name || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center font-semibold">
                              {registration.vassa || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(registration.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleEdit(registration)}
                                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg"
                                >
                                  ✏️ แก้ไข
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(registration.id, registration.full_name)
                                  }
                                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg"
                                >
                                  🗑️ ลบ
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationDashboard;
