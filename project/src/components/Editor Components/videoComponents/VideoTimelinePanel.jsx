// File: VideoTimelinePanel.jsx
import React, { useState,useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useEditor } from '../EditorStoreHooks/FullEditorHooks';
const SECOND_WIDTH = 100; // px per second

const TrackItem = ({ item, onUpdate }) => {
  const [localItem, setLocalItem] = useState(item); 
  const { duration, setduration } = useEditor();
  useEffect(() => {
    if (duration !== localItem.duration) {
      setLocalItem(prev => ({ ...prev, duration }));
    }
  }, [duration]);
  
  const handleDragStop = (e, d) => {
    const newStart = d.x / SECOND_WIDTH;
    const updated = { ...localItem, start: newStart };
    setLocalItem(updated);
    onUpdate(updated);
  };

  const handleResizeStop = (e, direction, ref, delta, position) => {
    const newWidth = ref.style.width || ref.offsetWidth;
    const widthInPx = parseFloat(newWidth);

    const newDuration = widthInPx / SECOND_WIDTH;
    const newStart = position.x / SECOND_WIDTH;
    const updated = { ...localItem, duration: newDuration, start: newStart };
    setLocalItem(updated);
    onUpdate(updated);
    setduration(newDuration); 

  };

  return (
    <Rnd
      size={{ width: localItem.duration * SECOND_WIDTH, height: 40 }}
      position={{ x: localItem.start * SECOND_WIDTH, y: 0 }}
      bounds="parent"
      enableResizing={{ left: true, right: true }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      className="absolute bg-blue-500 text-white text-xs px-2 py-1 rounded shadow flex flex-col justify-center"
      style={{ backgroundImage: `url(${localItem.image})`,
        backgroundSize: 'cover',
      
      }}

    >
      <span>{localItem.label}</span>
      <span className="text-[10px] text-white/80">
        {localItem.duration.toFixed(2)}s
      </span>
    </Rnd>
  );
};

const TrackRow = ({ track, onItemUpdate }) => (
  <div className="relative h-[40px] border-b border-gray-300">
    {track.items.map(item => (
      <TrackItem
        key={item.id}
        item={item}
        onUpdate={updatedItem => onItemUpdate(track.id, updatedItem)}
      />
    ))}
    <span className="absolute left-2 top-1 text-xs text-gray-600 capitalize">
      {track.type}
    </span>
  </div>
);

const VideoTimelinePanel = () => {
  const { duration } = useEditor(); // ✅ use dynamic duration from editor

  const [tracks, setTracks] = useState([
    {
      id: '1',
      type: 'video',
      items: [
        { id: '1', start: 0, duration: 5, label: 'Intro',  image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUPIfiGgUML8G3ZqsNLHfaCnZK3I5g4tJabQ&s'
        },
      ],
    },
    {
      id: '2',
      type: 'audio',
      items: [
        { id: '3', start: 0, duration: 5, label: 'Background Music' },
      ],
    },
  ]);

  const handleItemUpdate = (trackId, updatedItem) => {
    setTracks(prev =>
      prev.map(track =>
        track.id === trackId
          ? {
              ...track,
              items: track.items.map(item =>
                item.id === updatedItem.id ? updatedItem : item
              ),
            }
          : track
      )
    );
  };

  const timelineWidth = duration * SECOND_WIDTH;

  return (
    <div className="w-[900px] flex bg-gray-100 border-t border-gray-300 p-2">
      {/* Playback Controls */}
      <div className="flex items-center gap-2 mb-2">
        <button className="w-[50px] h-[40px] rounded-full bg-blue-500 text-white flex items-center justify-center">
          ▶
        </button>
        <span>00:00 / {duration.toFixed(2)}s</span>
      </div>

      {/* Timeline Area */}
      <div className="overflow-x-auto w-full">
        <div 
        // style={{ width: `${timelineWidth}px` }}
        >
          {tracks.map(track => (
            <TrackRow
              key={track.id}
              track={track}
              onItemUpdate={handleItemUpdate}
            />
          ))}
        </div>
      </div>

      {/* Add New Item Button */}
      <div className="flex justify-between items-center p-2 bg-white border-t border-gray-300 mt-2">
        <button className="w-full h-[30px] bg-gray-200 rounded hover:bg-gray-300">
          +
        </button>
      </div>
    </div>
  );
};

export default VideoTimelinePanel;
