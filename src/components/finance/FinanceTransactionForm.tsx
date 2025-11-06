import { useState, useEffect } from "react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { AxiosError } from "../../api";
import FinanceNavbar from "./FinanceNavbar";
import Modal from "../common/Modal";
import { FinanceTransactionRequest } from "../../types";

const FinanceTransactionForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState<FinanceTransactionRequest>({
    type: "income",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    image_urls: [],
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraVideoRef, setCameraVideoRef] = useState<HTMLVideoElement | null>(null);

  // Load transaction data if editing
  useEffect(() => {
    if (isEdit && id) {
      const loadTransaction = async () => {
        try {
          setLoadingData(true);
          const response = await api.get(`/api/finance/transactions/${id}`);
          const transaction = response.data;
          setFormData({
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            date: new Date(transaction.date).toISOString().split("T")[0],
            category: transaction.category || "",
            image_urls: transaction.image_urls || [],
          });
          setImagePreviews(transaction.image_urls || []);
        } catch (err) {
          const axiosError = err as AxiosError;
          setError(
            (axiosError.response?.data as { error?: string })?.error ||
              "ไม่สามารถโหลดข้อมูลได้"
          );
        } finally {
          setLoadingData(false);
        }
      };
      loadTransaction();
    }
  }, [isEdit, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate amount
      if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0) {
        setError("กรุณากรอกจำนวนเงินที่ถูกต้อง");
        setLoading(false);
        return;
      }

      // Prepare request data
      const requestData: FinanceTransactionRequest = {
        type: formData.type,
        amount: formData.amount,
        description: formData.description,
        date: formData.date,
        category: formData.category,
        image_urls: formData.image_urls && formData.image_urls.length > 0 ? formData.image_urls : undefined,
      };

      if (isEdit && id) {
        await api.put(`/api/finance/transactions/${id}`, requestData);
      } else {
        await api.post("/api/finance/transactions", requestData);
      }
      navigate("/finance");
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(
        (axiosError.response?.data as { error?: string })?.error || "ไม่สามารถบันทึกข้อมูลได้"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check total images (including existing)
    const totalImages = imagePreviews.length + files.length;
    if (totalImages > 5) {
      setError(`สามารถอัพโหลดได้สูงสุด 5 ภาพ (ปัจจุบันมี ${imagePreviews.length} ภาพ)`);
      return;
    }

    // Validate all files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        setError("กรุณาเลือกไฟล์ภาพเท่านั้น");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("ขนาดไฟล์ต้องไม่เกิน 10MB");
        return;
      }
    }

    setUploadingImage(true);
    setError("");

    // Upload all files
    const uploadPromises = Array.from(files).map(async (file) => {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      const response = await api.post<{ success: boolean; image_url: string }>(
        "/api/finance/upload-image",
        formDataUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.image_url;
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const newImageUrls = [...(formData.image_urls || []), ...uploadedUrls];
      setFormData({ ...formData, image_urls: newImageUrls });
      setImagePreviews(newImageUrls);
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(
        (axiosError.response?.data as { error?: string })?.error ||
          "ไม่สามารถอัพโหลดภาพได้"
      );
    } finally {
      setUploadingImage(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImageUrls = formData.image_urls?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, image_urls: newImageUrls });
    setImagePreviews(newImageUrls);
  };

  // Camera functions
  const startCamera = async () => {
    try {
      if (imagePreviews.length >= 5) {
        setError(`สามารถอัพโหลดได้สูงสุด 5 ภาพ (ปัจจุบันมี ${imagePreviews.length} ภาพ)`);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // ใช้กล้องหลัง
      });
      setCameraStream(stream);
      setShowCamera(true);
      setError("");

      if (cameraVideoRef) {
        cameraVideoRef.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการอนุญาต");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    if (cameraVideoRef) {
      cameraVideoRef.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!cameraVideoRef) return;

    const canvas = document.createElement("canvas");
    canvas.width = cameraVideoRef.videoWidth;
    canvas.height = cameraVideoRef.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(cameraVideoRef, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // Convert blob to File
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });

      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        setError("ขนาดไฟล์ต้องไม่เกิน 10MB");
        stopCamera();
        return;
      }

      // Stop camera
      stopCamera();

      // Upload the photo
      setUploadingImage(true);
      setError("");

      try {
        const formDataUpload = new FormData();
        formDataUpload.append("image", file);

        const response = await api.post<{ success: boolean; image_url: string }>(
          "/api/finance/upload-image",
          formDataUpload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const newImageUrls = [...(formData.image_urls || []), response.data.image_url];
        setFormData({ ...formData, image_urls: newImageUrls });
        setImagePreviews(newImageUrls);
      } catch (err) {
        const axiosError = err as AxiosError;
        setError(
          (axiosError.response?.data as { error?: string })?.error ||
            "ไม่สามารถอัพโหลดภาพได้"
        );
      } finally {
        setUploadingImage(false);
      }
    }, "image/jpeg", 0.9);
  };

  // Set video ref when component mounts or cameraVideoRef changes
  useEffect(() => {
    if (showCamera && cameraVideoRef && cameraStream) {
      cameraVideoRef.srcObject = cameraStream;
      cameraVideoRef.play();
    }
  }, [showCamera, cameraStream, cameraVideoRef]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100">
        <FinanceNavbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100">
      <FinanceNavbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isEdit ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
            </h1>
            <p className="text-gray-600">
              {isEdit ? "แก้ไขข้อมูลรายการรายรับรายจ่าย" : "กรอกข้อมูลรายการรายรับรายจ่ายใหม่"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ประเภท <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "income" | "expense",
                  })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="income">รายรับ</option>
                <option value="expense">รายจ่าย</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                จำนวนเงิน <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={isNaN(formData.amount) ? "" : formData.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === "" ? 0 : parseFloat(value);
                  setFormData({ 
                    ...formData, 
                    amount: isNaN(numValue) ? 0 : numValue 
                  });
                }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                รายละเอียด <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="กรอกรายละเอียด"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                วันที่ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                หมวดหมู่
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="เช่น บุญบารมี, ค่าใช้จ่ายทั่วไป"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                รูปภาพ (สูงสุด 5 ภาพ) {imagePreviews.length > 0 && `(${imagePreviews.length}/5)`}
              </label>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {imagePreviews.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {imagePreviews.length < 5 && (
                <div className="flex gap-3">
                  {/* File Upload Button */}
                  <div className="flex-1">
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        uploadingImage
                          ? "border-gray-300 bg-gray-100"
                          : "border-gray-300 hover:border-green-500 hover:bg-green-50"
                      }`}
                    >
                      {uploadingImage ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                          <span className="text-sm text-gray-600">กำลังอัพโหลด...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <svg
                            className="w-10 h-10 text-gray-400 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">
                            📁 เลือกไฟล์
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            JPEG, PNG, GIF, WebP
                          </span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Camera Button */}
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={uploadingImage}
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors ${
                        uploadingImage
                          ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                          : "border-gray-300 hover:border-green-500 hover:bg-green-50 cursor-pointer"
                      }`}
                    >
                      <svg
                        className="w-10 h-10 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">
                        📷 ถ่ายรูป
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        ใช้กล้องถ่ายรูป
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-800 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/finance")}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <Modal
          isOpen={showCamera}
          onClose={stopCamera}
          title="ถ่ายรูป"
          size="md"
        >
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={(ref) => setCameraVideoRef(ref)}
                autoPlay
                playsInline
                className="w-full h-auto max-h-[60vh]"
                style={{ transform: "scaleX(-1)" }} // Mirror the video
              />
            </div>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={stopCamera}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg flex items-center gap-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                ถ่ายรูป
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FinanceTransactionForm;

