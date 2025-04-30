import { React, useState } from "react";
import { SocialConnectLoader } from "../../PopUps/SocialMediaPopup";

export const InstagramAuth = () => {
  const [popUp, setPopUp] = useState(true);
  const handleClick = () => {
    setPopUp(true);
  };
  return (
    <div>
      Instagram Connected
      {popUp && (
        <SocialConnectLoader isOpen={popUp} onClose={() => {}} platform="Instagram" />
      )}
    </div>
  );
};
