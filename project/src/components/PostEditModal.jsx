import React, { Fragment, useEffect, useState } from "react";
import { X, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MultiSelectDropdown from "./MultiSelectDropdown";
import toast from "react-hot-toast";
import GraphicEditorModal from "./GraphicEditorModal";
import { Dialog, Transition } from "@headlessui/react";
import EditorModal from "./Editor Components/EditorModal";

export const PostEditModal = ({
  post,
  selectedType,
  showEditModal,
  postImageSize,
  onClose,
  onSave,
}) => {
  console.log(post);
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [postImageDetails, setPostImageDetails] = useState(null);
  const socialOptions = ["Facebook", "X", "Instagram", "LinkedIn"];
  const [isGraphicEditorModal, setIsGraphicEditorModal] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setTopic(post?.topic);
    setContent(post?.content);
    // Destructure and exclude specific fields
    const { topic, content, platform, status, ...imageData } = post || {};
    setPostImageDetails(imageData);
  }, [post]);
  // Function to validate if any changes were made
  const validateChanges = () => {
    const hasTopicChanged = topic !== (post?.topic || "");
    const hasContentChanged = content !== (post?.content || "");

    return hasTopicChanged || hasContentChanged;
  };
  const handleSave = () => {
    if (!validateChanges()) {
      // Show toast message if no changes were made
      // toast.error("No changes made to the post.");
      onClose();
      return;
    }
    onSave({
      ...post,
      topic,
      content,
    });
  };
  return (
    <>
      <Transition appear show={showEditModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[999]"
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
          <EditorModal
            post={post}
            selectedType={selectedType}
            onClose={() => setIsGraphicEditorModal(false)}
            isEditorOpen={isGraphicEditorModal}
          />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="min-h-full flex items-start justify-center p-4 text-center sm:items-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-6xl  transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Edit Post
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Topic */}
                    <div className="space-y-2">
                      <label className="block text-left pl-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Topic
                      </label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="text-left w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className=" grid md:grid-cols-2 grid-row-2 gap-6">
                      {/* Content */}
                      <div className=" space-y-2">
                        <label className="block text-left pl-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Content
                        </label>
                        <textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          className="w-full text-left h-[200px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your post text..."
                        />
                      </div>

                      {/* Image */}
                      <div className=" space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Visual
                          </label>
                          <button
                            onClick={() => {
                              setIsGraphicEditorModal(true);
                              // onClose();
                            }}
                            className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit Design
                          </button>
                        </div>
                        <div
                          onClick={() => setIsGraphicEditorModal(true)}
                          className="relative bg-gray-200 flex items-center rounded-lg justify-center group"
                        >
                          <img
                            src={post[selectedType]?.imageUrl}
                            alt="Post preview"
                            // style={{ ...postImageSize }}
                            className=" cursor-pointer object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 flex flex-col md:flex-row py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
                    <div className=" ml-[11%] md:ml-0 md:w-auto">
                      <h2 className=" capitalize">{post?.platform}</h2>
                    </div>
                    <div className="flex md:flex-row flex-col items-center gap-3">
                      <button
                        onClick={onClose}
                        className="border md:border-0 border-gray-300 border-2 w-full md:w-auto order-3 md:order-none  px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="border md:border-0 border-gray-300 border-2 w-full md:w-auto order-2 md:order-none px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        Save Changes
                      </button>
                      <button className="text-white md:text-gray-700 px-32 md:px-0 bg-black md:bg-white w-full  md:w-auto order-1 md:order-none px-4 py-2 text-sm text-gray-700 dark:text-gray-300 md:hover:bg-gray-100 md:dark:hover:bg-gray-700 rounded-lg flex items-center gap-1">
                        Schedule
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
