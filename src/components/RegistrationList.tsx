import { useState, useEffect } from "react";
import axios from "axios";
import { Registration } from "../types";

const RegistrationList: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async (): Promise<void> => {
    try {
      const response = await axios.get<Registration[]>("/api/registrations");
      setRegistrations(response.data);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลได้");
      console.error("Error fetching registrations:", err);
    } finally {
      setLoading(false);
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
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center text-red-600">
          <p className="text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        รายการลงทะเบียน
      </h2>

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
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 text-sm text-gray-600 text-center">
            ทั้งหมด {registrations.length} รายการ
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationList;
