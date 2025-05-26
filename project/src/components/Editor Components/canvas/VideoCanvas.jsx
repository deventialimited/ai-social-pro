import { useEditor } from "../EditorStoreHooks/FullEditorHooks";
import VideoTimelinePanel from "../videoComponents/VideoTimelinePanel";
import EditorCanvas from "./EditorCanvas";
const VideoCanva = () => {
  const { videoClips,duration } = useEditor();

  const activeClip = videoClips[0];

  if (!activeClip) return <div>No active clip</div>;

  return (
    <div className="flex flex-col h-[80%]">
     
      {/* ✅ Reuse Image Canvas */}
      <div className="flex-1">
        <EditorCanvas />
      </div>       
<VideoTimelinePanel/>
       {/* ✅ Video Navbar */}
       {/* <div className=" bg-black text-white flex items-center justify-around">
        <span>🎬 Video Editing Mode</span>
        <span>Clip Duration: {duration}s</span>
      </div> */}

    </div>
  );
};

export default VideoCanva;
