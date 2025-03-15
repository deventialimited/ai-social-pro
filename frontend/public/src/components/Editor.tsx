// @ts-nocheck
import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Cookies from "js-cookie";
const Editor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingPost = location.state || {};
  // We keep local state for edits
  const [post, setPost] = useState({
    topic: incomingPost.topic || "",
    content: incomingPost.content || "",
    image: incomingPost.image || "", // existing image URL (if any)
    imageBase64: incomingPost.imageBase64 || "", // new base64 image if user changes it
    post_id: incomingPost.post_id || "",
    website: incomingPost.website || "",
    date: incomingPost.date || "",
    platform: incomingPost.platform || "",
  });
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleEdit = (field: string, value: string) => {
    setPost((prevPost) => ({ ...prevPost, [field]: value }));
  };

  const handleClose = () => {
    navigate("/posts");
  };

  // Open Full Editor
  const handleEditDesignClick = () => {
    // Pass all current post fields to FullEditor
    localStorage.setItem("postdata", JSON.stringify(post));
    navigate("/fullEditor");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Store as base64 so we know it's newly changed
        setPost((prev) => ({
          ...prev,
          imageBase64: reader.result as string,
          image: "",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // "Save to Draft" => Calls API
  const handleSaveToDraft = async () => {
    try {
      setIsSaving(true);
      if (post.imageBase64) {
        post.imageBase64 = post.imageBase64.split("base64,")[1];
      }
      // If imageBase64 exists, do not send "image" in the final payload
      // If imageBase64 does NOT exist, use the existing "image" url
      let payload = {
        ...post,
        // We'll rename the field for clarity in the backend if needed
      };

      if (post.imageBase64) {
        // Remove `image` URL since we have a new base64 image
        payload.image = "";
      }
      const idToken = Cookies.get("idtoken");
      const response = await fetch(`${API_BASE_URL}/updatePostData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`, // key difference
        },
        body: JSON.stringify({ post: payload }),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      // If success
      navigate("/posts"); // go back to Posts page (it’ll refresh the list)
    } catch (error) {
      console.error(error);
      alert("Error saving post");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleBusiness = () => {
    setIsBusinessOpen(!isBusinessOpen);
  };

  const openProfile = () => {
    navigate("/profile");
  };

  // The final image to display in editor (either new base64 or existing url)
  const displayImage = post.imageBase64 || post.image;

  return (
    <div className="flex">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-grow">
        <Navbar />
        <div className="flex justify-center md:pl-[6%]">
          <div className="md:w-7/10 w-9/10 shadow-2xl border rounded-lg border-gray-300 p-3 md:mt-12">
            <div className="flex justify-between">
              <div className="ant-modal-header !p-4 !mb-0">
                <div className="ant-modal-title font-bold text-md">
                  Edit Post
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                className="ant-modal-close"
                onClick={handleClose}
              >
                <span className="ant-modal-close-x">
                  <span
                    role="img"
                    aria-label="close"
                    className="anticon anticon-close ant-modal-close-icon"
                  >
                    <svg
                      fillRule="evenodd"
                      viewBox="64 64 896 896"
                      focusable="false"
                      data-icon="close"
                      width="1em"
                      height="1em"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z"></path>
                    </svg>
                  </span>
                </span>
              </button>
            </div>

            <div className="ant-modal-body border-t border-gray-400 !p-4">
              <div className="w-full flex gap-4 flex-col-reverse md:flex-row min-h-80">
                {/* Text Editing Panel */}
                <div className="md:pr-6 flex-grow basis-2/5">
                  <div className="flex flex-col mb-3">
                    <label htmlFor="post-topic" className="font-medium">
                      Topic
                    </label>
                    <input
                      id="post-topic"
                      placeholder="Topic"
                      className="ant-input css-doxyl0 ant-input-outlined mt-1 border border-gray-500 p-2 rounded-lg"
                      value={post.topic}
                      onChange={(e) => handleEdit("topic", e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 mb-1">
                    <label htmlFor="post-content" className="font-medium">
                      Content
                    </label>
                  </div>
                  <textarea
                    id="post-content"
                    placeholder="Text"
                    className="ant-input css-doxyl0 ant-input-outlined mt-1 max-md:!max-h-64 !overflow-y-auto border border-gray-500 p-2 rounded-lg"
                    style={{
                      overflowY: "hidden",
                      resize: "none",
                      height: "260px",
                      minHeight: "128px",
                      maxHeight: "458px",
                      width: "100%",
                    }}
                    value={post.content}
                    onChange={(e) => handleEdit("content", e.target.value)}
                  />
                </div>

                {/* Image Panel */}
                <div className="text-center flex justify-center bg-antd-colorBgLayout p-6 -mx-4 md:!-mb-4 !-mt-[-7px] md:!ml-12">
                  <div className="space-y-2 relative">
                    {displayImage && (
                      <img
                        loading="lazy"
                        className="object-contain rounded border border-solid border-antd-colorBorder sm:w-[366px] cursor-pointer"
                        alt={post.topic}
                        src={displayImage}
                        onClick={handleImageClick}
                      />
                    )}
                    {!displayImage && (
                      <div
                        className="w-64 h-64 flex items-center justify-center bg-gray-100 border border-dashed cursor-pointer"
                        onClick={handleImageClick}
                      >
                        Click to Upload
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />

                    <div className="flex gap-4 mt-3 justify-center">
                      <button
                        type="button"
                        className="ant-btn css-doxyl0 ant-btn-default ant-btn-sm flex items-center gap-2 border border-gray-300 hover:border-gray-500 p-1 rounded-md"
                        onClick={handleEditDesignClick}
                      >
                        <span
                          role="img"
                          aria-label="edit"
                          className="anticon anticon-edit"
                        >
                          <svg
                            viewBox="64 64 896 896"
                            focusable="false"
                            data-icon="edit"
                            width="1em"
                            height="1em"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9zm67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z"></path>
                          </svg>
                        </span>
                        <span>Edit Design</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="ant-modal-body border-t border-gray-400 !p-4">
                <div className="ant-modal-footer !mt-0">
                  <div className="w-full flex max-sm:flex-col gap-2 justify-between items-center">
                    <div className="flex items-center gap-2 pl-2 min-w-max">
                      Publish to
                      <div className="ant-dropdown-trigger flex items-center gap-1 text-[#2e2e5e] cursor-pointer">
                        all socials
                        <svg
                          stroke="currentColor"
                          fill="currentColor"
                          strokeWidth="0"
                          viewBox="0 0 320 512"
                          className="transition-transform"
                          height="1em"
                          width="1em"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4-9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="flex max-sm:flex-col-reverse max-sm:w-full gap-2 [&_*]:w-[unset] ml-auto">
                      <button
                        type="button"
                        className="ant-btn css-doxyl0 ant-btn-text border border-gray-300 hover:border-gray-500 p-1 rounded"
                        onClick={handleClose}
                        disabled={isSaving}
                      >
                        <span>Cancel</span>
                      </button>
                      <div className="border border-gray-300 hover:border-gray-500 p-1 rounded  ant-space-compact css-doxyl0 ant-space-compact-block ant-dropdown-button [&_button]:flex-grow">
                        <button
                          type="button"
                          className="ant-btn css-doxyl0 ant-btn-default ant-btn-compact-item ant-btn-compact-first-item"
                          onClick={handleSaveToDraft}
                          disabled={isSaving}
                        >
                          <div className="flex gap-2 items-center">
                            {isSaving ? "Saving..." : "Save to Drafts"}
                          </div>
                        </button>
                        <button
                          type="button"
                          className="ant-btn css-doxyl0 ant-btn-default ant-btn-icon-only ant-btn-compact-item ant-btn-compact-last-item ant-dropdown-trigger"
                        >
                          <span className="ant-btn-icon">
                            <span
                              role="img"
                              aria-label="down"
                              className="anticon anticon-down"
                            >
                              <svg
                                viewBox="64 64 896 896"
                                focusable="false"
                                data-icon="down"
                                width="1em"
                                height="1em"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"></path>
                              </svg>
                            </span>
                          </span>
                        </button>
                      </div>
                      <div className="border border-gray-300 hover:border-gray-500 p-1 rounded ant-space-compact  css-doxyl0 ant-space-compact-block ant-dropdown-button [&_button]:flex-grow">
                        <button
                          type="button"
                          className=" ant-btn css-doxyl0 ant-btn-primary ant-btn-compact-item ant-btn-compact-first-item"
                        >
                          <div className="flex gap-2 items-center">
                            <span
                              role="img"
                              aria-label="clock-circle"
                              className="anticon anticon-clock-circle"
                            >
                              <svg
                                viewBox="64 64 896 896"
                                focusable="false"
                                data-icon="clock-circle"
                                width="1em"
                                height="1em"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                                <path d="M686.7 638.6L544.1 535.5V288c0-4.4-3.6-8-8-8H488c-4.4 0-8 3.6-8 8v275.4c0 2.6 1.2 5 3.3 6.5l165.4 120.6c3.6 2.6 8.6 1.8 11.2-1.7l28.6-39c2.6-3.7 1.8-8.7-1.8-11.2z"></path>
                              </svg>
                            </span>
                            Schedule
                          </div>
                        </button>
                        <button
                          type="button"
                          className="ant-btn css-doxyl0 ant-btn-primary ant-btn-icon-only ant-btn-compact-item ant-btn-compact-last-item ant-dropdown-trigger"
                        >
                          <span className="ant-btn-icon">
                            <span
                              role="img"
                              aria-label="down"
                              className="anticon anticon-down"
                            >
                              <svg
                                viewBox="64 64 896 896"
                                focusable="false"
                                data-icon="down"
                                width="1em"
                                height="1em"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"></path>
                              </svg>
                            </span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
