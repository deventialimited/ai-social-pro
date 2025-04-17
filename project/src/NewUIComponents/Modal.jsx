import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { BusinessSectionDummy } from "./businessDumy";
import { AnalyzeLoader } from "./LoaderAnimation";
import PostTopics from "./PostTopics";
import PostDetails from "./PostDetails";
import { SocialAccount } from "./SocialAccount";

export const BusinessModal = ({ isOpen, onClose }) => {
  const [componentType, setComponentType] = useState("loading");

  useEffect(() => {
    if (isOpen) {
      setComponentType("loading");
      const timer = setTimeout(() => {
        setComponentType("businessData");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
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
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-[90%] sm:max-w-[600px] rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
              {componentType === "loading" && (
                <AnalyzeLoader isOpen={true} onClose={() => {}} />
              )}
              {componentType === "businessData" && (
                <BusinessSectionDummy setComponentType={setComponentType} />
              )}
              {componentType === "postTopics" && (
                <PostTopics setComponentType={setComponentType} />
              )}
              {componentType === "postDetails" && (
                <PostDetails setComponentType={setComponentType} />
              )}
              {componentType === "socialAccount" && <SocialAccount />}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
