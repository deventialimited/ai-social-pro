import { useEffect, useRef, useState } from "react";
import { createImageElement } from "../hooks/ImagesHooks";
import { useGetAllTemplatesByUserId } from "../../../../libs/templateDesignService";

function TemplatesTab() {
  const [query, setQuery] = useState("");
  const fileInputRef = useRef(null);
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?._id) {
      setUserId(storedUser._id);
    }
  }, []);
  const {
    data: templates,
    isLoading,
    isError,
  } = useGetAllTemplatesByUserId(userId);

  const handleAddImage = async (src) => {
    try {
      setCanvasLoading(true);

      const response = await fetch(src, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const blob = await response.blob();

      const objectUrl = URL.createObjectURL(blob);
      const newElement = createImageElement(objectUrl); // includes a unique `id`
      addElement(newElement);

      const file = new File([blob], newElement.id, { type: blob.type });
      addFile(file);
      setCanvasLoading(false);
    } catch (error) {
      setCanvasLoading(false);
      console.error("Failed to add image:", error);
    }
  };
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex gap-2 mb-4">
        {/* <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Stock"
            className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
              setImages([]);
            }}
          />
        </div> */}
      </div>

      {/* Gallery Section */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 2px)" }}
      >
        <div className="grid grid-cols-2 gap-2">
          {templates?.map((template) => (
            <div
              key={template._id}
              className="aspect-square bg-gray-200 rounded-md overflow-hidden hover:opacity-80 cursor-pointer"
            >
              <img
                src={template?.templateImage}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TemplatesTab;
