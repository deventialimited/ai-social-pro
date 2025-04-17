import React, { Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Sparkles } from "lucide-react";
import clsx from "clsx";

export const FirstPostPopUp = ({ title, description, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(onClose, 9000);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, onClose]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        {/* Backdrop */}
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

        {/* Modal wrapper */}
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
              <div className="flex flex-col items-center space-y-8 text-center">
                {/* Loader */}
                <div className="relative w-32 h-32">
                  <div
                    className={clsx(
                      "w-full h-full rounded-full border-8 border-purple-500/50 border-t-transparent animate-spin",
                      "bg-gradient-to-br from-purple-500 to-blue-500 shadow-2xl",
                      "animate-pulse"
                    )}
                  />
                  <Sparkles
                    className="absolute inset-0 m-auto w-12 h-12 text-white animate-bounce"
                    strokeWidth={2}
                  />
                </div>

                {/* Title */}
                <Dialog.Title
                  as="h2"
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  {title}
                </Dialog.Title>

                {/* Description */}
                <p className="text-base text-gray-600 dark:text-gray-400 max-w-md">
                  {description}
                </p>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
