import { React, useState, useEffect } from "react";
import { SocialConnectLoader } from "../../PopUps/SocialMediaPopup";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { updatePlatformConnection } from "../../libs/authService";
import { useSocket } from "../../store/useSocket";
import toast from 'react-hot-toast'
export const XAuth = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const uid = searchParams.get("uid");
const userName=searchParams.get("name")
  const socket = useSocket();
  const navigate = useNavigate();
  const [popUp, setPopUp] = useState(true);
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
          platformName: getPlatformName(platform),
          userId: uid,
          status: setStatus(status),
          username:userName
        });
        console.log('user sdncndjndcjnd',user)
      }
    };

    if (socket?.connected) {
      updatePlatform();
      setPopUp(false);
      navigate("/dashboard?tab=socials");
      toast.success(`${ getPlatformName(platform)} connected`)
    }
  }, [status, uid, platform, socket]);
  return (
    <div>
      {/* LinkedIn Connected */}
      {popUp && (
        <SocialConnectLoader isOpen={popUp} onClose={() => {}} platform="X" />
      )}
    </div>
  );
};
