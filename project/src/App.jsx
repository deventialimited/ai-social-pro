import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { Dashboard } from "./pages/Dashboard";
import { useThemeStore } from "./store/useThemeStore";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { FacebookAuth } from "./pages/SocialMediaPages/FacebookAuth";
import { InstagramAuth } from "./pages/SocialMediaPages/InstagramAuth";
import { LinkedIn } from "./pages/SocialMediaPages/LinkedIn";
import { XAuth } from "./pages/SocialMediaPages/XAuth";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import { useAuthStore } from "./store/useAuthStore";

const queryClient = new QueryClient();
function App() {
  const { isDark } = useThemeStore();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        if (userObj?._id) setUser(userObj);
      } catch (err) {
        console.error("Failed to parse user from localStorage");
      }
    }
  }, []);
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);
  // hsdbsds
  return (
    <div className={isDark ? "dark" : ""}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />{" "}
            <Route
              path="/dashboard/InstagramAuth"
              element={<InstagramAuth />}
            />{" "}
            <Route path="/dashboard/FacebookAuth" element={<FacebookAuth />} />
            <Route path="/dashboard/XAuth" element={<XAuth />} />
            <Route path="/dashboard/LinkedinAuth" element={<LinkedIn />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-condition" element={<TermsAndConditions />} />
          </Routes>
          <Toaster toastOptions={{ style: { zIndex: 999999999999 } }} />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  );
}

export default App;
