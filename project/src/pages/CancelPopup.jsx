  import React from "react";

  export const CancelPopup = ({ onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-red-500">Payment Cancelled</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          <p className="mb-4">
            Your subscription was not processed. You can try again anytime.
          </p>
          <button
            onClick={onClose}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  };
