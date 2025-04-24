import React, { useState, useEffect, useRef } from "react";
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
import { useUpdateDomainDetails } from "../libs/domainService";
import { getFirstPost } from "../libs/postService";
import { useSocket } from "../store/useSocket";
export const BusinessSectionDummy = ({
  setComponentType,
  clientData,
  setPostData,
}) => {
  const [editing, setEditing] = useState(false);
  const [PopUp, setPopup] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [isBusinessModal, setisBusinessModal] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientDescription: "",
    clientWebsite: "",
    client_email: "",
    colors: [],
    country: "",
    state: "",
    language: "",
    niche: "",
    industry: "",
    siteLogo: "",
    marketingStrategy: {
      audience: [],
      audiencePains: [],
      core_values: [],
    },
  });
  const socket = useSocket();

  const updateDomainDetails = useUpdateDomainDetails();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (clientData) {
      const marketingStrategy = clientData.marketingStrategy || {
        audience: clientData.audience || [],
        audiencePains: clientData.audiencePains || [],
        core_values: clientData.core_values || [],
      };

      setFormData({
        id: clientData.id,
        clientName: clientData.clientName || "",
        clientDescription: clientData.clientDescription || "",
        clientWebsite: clientData.clientWebsite || "",
        client_email: clientData.client_email || "",
        colors: Array.isArray(clientData.colors) ? clientData.colors : [],
        country: clientData.country || "",
        state: clientData.state || "",
        language: clientData.language || "",
        niche: clientData.niche || "",
        industry: clientData.industry || "",
        siteLogo: clientData.siteLogo || "",
        marketingStrategy: {
          audience: Array.isArray(marketingStrategy.audience)
            ? marketingStrategy.audience
            : [],
          audiencePains: Array.isArray(marketingStrategy.audiencePains)
            ? marketingStrategy.audiencePains
            : [],
          core_values: Array.isArray(marketingStrategy.core_values)
            ? marketingStrategy.core_values
            : [],
        },
      });
    }
  }, [clientData]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const newLogoUrl = URL.createObjectURL(file);
      setFormData({ ...formData, siteLogo: newLogoUrl });
    }
  };

  const handleColorChange = (index, value) => {
    const updatedColors = [...formData.colors];
    updatedColors[index] = value;
    setFormData({ ...formData, colors: updatedColors });
  };
  useEffect(() => {
    if (!socket) {
      console.log("Socket not connected");
      return;
    }

    socket.on("PostSaved", (data) => {
      console.log("Post saved successfully!", data);
      setPostData({
        ...data?.post,
      });

      setComponentType("postDetails");
      setPopup(false);
    });

    return () => {
      socket.off("PostSaved");
    };
  }, []);
  // const getPostData = async (e) => {
  //   e.preventDefault();
  //   setPopup(true);
  //   try {
  //     const res = await getFirstPost(clientData.id);
  //     console.log(res, "post data in business section");
  //     setPostData({
  //       ...res?.data,
  //       domainId: clientData.id,
  //       userId: clientData.userId,
  //     });
  //     setComponentType("postDetails");
  //     setPopup(false);
  //   } catch (err) {
  //     console.log(err);
  //     setPopup(false);
  //     toast.error("Error fetching post data");
  //   }
  // };

  const handleCancel = () => {
    if (clientData) {
      const marketingStrategy = clientData.marketingStrategy || {
        audience: clientData.audience || [],
        audiencePains: clientData.audiencePains || [],
        core_values: clientData.core_values || [],
      };

      setFormData({
        id: clientData.id,
        clientName: clientData.clientName || "",
        clientDescription: clientData.clientDescription || "",
        clientWebsite: clientData.clientWebsite || "",
        client_email: clientData.client_email || "",
        colors: Array.isArray(clientData.colors) ? clientData.colors : [],
        country: clientData.country || "",
        state: clientData.state || "",
        language: clientData.language || "",
        niche: clientData.niche || "",
        industry: clientData.industry || "",
        siteLogo: clientData.siteLogo || "",
        marketingStrategy: {
          audience: Array.isArray(marketingStrategy.audience)
            ? marketingStrategy.audience
            : [],
          audiencePains: Array.isArray(marketingStrategy.audiencePains)
            ? marketingStrategy.audiencePains
            : [],
          core_values: Array.isArray(marketingStrategy.core_values)
            ? marketingStrategy.core_values
            : [],
        },
      });
    }
    setEditing(false);
    setLogoFile(null);
  };

  const handleEdit = () => setEditing(true);

  const handleSave = async () => {
    try {
      const logoFileToUpload = logoFile || null;
      console.log(clientData, "domainId");
      await updateDomainDetails.mutateAsync({
        domainId: clientData.id,
        formData: {
          ...formData,
          colors: formData.colors,
          marketingStrategy: formData.marketingStrategy,
        },
        logoFile: logoFileToUpload,
      });

      setEditing(false);
      setLogoFile(null);
      toast.success("Business profile updated successfully!");
    } catch (error) {
      console.error("Error updating domain:", error);
      toast.error("Failed to update business profile");
    }
  };

  const renderField = (icon, label, value, onChange = null) => (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <span className="font-medium text-gray-800 dark:text-white">
          {label}
        </span>
      </div>
      {editing ? (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
        />
      ) : (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {value || "—"}
        </p>
      )}
    </div>
  );

  const renderArrayField = (key, icon) => {
    const items = formData.marketingStrategy?.[key] || formData[key] || [];

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            {icon}
          </div>
          <h3 className="text-sm font-medium capitalize text-gray-800 dark:text-white">
            {key.replace("_", " ")}
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          {items.length > 0 ? (
            items.map((item, idx) =>
              editing ? (
                <input
                  key={`${key}-${idx}`}
                  type="text"
                  value={item || ""}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[idx] = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      marketingStrategy: {
                        ...prev.marketingStrategy,
                        [key]: updated,
                      },
                    }));
                  }}
                  className="bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 rounded-md p-2 text-sm outline-none"
                />
              ) : (
                <p
                  key={`${key}-${idx}`}
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  {item}
                </p>
              )
            )
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">—</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="px-7 sm:px-6">
        <div className="p-10 text-center dark:bg-gray-800 rounded-2xl dark:border-gray-700">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-white">
            Your Business Profile
          </h1>
          <p className="text-sm text-gray-500 mt-3 dark:text-gray-400">
            Here is the information we have extracted about your business. Make
            sure it's accurate for the best content.
          </p>
        </div>

        <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-24 bg-white dark:bg-gray-900 rounded-xl shadow-md relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
              <img
                src={formData.siteLogo || "/default-logo.png"}
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/default-logo.png")}
              />
              {editing && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  ref={fileInputRef}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              )}
            </div>
            <div className="flex-1">
              {renderField(
                <BadgeInfo className="w-4 h-4" />,
                "Business Name",
                formData.clientName,
                (v) => setFormData({ ...formData, clientName: v })
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <BookType className="w-4 h-4 text-gray-700 dark:text-white" />
              </div>
              <span className="font-medium text-gray-800 dark:text-white">
                Business Description
              </span>
            </div>
            {editing ? (
              <textarea
                rows={3}
                value={formData.clientDescription || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    clientDescription: e.target.value,
                  })
                }
                className="w-full bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
              />
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {formData.clientDescription || "—"}
              </p>
            )}
          </div>

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

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Palette className="text-blue-600 dark:text-blue-400 w-4 h-4" />
              </div>
              <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                Brand Colors
              </h3>
            </div>
            <div className="flex gap-3 flex-wrap">
              {formData.colors?.map((color, index) =>
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
                      className="w-full h-full rounded-full border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: color }}
                    ></div>
                  </label>
                ) : (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>
          </div>

          {renderArrayField(
            "audience",
            <Users className="w-4 h-4 text-purple-600" />
          )}
          {renderArrayField(
            "audiencePains",
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          )}
          {renderArrayField(
            "core_values",
            <Star className="w-4 h-4 text-green-600" />
          )}
        </div>

        <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow py-3 px-4 sm:px-6 flex items-center justify-between z-20">
          <h2 className="text-sm font-semibold text-blue-600 dark:text-white">
            Your Business Profile
          </h2>
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-1 text-gray-600 dark:text-white hover:text-black dark:hover:text-gray-300"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </button>
              <button
                onClick={() => {
                  setPopup(true);
                }}
                className="px-5 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition"
              >
                Looking Good! Let's Continue
              </button>
            </div>
          )}
        </div>
      </div>

      {PopUp && (
        <FirstPostPopUp
          isOpen={PopUp}
          onClose={() => {
            setPopup(false);
          }}
          title="Time to Create Compelling Content!"
          description="We’re generating dynamic posts and stunning visuals that will make your social media shine and captivate your followers"
        />
      )}
    </>
  );
};
