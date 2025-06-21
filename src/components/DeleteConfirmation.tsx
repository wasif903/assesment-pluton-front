import React from 'react';
import { toast } from 'react-toastify';

interface DeleteConfirmationProps {
  title: string;
  itemName: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const showDeleteConfirmation = async ({
  title,
  itemName,
  onConfirm,
  onCancel
}: DeleteConfirmationProps): Promise<boolean> => {
  return new Promise((resolve) => {
    toast.info(
      <div className="text-center">
        <p className="font-semibold mb-2">{title}</p>
        <p className="text-sm text-gray-600 mb-4">"{itemName}"</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => {
              toast.dismiss();
              onConfirm();
              resolve(true);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => {
              toast.dismiss();
              onCancel?.();
              resolve(false);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  });
};

export default showDeleteConfirmation; 