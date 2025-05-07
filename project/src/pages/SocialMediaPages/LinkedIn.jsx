import { React, useState, useEffect } from "react";
import { SocialConnectLoader } from "../../PopUps/SocialMediaPopup";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { updatePlatformConnection } from "../../libs/authService";
import { useSocket } from "../../store/useSocket";

export const LinkedIn = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const uid = searchParams.get("uid");
  const socket = useSocket();
  const navigate = useNavigate();
  const [popUp, setPopUp] = useState(true);
  const platform = location.pathname.split("/").pop();
  const getPlatformName = (raw) => {
    if (raw === "LinkedinAuth") return "LinkedIn";
  };
  const setStatus = (raw) => {
    if (raw === "success") return "connected";
  };
  useEffect(() => {
    const updatePlatform = async () => {
      if (status === "success" && uid) {
        const user = await updatePlatformConnection({
          platformName: getPlatformName(platform),
          userId: uid,
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
      {/* LinkedIn Connected */}
      {popUp && (
        <SocialConnectLoader
          isOpen={popUp}
          onClose={() => {}}
          platform="LinkedIn"
        />
      )}
    </div>
  );
};
