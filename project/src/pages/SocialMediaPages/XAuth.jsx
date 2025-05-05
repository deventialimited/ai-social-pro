import React, { useState } from "react";
import { SocialConnectLoader } from "../../PopUps/SocialMediaPopup";

export const XAuth = () => {
  const [popUp, setPopUp] = useState(true);
  const handleClick = () => {
    setPopUp(true);
  };
  return (
    <div>
      <button onClick={handleClick}>Lets connect X</button>
      {popUp && (
        <SocialConnectLoader isOpen={popUp} onClose={() => {}} platform="x" />
      )}
    </div>
  );
};
