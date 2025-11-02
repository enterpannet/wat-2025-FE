import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { AxiosError } from "../../api";
import AdminNavbar from "./AdminNavbar";
import { User } from "../../types";

interface ErrorResponse {
  error: string;
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  
  // Edit state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    roles: ["registration"] as ("registration" | "finance")[],
    is_active: true,
  });

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      await api.get<User>("/api/admin/me");
    } catch (err) {
      navigate("/admin/login");
    }
  };

  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<User[]>("/api/admin/users");
      setUsers(response.data);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.error || "ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.full_name,
      roles: user.roles || ["registration"],
      is_active: true,
    });
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (userId: number): Promise<void> => {
    setError("");
    setSuccess("");
    
    try {
      await api.put(
        `/api/admin/users/${userId}`,
        {
          full_name: editFormData.full_name,
          roles: editFormData.roles,
        }
      );
      
      setSuccess("อัพเดทข้อมูลสำเร็จ");
      setEditingUser(null);
      fetchUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.error || "ไม่สามารถอัพเดทข้อมูลได้");
    }
  };

  const handleDelete = async (userId: number): Promise<void> => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?")) {
      return;
    }

    setError("");
    setSuccess("");
    
    try {
      await api.delete(`/api/admin/users/${userId}`);
      
      setSuccess("ลบผู้ใช้สำเร็จ");
      fetchUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.error || "ไม่สามารถลบผู้ใช้ได้");
    }
  };

  const getRoleLabel = (role: string | undefined) => {
    switch (role) {
      case "registration":
        return "ผู้ดูแลระบบลงทะเบียน";
      case "finance":
        return "ผู้ดูแลรายรับ-รายจ่าย";
      default:
        return "ไม่ระบุ";
    }
  };

  const getRoleBadgeColor = (role: string | undefined) => {
    switch (role) {
      case "registration":
        return "bg-blue-100 text-blue-700";
      case "finance":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="animate-pulse text-purple-600 text-xl font-semibold">
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <AdminNavbar />

      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              จัดการผู้ใช้ระบบ
            </h1>
            <p className="text-gray-600">
              จัดการข้อมูลผู้ดูแลระบบ การลงทะเบียน และรายรับ-รายจ่าย
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-purple-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      ชื่อผู้ใช้
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      ชื่อ-นามสกุล
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      บทบาท
                    </th>
                    <th className="px-6 py-4 text-center text-white font-semibold">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        #{user.id}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4">
                        {editingUser && editingUser.id === user.id ? (
                          <input
                            type="text"
                            value={editFormData.full_name}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                full_name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="ชื่อ-นามสกุล"
                          />
                        ) : (
                          <span className="text-gray-700">{user.full_name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingUser && editingUser.id === user.id ? (
                          <div className="space-y-2 min-w-[200px]">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editFormData.roles.includes("registration")}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditFormData({ ...editFormData, roles: [...editFormData.roles, "registration"] });
                                  } else {
                                    setEditFormData({ ...editFormData, roles: editFormData.roles.filter(r => r !== "registration") });
                                  }
                                }}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">ระบบลงทะเบียน</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editFormData.roles.includes("finance")}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditFormData({ ...editFormData, roles: [...editFormData.roles, "finance"] });
                                  } else {
                                    setEditFormData({ ...editFormData, roles: editFormData.roles.filter(r => r !== "finance") });
                                  }
                                }}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">รายรับ-รายจ่าย</span>
                            </label>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {user.roles?.map((role) => (
                              <span
                                key={role}
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(
                                  role
                                )}`}
                              >
                                {getRoleLabel(role)}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {editingUser && editingUser.id === user.id ? (
                            <>
                              <button
                                onClick={() => handleUpdate(user.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold text-sm"
                              >
                                บันทึก
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold text-sm"
                              >
                                ยกเลิก
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(user)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm"
                              >
                                แก้ไข
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold text-sm"
                              >
                                ลบ
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-gray-500 text-lg">ยังไม่มีผู้ใช้ในระบบ</p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="text-2xl mr-4">ℹ️</div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">คำแนะนำ</h3>
                <ul className="text-blue-800 space-y-1 text-sm">
                  <li>• ผู้ดูแลระบบลงทะเบียน: สามารถเข้าถึงเฉพาะส่วนการลงทะเบียน</li>
                  <li>• ผู้ดูแลรายรับ-รายจ่าย: สามารถเข้าถึงเฉพาะส่วนรายรับ-รายจ่าย</li>
                  <li>• สามารถแก้ไขชื่อ-นามสกุลและบทบาทของผู้ใช้ได้</li>
                  <li>• การลบผู้ใช้จะทำให้ผู้ใช้ไม่สามารถเข้าสู่ระบบได้อีก</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

