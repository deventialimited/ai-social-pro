import { React, useState } from "react";
import { SocialConnectLoader } from "../../PopUps/SocialMediaPopup";

export const FacebookAuth = () => {
  const [popUp, setPopUp] = useState(true);
  const handleClick = () => {
    setPopUp(true);
  };
  return (
    <div>
      Facebook Connected
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
