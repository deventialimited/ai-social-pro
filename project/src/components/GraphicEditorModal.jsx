import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import FullEditorjs from "../pages/ImageEditor/FullEditorjs";

export default function GraphicEditorModal({
  isGraphicEditorModal,
  setIsGraphicEditorModal,
  postImageDetails,
  setPostImageDetails,
}) {
  return (
    <>
      <Transition appear show={isGraphicEditorModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[999999999]"
          onClose={() => {
            // setIsGraphicEditorModal(false);
            console.log("no close");
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full min-h-[98%] min-w-[95%] transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                  <FullEditorjs
                    postImageDetails={postImageDetails}
                    setPostImageDetails={setPostImageDetails}
                    setIsGraphicEditorModal={setIsGraphicEditorModal}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
