import React, { useEffect } from "react";
import {
  FacebookFilled,
  InstagramFilled,
  TwitterSquareFilled,
  LinkedinFilled,
  ArrowRightOutlined,
} from "@ant-design/icons";

export const SocialAccount = ({ onContinue, onClose }) => {
  
  const platforms = [
    {
      name: "Facebook",
      icon: <FacebookFilled className="text-blue-600" />,
    },
    {
      name: "Instagram",
      icon: <InstagramFilled className="text-pink-500" />,
    },
    {
      name: "Twitter",
      icon: <TwitterSquareFilled className="text-sky-500" />,
    },
    { name: "LinkedIn", icon: <LinkedinFilled className="text-blue-700" /> },
  ];

  return (
    <div className="relative max-w-md mx-auto p-6">
      <h2 className="text-2xl text-purple-700 font-semibold text-center mb-6">
        Connect Your Social Accounts
      </h2>

      <div className="space-y-3">
        {platforms.map((platform, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              {platform.icon}
              <span className="text-sm font-medium">{platform.name}</span>
            </div>
            <ArrowRightOutlined className="text-gray-400" />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={onClose}
          className="text-lg font-bold hover:text-black"
        >
          Do this later
        </button>
        <button
          onClick={onContinue}
          className="bg-purple-500 text-white px-6 py-2 rounded-md hover:bg-purple-600"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
};
