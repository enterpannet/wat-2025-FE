import { useState, useEffect, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import { DeviceLogRequest } from "../types";
import PublicNavbar from "./PublicNavbar";

interface ErrorResponse {
  error: string;
}

const DeviceLog: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const [formData, setFormData] = useState<DeviceLogRequest>({
    device_type: "",
    device_info: "",
    action: "",
    description: "",
    module: "public",
  });

  useEffect(() => {
    // ตรวจสอบข้อมูลอุปกรณ์
    const detectDevice = (): void => {
      const userAgent = navigator.userAgent;
      let deviceType = "desktop";
      let deviceInfo = "";

      if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
        deviceType = "tablet";
      } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
        deviceType = "mobile";
      }

      deviceInfo = `User Agent: ${userAgent.substring(0, 100)}...`;
      deviceInfo += ` | Screen: ${window.screen.width}x${window.screen.height}`;
      deviceInfo += ` | Language: ${navigator.language}`;

      setFormData((prev) => ({
        ...prev,
        device_type: deviceType,
        device_info: deviceInfo,
      }));
    };

    detectDevice();
  }, []);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!formData.action) {
      setError("กรุณากรอกการกระทำ");
      setLoading(false);
      return;
    }

    try {
      await axios.post("/api/public/device-logs", formData);

      setSuccess(true);
      setFormData({
        device_type: formData.device_type,
        device_info: formData.device_info,
        action: "",
        description: "",
        module: "public",
      });

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(
        axiosError.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <PublicNavbar currentPage="contact" />
      
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              บันทึกข้อมูลอุปกรณ์
            </h1>
            <p className="text-gray-600 text-sm">
              ระบบนี้เป็นไปตามมาตรฐาน PDPA โดยไม่เก็บข้อมูลส่วนบุคคลที่ระบุตัวตน
            </p>
          </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              การคุ้มครองข้อมูลส่วนบุคคล (PDPA)
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• ระบบบันทึกเฉพาะข้อมูลอุปกรณ์เท่านั้น</li>
              <li>• ไม่เก็บข้อมูลส่วนบุคคลที่ระบุตัวตนได้</li>
              <li>• IP Address จะถูกปรับปรุงเพื่อความเป็นส่วนตัว</li>
              <li>• ข้อมูลใช้เพื่อการวิเคราะห์และพัฒนาระบบเท่านั้น</li>
            </ul>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              บันทึกข้อมูลสำเร็จ!
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ประเภทอุปกรณ์
                </label>
                <input
                  type="text"
                  value={formData.device_type}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  โมดูล
                </label>
                <select
                  value={formData.module}
                  onChange={(e) =>
                    setFormData({ ...formData, module: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                >
                  <option value="public">สาธารณะ</option>
                  <option value="registration">ลงทะเบียน</option>
                  <option value="view">ดูข้อมูล</option>
                </select>
              </div>
            </div>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="เช่น ลงทะเบียน, ดูข้อมูล, อัปเดตข้อมูล"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                รายละเอียด
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                rows={4}
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับการกระทำ"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ข้อมูลอุปกรณ์
              </label>
              <textarea
                value={formData.device_info}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                ข้อมูลนี้ถูกตรวจสอบอัตโนมัติและจะไม่ระบุตัวตนคุณ
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </form>
        </div>
        </div>
      </div>
      </div>
    
  );
};

export default DeviceLog;

