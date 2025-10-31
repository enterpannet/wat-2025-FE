import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import {
  Province,
  District,
  SubDistrict,
  RegistrationFormData,
  RegistrationRequest,
} from "../types";
import PublicNavbar from "./PublicNavbar";

interface RegistrationFormProps {
  onSuccess?: () => void;
}

interface ErrorResponse {
  error: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    full_name: "",
    nickname: "",
    birth_date: "",
    province_id: "",
    district_id: "",
    sub_district_id: "",
    address_detail: "",
    phone_number: "",
    temple_name: "",
    medical_condition: "",
    vassa: "",
  });

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);
  const [zipCode, setZipCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (formData.province_id) {
      fetchDistricts(formData.province_id);
      setFormData((prev) => ({
        ...prev,
        district_id: "",
        sub_district_id: "",
      }));
      setSubDistricts([]);
    }
  }, [formData.province_id]);

  useEffect(() => {
    if (formData.district_id) {
      fetchSubDistricts(formData.district_id);
      setFormData((prev) => ({ ...prev, sub_district_id: "" }));
      setZipCode("");
    }
  }, [formData.district_id]);

  const fetchProvinces = async (): Promise<void> => {
    try {
      const response = await axios.get<Province[]>("/api/public/provinces");
      setProvinces(response.data);
    } catch (err) {
      console.error("Error fetching provinces:", err);
    }
  };

  const fetchDistricts = async (provinceId: string): Promise<void> => {
    try {
      const response = await axios.get<District[]>(
        `/api/public/provinces/${provinceId}/districts`,
      );
      setDistricts(response.data);
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  };

  const fetchSubDistricts = async (districtId: string): Promise<void> => {
    try {
      const response = await axios.get<SubDistrict[]>(
        `/api/public/districts/${districtId}/sub-districts`,
      );
      setSubDistricts(response.data);
    } catch (err) {
      console.error("Error fetching sub-districts:", err);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Update zip code when sub-district changes
    if (name === "sub_district_id" && value) {
      const selectedSubDistrict = subDistricts.find(
        (sd) => sd.id === parseInt(value),
      );
      setZipCode(selectedSubDistrict?.zip_code || "");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData: RegistrationRequest = {
        ...formData,
        province_id: parseInt(formData.province_id),
        district_id: parseInt(formData.district_id),
        sub_district_id: parseInt(formData.sub_district_id),
        vassa: formData.vassa ? parseInt(formData.vassa) : 0,
      };

      await axios.post("/api/public/registrations", submitData);
      setSuccess(true);

      setFormData({
        full_name: "",
        nickname: "",
        birth_date: "",
        province_id: "",
        district_id: "",
        sub_district_id: "",
        address_detail: "",
        phone_number: "",
        temple_name: "",
        medical_condition: "",
        vassa: "",
      });

      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(
        axiosError.response?.data?.error || "เกิดข้อผิดพลาดในการลงทะเบียน",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <PublicNavbar currentPage="registration" />
      
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">ระบบลงทะเบียน</h1>
            <p className="text-gray-600 text-sm">สำหรับประชาชนทั่วไป</p>
          </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            แบบฟอร์มลงทะเบียน
          </h2>

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              ลงทะเบียนสำเร็จ!
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
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ฉายา
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="กรอกฉายา"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  วันเกิด <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="0812345678"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                ที่อยู่
              </h3>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    จังหวัด <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="province_id"
                    value={formData.province_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">เลือกจังหวัด</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name_th}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    อำเภอ/เขต <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="district_id"
                    value={formData.district_id}
                    onChange={handleChange}
                    required
                    disabled={!formData.province_id}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                  >
                    <option value="">เลือกอำเภอ/เขต</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name_th}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ตำบล/แขวง <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sub_district_id"
                    value={formData.sub_district_id}
                    onChange={handleChange}
                    required
                    disabled={!formData.district_id}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                  >
                    <option value="">เลือกตำบล/แขวง</option>
                    {subDistricts.map((subDistrict) => (
                      <option key={subDistrict.id} value={subDistrict.id}>
                        {subDistrict.name_th}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    รหัสไปรษณีย์
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    readOnly
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    placeholder="เลือกตำบลเพื่อแสดงรหัสไปรษณีย์"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  รายละเอียดที่อยู่ <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address_detail"
                  value={formData.address_detail}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="เลขที่ หมู่ ซอย ถนน"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่อวัด
                </label>
                <input
                  type="text"
                  name="temple_name"
                  value={formData.temple_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="กรอกชื่อวัด"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  พรรษา
                </label>
                <input
                  type="number"
                  name="vassa"
                  value={formData.vassa}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="กรอกจำนวนพรรษา"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  โรคประจำตัว
                </label>
                <input
                  type="text"
                  name="medical_condition"
                  value={formData.medical_condition}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="ระบุโรคประจำตัว (ถ้ามี)"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังบันทึก..." : "ลงทะเบียน"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
