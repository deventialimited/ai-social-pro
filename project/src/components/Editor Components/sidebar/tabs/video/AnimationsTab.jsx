import { useState } from "react";

const animationTypes = ["None", "Move", "Fade", "Zoom"];
const directions = [
  { dir: "up", icon: "↑" },
  { dir: "right", icon: "→" },
  { dir: "down", icon: "↓" },
  { dir: "left", icon: "←" },
  { dir: "top-left", icon: "↖" },
  { dir: "top-right", icon: "↗" },
  { dir: "bottom-right", icon: "↘" },
  { dir: "bottom-left", icon: "↙" },
];

function AnimationsTab() {
  const [selectedTab, setSelectedTab] = useState("entry");
  const [selectedAnimation, setSelectedAnimation] = useState("Move");
  const [delay, setDelay] = useState(0);
  const [duration, setDuration] = useState(1);
  const [selectedDirection, setSelectedDirection] = useState("up");

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex gap-4 border-b text-sm font-medium">
        {["entry", "emphasis", "exit"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`pb-2 ${
              selectedTab === tab
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Animation Types */}
      <div className="grid grid-cols-2 gap-3">
        {animationTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedAnimation(type)}
            className={`py-2 rounded text-sm ${
              selectedAnimation === type
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Delay and Duration Inputs */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Delay</label>
        <input
          type="number"
          value={delay}
          onChange={(e) => setDelay(Number(e.target.value))}
          className="border px-3 py-2 rounded text-sm"
        />
        <span className="text-xs text-gray-400 -mt-2">seconds</span>

        <label className="text-xs text-gray-500">Duration</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="border px-3 py-2 rounded text-sm"
        />
        <span className="text-xs text-gray-400 -mt-2">seconds</span>
      </div>

      {/* Direction */}
      {selectedAnimation === "Move" && (
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Direction</label>
          <div className="grid grid-cols-4 gap-2">
            {directions.map((d) => (
              <button
                key={d.dir}
                onClick={() => setSelectedDirection(d.dir)}
                className={`p-2 rounded border text-lg ${
                  selectedDirection === d.dir
                    ? "bg-black text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                {d.icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnimationsTab;
