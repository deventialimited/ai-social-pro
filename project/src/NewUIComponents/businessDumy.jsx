import React, { useState } from "react";
import {
  Edit,
  Mail,
  Globe,
  Palette,
  Target,
  BadgeInfo,
  BookType,
  MapPin,
  Languages,
  Gem,
  Users,
  AlertTriangle,
  Star,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { FirstPostPopUp } from "./FirstPostPopUp";
export const BusinessSectionDummy = ({ setComponentType }) => {
  const [editing, setEditing] = useState(false);
  const [PopUp, setPopup] = useState(false);

  const [formData, setFormData] = useState({
    clientName: "Honda Motor Co., Ltd.",
    clientDescription:
      "Honda is a global manufacturer of automobiles, motorcycles, and power equipment. Known for engineering excellence and innovation, Honda designs reliable, fuel-efficient vehicles and offers environmentally-conscious technologies to improve mobility and enrich people's lives around the world.",
    clientWebsite: "honda.com",
    client_email: "mehtabahmed7777777@gmail.com",
    colors: ["#e40521", "#000000", "#ffffff"],
    country: "Worldwide",
    industry: "Automotive",
    language: "English",
    marketingStrategy: {
      audience: [
        "1. Individual vehicle buyers seeking reliable and fuel-efficient transportation,",
        "2. Environmentally-conscious consumers interested in hybrid and electric vehicles,",
        "3. Motorcycle enthusiasts and outdoor power equipment users",
      ],
      audiencePains: [
        "1. Rising fuel costs and environmental concerns,",
        "2. Need for reliable, maintenance-friendly vehicles,",
        "3. Desire for innovative, high-performance transportation options",
      ],
      core_values: [
        "1. Respect for the individual,",
        "2. The Three Joys: The Joy of Buying, The Joy of Selling, and The Joy of Creating,",
        "3. Innovation and environmental responsibility",
      ],
    },
    niche:
      "Fuel-efficient vehicles, motorcycles, and eco-friendly mobility solutions",
    siteLogo: "https://img.logo.dev/honda.com",
    state: "California",
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newLogoUrl = URL.createObjectURL(file);
      setFormData({ ...formData, siteLogo: newLogoUrl });
    }
  };

  const handleColorChange = (index, value) => {
    const updatedColors = [...formData.colors];
    updatedColors[index] = value;
    setFormData({ ...formData, colors: updatedColors });
  };
  const handlePopup = () => {
    setPopup(true);
  };
  const handleClosePopup = () => {
    setPopup(false);
    setComponentType("postTopics");
  };
  const handleEdit = () => setEditing(true);
  const handleCancel = () => setEditing(false);
  const handleSave = () => {
    setEditing(false);
    toast.success("Business profile updated!");
  };

  const renderField = (icon, label, value, onChange = null) => (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <span className="font-medium text-gray-800">{label}</span>
      </div>
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
        />
      ) : (
        <p className="text-sm text-gray-700">{value}</p>
      )}
    </div>
  );

  return (
    <>
      <div>
        <div className="pt-3 text-center">
          <h1 className="text-3xl font-bold text-blue-600">
            Your Business Profile
          </h1>
          <p className="text-sm text-gray-500 mt-3">
            Here is the informationwe have extracted about your business. Make
            sure it's accurate for the best content
          </p>
        </div>
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
          {/* Header */}
          <div className="flex items-end justify-end mb-6">
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 text-gray-600 hover:text-black"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm">Edit</span>
            </button>
          </div>

          {/* Logo and Name */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border">
              <img
                src={formData.siteLogo}
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/default-logo.png")}
              />
              {editing && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              )}
            </div>
            {renderField(
              <BadgeInfo className="w-4 h-4" />,
              "Business Name",
              formData.clientName,
              (v) => setFormData({ ...formData, clientName: v })
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <BookType className="w-4 h-4 text-gray-700" />
              </div>
              <span className="font-medium text-gray-800">
                Business Description
              </span>
            </div>
            {editing ? (
              <textarea
                rows={3}
                value={formData.clientDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    clientDescription: e.target.value,
                  })
                }
                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            ) : (
              <p className="text-sm text-gray-700">
                {formData.clientDescription}
              </p>
            )}
          </div>

          {/* Core Info */}
          {renderField(
            <Globe className="w-4 h-4" />,
            "Website",
            formData.clientWebsite,
            (v) => setFormData({ ...formData, clientWebsite: v })
          )}
          {renderField(
            <MapPin className="w-4 h-4" />,
            "Country",
            formData.country,
            (v) => setFormData({ ...formData, country: v })
          )}
          {renderField(
            <MapPin className="w-4 h-4" />,
            "State",
            formData.state,
            (v) => setFormData({ ...formData, state: v })
          )}
          {renderField(
            <Languages className="w-4 h-4" />,
            "Language",
            formData.language,
            (v) => setFormData({ ...formData, language: v })
          )}
          {renderField(
            <Gem className="w-4 h-4" />,
            "Niche",
            formData.niche,
            (v) => setFormData({ ...formData, niche: v })
          )}
          {renderField(
            <Target className="w-4 h-4" />,
            "Industry",
            formData.industry,
            (v) => setFormData({ ...formData, industry: v })
          )}

          {/* Brand Colors */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Palette className="text-blue-600 w-4 h-4" />
              </div>
              <h3 className="text-sm font-medium text-gray-800">
                Brand Colors
              </h3>
            </div>

            <div className="flex gap-3">
              {formData.colors.map((color, index) =>
                editing ? (
                  <label
                    key={index}
                    className="relative w-8 h-8 rounded-full overflow-hidden cursor-pointer"
                  >
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                      className="w-full h-full rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                    ></div>
                  </label>
                ) : (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>
          </div>

          {/* Marketing Strategy */}
          {["audience", "audiencePains", "core_values"].map((key, i) => (
            <div key={i} className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                  {key === "audience" ? (
                    <Users className="w-4 h-4 text-purple-600" />
                  ) : key === "audiencePains" ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  ) : (
                    <Star className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <h3 className="text-sm font-medium capitalize text-gray-800">
                  {key.replace("_", " ")}
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {formData.marketingStrategy[key].map((item, idx) =>
                  editing ? (
                    <input
                      key={idx}
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...formData.marketingStrategy[key]];
                        updated[idx] = e.target.value;
                        setFormData({
                          ...formData,
                          marketingStrategy: {
                            ...formData.marketingStrategy,
                            [key]: updated,
                          },
                        });
                      }}
                      className="bg-gray-50 border border-gray-200 rounded-md p-2 text-sm outline-none"
                    />
                  ) : (
                    <p key={idx} className="text-sm text-gray-700">
                      {item}
                    </p>
                  )
                )}
              </div>
            </div>
          ))}

          {/* Buttons */}
          {editing ? (
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex justify-end mt-6">
              <button
                onClick={handlePopup}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center justify-center gap-2 text-base font-medium transition-all"
              >
                <span>Looking Good! Continue</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {PopUp && (
        <FirstPostPopUp
          isOpen={PopUp}
          onClose={() => {
            // setPopup(false);
            setComponentType("postTopics");
          }}
          title="Let’s Discover the Perfect Topics..."
          description="We’re crafting relevant and captivating topics designed to spark interest and drive engagement within your audience."
        />
      )}
    </>
  );
};
