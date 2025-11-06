import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import api, { AxiosError } from "../../api";
import { Registration, Province, District, SubDistrict } from "../../types";
import AdminNavbar from "./AdminNavbar";
import AlertModal from "../common/AlertModal";
import Modal from "../common/Modal";
import ConfirmModal from "../common/ConfirmModal";

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
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);
  const [provinceSearch, setProvinceSearch] = useState<string>("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState<boolean>(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
    isOpen: false,
    message: "",
    type: "info",
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    fullName?: string;
  }>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    checkAuth();
    fetchRegistrations();
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (editFormData.province_id && showEditModal) {
      fetchDistricts(editFormData.province_id.toString());
    }
  }, [editFormData.province_id, showEditModal]);

  useEffect(() => {
    if (editFormData.district_id && showEditModal) {
      fetchSubDistricts(editFormData.district_id.toString());
    }
  }, [editFormData.district_id, showEditModal]);

  const fetchProvinces = async (): Promise<void> => {
    try {
      const response = await api.get<Province[]>("/api/public/provinces");
      if (Array.isArray(response.data)) {
        setProvinces(response.data);
      }
    } catch (err) {
      console.error("Error fetching provinces:", err);
    }
  };

  const fetchDistricts = async (provinceId: string): Promise<void> => {
    try {
      const response = await api.get<District[]>(
        `/api/public/provinces/${provinceId}/districts`,
      );
      if (Array.isArray(response.data)) {
        setDistricts(response.data);
      }
    } catch (err) {
      console.error("Error fetching districts:", err);
      setDistricts([]);
    }
  };

  const fetchSubDistricts = async (districtId: string): Promise<void> => {
    try {
      const response = await api.get<SubDistrict[]>(
        `/api/public/districts/${districtId}/sub-districts`,
      );
      if (Array.isArray(response.data)) {
        setSubDistricts(response.data);
      }
    } catch (err) {
      console.error("Error fetching sub-districts:", err);
      setSubDistricts([]);
    }
  };

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

  const showAlert = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    setAlertModal({ isOpen: true, message, type });
  };

  const handleDelete = (id: number, fullName: string): void => {
    setConfirmModal({
      isOpen: true,
      message: `คุณต้องการลบข้อมูลของ ${fullName} ใช่หรือไม่?`,
      onConfirm: async () => {
        try {
          await api.delete(`/api/admin/registrations/${id}`);
          setRegistrations((prev) => prev.filter((reg) => reg.id !== id));
          showAlert("ลบข้อมูลสำเร็จ", "success");
        } catch (err) {
          const axiosError = err as AxiosError<ErrorResponse>;
          showAlert(axiosError.response?.data?.error || "ไม่สามารถลบข้อมูลได้", "error");
        }
      },
      fullName,
    });
  };

  // Format date from ค.ศ. (YYYY-MM-DD) to พ.ศ. (DD/MM/YYYY)
  const formatDateToBE = (ceDate: string): string => {
    if (!ceDate) return "";
    const date = new Date(ceDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const beYear = date.getFullYear() + 543;
    return `${day}/${month}/${beYear}`;
  };

  // Parse พ.ศ. date (DD/MM/YYYY) to ค.ศ. (YYYY-MM-DD)
  const parseBEDateToCE = (beDate: string): string => {
    if (!beDate) return "";
    const parts = beDate.split("/");
    if (parts.length === 3) {
      const [day, month, beYear] = parts;
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const beYearNum = parseInt(beYear);
      
      // Validate date parts
      if (isNaN(dayNum) || isNaN(monthNum) || isNaN(beYearNum)) {
        return "";
      }
      
      // Validate ranges
      if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || beYearNum < 2400) {
        return "";
      }
      
      const ceYear = beYearNum - 543;
      return `${ceYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return "";
  };

  // Format date input: auto-add "/" when typing numbers
  const formatDateInput = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
  };

  const handleEdit = async (registration: Registration): Promise<void> => {
    try {
      setEditingId(registration.id);
      // Format birth_date to พ.ศ. (DD/MM/YYYY)
      const birthDateBE = formatDateToBE(registration.birth_date);
      
      setEditFormData({
        full_name: registration.full_name,
        nickname: registration.nickname || "",
        phone_number: registration.phone_number,
        address_detail: registration.address_detail,
        temple_name: registration.temple_name || "",
        medical_condition: registration.medical_condition || "",
        vassa: registration.vassa || 0,
        birth_date: birthDateBE,
        province_id: registration.province_id,
        district_id: registration.district_id,
        sub_district_id: registration.sub_district_id,
      });
      
      // Set province search
      const selectedProvince = provinces.find(p => p.id === registration.province_id);
      if (selectedProvince) {
        setProvinceSearch(selectedProvince.name_th);
      } else {
        setProvinceSearch("");
        // If province not found in list, try to fetch it
        if (registration.province_id && provinces.length === 0) {
          await fetchProvinces();
          const provinceAfterFetch = provinces.find(p => p.id === registration.province_id);
          if (provinceAfterFetch) {
            setProvinceSearch(provinceAfterFetch.name_th);
          }
        }
      }
      
      // Load districts and sub-districts if province/district is selected
      if (registration.province_id) {
        await fetchDistricts(registration.province_id.toString());
      }
      if (registration.district_id) {
        await fetchSubDistricts(registration.district_id.toString());
      }
      
      setShowEditModal(true);
    } catch (err) {
      console.error("Error opening edit modal:", err);
      showAlert("ไม่สามารถเปิดฟอร์มแก้ไขได้", "error");
    }
  };

  const handleEditFormChange = async (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): Promise<void> => {
    const { name, value } = e.target;
    
    if (name === "birth_date") {
      const formatted = formatDateInput(value);
      setEditFormData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "province_id") {
      const provinceId = parseInt(value);
      setEditFormData((prev) => ({
        ...prev,
        province_id: provinceId,
        district_id: 0,
        sub_district_id: 0,
      }));
      setDistricts([]);
      setSubDistricts([]);
      // Load districts for selected province
      if (provinceId) {
        await fetchDistricts(provinceId.toString());
      }
    } else if (name === "district_id") {
      const districtId = parseInt(value);
      setEditFormData((prev) => ({
        ...prev,
        district_id: districtId,
        sub_district_id: 0,
      }));
      setSubDistricts([]);
      // Load sub-districts for selected district
      if (districtId) {
        await fetchSubDistricts(districtId.toString());
      }
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!editingId) return;
    
    try {
      // Validate required fields
      if (!editFormData.full_name || !editFormData.phone_number || !editFormData.address_detail) {
        showAlert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", "warning");
        return;
      }

      if (!editFormData.province_id || !editFormData.district_id || !editFormData.sub_district_id) {
        showAlert("กรุณาเลือกจังหวัด อำเภอ และตำบล", "warning");
        return;
      }

      // Convert birth_date from พ.ศ. (DD/MM/YYYY) to ค.ศ. (YYYY-MM-DD)
      const ceBirthDate = parseBEDateToCE(editFormData.birth_date as string);
      
      if (!ceBirthDate) {
        showAlert("รูปแบบวันเกิดไม่ถูกต้อง กรุณาใช้รูปแบบ DD/MM/YYYY (เช่น 15/03/2545)", "warning");
        return;
      }
      
      // Prepare data for API - ensure all fields are properly formatted
      // Backend expects uint for IDs, so we need to ensure they are numbers, not strings
      const updateData = {
        full_name: String(editFormData.full_name || "").trim(),
        nickname: String(editFormData.nickname || "").trim(),
        phone_number: String(editFormData.phone_number || "").trim(),
        address_detail: String(editFormData.address_detail || "").trim(),
        temple_name: String(editFormData.temple_name || "").trim(),
        medical_condition: String(editFormData.medical_condition || "").trim(),
        vassa: Number(editFormData.vassa || 0),
        birth_date: ceBirthDate,
        province_id: Number(editFormData.province_id),
        district_id: Number(editFormData.district_id),
        sub_district_id: Number(editFormData.sub_district_id),
      };

      // Validate IDs are valid numbers (greater than 0)
      if (!updateData.province_id || updateData.province_id === 0 || isNaN(updateData.province_id)) {
        showAlert("กรุณาเลือกจังหวัด", "warning");
        return;
      }
      if (!updateData.district_id || updateData.district_id === 0 || isNaN(updateData.district_id)) {
        showAlert("กรุณาเลือกอำเภอ", "warning");
        return;
      }
      if (!updateData.sub_district_id || updateData.sub_district_id === 0 || isNaN(updateData.sub_district_id)) {
        showAlert("กรุณาเลือกตำบล", "warning");
        return;
      }

      // Validate birth_date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(updateData.birth_date)) {
        showAlert(`รูปแบบวันเกิดไม่ถูกต้อง: ${updateData.birth_date}. ควรเป็น YYYY-MM-DD`, "warning");
        return;
      }

      // Debug: Log the data being sent
      console.log("Sending update data:", JSON.stringify(updateData, null, 2));
      console.log("Birth date:", ceBirthDate);
      console.log("Province ID:", updateData.province_id, typeof updateData.province_id);
      console.log("District ID:", updateData.district_id, typeof updateData.district_id);
      console.log("Sub District ID:", updateData.sub_district_id, typeof updateData.sub_district_id);

      await api.put(`/api/admin/registrations/${editingId}`, updateData);
      await fetchRegistrations();
      handleCancelEdit();
      showAlert("บันทึกข้อมูลสำเร็จ", "success");
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || axiosError.message || "ไม่สามารถบันทึกข้อมูลได้";
      console.error("Update error:", axiosError.response?.data);
      showAlert(errorMessage, "error");
    }
  };

  const handleCancelEdit = (): void => {
    setEditingId(null);
    setEditFormData({});
    setShowEditModal(false);
    setProvinceSearch("");
    setShowProvinceDropdown(false);
    setDistricts([]);
    setSubDistricts([]);
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
                จัดการข้อมูลผู้ลงทะเบียนพระปริวาส
              </h1>
              <p className="text-lg text-gray-600">
                จัดการข้อมูลผู้ลงทะเบียนทั้งหมด ({registrations.length} รายการ)
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                🏠 ลงทะเบียนพระปริวาส
              </button>
              <button
                onClick={() => navigate("/admin/registration/detail")}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                📋 ตรารางสวด →
              </button>
            </div>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCancelEdit}
        title="แก้ไขข้อมูลผู้ลงทะเบียน"
        size="xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveEdit();
          }}
          className="space-y-6"
        >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ชื่อ-นามสกุล */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ชื่อ-นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={editFormData.full_name || ""}
                      onChange={handleEditFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* ฉายา */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ฉายา
                    </label>
                    <input
                      type="text"
                      name="nickname"
                      value={editFormData.nickname || ""}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* วันเกิด */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      วันเกิด (พ.ศ.) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="birth_date"
                      value={editFormData.birth_date || ""}
                      onChange={handleEditFormChange}
                      placeholder="DD/MM/YYYY"
                      pattern="\d{2}/\d{2}/\d{4}"
                      maxLength={10}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      title="รูปแบบ: DD/MM/YYYY (เช่น 15/03/2545)"
                    />
                  </div>

                  {/* เบอร์โทรศัพท์ */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      value={editFormData.phone_number || ""}
                      onChange={handleEditFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* ชื่อวัด */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ชื่อวัด
                    </label>
                    <input
                      type="text"
                      name="temple_name"
                      value={editFormData.temple_name || ""}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* พรรษา */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      พรรษา
                    </label>
                    <input
                      type="number"
                      name="vassa"
                      value={editFormData.vassa || 0}
                      onChange={handleEditFormChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* ที่อยู่ */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ที่อยู่ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address_detail"
                    value={editFormData.address_detail || ""}
                    onChange={handleEditFormChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* จังหวัด */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    จังหวัด <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={provinceSearch}
                      onChange={(e) => {
                        setProvinceSearch(e.target.value);
                        setShowProvinceDropdown(true);
                      }}
                      onFocus={() => setShowProvinceDropdown(true)}
                      placeholder="พิมพ์ค้นหาจังหวัด..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {showProvinceDropdown && provinces.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {provinces
                          .filter((p) =>
                            p.name_th
                              .toLowerCase()
                              .includes(provinceSearch.toLowerCase())
                          )
                          .map((province) => (
                            <div
                              key={province.id}
                              onClick={async () => {
                                setEditFormData((prev) => ({
                                  ...prev,
                                  province_id: province.id,
                                  district_id: 0,
                                  sub_district_id: 0,
                                }));
                                setProvinceSearch(province.name_th);
                                setShowProvinceDropdown(false);
                                setDistricts([]);
                                setSubDistricts([]);
                                // Load districts for selected province
                                await fetchDistricts(province.id.toString());
                              }}
                              className="px-4 py-2 hover:bg-purple-100 cursor-pointer"
                            >
                              {province.name_th}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* อำเภอ */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    อำเภอ <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="district_id"
                    value={editFormData.district_id || ""}
                    onChange={handleEditFormChange}
                    required
                    disabled={!editFormData.province_id}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">เลือกอำเภอ</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name_th}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ตำบล */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ตำบล <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sub_district_id"
                    value={editFormData.sub_district_id || ""}
                    onChange={handleEditFormChange}
                    required
                    disabled={!editFormData.district_id}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">เลือกตำบล</option>
                    {subDistricts.map((subDistrict) => (
                      <option key={subDistrict.id} value={subDistrict.id}>
                        {subDistrict.name_th} ({subDistrict.zip_code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* โรคประจำตัว */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    โรคประจำตัว
                  </label>
                  <textarea
                    name="medical_condition"
                    value={editFormData.medical_condition || ""}
                    onChange={handleEditFormChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-lg"
                  >
                    💾 บันทึกข้อมูล
                  </button>
                </div>
              </form>
      </Modal>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        message={alertModal.message}
        type={alertModal.type}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        type="danger"
        confirmText="ลบ"
        cancelText="ยกเลิก"
      />
    </div>
  );
};

export default RegistrationDashboard;
