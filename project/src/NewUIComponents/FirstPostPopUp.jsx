import React, { Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Sparkles } from "lucide-react";
import clsx from "clsx";

export const FirstPostPopUp = ({
  title,
  data,
  description,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(onClose, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, onClose]);

  return (
    <Transition appear show={isOpen} onClose={onClose} as={Fragment}>
      <Dialog as="div" className="relative z-50">
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
            <Dialog.Panel className="relative w-full max-w-xl min-h-[75vh] bg-white dark:bg-gray-900 rounded-3xl shadow-xl px-8 sm:px-10 py-6 sm:py-8 flex flex-col justify-center items-center text-center">
              {/* Title */}
              <Dialog.Title
                as="h1"
                className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-10"
              >
                {title}
              </Dialog.Title>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-4 sm:px-12 mb-10 leading-relaxed">
                {description}
              </p>

              {/* Animated Loader */}
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
              <h2 className="text-3xl mt-10 font-bold text-gray-900 dark:text-white text-center">
                Analyzing Your Website...
              </h2>

              {/* Data */}
              <p className="text-sm sm:text-base mt-10 text-gray-600 dark:text-gray-300 px-4 sm:px-12 leading-relaxed">
                {data}
              </p>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
