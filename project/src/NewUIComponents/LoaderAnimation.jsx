import React from "react";
import { Sparkles } from "lucide-react";
import clsx from "clsx";

export const AnalyzeLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-8 py-10">
      <div className="relative w-32 h-32">
        <div
          className={clsx(
            "w-full h-full rounded-full border-8 border-purple-500/50 border-t-transparent animate-spin",
            "bg-gradient-to-br from-purple-500 to-blue-500 shadow-2xl",
            "animate-pulse"
          )}
        />
        <Sparkles
          className="absolute inset-0 m-auto w-12 h-12 text-white animate-bounce"
          strokeWidth={2}
        />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
        Website Analysis in Progress...
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-lg">
        We're diving deep into your website, optimizing your brand, and
        uncovering key insights about your target audience.
      </p>
    </div>
  );
};
