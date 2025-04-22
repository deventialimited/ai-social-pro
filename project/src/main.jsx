import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import SocketProvider from "./store/useSocket.jsx";

createRoot(document.getElementById("root")).render(
  <>
    <GoogleOAuthProvider clientId="334445684697-p0hj5muaed53rquvet0svco0q5loo7c8.apps.googleusercontent.com">
      <SocketProvider>
        <App />
      </SocketProvider>
    </GoogleOAuthProvider>
  </>
);
