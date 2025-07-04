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
import axios from "axios";

import { FirstPostPopUp } from "./FirstPostPopUp";
import { useUpdateDomainDetails, getDomainById } from "../libs/domainService";
import { getFirstPost, useCreatePostViaPubSub } from "../libs/postService";
import { useQueryClient } from "@tanstack/react-query";

import { useSocket } from "../store/useSocket";
import { useNavigate } from "react-router-dom";
export const BusinessSectionDummy = ({
  setComponentType,
  clientData,
  setPostData,
  postData,
}) => {
  const [editing, setEditing] = useState(false);
  const [PopUp, setPopup] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [isBusinessModal, setisBusinessModal] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientDescription: "",
    clientWebsite: "",
    client_id: "",

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
  const navigate = useNavigate();
  const updateDomainDetails = useUpdateDomainDetails();
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const { mutateAsync: createPostViaPubSub, isLoading: isPubSubLoading } =
    useCreatePostViaPubSub();

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
        client_id: clientData.client_id || "",
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

  const handleGeneratePost = async (e) => {
    e.preventDefault();
    setPopup(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const platforms = ["x", "LinkedIn", "Instagram"];
      const basePayload = {
        client_email: clientData.client_email,
        client_id: clientData.client_id,
        website: clientData.clientWebsite,
        name: clientData.clientName || "Unknown",
        industry: clientData.industry || "Unknown",
        niche: clientData.niche || "Unknown",
        description: clientData.clientDescription || "",
        core_values: clientData.marketingStrategy?.core_values || [],
        target_audience: clientData.marketingStrategy?.audience || [],
        audience_pain_points: clientData.marketingStrategy?.audiencePains || [],
      };

      // Step 1: Facebook post
      const facebookPayload = { ...basePayload, post_platform: "Facebook" };
      const facebookResponse = await axios.post(
        "https://social-api-107470285539.us-central1.run.app/generate-single-post",
        facebookPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const requests = platforms.map((platform) => {
        const payload = { ...basePayload, post_platform: platform };
        return axios.post(
          "https://social-api-107470285539.us-central1.run.app/generate-single-post",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      });
      const facebookData = facebookResponse.data;

      const FacebookpubsubPayload = {
        post_id: facebookData.post_id,
        client_id: clientData.client_id,
        domainId: clientData.id,
        userId: user._id,
        image: facebookData.image || "",
        topic: facebookData.topic,
        related_keywords: facebookData.related_keywords || [],
        content: facebookData.content,
        slogan: facebookData.slogan,
        postDate: facebookData.date,
        imageIdeas: facebookData.imageIdeas || [], // Include imageIdeas from the response

        platform: facebookData.platform,
      };

      const pubsubApi = await createPostViaPubSub(FacebookpubsubPayload);
      setPostData(pubsubApi); // Set Facebook post data

      // Step 2: Generate posts for other platforms in parallel

      const responses = await Promise.all(requests);

      // Step 3: Send each of the 3 posts to PubSub
      await Promise.all(
        responses.map((res) => {
          const data = res.data;
          const pubsubPayload = {
            post_id: data.post_id,
            client_id: clientData.client_id,
            domainId: clientData.id,
            userId: user._id,
            image: data.image || "",
            topic: data.topic,
            related_keywords: data.related_keywords || [],
            content: data.content,
            slogan: data.slogan,
            imageIdeas: data.imageIdeas || [], // Include imageIdeas from the response
            postDate: data.date,
            platform: data.platform,
          };
          return createPostViaPubSub(pubsubPayload);
        })
      );
    } catch (error) {
      console.error("Error generating post:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };

  const handleColorChange = (index, value) => {
    const updatedColors = [...formData.colors];
    console.log("updated COlors", updatedColors);
    updatedColors[index] = value;
    setFormData({ ...formData, colors: updatedColors });
  };
  // useEffect(() => {
  //   if (!socket) {
  //     console.log("Socket not connected");
  //     return;
  //   }

  //   socket.on("PostSaved", (data) => {
  //     console.log("Post saved successfully!", data);
  //     setPostData({
  //       ...data?.post,
  //     });
  //   });

  //   return () => {
  //     socket.off("PostSaved");
  //   };
  // }, []);

  useEffect(() => {
    console.log("Post Data in Business Dummy ", postData);
    console.log("Popup in the business dummy", PopUp);
    if (postData && PopUp) {
      console.log("postdata", postData);
      setComponentType("postDetails");
      setPopup(false);
    }
  }, [postData, PopUp]);

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
      console.log("colors in the handle Save", formData.colors);
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
      <div className="px-0 md:px-6">
        <div className="md:p-10 text-center dark:bg-gray-800 rounded-2xl dark:border-gray-700">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-white">
            Your Business Profile
          </h1>
          <p className="text-sm text-gray-500 mt-3 dark:text-gray-400">
            Here is the information we have extracted about your business. Make
            sure it's accurate for the best content.
          </p>
        </div>

        <div className="max-w-3xl  mx-auto p-4 sm:p-6 pb-24 bg-white dark:bg-gray-900 rounded-xl shadow-md relative">
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

        <div
          className="sticky bottom-0 mt-10 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200
        dark:border-gray-700 shadow-lg py-4 px-4 sm:px-6 flex flex-col  
        items-center justify-between z-20"
        >
          <h2 className="text-sm md:pb-0 pb-2 md:pb-3 font-semibold text-blue-600 dark:text-white">
            Your Business Profile
          </h2>
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-1 bg-blue-600 text-white border-2 border-blue-700 
        hover:bg-blue-700 hover:border-blue-800 dark:text-white 
        dark:hover:bg-blue-500 w-full sm:w-auto justify-center sm:justify-start 
        px-4 py-2 rounded shadow"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </button>
              <button
                onClick={handleGeneratePost}
                className="md:px-5 px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition shadow border-2 border-green-600"
              >
                Looking Good! Let's Continue
              </button>
            </div>
          )}
        </div>
      </div>

      {PopUp && (
        <div className="fixed  inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-lg">
          <FirstPostPopUp
            isOpen={PopUp}
            onClose={() => {}}
            title="Time to Create Compelling Content!"
            description="We’re generating dynamic posts and stunning visuals that will make your social media shine and captivate your followers"
            website={`${formData.clientWebsite}`}
          />
        </div>
      )}
    </>
  );
};
