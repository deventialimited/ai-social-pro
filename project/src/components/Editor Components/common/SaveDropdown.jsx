import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Loader2, Save } from "lucide-react";

const SaveDropdown = ({
  onSave,
  isLoading,
  templateType,
  setTemplateType,
  templateCategory,
  setTemplateCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onSave();
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            <span>Save As Template</span>
          </>
        )}
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-[2147483647]">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white w-full max-w-md rounded-lg p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Save As Template
            </Dialog.Title>

            <div className="mb-4">
              <p className="font-medium mb-2">Select Template Type</p>
              <div className="space-y-1">
                {["private", "public"].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="templateType"
                      value={type}
                      checked={templateType === type}
                      onChange={() => setTemplateType(type)}
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="font-medium mb-2">Select Template Category</p>
              <div className="space-y-1">
                {["branding", "slogan"].map((category) => (
                  <label key={category} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="templateCategory"
                      value={category}
                      checked={templateCategory === category}
                      onChange={() => setTemplateCategory(category)}
                    />
                    <span className="capitalize">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 text-sm bg-black text-white rounded-md hover:bg-gray-800"
              >
                Save
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default SaveDropdown;
