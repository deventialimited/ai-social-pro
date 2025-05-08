import { React, useState, useEffect } from "react";
import { SocialConnectLoader } from "../../PopUps/SocialMediaPopup";
import { useLocation, useSearchParams } from "react-router-dom";
import { updatePlatformConnection } from "../../libs/authService";

export const FacebookAuth = () => {
  const [popUp, setPopUp] = useState(true);
  const handleClick = () => {
    setPopUp(true);
  };
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const uid = searchParams.get("uid");
  const platform = location.pathname.split("/").pop();
  const getPlatformName = (raw) => {
    if (raw === "FacebookAuth") return "Facebook";
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
      {/* Facebook Connected */}
      {popUp && (
        <SocialConnectLoader
          isOpen={popUp}
          onClose={() => {}}
          platform="Facebook"
        />
      )}
    </div>
  );
};
