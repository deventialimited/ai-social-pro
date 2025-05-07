import { React, useState, useEffect } from "react";
import { SocialConnectLoader } from "../../PopUps/SocialMediaPopup";
import { useLocation, useSearchParams } from "react-router-dom";
import { updatePlatformConnection } from "../../libs/authService";

export const LinkedIn = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const uid = searchParams.get("uid");
  console.log("status", uid);
  console.log("status", status);
  const [popUp, setPopUp] = useState(true);
  const platform = location.pathname.split("/").pop();
  console.log("into the linkedIn Loader");
  const getPlatformName = (raw) => {
    if (raw === "LinkedinAuth") return "LinkedIn";
  };
  const setStatus = (raw) => {
    if (raw === "success") return "connected";
  };
  useEffect(() => {
    console.log("into the useEffect in the linkedin auth component");
    const updatePlatform = async () => {
      if (status === "success" && uid) {
        const user = await updatePlatformConnection({
          platformName: getPlatformName(platform),
          userId: uid,
          status: setStatus(status),
        });
        localStorage.setItem("user", JSON.stringify(user.user));
      }
    };
    updatePlatform();
  }, [status, uid, platform]);
  console.log("hello man how are you");
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
