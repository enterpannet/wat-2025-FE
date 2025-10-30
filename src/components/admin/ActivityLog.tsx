import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { ActivityLog, ActivityLogRequest, User } from "../../types";
import AdminNavbar from "./AdminNavbar";

interface ErrorResponse {
  error: string;
}

const ActivityLogPage: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);

  const [formData, setFormData] = useState<ActivityLogRequest>({
    action: "",
    description: "",
    module: "",
  });

  useEffect(() => {
    checkAuth();
    fetchLogs();
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

  const fetchLogs = async (): Promise<void> => {
    try {
      const response = await axios.get<ActivityLog[]>(
        "/api/admin/activity-logs",
        { withCredentials: true },
      );
      setLogs(response.data);
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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!formData.action || !formData.module) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      await axios.post("/api/admin/activity-logs", formData, {
        withCredentials: true,
      });

      fetchLogs();
      setShowForm(false);
      setFormData({
        action: "",
        description: "",
        module: "",
      });
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminNavbar userName={user?.full_name} />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                บันทึกการทำกิจกรรม
              </h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                {showForm ? "ยกเลิก" : "เพิ่มบันทึก"}
              </button>
            </div>

            {/* Form */}
            {showForm && (
              <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      การกระทำ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.action}
                      onChange={(e) =>
                        setFormData({ ...formData, action: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="เช่น เพิ่มรายรับ, แก้ไขข้อมูล"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      โมดูล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.module}
                      onChange={(e) =>
                        setFormData({ ...formData, module: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="เช่น transaction, registration"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      รายละเอียด
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                      placeholder="รายละเอียดเพิ่มเติม"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                  >
                    บันทึก
                  </button>
                </div>
              </form>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Logs Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      วันที่/เวลา
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      ผู้ทำ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      การกระทำ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      โมดูล
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      รายละเอียด
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-purple-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-purple-700">
                          {log.user?.full_name || "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.user?.username || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {log.action}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {log.description || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogPage;

