import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { Edit, Save, X, Upload, Image, Building2 } from "lucide-react";
import {
  useDomains,
  useUpdateDomainBrandInfo,
  useUpdateDomainBusiness,
} from "../libs/domainService";
import { toast } from "react-hot-toast";

export const BusinessSection = ({ selectedWebsiteId, userId, onEdit }) => {
  const { data: domains, isLoading } = useDomains(userId);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState(null);
  const [formData, setFormData] = useState({
    clientName: "",
    clientDescription: "",
    industry: "",
    niche: "",
    clientWebsite: "",
    language: "",
    country: "",
    state: "",
    colors: [],
    marketingStrategy: {
      core_values: ["", "", ""],
      audiencePains: ["", "", ""],
      audience: ["", "", ""],
    },
  });

  const colorPickerRefs = {
    brandColor: useRef(null),
    backgroundColor: useRef(null),
    textColor: useRef(null),
  };

  const updateDomain = useUpdateDomainBusiness();
  const updateBrandInfo = useUpdateDomainBrandInfo();

  useEffect(() => {
    if (domains?.length > 0 && selectedWebsiteId) {
      const selectedWebsiteData = domains?.find(
        (w) => w?._id === selectedWebsiteId
      );
      setFormData({
        ...selectedWebsiteData,
        colors: selectedWebsiteData?.colors
          ?.split(",")
          ?.map((color) => color.trim())
          ?.filter((color) => color !== ""),
      });
    }
  }, [domains, selectedWebsiteId]);

  const handleEdit = (section) => {
    setEditingSection(section);
    onEdit(section);
  };

  const handleSave = async () => {
    try {
      await updateDomain.mutateAsync({
        domainId: selectedWebsiteId,
        domainData: formData,
      });
      setEditingSection(null);
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
  };

  const handleColorClick = (type) => {
    colorPickerRefs[type].current?.click();
  };

  const handleFileUpload = async () => {
    const selectedDomain = domains?.find((w) => w?._id === selectedWebsiteId);
    const originalColors = selectedDomain?.colors
      ?.split(",")
      ?.map((color) => color.trim())
      ?.filter((color) => color !== "") || [];

    const isLogoChanged = selectedLogoFile !== null;
    const areColorsChanged =
      JSON.stringify(originalColors) !== JSON.stringify(formData?.colors);

    if (!isLogoChanged && !areColorsChanged) {
      toast.error(
        "No changes detected. Please upload a new logo or select new brand colors."
      );
      return;
    }

    try {
      await updateBrandInfo.mutateAsync({
        domainId: selectedWebsiteId,
        logoFile: selectedLogoFile,
        colors: formData?.colors,
      });

      toast.success("Brand info updated!");
      setEditingSection(null);
      setSelectedLogoFile(null);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to update brand info.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedLogoFile(file);
  };

  const renderImageUpload = (type) => {
    const isEditing = editingSection === "brand";
    const title = type === "logo" ? "Upload Logo" : "Upload Headshot";

    const handleImageClick = () => {
      if (isEditing) {
        document.getElementById(`${type}-file-input`).click();
      }
    };

    return (
      <div className="space-y-2">
        <div
          className={`relative group cursor-pointer overflow-hidden 
            ${
              type === "logo"
                ? "w-[100px] h-[100px] rounded-full bg-gray-100 border border-gray-300"
                : "w-[120px] h-[120px] rounded-lg"
            }`}
          onClick={handleImageClick}
        >
          {selectedLogoFile || formData?.siteLogo ? (
            <>
              <img
                src={
                  selectedLogoFile
                    ? URL.createObjectURL(selectedLogoFile)
                    : formData?.siteLogo || "/default-logo.png"
                }
                alt={title}
                className={`w-full h-full ${
                  type === "logo" ? "object-cover rounded-full" : "object-cover"
                }`}
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Image className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {title}
              </span>
            </div>
          )}
        </div>
        <input
          id={`${type}-file-input`}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={!isEditing}
        />
      </div>
    );
  };

  const renderField = (label, value, field) => {
    const isEditing = editingSection === "business";

    return (
      <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
        <label className="w-32 text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </label>
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={value}
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm"
            />
          ) : (
            <span className="text-sm text-gray-900 dark:text-white">
              {value}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderList = (title, items, field) => {
    const isEditing = editingSection === "marketing";

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </h3>
        {isEditing ? (
          <div className="space-y-2">
            {items?.map((item, index) => (
              <input
                key={index}
                type="text"
                value={item}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = e.target.value;
                  setFormData({
                    ...formData,
                    marketingStrategy: {
                      ...formData.marketingStrategy,
                      [field]: newItems,
                    },
                  });
                }}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm"
              />
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            {items?.map((item, index) => (
              <li
                key={index}
                className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderColorPicker = () => {
    const isEditing = editingSection === "brand";

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select the colors you want to use for your posts.
        </h3>
        <div className="flex gap-4">
          {[
            { type: "brandColor", label: "Brand Color" },
            { type: "backgroundColor", label: "Background Color" },
            { type: "textColor", label: "Text Color" },
          ].map(({ type, label }, index) => (
            <div
              key={type}
              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  style={{
                    backgroundColor: formData?.colors?.[index] || "#000000",
                  }}
                  onClick={() => isEditing && handleColorClick(type)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {label}
                </span>
                <input
                  ref={colorPickerRefs[type]}
                  type="color"
                  value={formData?.colors?.[index] || "#000000"}
                  onChange={(e) => {
                    const newColors = [...(formData?.colors || [])];
                    newColors[index] = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      colors: newColors,
                    }));
                  }}
                  className="hidden"
                  disabled={!isEditing}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSection = (title, section, children) => {
    const isEditing = editingSection === section;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={section === "brand" ? handleFileUpload : handleSave}
                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
              >
                <Save className="w-5 h-5" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleEdit(section)}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="p-4 space-y-4">{children}</div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Business Profile
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your business information and branding to ensure consistent
            messaging across all platforms.
          </p>
        </div>

        <div className="p-8 space-y-6">
          {renderSection(
            "Brand",
            "brand",
            <div className="space-y-6">
              <div className="flex gap-6">{renderImageUpload("logo")}</div>
              {renderColorPicker()}
            </div>
          )}

          {renderSection(
            "Business",
            "business",
            <div className="space-y-4">
              {renderField("Business Name", formData?.clientName, "clientName")}
              {renderField("Description", formData?.clientDescription, "clientDescription")}
              {renderField("Industry", formData?.industry, "industry")}
              {renderField("Niche", formData?.niche, "niche")}
              {renderField("Website", formData?.clientWebsite, "clientWebsite")}
              {renderField("Language", formData?.language, "language")}
              {renderField("Country", formData?.country, "country")}
              {renderField("State/Region", formData?.state, "state")}
            </div>
          )}

          {renderSection(
            "Marketing Strategy",
            "marketing",
            <div className="space-y-6">
              {renderList("Target Audience", formData?.marketingStrategy?.audience, "audience")}
              {renderList("Audience Pains", formData?.marketingStrategy?.audiencePains, "audiencePains")}
              {renderList("Core Values", formData?.marketingStrategy?.core_values, "core_values")}
            </div>
          )}
        </div>
      </div>

      {(updateBrandInfo.isPending || updateDomain.isPending) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-white">Updating info...</span>
          </div>
        </div>
      )}
    </div>
  );
};
