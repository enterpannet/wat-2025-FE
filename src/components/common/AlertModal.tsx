import React from "react";
import Modal from "./Modal";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  confirmText?: string;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  confirmText = "ตกลง",
}) => {
  const typeStyles = {
    success: {
      icon: "✅",
      bgColor: "bg-green-50",
      borderColor: "border-green-400",
      textColor: "text-green-700",
      buttonColor: "bg-green-500 hover:bg-green-600",
    },
    error: {
      icon: "❌",
      bgColor: "bg-red-50",
      borderColor: "border-red-400",
      textColor: "text-red-700",
      buttonColor: "bg-red-500 hover:bg-red-600",
    },
    warning: {
      icon: "⚠️",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-400",
      textColor: "text-yellow-700",
      buttonColor: "bg-yellow-500 hover:bg-yellow-600",
    },
    info: {
      icon: "ℹ️",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-400",
      textColor: "text-blue-700",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
    },
  };

  const style = typeStyles[type];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <div className={`p-4 ${style.bgColor} border ${style.borderColor} rounded-lg mb-4`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">{style.icon}</span>
          <p className={`${style.textColor} font-medium`}>{message}</p>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className={`px-6 py-2 ${style.buttonColor} text-white rounded-lg transition-colors font-semibold`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default AlertModal;

