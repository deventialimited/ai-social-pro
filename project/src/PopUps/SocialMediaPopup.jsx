import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  FacebookFilled,
  InstagramFilled,
  TwitterSquareFilled,
  LinkedinFilled,
  ArrowRightOutlined,
  TikTokOutlined,
} from "@ant-design/icons";

const iconMap = {
  facebook: <FacebookFilled className="text-blue-600" />,
  instagram: <InstagramFilled className="text-pink-500" />,
  linkedin: <LinkedinFilled className="text-blue-700" />,
  twitter: <TwitterSquareFilled className="text-black" />,
  tiktok: <TikTokOutlined className="text-black" />,
};

export const SocialConnectLoader = ({ isOpen, onClose, platform }) => {
  const icon = iconMap[platform?.toLowerCase()];

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-8">
              <div className="flex flex-col items-center space-y-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute w-full h-full rounded-full border-8 border-purple-500/40 border-t-transparent animate-spin" />
                  <div className="text-4xl">{icon}</div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
                  Connecting to{" "}
                  {platform?.charAt(0).toUpperCase() + platform?.slice(1)}...
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Please wait while we securely connect your {platform} account.
                </p>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
