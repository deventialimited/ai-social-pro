// @ts-nocheck
import { Fragment, useState } from "react"
import { Dialog, Transition, Listbox } from "@headlessui/react"
import ArrowUpTrayIcon from "@heroicons/react/24/outline/ArrowUpTrayIcon"
import ArrowsPointingOutIcon from "@heroicons/react/24/outline/ArrowsPointingOutIcon"
import ArrowUturnLeftIcon from "@heroicons/react/24/outline/ArrowUturnLeftIcon"
import ArrowUturnRightIcon from "@heroicons/react/24/outline/ArrowUturnRightIcon"
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon"
import ClockIcon from "@heroicons/react/24/outline/ClockIcon"
import DocumentDuplicateIcon from "@heroicons/react/24/outline/DocumentDuplicateIcon"
import PaintBrushIcon from "@heroicons/react/24/outline/PaintBrushIcon"
import PlusIcon from "@heroicons/react/24/outline/PlusIcon"
import MinusIcon from "@heroicons/react/24/outline/MinusIcon"
import TrashIcon from "@heroicons/react/24/outline/TrashIcon"
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon"

type EditorTab = "text" | "images" | "elements" | "background" | "layers" | "size"

export default function Full() {
  const [isOpen, setIsOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<EditorTab>("text")
  const [zoomLevel, setZoomLevel] = useState(2)

  const closeModal = () => {
    setIsOpen(false)
  }

  const openModal = () => {
    setIsOpen(true)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "text":
        return <TextTabContent />
      case "images":
        return <ImagesTabContent />
      case "elements":
        return <ElementsTabContent />
      case "background":
        return <BackgroundTabContent />
      case "layers":
        return <LayersTabContent />
      case "size":
        return <SizeTabContent />
      default:
        return <TextTabContent />
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
      >
        Open Image Post Editor
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                  <div className="flex justify-between items-center px-4 py-3 border-b">
                    <Dialog.Title as="h3" className="text-lg font-medium flex items-center">
                      <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                      Image Post Editor
                    </Dialog.Title>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>

                      <div className="relative inline-block text-left">
                        <Listbox>
                          <div className="relative">
                            <Listbox.Button className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                              <span>Change to Video</span>
                              <ChevronDownIcon className="ml-2 h-4 w-4" />
                            </Listbox.Button>
                          </div>
                        </Listbox>
                      </div>

                      <button
                        type="button"
                        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
                        onClick={closeModal}
                      >
                        Save and Close
                      </button>
                    </div>
                  </div>

                  <div className="flex">
                    {/* Left sidebar */}
                    <div className="w-24 border-r bg-gray-50">
                      <div className="flex flex-col items-center">
                        <button
                          className={`w-full py-4 flex flex-col items-center justify-center ${activeTab === "text" ? "bg-blue-100" : "hover:bg-gray-100"}`}
                          onClick={() => setActiveTab("text")}
                        >
                          <span className="text-2xl font-semibold">A+</span>
                          <span className="text-xs mt-1">Text</span>
                        </button>

                        <button
                          className={`w-full py-4 flex flex-col items-center justify-center ${activeTab === "images" ? "bg-blue-100" : "hover:bg-gray-100"}`}
                          onClick={() => setActiveTab("images")}
                        >
                          <DocumentDuplicateIcon className="h-6 w-6" />
                          <span className="text-xs mt-1">Images</span>
                        </button>

                        <button
                          className={`w-full py-4 flex flex-col items-center justify-center ${activeTab === "elements" ? "bg-blue-100" : "hover:bg-gray-100"}`}
                          onClick={() => setActiveTab("elements")}
                        >
                          <span className="text-2xl font-semibold">%</span>
                          <span className="text-xs mt-1">Elements</span>
                        </button>

                        <button
                          className={`w-full py-4 flex flex-col items-center justify-center ${activeTab === "background" ? "bg-blue-100" : "hover:bg-gray-100"}`}
                          onClick={() => setActiveTab("background")}
                        >
                          <div className="h-6 w-6 bg-gray-300 rounded"></div>
                          <span className="text-xs mt-1">Background</span>
                        </button>

                        <button
                          className={`w-full py-4 flex flex-col items-center justify-center ${activeTab === "layers" ? "bg-blue-100" : "hover:bg-gray-100"}`}
                          onClick={() => setActiveTab("layers")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                          <span className="text-xs mt-1">Layers</span>
                        </button>

                        <button
                          className={`w-full py-4 flex flex-col items-center justify-center ${activeTab === "size" ? "bg-blue-100" : "hover:bg-gray-100"}`}
                          onClick={() => setActiveTab("size")}
                        >
                          <ArrowsPointingOutIcon className="h-6 w-6" />
                          <span className="text-xs mt-1">Size</span>
                        </button>
                      </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 flex flex-col">
                      {/* Toolbar */}
                      <div className="flex items-center p-2 border-b">
                        <div className="flex space-x-2 mr-4">
                          <button className="p-2 rounded-md hover:bg-gray-100">
                            <ArrowUturnLeftIcon className="h-5 w-5 text-gray-500" />
                          </button>
                          <button className="p-2 rounded-md hover:bg-gray-100">
                            <ArrowUturnRightIcon className="h-5 w-5 text-gray-500" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-2 mr-4">
                          <ClockIcon className="h-5 w-5 text-gray-500" />
                          <span>5s</span>
                        </div>

                        <div className="relative mr-4">
                          <Listbox>
                            <div className="relative">
                              <Listbox.Button className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                <span>Palette</span>
                                <ChevronDownIcon className="ml-2 h-4 w-4" />
                              </Listbox.Button>
                            </div>
                          </Listbox>
                        </div>

                        <div className="flex items-center space-x-2 mr-4">
                          <div className="h-8 w-8 bg-red-500 rounded"></div>
                          <span>Background Color</span>
                        </div>

                        <button className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                          <ArrowUpTrayIcon className="mr-2 h-5 w-5" />
                          Upload
                        </button>

                        <div className="ml-auto flex items-center space-x-4">
                          <button className="p-2 rounded-md hover:bg-gray-100">
                            <PaintBrushIcon className="h-5 w-5 text-gray-500" />
                          </button>
                          <button className="p-2 rounded-md hover:bg-gray-100">
                            <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />
                          </button>
                          <button className="p-2 rounded-md hover:bg-gray-100">
                            <ArrowsPointingOutIcon className="h-5 w-5 text-gray-500" />
                          </button>
                          <button className="p-2 rounded-md hover:bg-gray-100">
                            <TrashIcon className="h-5 w-5 text-gray-500" />
                          </button>
                        </div>
                      </div>

                      {/* Editor area */}
                      <div className="flex-1 bg-gray-200 p-4 relative">
                        <div className="bg-white w-full h-full rounded-md flex items-center justify-center">
                          {renderTabContent()}
                        </div>

                        {/* Zoom controls */}
                        <div className="absolute bottom-4 right-4 flex items-center bg-white rounded-md shadow-sm">
                          <button
                            className="p-2 hover:bg-gray-100 rounded-l-md"
                            onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1))}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <div className="px-3 py-1 border-l border-r">{zoomLevel}%</div>
                          <button
                            className="p-2 hover:bg-gray-100 rounded-r-md"
                            onClick={() => setZoomLevel(zoomLevel + 1)}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

// Tab content components
function TextTabContent() {
  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4">Create header</h1>
      <h2 className="text-2xl font-medium mb-4">Create sub header</h2>
      <p className="text-base">Create body text</p>
    </div>
  )
}

function ImagesTabContent() {
  return (
    <div className="w-full max-w-lg mx-auto text-center p-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center">
        <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Upload images or drag and drop</p>
      </div>
    </div>
  )
}

function ElementsTabContent() {
  return (
    <div className="w-full max-w-lg mx-auto grid grid-cols-3 gap-4 p-4">
      <div className="border rounded-lg p-4 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
        <span>Shape 1</span>
      </div>
      <div className="border rounded-lg p-4 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
        <span>Shape 2</span>
      </div>
      <div className="border rounded-lg p-4 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
        <span>Shape 3</span>
      </div>
      <div className="border rounded-lg p-4 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
        <span>Icon 1</span>
      </div>
      <div className="border rounded-lg p-4 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
        <span>Icon 2</span>
      </div>
      <div className="border rounded-lg p-4 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
        <span>Icon 3</span>
      </div>
    </div>
  )
}

function BackgroundTabContent() {
  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Colors</h3>
        <div className="grid grid-cols-6 gap-2">
          {[
            "bg-red-500",
            "bg-blue-500",
            "bg-green-500",
            "bg-yellow-500",
            "bg-purple-500",
            "bg-pink-500",
            "bg-gray-500",
            "bg-indigo-500",
            "bg-orange-500",
            "bg-teal-500",
            "bg-cyan-500",
            "bg-lime-500",
          ].map((color, index) => (
            <div key={index} className={`${color} h-10 rounded-md cursor-pointer`}></div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Patterns</h3>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((pattern) => (
            <div key={pattern} className="h-20 bg-gray-200 rounded-md cursor-pointer flex items-center justify-center">
              Pattern {pattern}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LayersTabContent() {
  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="border rounded-lg divide-y">
        <div className="p-3 flex items-center justify-between hover:bg-gray-50">
          <div className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 mr-2" />
            <span>Header Text</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-gray-200 rounded">
              <DocumentDuplicateIcon className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-3 flex items-center justify-between hover:bg-gray-50">
          <div className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 mr-2" />
            <span>Sub Header Text</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-gray-200 rounded">
              <DocumentDuplicateIcon className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-3 flex items-center justify-between hover:bg-gray-50">
          <div className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 mr-2" />
            <span>Body Text</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-gray-200 rounded">
              <DocumentDuplicateIcon className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SizeTabContent() {
  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
          <div className="flex items-center">
            <input type="range" min="100" max="1000" defaultValue="500" className="w-full" />
            <span className="ml-2 w-16 text-center">500px</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
          <div className="flex items-center">
            <input type="range" min="100" max="1000" defaultValue="500" className="w-full" />
            <span className="ml-2 w-16 text-center">500px</span>
          </div>
        </div>
        <div className="pt-4 border-t">
          <h3 className="text-lg font-medium mb-2">Preset Sizes</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="border rounded-md p-2 hover:bg-gray-50">Instagram Post</button>
            <button className="border rounded-md p-2 hover:bg-gray-50">Facebook Post</button>
            <button className="border rounded-md p-2 hover:bg-gray-50">Twitter Post</button>
            <button className="border rounded-md p-2 hover:bg-gray-50">LinkedIn Post</button>
          </div>
        </div>
      </div>
    </div>
  )
}
