import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import api, { AxiosError } from "../api";
import {
  Province,
  District,
  SubDistrict,
  RegistrationFormData,
  RegistrationRequest,
} from "../types";
import PublicNavbar from "./PublicNavbar";
import AlertModal from "./common/AlertModal";

interface RegistrationFormProps {
  onSuccess?: () => void;
  pageTitle?: string;
  formTitle?: string;
  successMessage?: string;
  description?: string;
  submitPath?: string;
}

interface ErrorResponse {
  error: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSuccess,
  pageTitle = "ระบบลงทะเบียน",
  formTitle = "แบบฟอร์มลงทะเบียน",
  successMessage = "ลงทะเบียนเสร็จแล้ว",
  description,
  submitPath = "/api/public/registrations",
}) => {
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
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [provinceSearch, setProvinceSearch] = useState<string>("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState<boolean>(false);

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
      // Update province search to show selected province name
      const selectedProvince = provinces.find(p => p.id === parseInt(formData.province_id));
      if (selectedProvince) {
        setProvinceSearch(selectedProvince.name_th);
      }
    }
  }, [formData.province_id, provinces]);

  useEffect(() => {
    if (formData.district_id) {
      fetchSubDistricts(formData.district_id);
      setFormData((prev) => ({ ...prev, sub_district_id: "" }));
      setZipCode("");
    }
  }, [formData.district_id]);

  const fetchProvinces = async (): Promise<void> => {
    try {
      const response = await api.get<Province[]>("/api/public/provinces");
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setProvinces(response.data);
      } else {
        console.error("Invalid provinces data:", response.data);
        setProvinces([]);
      }
    } catch (err) {
      console.error("Error fetching provinces:", err);
      setProvinces([]); // Ensure it's always an array
    }
  };

  const fetchDistricts = async (provinceId: string): Promise<void> => {
    try {
      const response = await api.get<District[]>(
        `/api/public/provinces/${provinceId}/districts`,
      );
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setDistricts(response.data);
      } else {
        console.error("Invalid districts data:", response.data);
        setDistricts([]);
      }
    } catch (err) {
      console.error("Error fetching districts:", err);
      setDistricts([]); // Ensure it's always an array
    }
  };

  const fetchSubDistricts = async (districtId: string): Promise<void> => {
    try {
      const response = await api.get<SubDistrict[]>(
        `/api/public/districts/${districtId}/sub-districts`,
      );
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setSubDistricts(response.data);
      } else {
        console.error("Invalid sub-districts data:", response.data);
        setSubDistricts([]);
      }
    } catch (err) {
      console.error("Error fetching sub-districts:", err);
      setSubDistricts([]); // Ensure it's always an array
    }
  };

  // Format date input: auto-add "/" when typing numbers
  const formatDateInput = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");
    
    // Format: DD/MM/YYYY
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
  };

  // Parse พ.ศ. date (DD/MM/YYYY) to ค.ศ. (YYYY-MM-DD)
  const parseBEDateToCE = (beDate: string): string => {
    if (!beDate) return "";
    // Format: DD/MM/YYYY
    const parts = beDate.split("/");
    if (parts.length === 3) {
      const [day, month, beYear] = parts;
      const ceYear = parseInt(beYear) - 543; // Convert พ.ศ. to ค.ศ.
      return `${ceYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return beDate;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    
    // Handle birth_date specially for พ.ศ.
    if (name === "birth_date") {
      // Format input automatically: DD/MM/YYYY
      const formatted = formatDateInput(value);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

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
      // Convert birth_date from พ.ศ. (DD/MM/YYYY) to ค.ศ. (YYYY-MM-DD)
      const ceBirthDate = parseBEDateToCE(formData.birth_date);
      
      const submitData: RegistrationRequest = {
        ...formData,
        birth_date: ceBirthDate,
        province_id: parseInt(formData.province_id),
        district_id: parseInt(formData.district_id),
        sub_district_id: parseInt(formData.sub_district_id),
        vassa: formData.vassa ? parseInt(formData.vassa) : 0,
      };

      await api.post(submitPath, submitData);
      setIsSuccessModalOpen(true);

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
      setProvinceSearch("");
      setShowProvinceDropdown(false);

    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(
        axiosError.response?.data?.error || "เกิดข้อผิดพลาดในการลงทะเบียน",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = (): void => {
    setIsSuccessModalOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <PublicNavbar />
      
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{pageTitle}</h1>
            {description && (
              <p className="text-lg text-gray-600">{description}</p>
            )}
          </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            {formTitle}
          </h2>

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
                  type="text"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="พิมพ์ตัวเลขเท่านั้น เช่น 15032545"
                  pattern="\d{2}/\d{2}/\d{4}"
                  title="พิมพ์ตัวเลข 8 หลัก ระบบจะใส่ / ให้อัตโนมัติ"
                />
                <p className="text-xs text-gray-500 mt-1">
                  พิมพ์ตัวเลข 8 หลัก (วันเดือนปี พ.ศ.) เช่น 15032545 ระบบจะใส่ / ให้อัตโนมัติ
                </p>
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
            </div>

            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                ที่อยู่
              </h3>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    จังหวัด <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={provinceSearch || provinces.find(p => p.id === parseInt(formData.province_id))?.name_th || ""}
                    onChange={(e) => {
                      const searchValue = e.target.value;
                      setProvinceSearch(searchValue);
                      setShowProvinceDropdown(true);
                      // Clear selection if search doesn't match selected province
                      const selectedProvince = provinces.find(p => p.id === parseInt(formData.province_id));
                      if (selectedProvince && !selectedProvince.name_th.includes(searchValue)) {
                        setFormData((prev) => ({
                          ...prev,
                          province_id: "",
                          district_id: "",
                          sub_district_id: "",
                        }));
                        setDistricts([]);
                        setSubDistricts([]);
                        setZipCode("");
                      }
                    }}
                    onFocus={() => setShowProvinceDropdown(true)}
                    onBlur={() => {
                      // Delay to allow click on dropdown item
                      setTimeout(() => setShowProvinceDropdown(false), 200);
                    }}
                    placeholder="พิมพ์ค้นหาจังหวัด..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                  {showProvinceDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {provinces
                        .filter((province) =>
                          province.name_th.toLowerCase().includes(provinceSearch.toLowerCase())
                        )
                        .map((province) => (
                          <div
                            key={province.id}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                province_id: province.id.toString(),
                                district_id: "",
                                sub_district_id: "",
                              }));
                              setProvinceSearch(province.name_th);
                              setShowProvinceDropdown(false);
                              setDistricts([]);
                              setSubDistricts([]);
                              setZipCode("");
                            }}
                            className="px-4 py-2 hover:bg-purple-50 cursor-pointer transition-colors"
                          >
                            {province.name_th}
                          </div>
                        ))}
                      {provinces.filter((province) =>
                        province.name_th.toLowerCase().includes(provinceSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          ไม่พบจังหวัดที่ค้นหา
                        </div>
                      )}
                    </div>
                  )}
                  {formData.province_id && (
                    <input
                      type="hidden"
                      name="province_id"
                      value={formData.province_id}
                      required
                    />
                  )}
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
    <AlertModal
      isOpen={isSuccessModalOpen}
      onClose={handleSuccessModalClose}
      title="สำเร็จ"
      message={successMessage}
      type="success"
      confirmText="ตกลง"
    />
  </div>
  );
};

export default RegistrationForm;
