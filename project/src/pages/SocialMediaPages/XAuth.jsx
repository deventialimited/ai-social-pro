import React, { useState, useEffect } from "react";
import { SocialConnectLoader } from "../../PopUps/SocialMediaPopup";
import { useLocation, useSearchParams } from "react-router-dom";
import { updatePlatformConnection } from "../../libs/authService";

export const XAuth = () => {
  const [popUp, setPopUp] = useState(true);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const uid = searchParams.get("uid");
  const platform = location.pathname.split("/").pop();
  const getPlatformName = (raw) => {
    if (raw === "XAuth") return "X";
  };
  const setStatus = (raw) => {
    if (raw === "success") return "connected";
  };
  useEffect(() => {
    const updatePlatform = async () => {
      if (status === "success" && uid) {
        const user = await updatePlatformConnection({
          platform: getPlatformName(platform),
          uid: uid,
          status: setStatus(status),
        });
      }
    };
    if (socket?.connected) {
      updatePlatform();
      setPopUp(false);
      navigate("/");
    }
  }, [status, uid, platform, socket]);
  return (
    <div>
      {popUp && (
        <SocialConnectLoader isOpen={popUp} onClose={() => {}} platform="x" />
      )}
    </div>
  );
};
