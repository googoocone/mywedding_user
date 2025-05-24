// components/AlertDialog.tsx
import React from "react";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  message,
  confirmText = "확인",
  cancelText = "취소", // '취소' 버튼을 추가하여 모달을 닫을 수 있게 합니다.
}: AlertDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600/70 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full mx-4">
        <p className="text-gray-800 text-lg mb-6 text-center">{message}</p>
        <div className="flex justify-around space-x-4">
          <button
            onClick={onConfirm}
            className="flex-1 cursor-pointer py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
