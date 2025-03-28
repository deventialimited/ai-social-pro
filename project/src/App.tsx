import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { Dashboard } from "./pages/Dashboard";
import { useThemeStore } from "./store/useThemeStore";
import { Toaster } from "react-hot-toast";
 
function App() {
  const { isDark } = useThemeStore();

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className={isDark ? "dark" : ""}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster/>
      </BrowserRouter>
    </div>
  );
}

export default App;
