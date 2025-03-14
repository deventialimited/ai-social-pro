// @ts-nocheck
import React from "react";
import { FaImage } from "react-icons/fa";

const TopMenu = () => {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 justify-between py-2 px-4 border-antd-colorBorderSecondary border-b z-50 bg-antd-colorBgContainer">
      <div className="md:text-base max-md:w-full flex items-center justify-center gap-1.5">
        <FaImage height="18" width="18" />
        <span>Image Post Editor</span>
      </div>
      <div className="flex gap-1 md:gap-2 max-md:[&_button]:text-xs max-md:[&_button]:!p-2 max-md:-my-2 max-md:-mx-3.5 max-md:px-1 max-md:py-2 overflow-auto">
        <button
          type="button"
          className="ant-btn css-doxyl0 ant-btn-text ant-btn-sm"
        >
          <span>Cancel</span>
        </button>
        <div className="ant-space-compact css-doxyl0 ant-space-compact-block ant-dropdown-button">
          <button
            type="button"
            className="ant-btn css-doxyl0 ant-btn-default ant-btn-sm ant-btn-compact-item ant-btn-compact-first-item [&_.ant-btn-icon]:flex"
          >
            <span className="ant-btn-icon">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="18"
                width="18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2.5-3.5 7-4.5-7-4.5v9z"></path>
              </svg>
            </span>
            <span>Change to Video</span>
          </button>
          <button
            type="button"
            className="ant-btn css-doxyl0 ant-btn-default ant-btn-sm ant-btn-icon-only ant-btn-compact-item ant-btn-compact-last-item ant-dropdown-trigger"
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
        <button
          type="button"
          className="ant-btn css-doxyl0 ant-btn-primary ant-btn-sm"
        >
          <span>Save and Close</span>
        </button>
      </div>
    </div>
  );
};

export default TopMenu;
