import { React, useState } from "react";
import { SocialConnectLoader } from "../../PopUps/SocialMediaPopup";

export const LinkedIn = () => {
  const [popUp, setPopUp] = useState(true);
  const handleClick = () => {
    setPopUp(true);
  };
  return (
    <div>
      LinkedIn Connected
      {popUp && (
        <SocialConnectLoader isOpen={popUp} onClose={() => {}} platform="LinkedIn" />
      )}
    </div>
  );
};
